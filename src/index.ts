import fs from "node:fs";
import path from "node:path";
import type { PackageManifest } from "./PackageManifest.js";
import { prasePackageManifest } from "./PackageManifest.js";

export function parseManifest(filePath: string) {
  return prasePackageManifest(filePath);
}

export function validateVersion(
  manifest: PackageManifest,
  expectedVersion: string
): void {
  if (manifest.version !== expectedVersion) {
    throw new Error(
      `版本不匹配：期望 ${expectedVersion}，但发现 ${manifest.version}`
    );
  }
}

export function copyStructureAndParse(
  inputDir: string,
  outputDir: string,
  version: string
): void {
  const files = fs.readdirSync(inputDir, { withFileTypes: true });

  files.forEach((file) => {
    const inputPath = path.join(inputDir, file.name);
    const outputPath = path.join(outputDir, file.name);

    if (file.isDirectory()) {
      fs.mkdirSync(outputPath, { recursive: true });
      copyStructureAndParse(inputPath, outputPath, version);
    } else if (file.isFile() && file.name.endsWith(".json")) {
      const manifest = parseManifest(inputPath);
      validateVersion(manifest, version);
      fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2), "utf-8");
    }
  });
}
