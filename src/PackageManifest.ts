import { readFile } from "fs/promises";
import { BytesReader, LengthType as LengthTypeEnum } from "./utils.js";

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
  Type_1 = 1,
  Type_4 = 4,
}

class PrasePackageManifestError extends Error {
  constructor(step: string) {
    super(`Failed to parse package manifest at step: ${step}`);
    this.name = "PrasePackageManifestError";
  }
}

const ManifestFileSign = new Uint8Array([0x4f, 0x4f, 0x59, 0x00]);

const LittleEdian = true;
const FileVersion = "1.5.2";
const LengthType = LengthTypeEnum.Uint16;

export async function prasePackageManifest(filename: string) {
  const buffer = await readFile(filename);
  const reader = new BytesReader(
    new Uint8Array(buffer),
    { lengthType: LengthType, littleEdian: LittleEdian },
    "manifest"
  );

  const r = {} as PackageManifest;

  const signReader = new BytesReader(ManifestFileSign, {
    littleEdian: LittleEdian,
  });

  if (reader.uint() !== signReader.uint()) {
    throw new PrasePackageManifestError("check sign");
  }

  r.fileVersion = reader.text();
  if (r.fileVersion !== FileVersion) {
    throw new PrasePackageManifestError("check file version");
  }

  r.enableAddressable = reader.boolean();
  r.locationToLower = reader.boolean();
  r.includeAssetGUID = reader.boolean();

  r.outputNameType = reader.int();
  r.packageName = reader.text();
  r.packageVersion = reader.text();

  if (r.enableAddressable && r.locationToLower) {
    throw new PrasePackageManifestError(
      "check enableAddressable & locationToLower"
    );
  }

  r.packageAssetCount = reader.int();
  r.packageAssetInfos = new Array(r.packageAssetCount).fill(null).map(() => {
    return {
      assetPath: reader.text(),
      bundleID: reader.int(),
      dependIDs: new Array(reader.ushort()).fill(null).map(() => reader.int()),
    } as PackageAssetInfo;
  });

  r.packageBundleCount = reader.int();
  r.packageBundleInfos = new Array(r.packageBundleCount).fill(null).map(() => {
    return {
      bundleName: reader.text(),
      unityCRC: reader.uint(),
      fileHash: reader.text(),
      fileCRC: reader.text(),
      fileSize: reader.long(),
      isRawFile: reader.boolean(),
      loadMethod: reader.byte(),
      referenceIDs: new Array(reader.ushort())
        .fill(null)
        .map(() => reader.int()),
    } as PackageBundleInfo;
  });

  return r;
}
