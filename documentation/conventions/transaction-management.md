---
title: Transaction Management
position: 6
---

Business services always runs in a transaction context. Its either main
transaction or manually created transactions. In this section you can learn how
we deal with database transactions.

## Using Main Transaction

Before every service call, Gazel creates a database connection and begins a
transaction. If there occurs an exception the transaction is automatically
rolled back. If there are no exceptions than transaction is committed.

```csharp
public class Company
{
    ...
    public virtual void AddEmployee(string name)
    {
        _context.New<Employee>().With(this, name);

        throw new Exception(); //Above insert will be rolled back
    }
    ...
}
```

### How to Disable Main Transaction

If you want to disable this main transaction behaviour, simply put
`[ManualTransaction]` attribute to the service method. This will prevent a
transaction to be opened.

```csharp
public class Company
{
    ...
    [ManualTransaction]
    public virtual void AddEmployee(string name)
    {
        ...
    }
    ...
}
```

> :information_source:
>
> When you use `[ManualTransaction]` you are not allowed to use a persistent
> object as a parameter because there will be no transaction or connection to
> fetch that persistent object.

Disabling main transaction can help when you need to make an external or
internal API call before you make any database operation. Normally, when you
make an API call, you left a connection and a transaction open and waiting in
an idle state. If your service requires an external call, we suggest you to
disable main transaction and make your external calls without blocking a
connection.

> :warning:
>
> Be careful if you implement `ISession` and `IAccount` interfaces on
> persistent classes. You need to check if there is a transaction before
> accessing the database. You may use
> `_context.TransactionalFactory.TransactionExists` or `_context.WithTransaction`
> when implementing `ISession.GetSession`, `ISession.Validate` and
> `IAccount.HasAccess` methods.

```csharp
public class Price
{
    ...
    [ManualTransaction]
    public virtual async Money Calculate(Money amount)
    {
        // no connection is used until unit converter service responds
        var result = await unitConverterService.Convert(amount, 'USD');

        // new transaction is used to log conversion into db
        await _context.WithNewTransaction().DoAsync(() => {
            _context.New<PriceLog>().With(amount, result);
        });
        // connection is released again

        return result;
    }
    ...
}
```

Here we used the `WithNewTransaction` method to obtain a new connection and a
transaction within a service. This feature is explained in detail in the
following section.

## Creating New Transactions

Most of the time one transaction will be enough for business services. However
there are cases when you will need a record to be updated or inserted and
committed to database.

```csharp
public class Company
{
    ...
    public virtual void AddEmployee(string name)
    {
        _context.WithNewTransaction().Do(() => {
			_context.New<Employee>().With(this, name);
		});

        throw new Exception(); //Above insert will not be rolled back
    }
    ...
}
```

In above example `_context.WithNewTransaction().Do(() => { ... })` creates a new
database connection and begins a transaction on this new connection to provide
you with a new transaction context.

> :information_source:
>
> When an exception occurs in a transaction scope, Gazel catches the exception,
> rollbacks the transcation, closes the connection and rethrows the exception.
>
> ```csharp
> public class Company
> {
>     ...
>     public virtual void AddEmployee(string name)
>     {
>         _context.WithNewTransaction().Do(() => {
> 			_context.New<Employee>().With(this, name);
>
> 			throw new Exception(); //Above insert will be rolled back
> 		});
>     }
>     ...
> }
> ```

### Using Persistent Objects

In previous example we used a variable (`name`) from outer scope. This is not a
problem when variables are non-persistent objects such as `string`, `int`, a
manager object or any `class` or `struct` in your modules.

Consider you need to pass a persistent object to `AddEmployee` method.

```csharp
public class Company
{
    ...
    public virtual void AddEmployee(string name, Branch employeeBranch)
    {
        _context.WithNewTransaction().Do(() => {
			//employeeBranch object will cause trouble
			_context.New<Employee>().With(this, name, employeeBranch);
		});
    }
    ...
}
```

When you pass a persistent object directly to a new transaction context, this
means that a `Branch` instance from outer scope will be assigned to an
`Employee` instance from inner scope. This causes an unexpected state for
NHibernate. To assign a persistent object to another persistent object, they
need to be loaded from the same transaction scope and `ISession` instance. To
achieve this you need to pass `Branch` object with a different way.

```csharp
public class Company
{
    ...
    public virtual void AddEmployee(string name, Branch employeeBranch)
    {
        _context.WithNewTransaction(employeeBranch).Do(eb => {
			//correct way to pass a persistent object to new transaction
			_context.New<Employee>().With(this, name, eb);
		});
    }
    ...
}
```

`employeeBranch` is passed to new transaction scope using
`_context.WithNewTransaction(employeeBranch).Do(eb => { ... })`. When you do
this, Gazel gets the id of given `employeeBranch`, loads it in new transaction
scope and passes it as a parameter (`eb`).

> :bulb:
>
> You can pass up to __15__ parameters to `WithNewTransaction` method.

## Nested Transactions

You can create as many nested transactions as you want like below;

```csharp
//this level uses main transaction

_context.WithNewTransaction().Do(() => {
	//this level uses first transaction

	_context.WithNewTransaction().Do(() => {
		//this level uses second transaction

		_context.WithNewTransaction().Do(() => {
			//this level uses third transaction
		});
	});
});
```

> :warning:
>
> When you create nested transactions, beware that you are using more than one
> database connections at a time.

## Example: Update Balance of an Account

Below is an example to demonstrate an update to a balance in an account.

```csharp
public class Account
{
    ...
    public virtual void Withdraw(Money amount)
    {
        _context.WithNewTransaction(this).Do(@this => {
			@this.Balance -= amount;
		});
    }
    ...
}
```

If you want to lock a record, you can make use of `IRepository<T>.Lock` method.

```csharp
public class Account
{
    ...
    public virtual void Withdraw(Money amount)
    {
        _context.WithNewTransaction(this).Do(@this => {
			//use repository of @this object.
			//"this._repository" uses outer scope whereas "@this._repository" uses inner scope.
			@this._repository.Lock(@this);

			@this.Balance -= amount;
		});
    }
    ...
}
```

To make it more readable, lets extract balance operation to another method.

```csharp
public class Account
{
    ...
    public virtual void Withdraw(Money amount)
    {
        _context.WithNewTransaction(this).Do(@this => {
			@this.LockAndChangeBalance(amount);
		});
    }

	private void LockAndChangeBalance(Money amount)
	{
		_repository.Lock(this);

		Balance -= amount
	}
    ...
}
```
