export interface PackageManifest {
  fileVersion: string;
  enableAddressable: boolean;
  locationToLower: boolean;
  includeAssetGUID: boolean;
  outputNameType: OutputNameType;
  packageName: string;
  packageVersion: string;
  packageAssetCount: number;
  packageAssetInfos: PackageAssetInfo[];
  packageBundleCount: number;
  packageBundleInfos: PackageBundleInfo[];
}

export interface PackageAssetInfo {
  assetPath: string;
  bundleID: number;
  dependIDs: number[];
}

export interface PackageBundleInfo {
  bundleName: string;
  unityCRC: number;
  fileHash: string;
  fileCRC: string;
  fileSize: number;
  isRawFile: boolean;
  loadMethod: number; // enum
  referenceIDs: number[];
}

export enum OutputNameType {
  HashName = 1,
  BundleName_HashName = 4,
}
