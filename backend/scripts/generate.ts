import fs from "node:fs";
import path from "node:path";

const [, , action, rawName, rawKinds] = process.argv;
const modulesRoot = path.resolve("src/modules");

function safeName(value: string): string {
  const name = value
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

  if (!name) throw new Error("Please provide a module/file name.");
  return name;
}

function writeIfMissing(filePath: string, content: string): void {
  if (fs.existsSync(filePath)) {
    console.log(`Skipped existing file: ${path.relative(process.cwd(), filePath)}`);
    return;
  }
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
  console.log(`Created: ${path.relative(process.cwd(), filePath)}`);
}

const templates: Record<string, (name: string) => string> = {
  "routes": (name) => `import { Router } from "express";\nimport { ${name}Controller } from "./${name}.controller";\n\nexport const ${name}Router = Router();\n\n${name}Router.get("/", ${name}Controller.list);\n`,
  "controller": (name) => `import type { RequestHandler } from "express";\nimport { asyncHandler } from "../../utils/async-handler";\nimport { sendSuccess } from "../../utils/api-response";\n\nconst list: RequestHandler = asyncHandler(async (_req, res) => {\n  // TODO: Call ${name}Service.list() after implementing the service.\n  return sendSuccess(res, "${name} fetched successfully", []);\n});\n\nexport const ${name}Controller = { list };\n`,
  "service": (name) => `export const ${name}Service = {\n  async list() {\n    // TODO: Implement business logic with Prisma.\n    return [];\n  }\n};\n`,
  "validation": (_name) => `import { z } from "zod";\n\nexport const createSchema = z.object({\n  // TODO: Add fields for this resource.\n});\n\nexport const idParamsSchema = z.object({\n  id: z.string().min(1)\n});\n`,
  "middleware": (_name) => `import type { RequestHandler } from "express";\n\nexport const ${_name}Middleware: RequestHandler = (_req, _res, next) => {\n  // TODO: Add feature-specific middleware.\n  next();\n};\n`
};

if (!action || !rawName || !["module", "file"].includes(action)) {
  console.log("Usage:");
  console.log("  npm run make:module -- properties");
  console.log("  npm run make:file -- properties controller,service");
  console.log("  npm run make:file -- properties middleware");
  process.exit(1);
}

const name = safeName(rawName);
const moduleDir = path.join(modulesRoot, name);
const available = Object.keys(templates);

if (action === "module") {
  for (const kind of ["routes", "controller", "service", "validation"]) {
    writeIfMissing(path.join(moduleDir, `${name}.${kind}.ts`), templates[kind](name));
  }
  console.log(`\nModule generated at ${path.relative(process.cwd(), moduleDir)}.`);
  console.log(`Mount its router in src/app.ts, for example: app.use("/api/${name}", ${name}Router);`);
  process.exit(0);
}

const kinds = (rawKinds ?? "controller,service")
  .split(",")
  .map((item) => item.trim().toLowerCase())
  .filter(Boolean);

for (const kind of kinds) {
  if (!available.includes(kind)) {
    throw new Error(`Unknown file type "${kind}". Available types: ${available.join(", ")}`);
  }
  writeIfMissing(path.join(moduleDir, `${name}.${kind}.ts`), templates[kind](name));
}