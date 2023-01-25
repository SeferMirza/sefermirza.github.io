---
title: Configurations
position: 100
---

## Application Assemblies

You may change which assemblies are used for an application via this
configuration. By default Gazel loads all assemblies starting with the root
namespace of your entry assembly. Assume your `Program.cs` is in a project
named `MyCompany.MyComponent.App.Service`, then the root namespace is
`MyCompany`.

Each application configurer has a configuration named `applicationAssemblies`
which is a lambda function that provides `Assemblies` instance as a parameter
and expects `List<Assembly>` as a result. Below you can find default
configuration;

```csharp
builder.Services.AddGazelServiceApplication(cfg,
    ...
    applicationAssemblies: c => c.All
);
```

There are several ways to determine which assemblies to use;

### Filtering `All`

You can directly filter out unwanted assemblies returned by `All` property.

```csharp
builder.Services.AddGazelServiceApplication(cfg,
    ...
    applicationAssemblies: c => c.All.Where(a => !a.FullName.Contains("Exclude")).ToList()
);
```

### Find By Namespace

There is a method on `Assemblies` class called `Find` that takes a namespace
predicate as a parameter;

```csharp
builder.Services.AddGazelServiceApplication(cfg,
    ...
    applicationAssemblies: c => c.Find(ns => ns.StartsWith("MyCompany"))
);
```

### Find By Regex

You can also provide a namespace regex;

```csharp
builder.Services.AddGazelServiceApplication(cfg,
    ...
    applicationAssemblies: c => c.Find("^MyCompany.*$")
);
```

### Find By `AssemblyType`

You can make use of `AssemblyType` class.

```csharp
builder.Services.AddGazelServiceApplication(cfg,
    ...
    applicationAssemblies: c => c.Find(AssemblyType.Module)
);
```

> :bulb:
>
> `c => c.Find(AssemblyType.All)` is equivalent to `c => c.All`

> :information_source:
>
> `AssemblyType` uses root namespace of your project that is resolved
> automatically. You can access your root namespace programmatically via
> `AssemblyType.Root` or `Config.RootNamespace`.

## Application Session

> TBD

## Business Logic

> TBD

## Command Line

> TBD

## Database

> TBD

## Gateway

> TBD

## Http Header

> TBD

## Middleware

> TBD

## Rest Api

> TBD

## Service Client

> TBD

## Service

> TBD
