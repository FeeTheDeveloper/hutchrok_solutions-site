#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const ts = require("typescript");

const scriptPath = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(scriptPath), "..");
const tsFiles = [];

function walk(directory) {
  if (!fs.existsSync(directory)) return;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(fullPath);
    else if (entry.isFile() && entry.name.endsWith(".ts")) tsFiles.push(fullPath);
  }
}

walk(path.join(root, "app"));
walk(path.join(root, "lib"));

let diagnostics = 0;
for (const file of tsFiles) {
  const source = fs.readFileSync(file, "utf8");
  const result = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      strict: true,
    },
    fileName: file,
    reportDiagnostics: true,
  });

  const errors = (result.diagnostics || []).filter(
    (diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error,
  );
  if (errors.length) {
    diagnostics += errors.length;
    console.error(`Syntax diagnostics in ${path.relative(root, file)}:`);
    for (const error of errors) {
      console.error(`- ${ts.flattenDiagnosticMessageText(error.messageText, "\n")}`);
    }
  }
}

const redactionFile = path.join(root, "lib/agents/redaction.ts");
const redactionJs = ts.transpileModule(fs.readFileSync(redactionFile, "utf8"), {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;

const redactionModule = { exports: {} };
new Function("module", "exports", redactionJs)(
  redactionModule,
  redactionModule.exports,
);
const { redactAgentInput } = redactionModule.exports;

const sample = redactAgentInput({
  email: "client@example.com",
  clientName: "Synthetic Client",
  organizerName: "Synthetic Organizer",
  apiKey: "sk-example-secret-value-1234567890",
  routingNumber: "123456789",
  physicalAddress: "100 Example Street",
  narrative:
    "Contact client@example.com or (214) 555-1212. EIN 12-3456789. Key sk-example-secret-value-1234567890.",
});
const serialized = JSON.stringify(sample);
const forbidden = [
  "client@example.com",
  "Synthetic Client",
  "Synthetic Organizer",
  "100 Example Street",
  "214) 555-1212",
  "12-3456789",
  "sk-example-secret-value-1234567890",
  "123456789",
];

for (const value of forbidden) {
  if (serialized.includes(value)) {
    console.error(`Redaction smoke test failed; leaked value: ${value}`);
    process.exit(1);
  }
}

const requiredFiles = [
  "app/api/admin/agents/health/route.ts",
  "app/api/admin/agents/run/route.ts",
  "app/api/admin/agents/tasks/route.ts",
  "app/api/admin/agents/tasks/[id]/route.ts",
  "lib/agents/hutchrok-command.ts",
  "lib/agents/orchestrator.ts",
  "lib/agents/subject-context.ts",
  "lib/agents/task-store.ts",
  "lib/db/migration-011-agent-command-center.sql",
  "lib/db/migration-012-enable-pg-net-for-agent-jobs.sql",
  "lib/notifications/dispatcher.ts",
  "docs/agent-interactions.png",
  "docs/agent-sequence.png",
  "docs/PRODUCTION_VALIDATION.md",
  "docs/SECURITY_FINDINGS.md",
  "scripts/install-overlay.sh",
];

for (const relativePath of requiredFiles) {
  if (!fs.existsSync(path.join(root, relativePath))) {
    console.error(`Missing required bundle file: ${relativePath}`);
    process.exit(1);
  }
}

const dispatcher = fs.readFileSync(
  path.join(root, "lib/notifications/dispatcher.ts"),
  "utf8",
);
if (dispatcher.includes("JSON.stringify(event.data)")) {
  console.error("Notification dispatcher still serializes arbitrary event data.");
  process.exit(1);
}
if (!dispatcher.includes("contactPresent")) {
  console.error("Notification dispatcher privacy metadata check is missing.");
  process.exit(1);
}

if (diagnostics > 0) process.exit(1);
console.log(`Verified ${tsFiles.length} TypeScript files with 0 syntax diagnostics.`);
console.log("Redaction smoke test passed.");
console.log(`Required bundle manifest passed (${requiredFiles.length} files).`);
console.log("Notification logging privacy check passed.");
