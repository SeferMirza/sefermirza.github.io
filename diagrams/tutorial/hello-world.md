---
title: Hello World
position: 1
---

In this tutorial, you will create a hello world service to have a quick feeling
on how Gazel works.

## Create a Hello World Service

To create a new business service, create a class named `TodoManager` in
`Inventiv.Sample.Module.Todo` project.

```
Inventiv.Sample
├── src
│   ├── Inventiv.Sample.App.Rest
│   ├── Inventiv.Sample.App.Service
│   └── Inventiv.Sample.Module.Todo
│       └── TodoManager.cs
└── test
    └── Inventiv.Sample.Test.Todo
```

Now add a new method called `SayHello` to `TodoManager` class as shown below.

```csharp
namespace Inventiv.Sample.Module.Todo;

public class TodoManager
{
    public string SayHello()
    {
        return "Hello World";
    }
}
```

> :information_source:
>
> `public` instance methods of classes within _module_ projects are directly
> exposed as business _services_.

Now run `Inventiv.Sample.App.Service` project, and you will see a test page to
be able to test your services.

On the left you will see that Gazel has rendered your `Todo` _module_ and
listed `TodoManager` class as a _service package_, and under `Todo Manager` it
lists your `SayHello` method as a _business service_. Click `Say Hello` and
press `Call` button to make a test service request. When you do, you will see a
response saying `Hello World`.

![](/-images/tutorial/hello-world-service.png)

## Writing a Unit Test

Now that you have implemented the most basic business service, it is time to
test it.

Create a class named `TodoTest` in `Inventiv.Sample.Test.Todo` project.

```
Inventiv.Sample
├── src
│   ├── Inventiv.Sample.App.Rest
│   ├── Inventiv.Sample.App.Service
│   └── Inventiv.Sample.Module.Todo
│       └── TodoManager.cs
└── test
    └── Inventiv.Sample.Test.Todo
        └── TodoTest.cs
```

Write below code within this class;

```csharp
using Gazel;
using Gazel.UnitTesting;
using Inventiv.Sample.Module.Todo;

namespace Inventiv.Sample.Test.Todo;

[TestFixture]
public class TodoTest : TestBase
{
    static TodoTest()
    {
        Config.RootNamespace = "Inventiv";
    }

    [Test]
    public void SayHello__says_hello()
    {
        var todoManager = Context.Get<TodoManager>();

        Assert.AreEqual("Hello World", todoManager.SayHello());
    }
}
```

> :information_source:
>
> `Context` property comes from `TestBase` which allows you to access IoC
> container. Manager classes are singleton by convention, so you can access to
> `TodoManager` instance by `Context.Get<TodoManager>()`.

That's it. Now you can run this test to see if it succeeds.

> :information_source:
>
> Gazel uses NUnit for unit testing. For more information about NUnit see:
> [NUnit Documentation][]

## Summary {#summary-of-hello-world}

As you can see no configuration is needed to create a new service. Once you've
created your solution and projects, every public class in _module_ projects
becomes a service package and every public method becomes a service by
convention.

Now try to add new methods or add parameters, re-run and see the results.

Once you are ready, you can proceed to create your first database operation
using Gazel.

---

Here you can download [source code for this tutorial][].

[NUnit Documentation]:https://docs.nunit.org
[source code for this tutorial]:https://github.com/multinetinventiv/gazel-samples/tree/main/tutorial/hello-world
