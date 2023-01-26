---
title: Business Services
position: 2
---

Gazel configures [Routine][] to expose every public method to be a business
service. A business service is a public method that you can call using HTTP.

## Public Methods

`public` methods are directly exposed as business services.

```csharp
public class Company
{
    ...
    public virtual List<Branch> GetBranches()
    {
        return _context.Query<Branches>().ByCompany(this);
    }
    ...
}
```

## Persistent Objects as Parameters

You can use a persistent object directly in your business methods. Gazel will
automatically lookup for a record with given id. If record is not found, it
will automatically throw `ObjectNotFoundException`.

```csharp
public class Company
{
    ...
    public virtual Branch AddBranch(string name, District district)
    {
        return _context.New<Branch>().With(this, name, district);
    }
    ...
}
```

Therefore, with the above code, you ensured that district is either null or an
existing record in database.

## Method Overloads

Method overloads are considered as one business service in service layer. If
you create method overloads like below, then you will see only one business
service with all of parameters.

```csharp
public class Company
{
    ...
    public virtual Branch AddBranch(string name, District district) => AddBranch(name, district, null);
    public virtual Branch AddBranch(string name, District district, Company ownerCompany)
    {
        ...
    }
    ...
}
```

If you don't send an `ownerCompany` then the first overload will be called, if
you fulfill all parameters, then the second overload will be called.

> :information_source:
>
> Overload selection is automatic, and Gazel will try to pass as many
> parameters as it can. Assume that you send `name` and `ownerCompany` to above
> `AddBranch` service. Then first overload matches only `name` parameter, but
> second overload matches both of them. So invocation will be on the second one
> and `district` parameter will be `null`.

> :warning:
>
> If return type of overloads are not the same, the first overload will be a
> business service, but the second one will be ignored.
>
> ```csharp
> public class Company
> {
>     ...
>     // First overload returns void
>     public virtual void AddBranch(string name, District district) { ... }
>
>     // Second overload returns Branch, this will not be a business service.
>     public virtual Branch AddBranch(string name, District district, Company ownerCompany) { ... }
>     ...
> }
> ```

## Optional parameters

Gazel supports optional parameters in business services. You can use
optional parameters instead of overloads.

```csharp
public class Company
{
    ...
    public virtual Branch AddBranch(string name, District district,
        Company ownerCompany = null
    )
    {
        ...
    }
    ...
}
```

## `List` and `array` parameters and return types

You can use `List` class for both parameters and return types as long as type
parameter `T` for lists is a supported type.

```csharp
public class Company
{
    ...
    public virtual List<Branch> GetBranches() { ... }
    public virtual Employee[] GetEmployees() { ... }
    ...
}
```

## No `Dictionary` parameters and return types

Gazel does not support `Dictionary` in business services by design. So any
service with Dictionary parameter or return type will not be exposed as a
business service. The reason behind this design decision is to favor
strongly-typed classes over generic dictionaries.

## Data Transfer Objects (DTOs)

If you need a class that is not a persistent class for input or output, then
you can make use of DTO structs.

```csharp
public class Company
{
    ...
    // This will not be a business service
    public virtual void AddBranch(string name, Dictionary<string, string> properties) { ... }
    ...
}
```

Data transfer objects are supported in two different usages in mind;

1. DTOs for parameters: Input DTOs
2. DTOs for results: Output DTOs

As their names imply,

1. You create an input DTO only to use in parameters of your business services
2. You create an output DTO only to return custom data as a result of a
   business service

And DTOs exist only to transfer data. Because of this reason, Gazel uses
`struct`s for DTOs.

### Input DTOs

To accept a complex data in service parameters you can make use of input DTOs.

```csharp
public struct NewBranch
{
    internal string Name { get; private set; }
    internal string Address { get; private set; }
    internal City City { get; private set; }
    internal Country Country { get; private set; }

    public NewBranch(string name, string address, City city, Country country)
        : this()
    {
        Name = name;
        Address = address;
        City = city;
        Country = country;
    }
}
```

Properties of input DTOs should be `internal` and constructor of input DTOs
should be `public`. This convention implies that;

- This struct __should not__ be used for results because no-one from outside
  will see its properties,
- This struct __should__ be used for parameters because constructor is public
  and everyone can create an instance of this struct.

> :information_source:
>
> Constructor parameters of input DTOs are just like parameters of business
> services. You can use
>
> - primitives and other value types,
> - persistent classes,
> - other input DTOs
>
> as parameters of constructor.

Example usage of an input DTO in a business service would be as follows;

```csharp
public class Company
{
    ...
    public virtual void AddBranches(List<NewBranch> newBranches) { ... }
    ...
}
```

> :bulb:
>
> If you need to get a list of name/value pairs you can simply create an input
> DTO with `Name` and `Value` properties. And use list of this DTO in a
> business service.

### Output DTOs

To return custom data from business services you can make use of output DTOs.

```csharp
public struct BranchInfo
{
    public string Name { get; private set; }
    public string Address { get; private set; }
    public City City { get; private set; }
    public Country Country { get; private set; }

    internal BranchInfo(Branch branch)
        : this()
    {
        Name = branch.Name;
        Address = branch.Address;
        City = branch.City;
        Country = branch.City.Country;
    }
}
```

Properties of output DTOs should be `public` and constructor of output DTOs
should be `internal`. This convention implies that;

- This struct __should__ be used for results because its properties are public
  and everyone can see them,
- This struct __should not__ be used for parameters because its constructor is
  internal and only internal classes create instances of this struct.

> :bulb:
>
> Notice that above constructor gets an instance of `Branch` class and assigns
> values by using this `Branch` instance. This will help you to create an
> instance of this struct whenever you have an instance of a `Branch` class.

Example usage of this output DTO in a business service would be as follows;

```csharp
public class Company
{
    ...
    public virtual List<BranchInfo> GetBranches()
    {
        return _context
            .Query<Branches>()
            .ByCompany(this)
            .Select(b => new BranchInfo(b))
            .ToList()
        ;
    }
    ...
}
```

## Hiding Public Methods and Properties

In some cases you might need to have a public method, but you might not want it
to be exposed as a business service. In this kind of cases, you can mark a
business service by adding an `Internal` attribute on top of a `class`,
`constructor`, `method` or `property` like below;

```csharp
[Internal]
public class InternalManager
{
    public PublicData ShouldNotBeRegisteredAsAService()
    {
        return new PublicData("public internal", "public");
    }
}

public class PublicManager
{
    private readonly InternalManager _internalManager;

    public PublicManager(InternalManager internalManager)
    {
        _internalManager = internalManager;
    }

    public PublicData PublicService()
    {
        return _internalManager.ShouldNotBeRegisteredAsAService();
    }

    [Internal]
    public void InternalService()
    {
    }
}

public struct PublicData
{
    [Internal]
    public string InternalProperty { get; private set; }

    public string PublicProperty { get; private set; }

    [Internal]
    public PublicData(string internalProperty, string publicProperty)
        : this()
    {
        InternalProperty = internalProperty;
        PublicProperty = publicProperty;
    }
}
```

For the above example;

- `InternalManager` class and all of its members will be hidden in service
  layer.
- `PublicManager.InternalService` method will be hidden in service layer.
- For `PublicData` class;
  - The constructor will be hidden,
  - `InternalProperty` will be hidden,
  - But `PublicProperty` will be available in service layer

You can think of this attribute as an additional access modifier to `public`,
`private`, `internal`, `protected` and `protected internal` access modifier
which we sometimes refer as `public internal`.

[Routine]:https://github.com/multinetinventiv/routine
