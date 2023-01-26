---
title: Queries
position: 5
---

For persistence classes, there needs to be corresponding query class to read
records from database. This section focuses on how you can organize your
queries in your projects.

## Query Class Conventions

The main purpose of query classes is to organize all of the queries of a table
together into one place. Query classes are named after their corresponding
persistent class. They are in plural form like below;

```csharp
public class Company { ... }

public class Companies : Query<Company>
{
    ...
}
```

> :bulb:
>
> You can access pluralization service through `IModuleContext.Pluralizer`
> property.

> :information_source:
>
> If pluralization service does not provide what you want, you can make use of
> `[Name]s` convention. For instance, there is a persistent class named `Xyz`,
> when you name its query class as `Xyzs`, it will work as well.

Query classes are singleton by convention and its usage is as follows;

```csharp
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

Query classes are singleton by convention, so you can inject query classes as
well;

```csharp
public class CompanyManager
{
    private Companies _companies;

    public CompanyManager(Companies companies) => _companies = companies;

    public virtual void DeactivateCompanies(string name)
    {
        foreach(var company in _companies.ByName(name))
        {
            company.Deactivate();
        }
    }
}
```

Query classes should extend `Query<T>` which is an abstract class with helper
functionalities to make it simple to implement query methods. To provide these
functionalities it requires `IModuleContext` to be injected.

```csharp
public class Company { ... }

public class Companies : Query<Company>
{
    public Companies(IModuleContext context) : base(context) { }
    ...
}
```

If you want to inject other dependencies, you are free to do it like in any
other class.

## By Methods

By methods are type of queries that return list of persistent objects.

```csharp
public class Company { ... }

public class Companies : Query<Company>
{
    ...
    public List<Company> By(string name, City city) =>
        By(c => c.Name.Contains(name) && c.City == city);
    ...
}
```

`By` method is declared in `Query<T>` base class to help you create query
methods quickly.

> :warning:
>
> `Query<T>.By` method accepts an expression that is converted to `SQL`. This
> expression never runs in your .NET application. Because of this reason you
> are not supposed to call methods of persistent classes within these
> expressions.  For example; `By(c => c.GetEmployees().Count > 0)` will not
> work.

> :bulb:
>
> Do not use `Id` properties for filtering;
>
> ```csharp
> public class Company { ... }
>
> public class Companies : Query<Company>
> {
>     ...
>     public List<Company> By(string name, City city) =>
>         By(c => c.Name.Contains(name) && c.City.Id == city.Id);
>     ...
> }
> ```
>
> This will cause a `NullReferenceException` when city is `null`. Prefer
> `c.City == city` expression, which will handle both cases in one shot.

A by method can also be implemented like below;

```csharp
public class Company { ... }

public class Companies : Query<Company>
{
    ...
    public List<Company> By(string name, City city) =>
        Lookup.List(true).Where(c => c.Name.Contains(name) && c.City == city).ToList();
    ...
}
```

`Lookup` property is declared in `Query<T>` base class and is of type
`ILookup<T>`. This interface acts as a gateway to NHibernate. `ILookup<T>.List`
method returns an `IQueryable<T>` instance. You may use this instance when `By`
method is not enough.

### Single Parameter Convention

When there is only one parameter in query methods, we suggest you to include
parameter name in method name like below;

```csharp
public class Transaction { ... }

public class Transactions : Query<Transaction>
{
    ...
    public List<Transaction> ByFrom(Account from) => By(t => t.From == from);
    ...
}
```

Consider you have two different queries on `Transaction` table, first one
filters using `From` column, second one filters using `To` column;

```csharp
public class Transaction { ... }

public class Transactions : Query<Transaction>
{
    ...
    public List<Transaction> By(Account from) => By(t => t.From == from);
    public List<Transaction> By(Account to) => By(t => t.To == to);
    ...
}
```

Above code will not compile because there are two methods with exactly the same
signature. To make it compile, you need to rename one of them. We prefer
renaming both to provide consistency in naming;

```csharp
public class Transaction { ... }

public class Transactions : Query<Transaction>
{
    ...
    public List<Transaction> ByFrom(Account from) => By(t => t.From == from);
    public List<Transaction> ByTo(Account to) => By(t => t.To == to);
    ...
}
```

### Take and Skip

You can use `skip` and `take` extensions methods. They are optional parameters.
`take` parameter extracts the first n elements from the beginning of the target
sequence. Here is how you can do it;

```csharp
public class Company { ... }

public class Companies : Query<Company>
{
    ...
    public List<Company> By(string name, City city, int take) =>
        By(c => c.Name.Contains(name) && c.City == city, take: take);

    public List<Company> All(string name, City city, int take) =>
        All(c => c.Name.Contains(name) && c.City == city, take: take);
    ...
}
```

The `skip` parameter moves pass the first n elements from the beginning of the
target sequence, returning the remainder;

```csharp
public class Company { ... }

public class Companies : Query<Company>
{
    ...
    public List<Company> By(string name, City city, int skip) =>
        By(c => c.Name.Contains(name) && c.City == city, skip: skip);

    public List<Company> All(string name, City city, int skip) =>
        All(c => c.Name.Contains(name) && c.City == city, skip: skip);
    ...
}
```

You can apply pagination by using `skip` and `take` optional parameters. Here
is how you can do it;

```csharp
public class Company { ... }

public class Companies : Query<Company>
{
    ...
    public List<Company> By(string name, int skip, int take) =>
        By(c => c.Name.Contains(name), skip: skip, take:take);

    public List<Company> All(string name, int skip, int take) =>
        All(c => c.Name.Contains(name), skip: skip, take:take);
    ...
}
```

Alternatively, you can also be implemented by using `ILookup<T>.List` as shown
below. It actually returns an `IQueryable<T>` instance.

```csharp
public class Company { ... }

public class Companies : Query<Company>
{
    ...
    public List<Company> By(string name, City city, int take) =>
        Lookup
            .List(true)
            .Where(c => c.Name.Contains(name) && c.City == city)
            .Take(take)
            .ToList();;

    public List<Company> By(string name, City city, int skip) =>
        Lookup
            .List(true)
            .Where(c => c.Name.Contains(name) && c.City == city)
            .Skip(skip)
            .ToList();;

    public List<Company> By(string name, City city, int take, int skip) =>
        Lookup
            .List(true)
            .Where(c => c.Name.Contains(name) && c.City == city)
            .OrderByDescending(c => c.City)
            .Skip(skip)
            .Take(take)
            .ToList();
    ...
}
```

### OrderBy and OrderByDescending

You can use `orderBy` and `orderByDescending` extensions methods. They are
optional parameters.

> :information_source:
>
> You can use `orderBy` and `orderByDescending` parameters in `By`, `All`,
> `FirstBy`,  methods.

The `orderby` parameter sorts the elements of a sequence in ascending order
according to a key.

```csharp
public class Company { ... }

public class Companies : Query<Company>
{
    ...
    public List<Company> ByName(string name) =>
        By(c => c.Name.StartsWith(name), orderBy: c => c.Name);

    public List<Company> All() =>
        All(orderBy: c => c.Name);

    public List<Company> FirstByName(string name) =>
        FirstBy(c => c.Name.StartsWith(name), orderBy: c => c.Name);
    ...
}
```

The `orderByDescending` parameter sorts the elements of a sequence in
descending order according to a key.

```csharp
public class Company { ... }

public class Companies : Query<Company>
{
    ...
    public List<Company> ByName(string name) =>
        By(c => c.Name.StartsWith(name), orderByDescending: c => c.Name);

    public List<Company> All(string name) =>
        All(orderByDescending: c => c.Name);

    public List<Company> FirstByName(string name) =>
        FirstBy(c => c.Name.StartsWith(name), orderByDescending: c => c.Name);
    ...
}
```

## FirstBy and SingleBy

`FirstBy` and `SingleBy` methods are like `By` methods but they return only one
record. `FirstBy` returns the first record matching the given conditions,
whereas `SingleBy` throws an exception when there are more than one records
matching the given conditions.

```csharp
public class User { ... }

public class Users : Query<User>
{
    ...
    public User SingleByEmail(Email email) =>
        SingleBy(u => u.Email == email);

    public User FirstByRegistrationDate(Date registrationDate) =>
        FirstBy(u => u.RegistrationDate == registrationDate);
    ...
}
```

> :information_source:
>
> Single Parameter Convention applies to all query methods. That's why above
> methods are named as `SingleByEmail` and `FirstByRegistrationDate` instead of
> `SingleBy` and `FirstBy`. When you have more than one parameter you may
> exclude parameter name from method name (e.g. `public User SingleBy(Email
> email, Password password)`).

`SingleBy` method will return `null` when there are no matching records. LINQ
extension methods uses a different convention. `Single` methods expects to
return one record, if there are none or more than one they will throw an
exception. `SingleBy` methods acts like `SingleOrDefault` method.

## CountBy

As the name implies, `CountBy` methods executes a `count` query and returns an
`int`.

```csharp
public class User { ... }

public class Users : Query<User>
{
    ...
    public int CountByRegistrationDate(Date registrationDate) =>
        CountBy(u => u.RegistrationDate == registrationDate);

    public int CountBy(Gender gender, Date birthDate) =>
        CountBy(u => u.Gender == gender && u.BirthDate == birthDate);
    ...
}
```

## AnyBy

As the name implies, `AnyBy` method determines whether all elements of a
sequence satisfy a condition and returns a `bool`.

```csharp
public class User { ... }

public class Users : Query<User>
{
    ...
    public bool AnyByRegistrationDate(Date registrationDate) =>
        AnyBy(u => u.RegistrationDate == registrationDate);

    public bool AnyBy(Gender gender, Date birthDate) =>
        AnyBy(u => u.Gender == gender && u.BirthDate == birthDate);
    ...
}
```

## MinBy and MaxBy

These aggregate functions take two expressions.

1. An expression of the property on which aggregate function is applied
2. An expression for where clause

```csharp
public class Transaction { ... }

public class Transactions : Query<Transaction>
{
    ...
    public Money MinAmountBy(DateRange transactionDateRange, CurrencyCode currency) =>
        MinBy(
            //Property expression
            t => t.Amount.Value,

            //Where clause expression
            t => t.TransactionDate >= transactionDateRange.Start &&
                 t.TransactionDate < transactionDateRange.End &&
                 t.Amount.Currency == currency
        ).ToMoney(currency);

    public Money MaxAmountBy(DateRange transactionDateRange, CurrencyCode currency) =>
        MaxBy(
            //Property expression
            t => t.Amount.Value,

            //Where clause expression
            t => t.TransactionDate >= transactionDateRange.Start &&
                 t.TransactionDate < transactionDateRange.End &&
                 t.Amount.Currency == currency
        ).ToMoney(currency);
    ...
}
```

## Optional Where Clauses

In a query class, if a condition needs to be included in a query depending on
the state of a given parameter, an optional where clause can be created as
shown below;

```csharp
public List<Company> By(City city, string name = default, Vkn taxNo = default)
{
    return By(c => c.City == city,
        When(name).IsNot(default).ThenAnd(c => c.Name.StartsWith(name)),
        When(taxNo).IsNot(default).ThenAnd(c => c.TaxNo == taxNo)
    );
}
```

This way you can create reusable query services/methods;

```csharp
companies.By(city);
companies.By(city, taxNo: taxNo);
companies.By(city, name: name, taxNo: taxNo);
```

> :information_source:
>
> You can use optional where clauses in `By`, `FirstBy`, `SingleBy`, `MinBy`,
> `MaxBy`, `CountBy` methods.

An optional where clause is built in 3 steps:

- __`When`__: In this step you specify the parameter on which you will check a
  condition.
- __`Is/Not`__: `Is` method expects the given condition to be `true` while
  `IsNot` method expects the given condition to be `false`.
- __`ThenAnd`__: This is the final step. In this step you provide the where
  clause.

```csharp
When(name).IsNot(default).ThenAnd(c => c.Name.StartsWith(name))
```

Together, in the above statement, you stated that there is an optional filter
which should be included when name is not `default`.

The alternative, you can also use as named optional parameters. They must be
the last ones in method arguments list.

There are available 2 different ways.

- __`optional`__: In this way, you specify the single condition.
- __`optionals`__: In this way, you specify the multiple conditions.

You can pass the parameter according to the name, as shown below;

```csharp
...
public List<Company> By(City city, string name = default)
{
    return By(c => c.City == city,
        optional: When(name).IsNot(default).ThenAnd(c => c.Name.StartsWith(name))
    );
}

public List<Company> By(City city, string name = default, Vkn taxNo = default)
{
    return By(c => c.City == city,
        optionals: new[] {
            When(name).IsNot(default).ThenAnd(c => c.Name.StartsWith(name)),
            When(taxNo).IsNot(default).ThenAnd(c => c.TaxNo == taxNo)
        }
    );
}
...
```

### How to use `Is`

```csharp
//if given name parameter object is expectedName
//then the condition will be included in the query.
When(name).Is(n => n == expectedName)

//you can pass an object instead of an expression
//which will be equivalent to above code
When(name).Is(expectedName)

//There is a shortcut method that does the same job
//that When(name).Is(null) and When(name).Is(default) does
When(name).IsDefault()
```

### How to use `IsNot`

```csharp
//if given name parameter object is not excludedName
//then the condition will be included in the query.
When(name).IsNot(c => c == excludedName)

//you can pass an object instead of an expression
//which will be equivalent to above code
When(name).IsNot(excludedName)

//There is a shortcut method that does the same job
//that When(name).IsNot(null) and When(name).IsNot(default) does
When(name).IsNotDefault()
```

## Query Base Class

`Query<T>` is an abstract class with helper functionalities to make it simple
to create queries. All methods in this class are `protected`. If a method
declared in `Query<T>` class is to be exposed as a business service, you can
override its access modifiers with `public new` keyword.

### SingleById and ByIds

```csharp
public abstract class Query<T> : IQuery<T>
{
    ...
    protected virtual T SingleById(int id) { ... }

    protected virtual List<T> ByIds(List<int> ids) { ... }
    ...
}
```

These methods are protected helper methods and are used by Gazel to find a
record by an id or ids. If you want these methods to be available for internal
use, then you can simply do the following;

```csharp
public class Company { ... }

public class Companies : Query<Company>
{
    ...
    internal new Company SingleById(int id)
    {
        return base.SingleById(id);
    }
    ...
}
```

> :information_source:
>
> `SingleById` caches the result in request scope, that is, when you make
> subsequent calls to `SingleById`, only first call will hit database.

### Query.All

This method lists all records in corresponding table. This method is
`protected` in `Query<T>` base class. If you want a persistent class to have an
`All` query as a business service do the following;

```csharp
public class Company { ... }

public class Companies : Query<Company>
{
    ...
    public new Company All()
    {
        return base.All();
    }
    ...
}
```
