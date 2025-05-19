import { readFile } from "node:fs/promises";
import { BytesReader } from "./BytesReader.js";

import type {
  PackageManifest,
  PackageAssetInfo,
  PackageBundleInfo,
} from "./types";
import { ManifestFilePraseError, ManifestFileVersionError } from "./errors.js";

export const ManifestFileSigns = {
  "1.5.2": new Uint8Array([0x4f, 0x4f, 0x59, 0x00]),
};

export enum LengthType {
  Byte,
  Uint16,
  Uint32,
}

export interface PraseOptions {
  littleEdian: boolean;
  lengthType: LengthType;
  fileVersion: keyof typeof ManifestFileSigns;
}

const DefaultPraseOptions: PraseOptions = {
  littleEdian: true,
  lengthType: LengthType.Uint16,
  fileVersion: "1.5.2",
};

/**
 * @param filename
 * @param {PraseOptions} options
 * @default options - {
 *  littleEdian: true,
 *  lengthType: LengthType.Uint16,
 *  fileVersion: "1.5.2"
 * }
 * @returns
 */
export async function prasePackageManifest(
  filename: string,
  options?: Partial<
    Omit<PraseOptions, "fileVersion"> & { fileVersion: string }
  >,
) {
  const mergedOptions = {
    ...DefaultPraseOptions,
    ...options,
  };

  const { fileVersion, littleEdian } = mergedOptions;

  const buffer = await readFile(filename);
  const reader = new BytesReader(
    new Uint8Array(buffer),
    mergedOptions,
    "manifest",
  );

  const r = {} as PackageManifest;

  if (!Object.keys(ManifestFileSigns).includes(fileVersion)) {
    throw new ManifestFilePraseError("unsupported file version");
  }

  const signReader = new BytesReader(
    ManifestFileSigns[fileVersion as keyof typeof ManifestFileSigns],
    {
      littleEdian,
    },
  );

  if (reader.uint() !== signReader.uint()) {
    throw new ManifestFilePraseError("check sign failed");
  }

  r.fileVersion = reader.text();

  if (r.fileVersion !== fileVersion) {
    throw new ManifestFileVersionError(r.fileVersion, fileVersion);
  }

  r.enableAddressable = reader.boolean();
  r.locationToLower = reader.boolean();
  r.includeAssetGUID = reader.boolean();

  r.outputNameType = reader.int();
  r.packageName = reader.text();
  r.packageVersion = reader.text();

  if (r.enableAddressable && r.locationToLower) {
    throw new ManifestFilePraseError(
      "check enableAddressable & locationToLower failed",
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
