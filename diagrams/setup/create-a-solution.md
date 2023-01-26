---
title: Create a solution
position: 1
---

In this document, you will learn how to setup a solution from scratch.

## Create a blank solution

Create a solution folder for your application. Name it in the
`<Company>.<Component>` convention (see [.NET Naming Conventions][]). Under
this folder create an empty solution.

```bash
mkdir Inventiv.Sample; cd Inventiv.Sample
dotnet new sln
```

> :information_source:
>
> We well use `Inventiv` as a company, and `Sample` as a component throughout
> this document.

## Create a service application

To create a service application, first create a new web project by typing below
commands;

```bash
dotnet new web --output src/Inventiv.Sample.App.Service
dotnet sln add src/Inventiv.Sample.App.Service --solution-folder src
```

Now `Inventiv.Sample.sln` should have below structure;

```
Inventiv.Sample
└── src
    └── Inventiv.Sample.App.Service
        ├── Properties
        │   └── launchSettings.json
        ├── appsettings.json
        ├── appsettings.Developement.json
        └── Program.cs
```

Now add [Gazel.Configuration][] package to the `App.Service` project from
nuget.org.

```bash
dotnet add src/Inventiv.Sample.App.Service package Gazel.Configuration
```

To configure this project to use Gazel, modify `Program.cs` file in
`src/Inventiv.Sample.App.Service` as below;

```csharp[Program.cs]
var builder = WebApplication.CreateBuilder(args);
var configuration = builder.Configuration;

builder.Host.UseGazelServiceProvider();

builder.Services.AddGazelServiceApplication(configuration,
    database: c => c.Sqlite("gazel.tutorial.db"),
    service: c => c.Routine("http://localhost:5000/service"),
    logging: c => c.Log4Net(LogLevel.Information, l => l.DefaultConsoleAppenders()),
    authentication: c => c.AllowAnonymous(),
    authorization: c => c.AllowAll()
);

var app = builder.Build();

app.UseGazel();
app.Run();
```

As you can see there are 5 configurations;

- `database: c => c.Sqlite("gazel.tutorial.db")` tells Gazel to use a local
  `SQLite` database with a file named `gazel.tutorial.db`. This file will be
  located in default user documents folder.
- `service: c => c.Routine("http://localhost:5000/service")` tells Gazel the
  service url base to itself to be able to make internal calls.
- `logging: c => c.Log4Net(LogLevel.Info, l => l.DefaultConsoleAppenders())`
  tells Gazel to use console appenders in info level
- `authentication: c => c.AllowAnonymous()` disables authentication feature.
- `authorization: c => c.AllowAll()` disables authorization feature.

> :warning:
>
> You need to configure your application port correctly. You can go to
> `Properties/launchSettings.json` and set it to `5000`;
>
> ```json[launchSettings.json]
> {
>   "iisSettings": {
>     "windowsAuthentication": false,
>     "anonymousAuthentication": true,
>     "iisExpress": {
>       "applicationUrl": "http://localhost:5000",
>       "sslPort": 5001
>     }
>   },
>   "profiles": {
>     "Inventiv.Sample.App.Service": {
>       "commandName": "Project",
>       "dotnetRunMessages": true,
>       "launchBrowser": true,
>       "applicationUrl": "https://localhost:5001;http://localhost:5000",
>       "environmentVariables": {
>         "ASPNETCORE_ENVIRONMENT": "Development"
>       }
>     },
>     "IIS Express": {
>       "commandName": "IISExpress",
>       "launchBrowser": true,
>       "environmentVariables": {
>         "ASPNETCORE_ENVIRONMENT": "Development"
>       }
>     }
>   }
> }
> ```

> :information_source:
>
> Gazel scans bin directory to configure your classes automatically. To
> understand which assembly is yours, Gazel uses assembly name of your app
> project. If your host project is named `Foo.Bar.App.Service` then it will
> only scan assemblies with a name that starts with `Foo`.

## Create a Rest API application

Now create another web project and name it after
`<Company>.<Component>.App.Rest` format;

```bash
dotnet new web --output src/Inventiv.Sample.App.Rest
dotnet sln add src/Inventiv.Sample.App.Rest --solution-folder src
```

Now your solution explorer should look like this;

```
Inventiv.Sample
    └── src
        ├── Inventiv.Sample.App.Rest
        │   ├── Properties
        │   │   └── launchSettings.json
        │   ├── appsettings.json
        │   ├── appsettings.Developement.json
        │   └── Program.cs
        └── Inventiv.Sample.App.Service
```

Now add [Gazel.Configuration][] package to the `App.Rest` project from
nuget.org.

```bash
dotnet add src/Inventiv.Sample.App.Rest package Gazel.Configuration
```

To configure this project to use Gazel, modify `Program.cs` file in
`src/Inventiv.Sample.App.Rest` as below;

```csharp[Program.cs]
var builder = WebApplication.CreateBuilder(args);
var configuration = builder.Configuration;

builder.Host.UseGazelServiceProvider();

builder.Services.AddGazelApiApplication(configuration,
    serviceClient: c => c.Routine("http://localhost:5000/service"),
    restApi: c => c.Standard(),
    logging: c => c.Log4Net(LogLevel.Information, l => l.DefaultConsoleAppenders())
);

var app = builder.Build();

app.UseGazel();
app.UseCors();
app.Run();
```

As you can see there are 3 main configurations.

- `serviceClient: c => c.Routine("http://localhost:5000/service"))` tells Gazel
  to use previously created service application as a backend service.
- `restApi: c => c.Standard()` tells Gazel to use standard rest configuration
  which uses AspNetCore.Mvc template.
- `logging: c => c.Log4Net(LogLevel.Information, l => l.DefaultConsoleAppenders())`
  tells Gazel to use console appenders in info level

---

Now you've set up your environment to start developing a new backend. To add a
new business module to your project, check out next section.

[Gazel.Configuration]:https://nuget.org/packages/Gazel.Configuration
[.NET Naming Conventions]:https://docs.microsoft.com/en-us/dotnet/standard/design-guidelines/names-of-assemblies-and-dlls
[Castle.Windsor]:https://github.com/castleproject/Windsor
