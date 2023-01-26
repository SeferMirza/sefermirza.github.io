---
title: Rest API
position: 5
---

In this tutorial, you will create a Rest API and learn about configuration and
api packaging.

## Define a Service Interface

Until now you've created business services for internal use. By internal we
mean that they are supposed to be consumed by your applications only. You can
always publish your business services directly to outside but this would be
hard for you to maintain and refactor your business code. For this reason, you
will create an api package out of your business services.

First we will define which services to expose. To do this, create a folder
named `Service` in `Todo` _module_ and under this folder create an interface
named `ITaskCardService` as shown below;

```
Inventiv.Sample
├── src
│   ├── Inventiv.Sample.App.Rest
│   ├── Inventiv.Sample.App.Service
│   └── Inventiv.Sample.Module.Todo
│       ├── Service
│       │   └── ITaskCardService.cs
│       ├── TodoManager.cs
│       └── TaskCard.cs
└── test
    └── Inventiv.Sample.Test.Todo
```

This interface is a _service interface_ and it will contain the methods of
`TaskCard` class that you want to share with the outside world.

Now modify `ITaskCardService` service interface to include following method;

```csharp
namespace Inventiv.Sample.Module.Todo.Service;

public interface ITaskCardService
{
    void Complete();
}

```

Now go to `TaskCard.cs` file and make your `TaskCard` class implement
`ITaskCardService` interface as shown below;

```csharp
public class TaskCard : ITaskCardService
{
    ...
}
...
```

> :information_source:
>
> Notice that you don't have to implement `Complete` method, since it is
> already implemented within `TaskCard` class.

## Create an API Package

To create an api package go to `App.Service` project and add a class named
`TaskCardApi` as shown below;

```
Inventiv.Sample
├── src
│   ├── Inventiv.Sample.App.Rest
│   ├── Inventiv.Sample.App.Service
│   │   └── TaskCardApi.cs
│   └── Inventiv.Sample.Module.Todo
│       ├── Service
│       │   └── ITaskCardService.cs
│       ├── TodoManager.cs
│       └── TaskCard.cs
└── test
    └── Inventiv.Sample.Test.Todo
```

And add below code to `TaskCardApi` class;

```csharp
using Castle.MicroKernel;
using Gazel.Configuration;
using Inventiv.Sample.Module.Todo;
using Inventiv.Sample.Module.Todo.Service;
using Routine;
using Routine.Engine.Configuration.ConventionBased;

namespace Inventiv.Sample.App.Service;

public class TaskCardApi : ICodingStyleConfiguration
{
    public void Configure(ConventionBasedCodingStyle codingStyle, IKernel kernel)
    {
        codingStyle.AddTypes(v => v.ApiPackage("TaskCard", t => t
            .Methods.Add(c => c.Proxy<ITaskCardService>().TargetByParameter<TaskCard>())
        ));
    }
}

```

With this configuration, you've created a virtual class -which we call _api
package_- and added all methods in `ITaskCardService` class to this virtual
class.

Now build and run `App.Service` project.

![](/-images/tutorial/tutorials-rest-api-servicetestui.png)

As you can see, there is a new group called `Api`. Under this group you will
see a new api package named `ITaskCardService`. You can see that this service
package is marked as `Virtual` and `Web Service`. Under this package there is
'Complete' service.

## Test your first endpoint

Now build and run both `App.Service` and `App.Rest` projects.

`App.Rest` is an application that acts as a gateway to your internal business
services. It only allows access to the services under `Api` group.

Now your api is in this url;

```
POST http://localhost:{port}/task-cards/{id}/complete
```

Try your endpoint by making an HTTP request to this URL, and make sure you use
an id value from your test database in place of `{id}`.

We used [Postman][] for this test, and the result is shown below;

![ ](/-images/tutorial/tutorials-rest-api-postman-result.png)

### URL breakdown

Your api consists of 3 parts;

1. Resource name in plural - `tasks`
2. Id of the resource - `6`
3. Operation/method name - `complete`

> :information_source:
>
> Resource name is in plural because you named your web service package after a
> persistent class, `TaskCard`.

## Improve your API Package

Now modify `ITaskCardService.cs` file as shown below;

```csharp
namespace Inventiv.Sample.Module.Todo.Service;

public interface ITaskCardService
{
    void Complete();
}

public interface ITaskCardsService
{
    ITaskCardInfo GetTaskCard(int taskCardId);
    List<ITaskCardInfo> GetTaskCards(bool completed);
}

public interface ITaskCardManagerService
{
    ITaskCardInfo CreateTaskCard(string? name);
}

public interface ITaskCardInfo
{
    int Id { get; }
    string? Name { get; }
    bool Completed { get; }
}

```

There are 3 new interfaces in your service definition;

1. `ITaskCardsService` to include services from `TaskCards` query class.
2. `ITaskCardManagerService` to include task card related services from
   `TodoManager` manager class.
3. `ITaskCardInfo` to include properties of `TaskCard` class in responses.

Implement your new interfaces as shown below;

```csharp[TaskCard.cs]
...
public class TaskCard : ITaskCardService, ITaskCardInfo
{
    ...
}

public class TaskCards : Query<TaskCard>, ITaskCardsService
{
    ...

    ITaskCardInfo ITaskCardsService.GetTaskCard(int taskCardId) =>
        SingleById(taskCardId);

    List<ITaskCardInfo> ITaskCardsService.GetTaskCards(bool completed) =>
        ByCompleted(completed).Cast<ITaskCardInfo>().ToList();

}
...
```

```csharp[TodoManager.cs]
...
public class TodoManager : ITaskCardManagerService
{
    ...

    ITaskCardInfo ITaskCardManagerService.CreateTaskCard(string name) =>
        CreateTaskCard(name);

}
...
```

> :information_source:
>
> Notice that we make use of [Explicit Interface Implementation][] to map
> interface methods to class methods. This is required for methods of service
> interfaces where return type in service interface is different than the
> return type in implementing class. e.g. `CreateTaskCard` method returns
> `TaskCard` in `TodoManager` class, but it returns `ITaskCardInfo` in
> `ITaskCardManagerService` interface.

And finally add new interfaces to your api package;

```csharp
...
public class TaskCardApi : ICodingStyleConfiguration
{
    public void Configure(ConventionBasedCodingStyle codingStyle, IKernel kernel)
    {
        codingStyle.AddTypes(v => v.ApiPackage("TaskCard", t => t
            .Methods.Add(c => c.Proxy<ITaskCardService>().TargetByParameter<TaskCard>())
            .Methods.Add(c => c.Proxy<ITaskCardsService>().TargetBySingleton(kernel))
            .Methods.Add(c => c.Proxy<ITaskCardManagerService>().TargetBySingleton(kernel))
        ));
    }
}
...
```

Now rebuild and run both `App.Service` and `App.Rest` projects.

You now have 4 endpoints to test;

1. `POST /task-cards/{id}/complete` mapped to `ITaskCardService.Complete`
2. `GET /task-cards` or `GET /task-cards?completed={bool}` mapped to
   `ITaskCardsService.GetTaskCards`
3. `GET /task-cards/{id}` mapped to `ITaskCardsService.GetTaskCard`
4. `POST /task-cards` mapped to `ITaskCardManagerService.CreateTaskCard`

> To test 4. endpoint you have to include a JSON request body like below. This
> is because `CreateTaskCard` method accepts a parameter named `name`.

```json
{
    "name": "task name goes here"
}
```

## Summary {#summary-of-rest-api}

In this section you've learned how to create a Rest API out of your business
services.

Now try to create new persistent objects to enhance your to-do application.

You can move to next section to download a complete to-do application.

---

Here you can download [source code for this tutorial][]

[Explicit Interface Implementation]:https://docs.microsoft.com/en-us/dotnet/csharp/programming-guide/interfaces/explicit-interface-implementation
[empty solution]:https://github.com/multinetinventiv/gazel-samples/tree/main/empty
[Postman]:https://www.getpostman.com
[source code for this tutorial]:https://github.com/multinetinventiv/gazel-samples/tree/main/tutorial/rest-api
