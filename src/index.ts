import fs from "node:fs/promises";
import path from "node:path";
import { prasePackageManifest } from "./PackageManifest.js";
import consola from "consola";

export * from "./PackageManifest.js";

export async function parseFiles(
  inputDir: string,
  outputDir: string,
  version: string,
) {
  const files = await fs.readdir(inputDir, { withFileTypes: true });

  await Promise.all(
    files.map(async (file) => {
      if (file.isFile() && file.name.endsWith(".bytes")) {
        const inputPath = path.join(inputDir, file.name);

        const outputPath = path.join(
          outputDir,
          path.basename(file.name, ".bytes") + ".json",
        );

        try {
          const manifest = await prasePackageManifest(inputPath, {
            fileVersion: version,
          });
          await fs.mkdir(outputDir, { recursive: true });
          await fs.writeFile(
            outputPath,
            JSON.stringify(manifest, null, 2),
            "utf-8",
          );
          consola.success(`Processed file: ${file.name} successfully.`);
        } catch (error) {
          consola.error(`Error processing file ${file.name}:`, error);
        }
      }
    }),
  );
}
