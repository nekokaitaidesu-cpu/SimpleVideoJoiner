const { withAppBuildGradle } = require('@expo/config-plugins');

/**
 * ffmpeg-kit-react-native が要求する Maven バージョン (例: 4.5.1-1) は JCenter 廃止後
 * 存在しない。Maven Central には 4.5.LTS として公開されているため、
 * Gradle の依存解決でバージョンを強制上書きし、パッケージ種別を full に変更する。
 */
module.exports = function withFfmpegKit(config) {
  return withAppBuildGradle(config, (config) => {
    let contents = config.modResults.contents;

    // 1. ffmpegKitPackage を "full" に設定 (ffmpeg-kit-https → ffmpeg-kit-full)
    if (!contents.includes('ffmpegKitPackage')) {
      contents = contents.replace(
        /^(apply plugin: "com\.android\.application")/m,
        '$1\next.ffmpegKitPackage = "full"'
      );
    }

    // 2. 依存バージョンを 4.5.LTS に強制解決
    const resolutionBlock = `
configurations.all {
    resolutionStrategy.eachDependency { DependencyResolveDetails details ->
        if (details.requested.group == 'com.arthenica') {
            details.useVersion('4.5.LTS')
        }
    }
}
`;
    if (!contents.includes('com.arthenica') || !contents.includes('eachDependency')) {
      contents = contents.replace(/^android \{/m, resolutionBlock + 'android {');
    }

    config.modResults.contents = contents;
    return config;
  });
};
