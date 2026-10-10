const logger = {
  info: (msg) => console.log(`\x1b[36mℹ\x1b[0m ${msg}`),
  success: (msg) => console.log(`\x1b[32m✔\x1b[0m ${msg}`),
  warn: (msg) => console.log(`\x1b[33m⚠\x1b[0m ${msg}`),
  error: (msg) => console.error(`\x1b[31m✖\x1b[0m ${msg}`),
  step: (stepNum, total, title) => {
    console.log(`\n\x1b[35m======================================================\x1b[0m`);
    console.log(`\x1b[1m\x1b[33m🚀 [STAGE ${stepNum}/${total}]\x1b[0m: \x1b[1m${title}\x1b[0m`);
    console.log(`\x1b[35m======================================================\x1b[0m`);
  },
  divider: () => console.log(`\x1b[90m------------------------------------------------------\x1b[0m`),
  banner: (title) => {
    console.log(`\x1b[1m\x1b[36m`);
    console.log(`╔══════════════════════════════════════════════════════╗`);
    console.log(`║      ⚡ AUTO-VIBECODER — AGENTIC APP FACTORY         ║`);
    console.log(`╚══════════════════════════════════════════════════════╝\x1b[0m`);
    if (title) console.log(`\x1b[90mTarget:\x1b[0m \x1b[1m${title}\x1b[0m\n`);
  }
};

module.exports = logger;
