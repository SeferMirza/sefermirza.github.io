---
title: Exception Handling
position: 7
---

Gazel uses .NET exceptions to handle errors in your business code. For every
error message there should be a corresponding exception class.

## Writing an Exception

Create a parent static class for each group of your exceptions and define all
related exceptions under this class as a nested class.

```csharp
using static MyProduct.ResultCodes;

namespace MyProduct;

public static class CommonExceptions
{
    public class NameShouldBeUnique : ServiceException
    {
        public NameShouldBeUnique() : base(Common.Err(0)) { }
    }

    public class ValueIsRequired : ServiceException
    {
        public ValueIsRequired() : base(Common.Err(1)) { }
    }
}

```

> :warning:
>
> Exceptions should inherit from `ServiceException` to be treated as handled
> errors. Handled errors are HTTP status `4XX` in REST API and they are logged
> in `WARN` level.
>
> All other exceptions are treated as unhandled errors with code `99999`,
> logged in `ERROR` level and HTTP status is always `500` in REST API.

> :information_source:
>
> `ResultCodes` is a class that generates error codes, but we will mention this
> later in this section. You can find a detailed description in [Features /
> Exception Handling](/features#exception-handling)

## Throwing an Exception

To throw an exception you can use `using static` directive to include
exceptions class, `MyProduct.CommonExceptions` in this case;

```csharp
using static MyProduct.CommonExceptions;
```

And then just throw the exception like any other .NET exception;

```csharp
...
public class Company
{
    ...
    protected internal Company With(string name)
    {
        if(_context.Query<Companies>().AnyByName(name))
        {
            throw new NameShouldBeUnique();
        }

        ...
    }
    ...
}
...
```

## Result Codes

Above mentioned `ResultCodes` is a class where you organize your `error`,
`warning` and `info` codes as named code blocks;

```csharp
...
public class ResultCodes : ResultCodeBlocks
{
    public static readonly ResultCodeBlock Common = CreateBlock(1, "Common");
}
...
```

> :bulb:
>
> You will use this class potentially from every business module, so it's
> better for this to be included in the most base business module.

Every code block reserves `700` error codes, `100` warning codes and `100` info
codes. In the previous example we've seen `Common.Err(0)`, this means that
`NameShouldBeUnique` error should have the first error code in `Common` code
block.

```csharp
...
public NameShouldBeUnique() : base(Common.Err(0)) { } // First error of 'Common' code block
...
```

Here, we've started with `Common.Err(0)` and can go up to `Common.Err(699)`
using `Common` code block.

> :bulb:
>
> You may create a code block for every business module, so that error codes
> are grouped according to their business domain.

## Parameterized Exceptions

You can accept parameters in your exception classes;

```csharp
...
public class NameShouldBeUnique : ServiceException
{
    public NameShouldBeUnique(string name) : base(Common.Err(0), name) { }
}
```

Last parameter of base constructor accepts `params object[] parameters` so that
you can add as many parameters as you want. This parameters are used in
building the exception message that is included in the response.

### Localizing Messages

Error messages will be asked to localization with a key that is unique to each
result code. For example, `NameShouldBeUnique` exception will have `ERR-20701`
error code.

To include parameters in messages, you can use a format string as your message
such as `'{0}' already exists, name should be unique`. First parameter will
replace `{0}`, second parameter will replace `{1}`, and so on.
