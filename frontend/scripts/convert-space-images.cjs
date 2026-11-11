const fs = require("node:fs/promises");
const path = require("node:path");
const sharp = require("sharp");

const imageDirectory = path.resolve(__dirname, "../public/images/spaces");
const sourcePattern = /\.(?:jpe?g|png)$/i;

async function run() {
  const entries = await fs.readdir(imageDirectory, { withFileTypes: true });
  await Promise.all(entries.filter((entry) => entry.isFile() && entry.name.endsWith(".webp.tmp")).map((entry) => fs.unlink(path.join(imageDirectory, entry.name))));
  const sources = entries.filter((entry) => entry.isFile() && sourcePattern.test(entry.name));
  let sourceBytes = 0;
  let outputBytes = 0;

  for (const entry of sources) {
    const source = path.join(imageDirectory, entry.name);
    const output = path.join(imageDirectory, entry.name.replace(sourcePattern, ".webp"));
    const sourceStat = await fs.stat(source);

    await sharp(source)
      .rotate()
      .webp({ quality: 70, effort: 6 })
      .toFile(output);

    const metadata = await sharp(output).metadata();
    if (metadata.format !== "webp" || !metadata.width || !metadata.height) {
      await fs.unlink(output).catch(() => undefined);
      throw new Error(`Failed to verify ${entry.name}`);
    }

    const outputStat = await fs.stat(output);
    await fs.unlink(source);
    sourceBytes += sourceStat.size;
    outputBytes += outputStat.size;
    process.stdout.write(`${entry.name} -> ${path.basename(output)}\n`);
  }

  const saved = sourceBytes ? Math.round((1 - outputBytes / sourceBytes) * 100) : 0;
  process.stdout.write(`Converted ${sources.length} images; ${sourceBytes} -> ${outputBytes} bytes (${saved}% smaller)\n`);
}

run().catch((error) => {
  process.stderr.write(`${error.stack || error}\n`);
  process.exitCode = 1;
});
