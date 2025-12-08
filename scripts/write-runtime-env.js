const fs = require("fs");
const path = require("path");

const runtimeFile = path.join("/app", "dist", "runtime-env.js");
const backendUrl = (process.env.BACKEND_URL || "").trim();

const runtimeScript = [
    "window.RUNTIME_CONFIG = window.RUNTIME_CONFIG || {};",
    `window.RUNTIME_CONFIG.BACKEND_URL = ${JSON.stringify(backendUrl)};`,
    "",
].join("\n");

fs.writeFileSync(runtimeFile, runtimeScript, "utf8");
console.log(`[runtime-env] wrote BACKEND_URL="${backendUrl}" to ${runtimeFile}`);
