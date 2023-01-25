---
title: Crypto
position: 4
---

Crypto feature provides a basic encryption/decryption capability to store
sensitive data in configuration file or database. It also provides an API to be
used in accepting an input in a more secure way. Let's dive in to see how you
can use this feature to make your back-end functionality more secure.

## Crypto API

This API consists of two main types `ICryptographer` and `EncryptedString`
providing ways to encrypt/decrypt data and represent encrypted data,
respectively.

### `ICryptographer` interface

This interface is a gateway facade to an underlying security mechanism provided
by .NET. Behind the scenes, this interface uses a `X.509` certificate with a an
_public / private key pair_ (for more information see [X.509][] and [RSA][]).
This way you can make use of asymmetric encryption where needed. There are two
types of usage; _Encrypt / Decrypt_ and _Sign / Verify_.

#### `Encrypt` & `Decrypt`

First and most basic type of usage is to encrypt data using the public key, and
decrypt it using the private key. For example, you can use this to encrypt
sensitive data to save it in somewhere unsafe so that you can retrieve and
decrypt it later.

```csharp
public class CryptoManager
{
    private readonly ICryptographer _crypto;
    public FileManager(ICryptographer crypto) => _crypto = crypto;

    public Binary GetSensitiveData()
    {
        var sensitive = "something to hide".ToUtf8Binary();

        return _crypto.Encrypt(sensitive);
    }

    public bool CheckSensitiveData(Binary binary)
    {
        var sensitive = _crypto.Decrypt(binary).ToUtf8String();

        return sensitive == "something to hide";
    }
}
```

> :bulb:
>
> You may share your public key with the outside world so that anyone with this
> key can encrypt and send a sensitive information which can only be decrypted
> by your back-end system.

`ICryptographer` also has helper methods to make string conversions easier.

```csharp
...
public string GetSensitiveData()
{
    // returns base64 representation of encrypted binary
    return _crypto.Encrypt("something to hide");
}

public bool CheckSensitiveData(string encryptedSensitive)
{
    return _crypto.DecryptUnsecure(encryptedSensitive) == "something to hide";
}
...
```

Above code uses `DecryptUnsecure` method, which returns a regular string
object. There is also a `Decrypt` method which returns a `SecureString`.
[SecureString][] is a class that encrypts given string with a symmetric key and
stores in memory so that a it is safely kept in memory.

```csharp
...
public bool CheckSensitiveData(string encryptedSensitive)
{
    var sensitive = _crypto.Decrypt(encryptedSensitive);

    return sensitive.Decrypt() == "something to hide";
}
...
```

Notice that data is decrypted twice; first time it is done by using your X.509
certificate, second time it is done on `SecureString` object by using a
symmetric key that .NET generates.

> :information_source:
>
> This code is for demonstration purposes only. In a real life case you might
> keep your sensitive data in a `SecureString` object, and pass it to a method
> as a parameter or store in a property. This way it will be less likely to be
> exposed. Decrypt a `SecureString` right before you use it in your code.

#### `Sign` & `Verify`

_Sign & verify_ is like the opposite usage of _encrypt & decrypt_. Decryption
can only happen on the side that has the private key, which is back-end side in
this case. So encryption is made with a public key, decryption is made with the
corresponding private key.

On the contrary, here, signing is done using a private key, and verifying is
done using its corresponding public key. So in this usage it's not about hiding
information from outside, rather it's about signing data to make it possible
for retrievers to verify that data is signed by, thus coming from, the trusted
source.

```csharp
...
public string[] GetSignedData()
{
    var sensitive = "something to be signed";

    var hasher = HashAlgorithm.Create("SHA256");
    hasher.ComputeHash(sensitive.ToUtf8Binary());

    // Signing is done using the private key
    var signature = _crypto.Sign(hasher.Hash, "SHA256");

    return new[] { sensitive, signature };
}

public bool Verify(string[] signedData)
{
    var sensitive = signedData[0];
    var signature = signedData[1];

    var hasher = HashAlgorithm.Create("SHA256");
    hasher.ComputeHash(sensitive.ToUtf8Binary());

    // Verification is done with the public key
    return _crypto.Verify(hasher.Hash, "SHA256", signature);
}
...
```

> :information_source:
>
> Sign and verify is used in [Secure Call](/features#secure-call) feature,
> where response values are used to compute a hash to be signed so that client
> can verify and trust response.

### `EncryptedString` struct

This struct acts like a wrapper type for `SecureString` class from .NET, (see
[SecureString][]). It conforms to the _parseable value type_ convention just
like rest of the value types from _Gazel.Primitives_ package. There are three ways to
create an `EncryptedString` instance.

1. `Parse` method, when you have a plain string object;
   ```csharp
   var encrypted = EncryptedString.Parse("something sensitive");
   ```
2. `FromEncrypted` method, when you have an encrypted value;
   ```csharp
   var encrypted = EncryptedString.FromEncrypted(encryptedBinary, b => _crypto.DecryptUnsecure(b));
   ```
   Second parameter is `decryptDelegate` in case `EncryptedString.Decrypt` or
   `Encrypted.ToString()` method are called on this instance. Without a decrypt
   delegate it would not be able to decrpyt its value.
3. Use a `SecureString` instance. You can cast it to an `EncryptedString`;
   ```csharp
   var encrypted = (EncryptedString)secureString;
   ```
   or use constructor;
   ```csharp
   var encrypted = new EncryptedString(secureString);
   ```

This struct either stores given encrypted binary value, or a secure string
instance so that sensitive information is securly kept in memory. You may read
_[How secure is SecureString][]_ section from .NET documentation to learn more.

#### Mapping to a Table Column

You can map `EncryptedString` just like any other value type.

```csharp
public class Secret
{
    ...
    public virtual int Id { get; protected set; }
    public virtual string Name { get; protected set; }
    public virtual EncryptedString Value { get; protected set; }
    ...
}
```

If you intend to use an encrypted string property, __please read__ below
information carefully;

- Only encrypted binary value is stored in database so that nobody can see the
  value without a proper certificate. So it is __highly recommended__ for you
  to use a __different__ certificate for each environment (_Development_,
  _Production_ etc.), and __never__ expose private key of your _Production_
  certificate to the people that have access to your production database.
- Value is not decrypted until you explicitly call `Decrypt` or `ToString`.
  This is because decryption is costly and retrieving a list of persistent
  objects should not decrypt automatically. `DataAccessLayer` uses
  `FromEncrypted` method to create `EncryptedString` instances when data is
  retrieved from database.
- Since `EncryptedString` is expected to store sensitive data, it will never
  appear in a response directly. So you don't need to make it `protected
  internal` or `[Internal]`.

> :information_source:
>
> Notice how Gazel does __not__ decrypt an EncryptedString in any case. So if
> your business logic somehow requires an encrypted string to be decrypted,
> remember that you will need to either call `ToString()` or `Decrypt()` at
> some point.

Below is an example of how you can generate and store a sensitive information;

```csharp
public class Secret
{
    ...
    protected internal SecretToken With(string name)
    {
        Name = name;
        Value = EncryptedString.Parse($"{system.NewGuid()}");

        _repository.Insert(this);

        return this;
    }
    ...
}
```

#### As a Service Parameter

You may use `EncryptedString` as a service parameter just like any other value
type. Below you can see a simple example;

```csharp
public class Secret
{
    ...
    public virtual void UpdateValue(EncryptedString value)
    {
        Value = value;
    }
    ...
}
```

> :warning:
>
> Beware that this does __not__ encrypt the sensitive data when transferring
> from client to your back-end. You can already achieve this through an HTTPS
> connection. `EncryptedString` only helps you to secure this data using a
> symmetric encryption when stored in memory and an asymmetric encryption when
> stored in database.

Although `EncryptedString` is accepted as a service parameter, a method that
returns `EncryptedString` cannot be registered as a business service (a.k.a.
operation), and cannot be called from outside. And also, a property with its
type as `EncryptedString` cannot be registered in service layer as a business
data as well.

> :information_source:
>
> When a service one of the parameters of a service is `EncryptedString`, that
> service is marked as sensitive and does __not__ log its parameter and
> response data.

#### Reading from Settings

This feature allows you to read an encrypted string from settings using
`GetEncryptedString` method of `ICryptographer` interface. Let's revisit the
previous example from [ICryptographer
Interface](features#icryptographer-interface) section.

```csharp
public Binary GetSensitiveData()
{
    var sensitive = "something to hide".ToUtf8Binary();

    return _crypto.Encrypt(sensitive);
}
```

Here you can see that sensitive information is exposed as a constant string,
which makes this sensitive information available to anyone who has access to
this code. To prevent this we can read it from settings.

```csharp
public Binary GetSensitiveData()
{
    var sensitive = _crypto.GetEncryptedString("Sensitive");

    return sensitive.EncryptedValue;
}
```

Encrypt a sensitive data using your certificate and put its encrypted value to
configuration file in base64 format. This way only someone with private key
will be able to know actual value of sensitive data.

> :bulb:
>
> This method first looks for a value with given key. If value does not exist,
> it will look for its decrypted version under `"Sensitive.Decrypted"` key, so
> below file also works;
>
> ```json
> {
>   "Sensitive": { "Decrypted": "something to hide" }
> }
> ```
>
> This can be handy in development environemnt, when sensitive data is
> sensitive only in production and you have some other not sensitive value in
> development.

## Configuration {#crypto-configuration}

There are three ways to load a certificate, `X509Store`,
`X509CertificateFromP12File` and `X509CertificateFromPem`. There is also a
fourth, and the default, `AutoResolve` option which uses configuration file to
decide which one to use.

### `X509Store`

This option uses certificate store of operating system to load a certificate.
If you use this option you will have to install your certificate to every OS
that will run your back-end system.

> :x:
>
> Currently this option is __only__ supported in __Windows__ operating systems.

You can choose this option as follows;

```csharp
crypto: c => c.X509Store()
```

`X509Store` requires `storeName` and `storeLocation` information to know in
which store to look for a certificate. It also requires an extra search
parameter to locate certificate in the specified store. By default this option
looks for `StoreName`, `StoreLocation` and `SubjectName` in configuration file
under `Gazel.Certificate` section like the following;

```json
{
    "Gazel": {
        "Certificate": {
            "StoreName": "TrustedPublisher",
            "StoreLocation": "LocalComputer",
            "SubjectName": "Gazel"
        }
    }
}
```

If no configuration was given, `storeName` defaults to `TrustedPublisher`,
`storeLocation` defaults to `LocalComputer`. Possible values to these
parameters can be found at [StoreName][] and [StoreLocation][] pages.

You can override this configuration directly from configurer as well;

```csharp
crypto: c => c.X509Store(
    storeName: StoreName.TrustedPublisher,
    storeLocation: StoreLocation.LocalMachine
)
```

For the extra search parameter, you may give any of search criteria defined in
[X509FindType][]. All values of `X509FindType` enum starts with `FindBy`
prefix, which is removed in configuration keys. For example if you use
`FindByIssuerName` and use `Inventiv` as its value, you should change
configuration as follows;

```json
{
    "Gazel": {
        "Certificate": {
            "StoreName": "TrustedPublisher",
            "StoreLocation": "LocalComputer",
            "IssuerName": "Inventiv"
        }
    }
}
```

> :information_source:
>
> You cannot override this extra search parameter from configurer like you do
> it with `storeName` and `storeLocation` parameters. It has to be specified
> from configuration file.

### `X509CertificateFromP12File`

This option enables you to load a [PKCS #12][] certificate from `.p12` file
using configured `IFileSystem` instance (see [File
System](features#file-system)) and suitable in non-Windows operating systems.
Below code enables this option;

```csharp
crypto: c => c.X509CertificateFromP12File()
```

It requires `path` and `passwordFile` information to load a certificate from
given path and use private key with the password specified in given password
file. By default it looks for `Path` and `PasswordFile` keys in configuration
under `Gazel.Certificate` section as follows;

```json
{
    "Gazel": {
        "Certificate": {
            "Path": "Gazel.p12",
            "PasswordFile": ".CERTPASS"
        }
    }
}
```

When configuration does not contain these keys, `path` defaults to `Gazel.p12`
and `passwordFile` defaults to `.CERTPASS`.

> :information_source:
>
> Private key password is asked to be in a separate file so that you can
> include a certificate, such as a development certificate in your code
> repository, but put `.CERTPASS` file in `.gitignore`. This will protect your
> certificate even if you include it in your repository.

You may override these configurations to be set directly from configurer;

```csharp
crypto: c => c.X509CertificateFromP12File(
    path: "Inventiv.p12",
    passwordFile: ".Inventiv.p12.pass"
)
```

> :bulb:
>
> We suggest you to use a hidden file for password files. In a unix-like
> operating systems when a file starts with a dot, it means it is a hidden file
> (see [Dot file][]). In Windows operating systems you explicitly need to set a
> file as hidden.

### `X509CertificateFromPem`

This option enables you to give certificate information directly from
configuration file or configurer. Gazel uses this option to register a stub
certificate during unit test runs. Below code enables this option;

```csharp
crypto: c => c.X509CertificateFromPem()
```

This option requires `certPem`, `keyPem` and `passwordFile` information to be
used. By default it looks for these information configuration file using
`CertPem`, `KeyPem` and `PasswordFile` keys, respectively, under
`Gazel.Certificate` section. Certificate contents usually start with
`-----BEGIN CERTIFICATE-----` and has new lines in them. To handle this you
need to use `\n` character in json string, an example is as follows;

```json
{
    "Gazel": {
        "Certificate": {
            "CertPem": "-----BEGIN CERTIFICATE-----\nMIIC7zCCAdegAwIBAgIQhaAixfnuiK5HBHMC+kz4zTANBgkqhkiG9w0BAQsFADAQ\nMQ4wDAYDVQQDEwVHYXplbDAeFw0xODAxMTcxMDMxMDFaFw0zOTEyMzEyMzU5NTla...",
            "KeyPem": "-----BEGIN ENCRYPTED PRIVATE KEY-----\nMIIFHDBOBgkqhkiG9w0BBQ0wQTApBgkqhkiG9w0BBQwwHAQIG7xEAxkSK6gCAggA\nMAwGCCqGSIb3DQIJBQAwFAYIKoZIhvcNAwcECEmeebmmTgQsBIIEyJGTsjMc2869...",
            "PasswordFile": ".CERTPASS"
        }
    }
}
```

Gazel does not have a default certificate so `certPem` and `keyPem` do not have
a default. Just like previous option, `passwordFile` defaults to `.CERTPASS`.

```csharp
crypto: c => c.X509CertificateFromPem(
    certPem: @"
-----BEGIN CERTIFICATE-----
MIIC7zCCAdegAwIBAgIQhaAixfnuiK5HBHMC+kz4zTANBgkqhkiG9w0BAQsFADAQ
MQ4wDAYDVQQDEwVHYXplbDAeFw0xODAxMTcxMDMxMDFaFw0zOTEyMzEyMzU5NTla
...
-----END CERTIFICATE-----
",
    keyPem: @"
-----BEGIN ENCRYPTED PRIVATE KEY-----
MIIFHDBOBgkqhkiG9w0BBQ0wQTApBgkqhkiG9w0BBQwwHAQIG7xEAxkSK6gCAggA
MAwGCCqGSIb3DQIJBQAwFAYIKoZIhvcNAwcECEmeebmmTgQsBIIEyJGTsjMc2869
...
-----END ENCRYPTED PRIVATE KEY-----
",
    passwordFile: ".CERTIFICATE_PASSWORD"
)
```

Above example illustrates how you can override default configuratiion directly
from configurer.

> :warning:
>
> Configuring certificate directly from configurer is __not__ recommended for
> production code, because it may lead you to include production certificate
> directly in source code. Production certificates are strongly recommended
> __not__ to be in your repository. If you choose `X509CertificateFromPem`
> option, make sure you load certificate from configuration file and you don't
> include `Gazel.Certificate` section of your production environment
> configuration in your repository.

### `AutoResolve`

This option is the default option for crypto feature and enables you to
configure crypto feature completely through configuration file. You don't have
to select this option explicitly but you can still choose to do it as shown
below;

```csharp
crypto: c => c.AutoResolve()
```

It does not accept any parameters. Default behaviour is to use `X509Store` on
Windows and `X509CertificateFromP12File` on unix-like operating systems. To
explicitly specify which option to use, you can add `Type` key under
`Gazel.Certificate` section;

```json
{
    "Gazel": {
        "Certificate": {
            "Type": "X509Store"
        }
    }
}
```

Option names are the same as previous sections; `X509Store`,
`X509CertificateFromP12File` and `X509CertificateFromPem`. Each option expects
its own keys as explained in previous sections. Below example uses store option
and specifies certificate information under same conffiguration section;

```json
{
    "Gazel": {
        "Certificate": {
            "Type": "X509Store",
            "SubjectName": "Inventiv"
        }
    }
}
```

> :bulb:
>
> Combining options is also possible. Assume some people use Windows for
> development and some use unix-like systems. Below example will be sufficient
> to configure both at one place;
>
> ```json
> {
>     "Gazel": {
>         "Certificate": {
>             "SubjectName": "Inventiv",
>             "Path": "Inventiv.p12",
>         }
>     }
> }
> ```
>
> This configuration will look for a certificate with subject name `Inventiv`
> in trusted publisher and local machine for Windows operating systems, and
> will look for a certificate `Inventiv.p12` in file system for unix-like
> operating systems.

#### Configuring certificates for a Gazel CLI process

Gazel CLI allows you to generate a schema from a bin directory. When you use
this option Gazel CLI will render given bin directory including your
configuration files and configurers in your `Program.cs`. This means that if
you use crypto feature, especially in configuration files, it might require a
correct configuration for crypto feature as well.

Gazel CLI uses `Development` for environment by default. However if you face a
problem while generating schema, code or dll because of encryption problems,
you can make use of `--environment` option to set environment during Gazel CLI
process.

```bash
g schemagen bin/net6.0/Debug --environment GazelCLI
```

This, for example, sets environment to `GazelCLI` so that you can create a
`appsettings.GazelCLI.json` file and specify your certificate option in this
configuration under `Gazel.Certificate` section.

[X.509]:https://en.wikipedia.org/wiki/X.509
[RSA]:https://en.wikipedia.org/wiki/RSA_(cryptosystem)
[SecureString]:https://learn.microsoft.com/en-us/dotnet/api/system.security.securestring
[How secure is SecureString]:https://learn.microsoft.com/en-us/dotnet/api/system.security.securestring#HowSecure
[StoreName]:https://learn.microsoft.com/en-us/dotnet/api/system.security.cryptography.x509certificates.storename
[StoreLocation]:https://learn.microsoft.com/en-us/dotnet/api/system.security.cryptography.x509certificates.storelocation
[X509FindType]:https://learn.microsoft.com/en-us/dotnet/api/system.security.cryptography.x509certificates.x509findtype
[PKCS #12]:https://en.wikipedia.org/wiki/PKCS_12
[Dot file]:https://en.wikipedia.org/wiki/Dot_file
