import fs from "node:fs";
import path from "node:path";
import { prasePackageManifest } from "./PackageManifest.js";
import consola from "consola";

export * from "./PackageManifest.js";

export async function parseFiles(
  inputDir: string,
  outputDir: string,
  version: string,
) {
  const files = fs.readdirSync(inputDir, { withFileTypes: true });

  await Promise.all(
    files.map(async (file) => {
      const inputPath = path.join(inputDir, file.name);
      const outputPath = path.join(outputDir, file.name);

      if (file.isFile() && file.name.endsWith(".bytes")) {
        try {
          const manifest = await prasePackageManifest(inputPath, {
            fileVersion: version,
          });
          fs.writeFileSync(
            outputPath,
            JSON.stringify(manifest, null, 2),
            "utf-8",
          );
        } catch (error) {
          consola.error(`Error processing file ${file.name}:`, error);
        }
      }
    }),
  );
}
