const { withAppBuildGradle, withGradleProperties } = require('@expo/config-plugins');

/**
 * ffmpeg-kit-react-native の Maven 依存問題を修正するプラグイン。
 *
 * 問題:
 *   ffmpeg-kit-react-native@4.5.1 が要求する
 *   com.arthenica:ffmpeg-kit-https:4.5.1-1 は Maven Central に存在しない。
 *   (https バリアントが存在しないが full バリアントは存在する)
 *
 * 修正:
 *   1. gradle.properties に ffmpegKitPackage=full を設定
 *   2. dependencySubstitution で ffmpeg-kit-https:4.5.1-1
 *      → ffmpeg-kit-full:4.5.1-1 に置換 (バージョンはそのまま)
 */
module.exports = function withFfmpegKit(config) {
  // 1. gradle.properties に設定 (ffmpeg-kit-react-native が rootProject.property() で参照)
  config = withGradleProperties(config, (config) => {
    config.modResults = config.modResults.filter(
      (item) => !(item.type === 'property' && item.key === 'ffmpegKitPackage')
    );
    config.modResults.push({ type: 'property', key: 'ffmpegKitPackage', value: 'full' });
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

    // ffmpeg-kit-https → ffmpeg-kit-full に名前置換 (バージョンはそのまま維持)
    const substitutionBlock = `
configurations.all {
    resolutionStrategy.dependencySubstitution {
        substitute(module('com.arthenica:ffmpeg-kit-https')).using(module('com.arthenica:ffmpeg-kit-full:4.5.1-1'))
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
