const { withAppBuildGradle, withGradleProperties } = require('@expo/config-plugins');

/**
 * ffmpeg-kit-react-native の Maven 依存問題を修正するプラグイン。
 *
 * 問題:
 *   - npm パッケージが com.arthenica:ffmpeg-kit-https を要求するが
 *     このアーティファクトは Maven Central に存在しない。
 *   - Maven Central に存在するのは com.arthenica:ffmpeg-kit-full:4.5.LTS
 *
 * 修正:
 *   1. gradle.properties に ffmpegKitPackage=full を設定
 *   2. app/build.gradle の ext にも ffmpegKitPackage=full を設定
 *   3. dependencySubstitution で ffmpeg-kit-https → ffmpeg-kit-full:4.5.LTS に置換
 */
module.exports = function withFfmpegKit(config) {
  // 1. gradle.properties に設定
  config = withGradleProperties(config, (config) => {
    // 既存のエントリを削除してから追加
    config.modResults = config.modResults.filter(
      (item) => !(item.type === 'property' && item.key === 'ffmpegKitPackage')
    );
    config.modResults.push({
      type: 'property',
      key: 'ffmpegKitPackage',
      value: 'full',
    });
    return config;
  });

  // 2. app/build.gradle に ext 設定 + dependencySubstitution
  config = withAppBuildGradle(config, (config) => {
    let contents = config.modResults.contents;

    // ext.ffmpegKitPackage を apply plugin 直後に追加
    if (!contents.includes('ffmpegKitPackage')) {
      contents = contents.replace(
        /^(apply plugin: "com\.android\.application")/m,
        '$1\next.ffmpegKitPackage = "full"'
      );
    }

    // ffmpeg-kit-https → ffmpeg-kit-full:4.5.LTS に置換する substitution を追加
    const substitutionBlock = `
configurations.all {
    resolutionStrategy.dependencySubstitution {
        substitute(module('com.arthenica:ffmpeg-kit-https')).using(module('com.arthenica:ffmpeg-kit-full:4.5.LTS'))
    }
    resolutionStrategy.eachDependency { DependencyResolveDetails details ->
        if (details.requested.group == 'com.arthenica') {
            details.useVersion('4.5.LTS')
        }
    }
}
`;
    if (!contents.includes('dependencySubstitution')) {
      contents = contents.replace(/^android \{/m, substitutionBlock + 'android {');
    }

    config.modResults.contents = contents;
    return config;
  });

  return config;
};
