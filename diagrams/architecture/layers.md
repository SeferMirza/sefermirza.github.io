---
title: Layers
position: 2
---

Below is the list of available layers in Gazel. Every layer introduces zero or
more configuration interfaces. These configuration interfaces mostly act as
wrappers around a new framework or library so that a feature can be built on
top of those technologies provided by layers.

## Default Layers

_IoC Layer_ and _Application Layer_ are default in all applications, hence it
it is better to put them before the rest.

### IoC Layer

Gazel uses [Castle.Windsor][] as its dependency injection framework. This layer
introduces two configurations:

- `IComponentModelBuilderConfiguration`: Provides `IComponentModelBuilder`
  instance. Implement this configuration to add windsor interceptors or to make
  a change in lifecycles of already registered components.
- `IIoCConfiguration`: Provides `IKernel` instance. Implement this to register
  new components. `IServiceCollection` is available to be resolved so that you
  can add other ASP.NET Core features.

> :warning:
>
> Every layer configuration has a `IKernel` parameter for features to be able
> to `Resolve` components. `IIoCConfiguration` is the only type of
> configuration where it is safe to register new components.

### Application Layer

This layer serves as a base for every application and exposes three
configurations:

- `IApplicationBuilderConfiguration`: Provides `IApplicationBuilder` instance.
  Use this configuration when you need to add new features via `Use` methods.
- `IOnStartConfiguration`: This configuration is called right after application
  building is done. It is a hook on `ApplicationStarted` lifetime event.
- `IOnStopConfiguration`: This configuration is called during
  `ApplicationStopping` lifetime event.

## Business Logic Layer

Business logic layer scans your module assemblies, registers your classes to
IoC container and configures methods to be exposed as business services. Gazel
uses [Routine][] to define a coding style. It has two configuration interfaces;

- `ICodingStyleConfiguration`: Provides `ConventionBasedCodingStyle` instance.
  Use this configuration to introduce new conventions for your the classes in
  module projects.
- `IInterceptionConfiguration`: Provides
  `ConventionBasedInterceptionConfiguration`. Use this configuration to
  register new interceptors to your business services.

## Client Api Layer

Client api layer enables your application to consume other service applications
from yours. Gazel uses [Routine][] to generate client api code, This layer
introduces one configuration;

- `IClientApiConfiguration`: Provides `ClientApiConfigurer` instance. Use this
  to configure a client context of your service dependency.

## Command Line Layer

Command line layer scans your application assembly to look for implementations
of `ICommand` interface. Gazel uses [CommandLineParser][] to parse arguments
into command and options. This layer introduces one configuration;

- `ICommandLineConfiguration`: Provides `ParserSettings` instance. Use this
  configuration to change the way [CommandLineParser][] behaves.

## Data Access Layer

Gazel makes use of __Generic Repository Pattern__ with two interfaces
`IRepository<T>` and `ILookup<T>`. With their [NHibernate][] implementations
`NHibernateRepository<T>` and `NHibernateLookup<T>`, Gazel enables your module
classes to perform CRUD operations. [Fluent NHibernate][] is used to configure
data access layer by conventions.

To create a new configuration in this layer, there are two configuration
interfaces:

- `IMappingConfiguration`: Helps you to have an access to
  `AutoPersistenceModel` instance so that you can create new ORM conventions,
  or override existing conventions.
- `INHibernateConfiguration`: Helps you to have an access to
  `FluentConfiguration` instance so that you can configure other things than
  class mappings.

For more information see [Fluent NHibernate Documentation][]

## Gateway Layer

This layer is created specificaly to make _Gateway Application_ possible. It
does not introduce a new library or framework, instead it introduces a custom
configuration to enable some changes in gateway behaviour;

- `IGatewayConfiguration`: Provides `ConventionBasedGatewayConfiguration`
  instance. Use this to change header mappings and/or to allow/forbid some
  requests.

## Rest Api Layer

Gazel uses [ASP.NET Core MVC][] to render controllers out of your business
services. It generates source code, compiles and registers it during
initalization of your application. It provides one configuration;

- `IRestApiConfiguration`: Provides `RestApiTemplate` instance. Use this to
  change action routes, naming conventions and type conversions in generated
  code.

## Service Client Layer

Service client layer registers an `IClientContext` instance to `IKernel` so
that you can use it to make calls to business services internally. This layer
uses [Routine][] to make client requests to a remote http endpoint. As an
example, _Api Application_ makes use of this layer to consume business services
from a given base URL. It comes with one configuration;

- `IServiceClientConfiguration`: Provides
  `ConventionBasedServiceClientConfiguration` and
  `ConventionBasedInterceptionConfiguration` instances. Use this to alter
  request/response headers and/or intercept business services from client.

## Service Layer

Service layer works directly with _Business Logic Layer_ so that your domain
objects can be accessed through http endpoints. This layer uses [Routine][] to
expose objects as services. It introduces two configuration interfaces:

- `IServiceConfiguration`: Helps you to configure request and response headers
  of your busines services.
- `IServiceClientConfiguration`: Provides
  `ConventionBasedServiceClientConfiguration` and
  `ConventionBasedInterceptionConfiguration` instances. Use this to alter
  request/response headers and/or intercept remote service calls from client.

## Service Local Client Layer

This layer registers an `IClientContext` instance that consumes _Business Logic
Layer_ locally, without an HTTP layer. This layer serves as an adapter between
layers that require `IClientContext` and layers that provide `ICodingStyle`,
such as _Middleware Application_ and does not introduce an additional
configuration interface.

[Castle.Windsor]:http://www.castleproject.org/projects/windsor
[NHibernate]:http://nhibernate.info
[Fluent NHibernate]:https://github.com/nhibernate/fluent-nhibernate
[Fluent NHibernate Documentation]:https://github.com/jagregory/fluent-nhibernate/wiki/Auto-mapping
[Routine]:https://github.com/multinetinventiv/routine
[CommandLineParser]:https://github.com/commandlineparser/commandline
[ASP.NET Core MVC]:https://docs.microsoft.com/en-us/aspnet/core/mvc/overvie
