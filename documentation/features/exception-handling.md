---
title: Exception Handling
position: 5
---

Exception handling feature provides a way for your services to respond with a
code and a message for every request. To set an error code and message in your
response you simply implement an exception class that extends
`ServiceException` and throw an instance of that exception class in your
business code.

But before you start writing exception classes and use them right away, we want
to describe result code system in Gazel.

## Result Codes

Result codes are reserved numbers starting from `0` to `99999` that will
represent a response status of a service in your system. There are 5 types of
result codes;

| Type      | Abbr. | Code Range      |
| --------- | ----- | --------------- |
|  Success  | -     | `0`             |
|  Info     | `INF` | `1 - 10000`     |
|  Warning  | `WAR` | `10001 - 20000` |
|  Error    | `ERR` | `20001 - 90000` |
|  Fatal    | -     | `99999`         |

> :information_source:
>
> These types are represented by `ResultCodeType` enum in `Gazel.Service`
> namespace.

### Result Code Blocks

There are two main concerns about result codes that need to be addressed;

1. To be unique and static so that they can be documented
2. To be organized so that they are easily used

There are `10K` info, `10K` warning codes and `70K` error codes. To organize
these numbers without breaking uniqueness you may split those codes into
blocks, so that for every result code block there are `100` info, `100` warning
and `700` error codes. Here is the table for result codes organized using
result code blocks;

| Block Index      | Info           | Warning         | Error           |
| ---------------- | -------------- | --------------- | --------------- |
| _#0 (Reserved)_  | `1 - 100`      | `10001 - 10100` | `20001 - 20700` |
| _#1_             | `101 - 200`    | `10101 - 10200` | `20701 - 21400` |
| _#2_             | `201 - 300`    | `10201 - 10300` | `21401 - 22100` |
| ...              |                |                 |                 |
| _#99_            | `9901 - 10000` | `19901 - 20000` | `89301 - 90000` |

> :information_source:
>
> Block `0` is reserved for built-in result codes such as `20001 -
> Authentication Required` etc. See [below section](features#built-in-errors)
> for all built-in result codes of Gazel

To create a result code block extend `ResultCodeBlocks` class like this;

```csharp
public class ResultCodes : ResultCodeBlocks
{
    public static readonly ResultCodeBlock MyBlock = CreateBlock(1, "MyBlock");
}
```

> :bulb:
>
> You will use this class potentially from every business module, so it's
> better for this to be included in the most base business module.

Now that we've created a block called `MyBlock` at index `1`, let's use this
block to create a unique result code within its code ranges;

```csharp
using static MyProduct.ResultCodes;
```

```csharp
MyBlock.Info(0); // 101
MyBlock.Info(10); // 111

MyBlock.Warn(0); // 10101
MyBlock.Warn(10); // 10111

MyBlock.Err(0); // 20701
MyBlock.Err(10); // 20711
```

You may use one block per business module in your project. This way, errors
will be organized by the domain they belong to.

## Response Status

Response status is managed by `Status` property of `IResponse` to which you can
access through `IModuleContext`.

```csharp
_context.Response.Status
```

Type of this property is `IResponseStatus`, which is the interface to represent
all response statuses. There are 3 base classes that implements this interface;

- `ServiceInformation` for information
- `ServiceWarning` for warnings
- `ServiceException` for errors

> :information_source:
>
> In service applications, `ServiceInformation` and `ServiceWarning` are
> included in response headers along with the successful response body.
> However, `ServiceException` is returned directly in the response body.

### Implementing a response status

For every message and status extend one of the response status base classes
with a proper result code.

```csharp
using static MyProduct.ResultCodes;

...

public static class MyExceptions
{
    public class ThisIsWrong : ServiceException
    {
        public ThisIsWrong() : base(MyBlock.Err(0)) { }
    }
}

public static class MyWarnings
{
    public class YouAreWarned : ServiceWarning
    {
        public YouAreWarned() : base(MyBlock.Warn(0)) { }
    }
}
```

> :information_source:
>
> Here you can see that we've used a result code block `MyBlock` to give a
> proper warning code.

### Throwing exceptions

When you implement an exception class that extends `ServiceException` you may
throw it just like any .NET exception;

```csharp
using static MyProduct.MyExceptions;

...

public class MyManager
{
    public void GiveMeError()
    {
         throw new ThisIsWrong();
    }
}
```

Exception handling mechanism catches this exception and automatically sets it
as a response status.

> :information_source:
>
> When you throw an exception that is not a `ServiceException`, then it will be
> treated as a fatal error with result code `99999`. To handle other exceptions
> than `ServiceException` you need to implement a custom exception handler as
> mentioned in [below section](features#customization).

> :bulb:
>
> You may still catch this exception from your business code so that exception
> handling mechanism is not triggered.

### Setting response status

You may also directly set `_context.Response.Status` property with an
`IResponseStatus` instance. Below is an example of setting status to a warning;

```csharp
using static MyProduct.MyWarnings;

...

public class MyManager
{
    private readonly IModuleContext _context;
    public MyManager(IModuleContext context) => _context = context;

    public void GiveMeStatus()
    {
        _context.Response.Status = new YouAreWarned();
    }
}
```

### Log Levels

- Handled exceptions, responses with error codes, are logged in __Warning__
  level.
- Unhandled exceptions, responses with fatal code , are logged in __Error__
  level.
- Other statuses are not logged separately.

> :bulb:
>
> You may configure logging to only include error logs in production, so that
> you can monitor unhandled errors in the production code.

### Localizing messages

Every result code should have a corresponding message in localization.
Exception handling uses `ILocalizer` to retrieve message format using a key
with type and code such as `ERR-20001`, `WAR-10001`. Once message format is
retrieved, it is formatted using message parameters in response status object.

Let's say you defined another exception in `MyBlock`;

```csharp
...
public class RequiredParameter : ServiceException
{
    public RequiredParameter(string parameterName) : base(MyBlock.Err(1), parameterName) { }
}
```

This would have a localization key `ERR-20702`.

Assume your localization has a message like this;

```json
{
    "ERR-20702": "Parameter is required: '{0}'"
}
```

When you throw this exception;

```csharp
public void CreateEmployee(string ssid)
{
    if(string.IsNullOrWhitespace(ssid))
    {
        throw new RequiredParameter(nameof(ssid));
    }
    ...
}
```

You will send a response with code `20702` and message;

```
Parameter is required: 'ssid'
```

### Including extra data

`ServiceException` class has a special property called `ExtraData` to enable you
to include extra data along with code and message so that client applications can
use this information to handle some business logic in exception case.

Assume you have a `Withdraw` service that withdraws money from an account. You
may return current balance in extra data, when withdraw operation throws
insufficient balance exception so that client application can use it to provide
some further functionality.

> :information_source:
>
> Service applications include this informations in `X-Extra-Data` response
> header. Other applications, e.g. api application, may not return this
> information.

## Built-in Errors

Below you can see built-in exceptions and their defined error codes;

| Error Code | Error Type                                  | HTTP Status Code[^2] |
| ---------- | ------------------------------------------- | -------------------- |
| 20001      | AuthenticationRequiredException             | [401][]              |
| 20002      | FormatException                             |                      |
| 20003      | PermissionDeniedException                   | [403][]              |
| 20004      | FormatException&lt;**CreditCardNumber**&gt; |                      |
| 20005      | UriFormatException                          |                      |
| 20006      | ObjectNotFoundException                     | [404][]              |
| 20007      | FormatException&lt;**AppToken**&gt;         |                      |
| 20008      | FormatException&lt;**CardNumber**&gt;       |                      |
| 20009      | FormatException&lt;**CurrencyCode**&gt;     |                      |
| 20010      | FormatException&lt;**DateRange**&gt;        |                      |
| 20011      | FormatException&lt;**Date**&gt;             |                      |
| 20012      | FormatException&lt;**Email**&gt;            |                      |
| 20013      | FormatException&lt;**MoneyRange**&gt;       |                      |
| 20014      | FormatException&lt;**Money**&gt;            |                      |
| 20015      | FormatException&lt;**Tckn**&gt;             |                      |
| 20016      | FormatException&lt;**TimeRange**&gt;        |                      |
| 20017      | FormatException&lt;**Time**&gt;             |                      |
| 20018      | FormatException&lt;**Vkn**&gt;              |                      |
| 20019      | InvalidEnumArgumentException                |                      |
| 20020      | RangeException&lt;**DateRange**&gt;         |                      |
| 20021      | RangeException&lt;**MoneyRange**&gt;        |                      |
| 20022      | RangeException&lt;**TimeRange**&gt;         |                      |
| 20023      | FormatException&lt;**TriState**&gt;         |                      |
| 20024      | InvalidCurrencyException                    |                      |
| 20025      | FormatException&lt;**Rate**&gt;             |                      |
| 20026      | FormatException&lt;**Timestamp**&gt;        |                      |
| 20027      | FormatException&lt;**DateTime**&gt;         |                      |
| 20028      | FormatException&lt;**DateTimeRange**&gt;    |                      |
| 20029      | RangeException&lt;**DateTimeRange**&gt;     |                      |
| 20030      | FormatException&lt;**Guid**&gt;             |                      |
| 20031      | RequestIdRequiredException                  |                      |
| 20032      | FormatException&lt;**Binary**&gt;           |                      |
| 20033      | MaxDailyRequestCountExceededException       |                      |
| 20034      | FormatException&lt;**Iban**&gt;             |                      |
| 20035      | FormatException&lt;**Geoloc**&gt;           |                      |
| 20036      | FormatException&lt;**TimeSpan**&gt;         |                      |
| 20037      | FormatException&lt;**VknOrTckn**&gt;        |                      |
| 20038      | FormatException&lt;**MimeType**&gt;         |                      |
| 20039      | FormatException&lt;**CountryCode**&gt;      |                      |
| 20040      | NotImplementedException                     | [501][][^1]          |
| 20041      | FormatException&lt;**Password**&gt;         |                      |
| 20042      | FormatException&lt;**EncryptedString**&gt;  |                      |
| 20201      | FrameworkExceptions.Remote                  |                      |
| 20202      | FrameworkExceptions.InvalidSign             |                      |

### Information and Warnings

| Result Code | Response Status                                   |
| ----------- | ------------------------------------------------- |
| 1           | FrameworkInformations.Remote                      |
| 10001       | FrameworkWarnings.ObsoleteServiceCalled           |
| 10002       | FrameworkWarnings.Remote                          |
| 10003       | FrameworkWarnings.GivenLanguageCodeIsNotSupported |

## Customization {#exception-handling-customization}

Exception handling mechanism is a core feature of Gazel framework. You cannot
change the underlying mechanism nor you cannot disable it. However, you can
extend it to provide additional exception handlers.

### Creating a custom handler

Exception handling is done through `IExceptionHandler` interface. If you want
to provide a custom mechanism to handle errors, you must implement this
interface and register it to `IKernel`.

When an exception is thrown, exception handling feature loops through all
exception handlers to find a way to convert the exception into
`ServiceException`. If it can, then it means exception is handled with an error
code, if it cannot, then it means it is an unhandled exception with the fatal
code.

Below is an example of a custom exception handler for `ArgumentException`;

```csharp
public class MyHandler : IExceptionHandler
{
    public bool Handles(Exception ex) => ex is ArgumentException;
    public ServiceException Handle(Exception ex) => new ServiceException(90001)
    ExceptionInfo GetExceptionInfo(int resultCode) =>
        resultCode == 90001
            ? new ExceptionInfo(typeof(ArgumentException))
            : null;
}
```

> :bulb:
>
> If you implement a handler inside a module project, it will be automatically
> registered to kernel so that exception handling can use your custom handler.

[^1]:This mapping violates `4xx` rule for handled exceptions. This is intentional to provide you to throw a `NotImplementedException` anywhere without causing an error log.
[^2]:All handled errors are [400][] unless indicated otherwise.

[400]:https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/400
[401]:https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/401
[403]:https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/403
[404]:https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/404
[501]:https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/501
