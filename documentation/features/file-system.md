---
title: File System
position: 6
---

File system feature basically enables you to read/write file content from/to a
file storage.

## `IFileSystem` interface

When an application has this feature, you can directly inject `IFileSystem` interface
into your business objects. Below is a simple example;

```csharp
public class FileManager
{
    private readonly IFileSystem _file;
    public FileManager(IFileSystem file) => _file = file;

    public await Task<Binary> FetchContent(string path)
    {
        return await _file.ReadAsync(path);
    }
}
```

## Configuration {#file-system-configuration}

Gazel has a built-in implementation that uses local storage.

```csharp
builder.Services.AddGazelServiceApplication(
    ...
    fileSystem: c => c.Local(rootPath: "files"),
    ...
);
```

When `rootPath` is given, all files will be stored under this folder. You might
pass an absolute path as well.

```csharp
c => c.Local(rootPath: "/absolute-path"),
```

> :information_source:
>
> Local storage makes sense for development environment. You may use a network
> path by giving an absolute path as well.

## Customization {#file-system-customization}

When you want to store files in a different type of storage, you can implement
`IFileSystem` interface and register it using `Custom` configurer in
`FileSystemConfigurer`.

Assume you've made an S3 implementation of file system interface, you can
register it as below;

```csharp
c => c.Custom<S3FileSystem>()
```

> :bulb:
>
> If your implementation depends on some configuration, write a settings class,
> register it to the IoC and inject it to the file system implementation.
>
> For above example, write a class named `S3Settings` and inject it into
> `S3FileSystem` class, and then register `S3Settings` to the kernel.
