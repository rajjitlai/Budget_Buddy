

// metro.config.js
const { getDefaultConfig } = require("@expo/metro-config");

const defaultConfig = getDefaultConfig(__dirname);

defaultConfig.resolver.unstable_enablePackageExports = true;
defaultConfig.resolver.sourceExts.push('wasm');
defaultConfig.resolver.assetExts.push('wasm');

module.exports = {
    ...defaultConfig,
    server: {
        ...defaultConfig.server,
        enhanceMiddleware: (middleware) => {
            return (req, res, next) => {
                // Set custom timeout (in milliseconds)
                req.setTimeout(30000); // 30 seconds
                res.setTimeout(30000); // 30 seconds

                return middleware(req, res, next);
            };
        },
    },
    watcher: {
        ...defaultConfig.watcher,
        unstable_lazySha1: true, // Enable lazy SHA1 computation for better performance
    },
};


