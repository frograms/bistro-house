export const PACKAGE_LICENSE_VALUES = [
  "mit",
  "isc",
  "bsd-3-clause",
  "private",
] as const;

export type PackageLicenseType = (typeof PACKAGE_LICENSE_VALUES)[number];

type PackageJsonFragment = Record<string, unknown>;

export const licenseConfigs: Record<PackageLicenseType, PackageJsonFragment> =
  {
    "bsd-3-clause": {
      license: "BSD-3-Clause",
    },
    isc: {
      license: "ISC",
    },
    mit: {
      license: "MIT",
    },
    private: {
      private: true,
    },
  };
