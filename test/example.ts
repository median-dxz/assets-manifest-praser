import path from "node:path";
import fs from "node:fs/promises";
import { LengthType, prasePackageManifest } from "../src/index.js";

const [manifestPath, file] = process.argv.slice(2);

const dump = async (file: string) => {
  const inputPath = path.join(manifestPath, file);
  const outputPath = path.join(process.cwd(), `${file}.json`);
  const manifest = await prasePackageManifest(inputPath, {
    lengthType: LengthType.Uint16,
    littleEdian: true,
  });
  await fs.writeFile(outputPath, JSON.stringify(manifest, null, 2));
};

await dump(file);

// hash algorithm: md5
// little endian: true
// length type: unsigned short
