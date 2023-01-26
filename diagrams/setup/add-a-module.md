---
title: Add a module
position: 2
---

In this document you will learn to create a new business module to your
existing solution.

## Create a new module

A module is a project that contains the domain logic of a specficic subset of
your backend, so choose a name accordingly. Naming convention for module
projects is `<Company>.<Component>.Module.<ModuleName>`.

Now create a class library project under `src` and add it to solution.

```bash
dotnet new classlib --output src/Inventiv.Sample.Module.Todo
dotnet sln add src/Inventiv.Sample.Module.Todo --solution-folder src
```

Check if your solution has new module under `src` folder;

```
Inventiv.Sample
└── src
    ├── Inventiv.Sample.App.Rest
    ├── Inventiv.Sample.App.Service
    └── Inventiv.Sample.Module.Todo
```

Add [Gazel][] to your new module;

```bash
dotnet add src/Inventiv.Sample.Module.Todo package Gazel
```

> :warning:
>
> Modules only use [Gazel][]. Do NOT add [Gazel.Configuration][] package to a
> module project.

Finally you need to add your module project reference to `App.Service` so that
it renders and exposes business services in your new module.

```bash
dotnet add src/Inventiv.Sample.App.Service reference src/Inventiv.Sample.Module.Todo
```

## Create a test project

To test your business services you need to create a test project. Naming
convention for test projects is `<Company>.<Component>.Test.<ModuleName>`.

Add a new class library project under `test` folder. Add
[Gazel.Configuration][] package and module reference to the new project;

```bash
dotnet new nunit --output test/Inventiv.Sample.Test.Todo
dotnet sln add test/Inventiv.Sample.Test.Todo --solution-folder test
dotnet add test/Inventiv.Sample.Test.Todo package Gazel.Configuration
dotnet add test/Inventiv.Sample.Test.Todo reference src/Inventiv.Sample.Module.Todo
```

Your directory structure should look like this;

```
Inventiv.Sample
├── src
│   ├── Inventiv.Sample.App.Rest
│   ├── Inventiv.Sample.App.Service
│   └── Inventiv.Sample.Module.Todo
└── test
    └── Inventiv.Sample.Test.Todo
        └── Usings.cs
```

> :information_source:
>
> If your test project does not have 'Usings.cs', you can add it manually.
> Then add the following line 'global using NUnit.Framework;'.
---

[Gazel]:https://nuget.org/packages/Gazel
[Gazel.Configuration]:https://nuget.org/packages/Gazel.Configuration
