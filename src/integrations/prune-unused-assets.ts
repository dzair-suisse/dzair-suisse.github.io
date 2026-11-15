import { readdir, readFile, rm, stat } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import type { AstroIntegration } from "astro";

const IMAGE_EXT = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".avif",
  ".svg",
]);
const TEXT_EXT = new Set([
  ".html",
  ".css",
  ".js",
  ".mjs",
  ".xml",
  ".json",
  ".webmanifest",
  ".txt",
]);

async function walk(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const full = join(dir, entry.name);
      return entry.isDirectory() ? walk(full) : Promise.resolve([full]);
    }),
  );
  return files.flat();
}

/**
 * Content-collection images keep their full-size originals in the assets
 * folder (`build.assets`, `_astro` by default) even when only optimized
 * renditions are referenced. This removes any image in that folder that no
 * generated text file references, keeping the deploy lean.
 */
export default function pruneUnusedAssets(): AstroIntegration {
  let assetsDir = "_astro";
  return {
    name: "prune-unused-assets",
    hooks: {
      "astro:config:done": ({ config }) => {
        assetsDir = config.build.assets.replace(/^\/+|\/+$/g, "");
      },
      "astro:build:done": async ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        const files = await walk(root);
        const corpus = (
          await Promise.all(
            files
              .filter((f) => TEXT_EXT.has(extname(f)))
              .map((f) => readFile(f, "utf8")),
          )
        ).join("\n");

        let removed = 0;
        let bytes = 0;
        for (const file of files) {
          const inAssets = relative(root, file)
            .replaceAll("\\", "/")
            .startsWith(`${assetsDir}/`);
          if (!inAssets || !IMAGE_EXT.has(extname(file).toLowerCase()))
            continue;
          const name = file.split(/[\\/]/).pop() ?? "";
          if (!corpus.includes(name)) {
            bytes += (await stat(file)).size;
            await rm(file);
            removed += 1;
          }
        }
        logger.info(
          `Removed ${removed} unreferenced image(s) from ${assetsDir}/ (${(bytes / 1024 / 1024).toFixed(1)} MB).`,
        );
      },
    },
  };
}
