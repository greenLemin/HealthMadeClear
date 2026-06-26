import { execFileSync } from "child_process";
import path from "path";

export function formatWithPrettier(filePath: string) {
  const prettierCli = path.join(process.cwd(), "node_modules", "prettier", "bin", "prettier.cjs");
  execFileSync(process.execPath, [prettierCli, "--write", filePath], { stdio: "inherit" });
}
