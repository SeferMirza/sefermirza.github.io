---
title: Release Notes
article:
  position: 6
  sectionOrder: desc
  sectionSortBy: title
---

Gazel follows `[major].[minor].[patch]` version format. It is basically
[Semantic Versioning][], but with a small difference;

- `[major]`: Starting from v5.x.x, this part will follow major .NET releases
  without backward compatibility. So if Gazel is on v5.x.x then it is
  compatible with .NET 5, if it is v6.x.x then it is compatible with .NET 6,
  and so on.
- `[minor]`: When there is a new feature or a breaking change on top of an
  existing major release, it means it is a minor release.
- `[patch]`: When new release only includes a bugfix or an improvement without
  a new feature or breaking change, it is only a patch.

[Semantic Versioning]:https://semver.org/
