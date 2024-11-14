import { parse, stringify } from "yaml";

async function readFile(filePath) {
  const file = Bun.file(filePath);
  return await file.text();
}

function deepMerge(base, override) {
  const cleanedBase = {};

  for (const key in base) {
    const cleanKey = key.replace(/\+$/, "");
    cleanedBase[cleanKey] = base[key];
  }

  for (const key in override) {
    const isAppend = key.endsWith("+");
    const isRemove = key.startsWith("-");
    const cleanKey = key.replace(/^\-|\+$/, ""); // Remove "-" or "+" suffix

    if (isRemove) {
      delete cleanedBase[cleanKey];
      continue;
    }

    if (!(cleanKey in cleanedBase)) {
      cleanedBase[cleanKey] = override[key];
      continue;
    }

    if (!isAppend) {
      cleanedBase[cleanKey] = override[key];
      continue;
    }

    if (Array.isArray(cleanedBase[cleanKey]) && Array.isArray(override[key])) {
      cleanedBase[cleanKey] = [...cleanedBase[cleanKey], ...override[key]];
    }
    else if (typeof cleanedBase[cleanKey] === "object" && typeof override[key] === "object") {
      cleanedBase[cleanKey] = deepMerge(cleanedBase[cleanKey], override[key]);
    } else {
      cleanedBase[cleanKey] = override[key];
    }
  }

  return cleanedBase;
}

async function mergeYamlFiles(files) {
  if (files.length < 1) {
    console.error("No values files provided.");
    process.exit(1);
  }

  const baseContent = await readFile(files[0]);
  let mergedYaml = parse(baseContent);

  for (let i = 1; i < files.length; i++) {
    const currentContent = await readFile(files[i]);
    const currentYaml = parse(currentContent);
    mergedYaml = deepMerge(mergedYaml, currentYaml);
  }

  console.log(stringify(mergedYaml));
}

const args = process.argv;
const filesIndex = args.indexOf("-f") + 1;
const files = args[filesIndex]?.split(" ") || [];

await mergeYamlFiles(files);
