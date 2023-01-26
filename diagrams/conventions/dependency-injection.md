---
title: Dependency Injection
position: 1
---

Gazel uses [Castle.Windsor][] for Dependency Injection. Using Convention over
Configuration capabilities of Castle.Windsor, you don't have to register your
classes one by one. Every public class in module projects are automatically
registered to the kernel. In this document you will find ways on how to make
use of this feature.

## Scopes

There are 3 types of scope;

1. Transient: For every resolution, Windsor creates a new instance.
2. Request: For every request there is only one instance. After the request
   ends, object is disposed.
3. Singleton: There is only one instance until application is shut down.

`Manager` and `Query` classes are singleton by convention and the rest are
transient.

## Manager classes

For a class to be a manager class, it should have `Manager` suffix.

```csharp
public class ProductManager
{
    ...
}
```

Manager classes are singleton by convention. You can make use of `Manager`
classes to provide general domain logic of a module, batch operations or
complex query services.

## Injecting a Dependency

Every public class is registered to Castle.Windsor by their own type so that
they can be injected to other classes.

```csharp
public class ProductManager
{
    private readonly UserManager _userManager;

    public ProductManager(UserManager userManager)
    {
        _userManager = userManager;
    }
    ...
}

public class UserManager { ... }
```

### Public Constructors

Every public class should contain a `public` constructor, in order for
Castle.Windsor to register and configure them.

```csharp
public class ProductManager
{
    ...
    public ProductManager()
    {
        ...
    }
    ...
}
```

### Circular Dependencies

Avoid creating circular dependencies as shown below;

```csharp
public class ProductManager
{
    ...
    public ProductManager(UserManager userManager)
    {
        ...
    }
    ...
}

public class UserManager
{
    ...
    public UserManager(ProductManager userManager)
    {
        ...
    }
    ...
}

```

For such cases;

1. Consider refactoring your code. Two classes shouldn't depend on each other.
2. If you think you have no other choice, then you can refactor code as shown
   below;

```csharp
public class UserManager
{
    private readonly IModuleContext _context;

    public UserManager(IModuleContext context)
    {
        _context = context;
    }

    private ProductManager ProductManager
    {
        get
        {
            return _context.Resolve(typeof(ProductManager), Scope.Any);
        }
    }
    ...
}
```

## `IModuleContext` interface

`IModuleContext` is basically an abstraction for your domain objects to be
isolated from the 3rd party libraries.

For singleton objects, mainly `Manager` objects, we encourage you to inject
them through constructor. On the other hand, if you want to create a transient
object, you can make use of `IModuleContext.New<T>()`.

```csharp
public class ProductManager
{
    private readonly IModuleContext _context;

    public ProductManager(IModuleContext context)
    {
        _context = context;
    }

    public void DoSomethingHeavy()
    {
        _context.New<BatchUserOperation>().DoSomethingHeavy();
    }
    ...
}

public class BatchUserOperation
{
    private readonly UserManager _userManager;

    public BatchUserOperation(UserManager userManager)
    {
        _userManager = userManager;
    }

    internal void DoSomethingHeavy() { ... }
}
```

## Injecting Interfaces

Public classes can also be injected using their interfaces

```csharp
public class ProductManager
{
    private readonly IUserManager _userManager;

    public ProductManager(IUserManager userManager)
    {
        _userManager = userManager;
    }

    ...
}

public interface IUserManager { ... }

public class UserManager : IUserManager { ... }
```

## Injecting Multiple Implementations

If an interface has more than one implementations then you can inject all of
them at once by using `IList<T>`.

```csharp
public class ProductManager
{
    private IList<INotifier> _notifiers;

    public ProductManager(IList<INotifier> notifiers)
    {
        _notifiers = notifiers;
    }
    ...
}

public interface INotifier { ... }

public class SmsNotifier : INotifier { ... }
public class MailNotifier : INotifier { ... }
public class PushNotifier : INotifier { ... }
```

[Castle.Windsor]:http://www.castleproject.org/projects/windsor
