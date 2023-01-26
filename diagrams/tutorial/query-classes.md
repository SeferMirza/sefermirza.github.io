---
title: Query Classes
position: 4
---

In this tutorial, you will create a query service and learn about query service
conventions.

## Create a Query Service

Now you will create a query service to see all completed task cards. Add below
code to `TaskCards` class in `TaskCard.cs`.

```csharp
...
public class TaskCards : Query<TaskCard>
{
    ...
    public List<TaskCard> ByCompleted(bool completed)
    {
        return By(t => t.Completed == completed);
    }
    ...
}
...
```

> :information_source:
>
> `By` method is inherited from `Query<T>` base class, and it simply accepts a
> lambda expression with one parameter of type `T` which is `TaskCard` in this
> example.

Like every public method, this query method is also exposed as a business
service. Build and run `App.Service` to see your completed task cards.

> :information_source:
>
> Query naming conventions;
>
> - When a query method returns a list of objects, the convention is to name it
>   as `By`.
> - When a query method takes only one parameter, method name contains
>   parameter name as a suffix.
>
> So by these conventions we named this query as `ByCompleted`. For more
> information see: [Queries](/conventions#queries)

## Testing Queries

Now add following test case to your `TodoTest` class;

```csharp
...
[TestFixture]
public class TodoTest : TestBase
{
    ...
    [Test]
    public void TaskCards_ByCompleted__filters_task_cards_by_completed_column()
    {
        var todoManager = Context.Get<TodoManager>();

        todoManager.CreateTaskCard("incomplete");
        todoManager.CreateTaskCard("completed 1").Complete();
        todoManager.CreateTaskCard("completed 2").Complete();

        BeginTest();

        var actual = Context.Query<TaskCards>().ByCompleted(true);

        Assert.AreEqual(2, actual.Count);
        Assert.AreEqual("completed 1", actual[0].Name);
        Assert.AreEqual("completed 2", actual[1].Name);
    }
    ...
}
...
```

> :information_source:
>
> Note that there is a `Context.Query<T>()` shortcut to access query classes.
> Unlike `Context.Get<T>()` this shortcut is available in _module_ projects as
> well, so that you don't have to inject query classes.

## Summary {#summary-of-query-classes}

Query classes help you to organize your query methods for the same persistent
class into one place, so that you can create reusable query methods.

Now try to create other query methods that accepts more than one parameter,
re-run and see the results.

Once you are ready, you can proceed to learn how to create service packages and
expose your business services publicly.

---

Here you can download [source code for this tutorial][].

[source code for this tutorial]:https://github.com/multinetinventiv/gazel-samples/tree/main/tutorial/query-classes
