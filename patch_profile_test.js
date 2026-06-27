const fs = require("fs");

const file = "src/lib/dashboard/profile.test.ts";
let code = fs.readFileSync(file, "utf8");

const search1 = `    expect(consoleSpy).toHaveBeenCalledWith("[dashboard:getUserProfile]", "Not found");`;
const replace1 = `    expect(consoleSpy).toHaveBeenCalledWith("Query error in getUserProfile:", { message: "Not found" });`;

const search2 = `    expect(consoleSpy).toHaveBeenCalledWith("[dashboard:getUserProfile:auth]", "Auth failed");`;
const replace2 = `    expect(consoleSpy).toHaveBeenCalledWith("Query error in getUserProfile:auth:", { message: "Auth failed" });`;

if (code.includes(search1)) {
  code = code.replace(search1, replace1);
  console.log("Patched 1 successfully");
} else {
  console.log("Could not find block 1 to replace");
}

if (code.includes(search2)) {
  code = code.replace(search2, replace2);
  console.log("Patched 2 successfully");
} else {
  console.log("Could not find block 2 to replace");
}

fs.writeFileSync(file, code, "utf8");
