---
title: Relations
position: 4
---

Gazel configures NHibernate so that you can define relations intiutively.

## Many-to-One Relation

This relation is the most used type among all and the simplest one.

```csharp
public class Company
{
    ...
    public virtual int Id { get; protected set; }
    public virtual string Name { get; protected set; }
    ...
}

public class Employee
{
    ...
    public virtual int Id { get; protected set; }
    public virtual Company Company { get; protected set; }
    public virtual string Name { get; protected set; }
    ...
}
```

Above code is enough to set a many-to-one relation between `Employee` and
`Company` classes. In this example, `Employee` table will require a column
named `CompanyId` that is mapped to `Company` property as a many to one
relation.

## One-to-Many Relations

Creating `List<T>` properties on persistent classes will NOT cause a
one-to-many relation. To have this relation, simply create a method that
queries child records from the parent record;

```csharp
public class Company
{
    ...
    public virtual List<Employee> GetEmployees()
    {
        return _context.Query<Employees>().ByCompany(this);
    }
    ...
}

public class Employees : Query<Employee>
{
    ...
    internal List<Employee> ByCompany(Company company)
    {
        return By(e => e.Company == company);
    }
    ...
}
```

## Eager-Fetching and Lazy-Loading

Gazel configures NHibernate to eager fetch persistent object with one level.
This means that when you query a list of persistent objects, their parents will
be fetched eagerly using an inner join. But their grandparents will be
lazy-loaded.

```csharp
public class Company
{
    ...
    public virtual string Name { get; protected set; }
    ...
}

public class Department
{
    ...
    public virtual string Name { get; protected set; }
    public virtual Company Company { get; protected set; }
    ...
}

public class Employee
{
    ...
    public virtual string Name { get; protected set; }
    public virtual Department Department { get; protected set; }
    ...
}
```

When you query employees with something like
`_context.Query<Employees>().ByName("mike")`, the resulting `Employee` objects
will have `Department` objects eagerly fetched. However, when you try to access
a property of their `Company` object (other than Id property), a query will be
executed using that `Company` object's primary key.

```csharp
public class CompanyManager
{
    ...
    public void SomeEmployeeOperation(string name)
    {
        var employees = _context.Query<Employees>().ByName(name);

        foreach(var employee in employees)
        {
            var departmentName = employee.Department.Name; //No query is executed, department is already loaded
            var companyName = employee.Department.Company.Name; //A query is executed to load company object from database
        }
    }
    ...
}
```

### About N + 1 select problem

Above code causes N+1 select problem, which can be a performance issue. If you
encounter this problem, you need to consider selecting all grandparents
(`Company`) of the children (`Employee`) with an additional query so that there
will be only 2 queries in total.

```csharp
public class CompanyManager
{
    ...
    public void SomeEmployeeOperation(string name)
    {
        var employees = _context.Query<Employees>().ByName(name);
        var companies = _context.Query<Companies>().ByIds(employees.Select(e => e.Department.Company.Id));

        foreach(var employee in employees)
        {
            var departmentName = employee.Department.Name; //No query is executed, department is already loaded
            var companyName = employee.Department.Company.Name; //No query is executed, company is already loaded with the second query.
        }
    }
    ...
}
```

## One-to-Any Relation

This relation type enables you to map your properties to interfaces, which we
refer to as _Interface Mapping_ or _Polymorphic Mapping_.

```csharp
public class Order
{
    ...
    public virtual ICustomer Customer { get; protected set; }
    ...
}
```

For NHibernate to map this property to a table it needs two columns;

1. `CustomerId`: The id value of related record, like in a Many-to-One relation,
2. `CustomerType`: Type of related record.

NHibernate uses type column to know which table to select. This type
information is retrieved from an enum that corresponds to `IOrderProcessor`
interface.

```csharp
public interface ICustomer
{
}

public enum CustomerType
{
    RealPerson = 1,
    LegalEntity = 2
}

public class RealPerson : ICustomer { ... }
public class LegalEntity : ICustomer { ... }
```

Conventions for one-to-any mapping are;

- For an interface named `I[Name]` (e.g. `ICustomer`)
- There should be an enum named `[Name]Type` (e.g. `CustomerType`)
- Each enum member must be a persistent class and implement `I[Name]` interface
  (e.g. `RealPerson` and `LegalEntity`).
- When `I[Name]` is mapped to a persistent class with a property named
  `[Property]`,
  - `[Property]Id` (`CustomerId`) column stores the id value of the related
    record
  - `[Property]Type` (`CustomerType`) column store enum member values (`1` or
    `2`), not member names (`RealPerson` or `LegalEntity`)

In a query method, you can filter by object like this;

```csharp
public class Orders : Query<Order>
{
    ...
    internal List<Order> ByCustomer(ICustomer customer)
    {
        return By(wa => wa.Customer == customer); //uses both CustomerId and CustomerType columns
    }
    ...
}
```

Or you can filter by type like this;

```csharp
public class Orders : Query<Order>
{
    ...
    internal List<Order> ByCustomerType<T>() where T : ICustomer
    {
        return By(wa => wa.Customer is T); //uses only Customer column
    }
    ...
}
```

> :warning:
>
> Unfortunately interface mappings cannot be fetched eagerly. So beware of N+1
> select problems if you use this feature.
