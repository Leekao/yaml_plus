import { parse, stringify } from "yaml";

// Helper function to read files in Bun
async function readFile(filePath) {
  const file = Bun.file(filePath);
  return await file.text();
}

// Helper function to recursively merge objects with correct handling of "+"
function deepMerge(base, override) {
  const cleanedBase = {};

  // Normalize keys in the base by removing the "+" suffix
  for (const key in base) {
    const cleanKey = key.replace(/\+$/, "");
    cleanedBase[cleanKey] = base[key];
  }

  // Merge override into the cleaned base
  for (const key in override) {
    const isAppend = key.endsWith("+");
    const cleanKey = key.replace(/\+$/, "");

    // If the key does not exist in the base, add it directly
    if (!(cleanKey in cleanedBase)) {
      cleanedBase[cleanKey] = override[key];
      continue;
    }

    // If the override key does NOT have "+", overwrite the base key entirely
    if (!isAppend) {
      cleanedBase[cleanKey] = override[key];
      continue;
    }

    // Handle appending for arrays
    if (Array.isArray(cleanedBase[cleanKey]) && Array.isArray(override[key])) {
      cleanedBase[cleanKey] = [...cleanedBase[cleanKey], ...override[key]];
    }
    // Handle merging for objects
    else if (typeof cleanedBase[cleanKey] === "object" && typeof override[key] === "object") {
      cleanedBase[cleanKey] = deepMerge(cleanedBase[cleanKey], override[key]);
    } else {
      // Overwrite for other types
      cleanedBase[cleanKey] = override[key];
    }
  }

  return cleanedBase;
}

// Main function to merge YAML files
async function mergeYamlFiles(files) {
  if (files.length < 1) {
    console.error("No values files provided.");
    process.exit(1);
  }

  // Parse the base YAML file
  const baseContent = await readFile(files[0]);
  let mergedYaml = parse(baseContent);

  // Iterate through the remaining YAML files and merge them
  for (let i = 1; i < files.length; i++) {
    const currentContent = await readFile(files[i]);
    const currentYaml = parse(currentContent);
    mergedYaml = deepMerge(mergedYaml, currentYaml);
  }

  // Output the merged YAML
  console.log(stringify(mergedYaml));
}

// Extract the `-f`/`--values` arguments from the command-line input
const args = process.argv;
const filesIndex = args.indexOf("-f") + 1;
const files = args[filesIndex]?.split(" ") || [];

// Run the merging process
await mergeYamlFiles(files);
