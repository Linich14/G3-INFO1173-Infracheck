// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "~": "./",
            "@features": "./features",
            "@app": "./app",
            "@assets": "./assets",
          },
        },
      ],
    ],
  };
};
