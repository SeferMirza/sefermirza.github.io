---
title: Persistent Classes
position: 2
---

In this tutorial, you will create a persistent class and make your first
database operation using Gazel.

## Create A Persistent Class

Database operations are done using `Persistent` objects.

> :information_source:
>
> An object is `Persistent` if its class injects its own repository. For more
> information see: [Data Persistence](/features#data-persistence)

Create a new class named `TaskCard` under `Todo` module.

```
Inventiv.Sample
├── src
│   ├── Inventiv.Sample.App.Rest
│   ├── Inventiv.Sample.App.Service
│   └── Inventiv.Sample.Module.Todo
│       ├── TodoManager.cs
│       └── TaskCard.cs
└── test
    └── Inventiv.Sample.Test.Todo
        └── TodoTest.cs
```

Add following code to your `TaskCard` source file.

```csharp
using Gazel;
using Gazel.DataAccess;

namespace Inventiv.Sample.Module.Todo;

public class TaskCard
{
    private readonly IRepository<TaskCard> _repository = default!;

    protected TaskCard() { }
    public TaskCard(IRepository<TaskCard> repository)
    {
        _repository = repository;
    }
}

public class TaskCards : Query<TaskCard>
{
    public TaskCards(IModuleContext context) : base(context) { }
}

```

Each `TaskCard` object will represent one row in `TaskCard` table.

> :information_source:
>
> `TaskCards` class is registered to IoC as a singleton by convention and it
> will consist of queries to that table. In this tutorial you will not write
> any queries. Leave this class empty for now.

`TaskCard` class, by injecting its own repository, indicates that its a
persistent class.

> :information_source:
>
> Notice that both classes are subject to dependency injection.
>
> `protected TaskCard() { }` constructor is there for NHibernate to create
> proxies for lazy loading.

Now you can add properties to your `TaskCard` class as shown below;

```csharp
...
public class TaskCard
{
    ...
    public virtual int Id { get; protected set; }
    public virtual string? Name { get; protected set; }
    public virtual bool Completed { get; protected set; }
    ...
}
...
```

First property is mandatory for all persistent classes. Gazel requires an
integer Id column for every table.

> :information_source:
>
> The reason for `protected` setters is to implement domain logic inside
> persistent classes.
>
> `virtual` keywords are there for NHibernate to create proxies for lazy
> loading.

These properties are automatically mapped to columns of `TaskCard` table in
`gazel.tutorial.db` database.

> :information_source:
>
> Note that you don't have to create tables and columns in your SQLite
> database.  When in local development mode, Gazel configures NHibernate's
> SQLite connection to automatically create database schema.

Now add following method to `TaskCard` class.

```csharp
...
public class TaskCard
{
    ...
    protected internal virtual TaskCard With(string? name)
    {
        Name = name;
        Completed = false;

        _repository.Insert(this);

        return this;
    }
    ...
}
...
```

For persistent classes construction is in two steps. First step is the actual
constructor, and second step is `With` methods which takes instance arguments
and inserts a row to database via `_repository`.

Go to `TodoManager` class in `Todo` module and modify its content with the
following code;

```csharp
using Gazel;

namespace Inventiv.Sample.Module.Todo;

public class TodoManager
{
    private readonly IModuleContext _context;

    public TodoManager(IModuleContext context)
    {
        _context = context;
    }

    public TaskCard CreateTaskCard(string? name)
    {
        return _context.New<TaskCard>().With(name);
    }
}

```

You've created a business service named `CreateTaskCard` that inserts a new
task card record with the given name. As mentioned above, construction is done
in two steps;

1. The first one is `_context.New<TaskCard>()` which initiates a new `TaskCard`
   object using IoC container,
2. And the second one is `.With(name)` which inserts a new record using its own
   `_repository`.

So together you read this as "__new task card with name__".

Now run `App.Service` project to see your new service `Create Task Card` and
create task cards using it.

![ ](/-images/tutorial/create-task-card.png)

> :information_source:
>
> Note that Id's are assigned from database. This is the default mapping
> configuration Gazel applies to NHibernate.

## Testing Persistent Objects

Go to `TodoTest` class in `Test.Todo` add following test case;

```csharp
...
[TestFixture]
public class TodoTest : TestBase
{
    ...
    [Test]
    public void CreateTaskCard__creates_a_task_card_using_given_name()
    {
        var todoManager = Context.Get<TodoManager>();

        BeginTest();

        var actual = todoManager.CreateTaskCard("Write Tests");

        Verify.ObjectIsPersisted(actual);
        Assert.AreEqual("Write Tests", actual.Name);
    }
    ...
}
...
```

> You may remove `SayHello__says_hello` test case from previous tutorial.

Here is what this test does in terms of AAA pattern;

- _Arrange_: Gets `TodoManager` instance from context
- _Act_: Creates a task card named "Write Tests"
- _Assert_: Verifies that the `TaskCard` object is persisted and its name is
  "Write Tests"

> :information_source:
>
> `BeginTest()` call prepares underlying mechanism for the execution of service
> under test.
>
> Verify property comes from `TestBase` class. It basically helps you to check
> if object is persisted or deleted.
>
> When testing, Gazel configures a fake service application in which there is a
> database connection to an in-memory SQLite database. For every test case, it
> begins a transaction and rollbacks after execution.

## Summary {#summary-of-persistent-classes}

Like manager classes, persistent classes also follow conventions. In this
tutorial you've created a table and a create service using no configuration.

Now try to add new properties to `TaskCard` class or add new persistent
classes, re-run and see the results.

Once you are ready, you can proceed to learn how to update a record in
database.

---

Here you can download [source code for this tutorial][].

[source code for this tutorial]:https://github.com/multinetinventiv/gazel-samples/tree/main/tutorial/persistent-classes
