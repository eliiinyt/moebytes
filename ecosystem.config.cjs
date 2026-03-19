module.exports = {
  apps: [
    {
      name: "moebytes",
      script: "./dist/server/entry.mjs",
      interpreter: "bun",
      env: {
        NODE_ENV: "production",
        HOST: "127.0.0.1",
        PORT: "4322"
      }
    }
  ]
};
