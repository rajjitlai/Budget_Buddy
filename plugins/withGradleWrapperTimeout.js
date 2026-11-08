const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Expo Config Plugin to ensure reliable Gradle wrapper downloads.
 * Bypasses GitHub Releases / services.gradle.org HTTP 504 Gateway Timeouts
 * by routing to a resilient direct mirror and extending the socket timeout.
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

        // Increase socket timeout to 120s
        if (/networkTimeout\s*=/i.test(content)) {
          content = content.replace(/networkTimeout\s*=.*/i, 'networkTimeout=120000');
        } else {
          content += '\nnetworkTimeout=120000\n';
        }

        // Allow mirror URLs
        if (/validateDistributionUrl\s*=/i.test(content)) {
          content = content.replace(/validateDistributionUrl\s*=.*/i, 'validateDistributionUrl=false');
        } else {
          content += '\nvalidateDistributionUrl=false\n';
        }

        // Route services.gradle.org to direct resilient mirror (avoids GitHub Releases 504s)
        content = content.replace(
          /https\\?:\/\/services\.gradle\.org\/distributions\/gradle-([0-9.]+)-(bin|all)\.zip/g,
          'https\\://mirrors.cloud.tencent.com/gradle/gradle-$1-$2.zip'
        );

        fs.writeFileSync(propertiesPath, content);
      }
      return config;
    },
  ]);
};

module.exports = withGradleWrapperTimeout;
