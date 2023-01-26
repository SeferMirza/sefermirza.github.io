---
title: Data Persistence
position: 3
---

Gazel configures [NHibernate][] with the help of [Fluent NHibernate][] to
provide a data persistence layer.

## Persistent Class Conventions

An object is `Persistent` if its class injects its own repository. This
convention ensures that there is only one class to deal with one table in the
database.

```csharp
public class Company
{
    private readonly IRepository<Company> _repository;

    protected Company() { }
    public Company(IRepository<Company> repository)
    {
        _repository = repository;
    }
    ...
}
```

This injection tells Gazel to configure this class to be a persistent class
which means that there will be an ORM configuration for this class.

> :information_source:
>
> `protected Task() { }` constructor is there for NHibernate to be able to
> create proxies on persistent classes for lazy loading.

### Query classes

When you have a persistent class, this means that you will need to read
persistent objects from corresponding database table. That's why Gazel requires
you to create a query class for every persistent class.

```csharp
public class Company
{
    ...
}

public class Companies : Query<Company>
{
    ...
}
```

> :bulb:
>
> It's better to put persistent and query classes of a table into one source
> file.

In this document we will explain persistent classes rather than query classes.
You can find detailed explanation for queries in [this
page](/features#queries).

### Id property

Every persistent class should have an identifier property of type `int` and of
name `Id`.

```csharp
public class Company
{
    ...
    public virtual int Id { get; protected set; }
    ...
}
```

This property will be used by NHibernate to be the primary key and first level
caching.

> :information_source:
>
> Id properties are automatically configured to be an identity column which
> means that database is responsible for assigning Id values.

### `virtual` keyword

Every member in persistent classes (methods and properties) should be `virtual`
in order NHibernate to be able to create proxies for lazy loading.

```csharp
public class Company
{
    ...
    public virtual int Id { get; protected set; }
    public virtual string Name { get; protected set; }
    public virtual string Address { get; protected set; }
    ...
}
```

> :x:
>
> In persistent classes `private` access modifier causes null reference
> exceptions. Use `protected virtual` instead of `private` to workaround this
> problem.

### `protected` setters

We encourage you to use protected setters so that you can make sure that no
other class than the class itself is able to modify the values of its
properties.

> :information_source:
>
> It could be `private` setters but NHibernate wouldn't be able to create
> proxies for lazy loading.

For a more detailed explanation please have a look at [this tutorial
page](/tutorial#database-transactions).

## Inserting a New Record

There is an `Insert` method in `IRepository<T>` which does what it says. The
convention for insert operations is as follows;

```csharp
public class Company
{
    ...
    protected internal virtual Company With(string name, string address)
    {
        Name = name;
        Address = address;

        _repository.Insert(this);

        return this;
    }
    ...
}
```

`With` methods are part of the creation of a persistent object. We use builder
pattern for this operation. For a more detailed explanation about `With`
methods please have a look at [this tutorial
page](/tutorial#persistent-classes).

`With` methods are;

- `protected` and `virtual` because of NHibernate's lazy loading requirements,
- `internal` to be able to use from other classes in its module.

Below you can see an example of an insert operation;

```csharp
public class CompanyManager
{
    ...
    public void CreateCompany(string name, string address)
    {
        _context.New<Company>().With(name, address);
    }
    ...
}
```

## Updating a Record

When a persistent object is loaded, its state is managed by NHibernate. This
feature of NHibernate enables services to  automatically update a record upon
commit.

```csharp
public class Company
{
    ...
    public virtual void Update(string name, string address)
    {
        Name = name;
        Address = address;
    }
    ...
}
```

Above method is enough for the `Company` object to update itself. At this point
object is marked as dirty by NHibernate. Whenever NHibernate session is
flushed, an update statement will be executed in the database. There are 3
reasons for NHibernate session to be flushed;

1. When current transaction is committed NHibernate flushes current session,
   hence record gets updated.
2. When a select query is sent to `Company` table, either directly or via table
   joins.
3. You make an explicit call to `IRepository<T>.Flush()` which calls
   NHibernate's session flush directly.

> :information_source:
>
> `IRepository<T>.Flush()` causes all dirty objects to be flushed, not just the
> persistent object it is called, nor instances of `<T>`. This is how
> NHibernate implements session flush.

### Batch Updates

```csharp
public class Company
{
    ...
    public virtual bool Active { get; protected set; }
    ...
    public virtual void Deactivate()
    {
        Active = false;
    }
}

public class CompanyManager
{
    ...
    public virtual void DeactivateCompanies(string name)
    {
        foreach(var company in _context.Query<Companies>().ByName(name))
        {
            company.Deactivate();
        }
    }
    ...
}
```

`DeactivateCompanies` method iterates through a list of `Company` objects.
Changing a property value does not cause an immediate update. Upon NHibernate
session flush, above updates will be executed as batch.

> :warning:
>
> If you execute a query to `Company` table inside `Deactivate` method, this
> will cause NHibernate to flush on every iteration and cause an update
> execution one by one. This can create a performance flaw in your code. If you
> need to check something before such an update (e.g. checking if new username
> exists before updating it), and if you want the operation to be a batch
> update, then you need to optimize your query accordingly. For "unique
> username" example, you might consider checking uniqueness at once.

```csharp
public class User
{
    ...
    public virtual bool Username { get; protected set; }
    ...
    public virtual void ChangeUsername(string username) { ChangeUsername(username, false); }
    protected internal virtual void ChangeUsername(string username, bool batch)
    {
        if(!batch)
        {
            if(_context.Query<Users>().CountByUsername(username) > 0)
            {
                throw new ArgumentException("username");
            }
        }

        Username = username;
    }
    ...
}

public class UserManager
{
    ...
    public virtual void ChangeUsernames(List<UsernameChange> changes)
    {
        if(_context.Query<Users>().CountByUsernames(changes.Select(c => c.To)) > 0)
        {
            throw new ArgumentException("changes");
        }

        var users = _context.Query<Users>().ByUsernames(changes.Select(c => c.From));
        foreach(var user in users)
        {
            users.ChangeUsername(change.To, true);
        }
    }
    ...
}
```

### Force Update

If a persistent class implements `IAuditable`, this means that with every
update to objects of that class, Gazel will automatically update values of
`AuditInfo` properties. A force update is handy when you only want to update
`AuditInfo` properties (e.g. `ModifyDate`). You can force an object to be
updated using `ForceUpdate` method of `IRepository<T>`.

```csharp
public class Company : IAuditable
{
	...
	public virtual AuditInfo AuditInfo { get; protected set; }
    ...
    public virtual void AddEmployee(string name)
    {
        _context.New<Employee>().With(this, name);

        _repository.ForceUpdate(this);
    }
    ...
}

public class Companies : Query<Company> { ... }
```

In the above example, we want a company record to be updated whenever an
employee is added to it. Since adding an employee does not cause an update to a
company record, we force company objects to be updated upon adding an employee.
This `ForceUpdate` call will cause a company object's `AuditInfo.ModifyDate`
column to be refreshed with `AddEmployee` operation.

> :x:
>
> If given persistent class does not implement `IAuditable` interface, an
> `InvalidOperationException` will be thrown.

> :information_source:
>
> If a persistent object is already dirty and forced to be updated, there will
> be only one `UPDATE` statement to update changes to database.

## Deleting a Record

Deleting is done by `Delete` method in `IRepository<T>`.

```csharp
public class Company
{
    ...
    public virtual void Delete()
    {
        _repository.Delete(this);
    }
    ...
}
```

### Batch Deletes

Behaviour of delete operations are similar to update operations. If you do it
like above, delete statements will be executed when NHibernate session is
flushed. If you execute a query before deleting, this would prevent NHibernate
from performing a batch operation. For detailed explanation have a look at
_Batch Updates_ section above in this document.

[NHibernate]:https://nhibernate.info
[Fluent NHibernate]:https://github.com/nhibernate/fluent-nhibernate
