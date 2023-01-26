---
title: Database Transactions
position: 3
---

In this tutorial, you will create an update service and learn about how Gazel
manages database transactions.

## Business Service on Persistent Objects

Now that you've created task cards, it's time to complete them. To do this add
following method to your `TaskCard` class.

```csharp
...
public class TaskCard
{
    ...
    public virtual void Complete()
    {
        Completed = true;
    }
    ...
}
...
```

And that's it. You've created a `Complete` service.

> :information_source:
>
> There is no need to create a database transaction, before every service call
> Gazel automatically opens a database connection and begins a transaction.

> :information_source:
>
> Notice that you don't have to call an update method in repository. Gazel
> configures NHibernate in auto update mode. This means it makes a dirty check
> upon commit and update rows when there is a change.

Build and run `App.Service` again. Now you will see a `TaskCard` service
package and under this package there is `Complete` service. Since this service
requires a row in database, `Id` parameter is added automatically.

Go and create a task card using `Task Manager / Create Task Card` and use that
object's `Id` in `Target/Id` field of `Complete` service.

When you press call button you will see following screen;

![](/-images/tutorial/complete-task.png)

### Important note on `protected` setters

You may remember that we used `protected` access modifier on property setters
as shown below;

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

As mentioned before `protected` setters ensure that data of a persistent object
can only be updated within its own class. Gazel is designed to welcome business
services on persistent classes.

If you allow `public` setters, that is fine too. But this would make it
possible to update a property value from outside. This is because we use auto
update feature of NHibernate.

Always remember that persistent objects in Gazel are not simle DTOs. They are
context aware domain objects that manages a row in a database.

## Testing an Update Service

Let's move on to testing. Now add following test to your `TodoTest` test class;

```csharp
...
[TestFixture]
public class TodoTest : TestBase
{
    ...
    [Test]
    public void Complete__marks_task_card_as_completed()
    {
        var todoManager = Context.Get<TodoManager>();
        var taskCard = todoManager.CreateTaskCard("Write Tests");

        BeginTest();

        taskCard.Complete();

        Assert.IsTrue(taskCard.Completed);
    }
}
...
```

Here's what you've done;

- _Arrange_: Get `TodoManager` object and create a task card named "Write
  Tests"
- _Act_: Complete the new `TaskCard` object
- _Assert_: Assert that task card is completed

> :information_source:
>
> Note that this time `CreateTaskCard` is moved before `BeginTest()`. This is
> because for this test case creating a task card is a part of the _arrange_
> step.

## Summary {#summary-of-database-transactions}

In this tutorial you've learned how to write a simple update service to a
method. Now try to add new properties and methods to your persistent classes,
re-run and see the results.

Once you are ready, you can proceed to learn how to write query services.

---

Here you can download [source code for this tutorial][].

[source code for this tutorial]:https://github.com/multinetinventiv/gazel-samples/tree/main/tutorial/database-transactions
