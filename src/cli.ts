import path from "node:path";

import { defineCommand, runMain } from "citty";
import { copyStructureAndParse } from "./index.js";

const main = defineCommand({
  meta: {
    name: "yooasset-cli",
    description: "解析 YooAsset 的 manifest 文件",
    version: "1.0.0",
  },
  args: {
    input: {
      type: "string",
      description: "包含 manifest 文件的文件夹路径",
      required: true,
    },
    version: {
      type: "string",
      description: "manifest 文件的版本号",
      required: true,
    },
    output: {
      type: "string",
      description: "输出目录",
      required: true,
    },
  },
  run({ args }) {
    const inputDir = path.resolve(args.input);
    const outputDir = path.resolve(args.output);
    const version = args.version;

    try {
      copyStructureAndParse(inputDir, outputDir, version);
      console.log("解析完成，结果已输出到：", outputDir);
    } catch (error) {
      console.error("发生错误：", (error as Error).message);
      process.exit(1);
    }
  },
});

runMain(main);
