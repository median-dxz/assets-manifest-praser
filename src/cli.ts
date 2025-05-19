import path from "node:path";
import { consola } from "consola";

import { defineCommand, runMain } from "citty";
import { parseFiles } from "./index.js";

const main = defineCommand({
  meta: {
    name: "@sea/assets-manifest-praser cli",
    description: "解析 YooAsset 的 manifest 文件",
    version: "0.1.0",
  },
  args: {
    input: {
      type: "positional",
      description: "包含 manifest 文件的文件夹路径",
      required: true,
    },
    version: {
      type: "string",
      description: "manifest 文件的版本号, 默认为1.5.2 (目前只支持1.5.2)",
      default: "1.5.2",
    },
    output: {
      type: "string",
      description: "输出目录, 默认为当前目录",
      default: ".",
    },
  },
  async run({ args }) {
    const inputDir = path.resolve(args.input);
    const outputDir = path.resolve(args.output);
    const version = args.version;

    try {
      await parseFiles(inputDir, outputDir, version);
      consola.log("解析完成，结果已输出到：", outputDir);
    } catch (error) {
      consola.error("发生错误：", (error as Error).message);
      process.exit(1);
    }
  },
});

void runMain(main);
