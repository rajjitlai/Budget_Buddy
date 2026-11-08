const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Expo Config Plugin to increase Gradle wrapper network timeout.
 * Prevents java.net.SocketTimeoutException: Read timed out during
 * the Gradle distribution zip download on slow or high-latency networks.
 */
const withGradleWrapperTimeout = (config) => {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const propertiesPath = path.join(
        config.modRequest.platformProjectRoot,
        'gradle',
        'wrapper',
        'gradle-wrapper.properties'
      );
      if (fs.existsSync(propertiesPath)) {
        let content = fs.readFileSync(propertiesPath, 'utf8');
        if (/networkTimeout\s*=/i.test(content)) {
          content = content.replace(/networkTimeout\s*=.*/i, 'networkTimeout=120000');
        } else {
          content += '\nnetworkTimeout=120000\n';
        }
        fs.writeFileSync(propertiesPath, content);
      }
      return config;
    },
  ]);
};

module.exports = withGradleWrapperTimeout;
