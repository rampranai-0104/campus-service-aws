const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

const amplifyReactNativeShim = path.resolve(
  __dirname,
  'src/shims/awsAmplifyReactNativeShim.js'
);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // 1. Intercept @aws-amplify/react-native and replace with safe pure-JS shim for Expo Go
  if (
    moduleName === '@aws-amplify/react-native' ||
    moduleName.startsWith('@aws-amplify/react-native/')
  ) {
    return {
      filePath: amplifyReactNativeShim,
      type: 'sourceFile',
    };
  }

  // 2. Intercept explicit requests to native SRP files before standard resolution
  let effectiveModuleName = moduleName;
  if (effectiveModuleName.endsWith('calculateS.native.mjs')) {
    effectiveModuleName = effectiveModuleName.replace('calculateS.native.mjs', 'calculateS.mjs');
  } else if (effectiveModuleName.endsWith('calculateS.native.js')) {
    effectiveModuleName = effectiveModuleName.replace('calculateS.native.js', 'calculateS.js');
  } else if (effectiveModuleName.endsWith('calculateS.native')) {
    effectiveModuleName = effectiveModuleName.replace('calculateS.native', 'calculateS');
  } else if (
    effectiveModuleName.endsWith('index.native.mjs') &&
    context.originModulePath &&
    context.originModulePath.includes('BigInteger')
  ) {
    effectiveModuleName = effectiveModuleName.replace('index.native.mjs', 'index.mjs');
  } else if (
    effectiveModuleName.endsWith('index.native.js') &&
    context.originModulePath &&
    context.originModulePath.includes('BigInteger')
  ) {
    effectiveModuleName = effectiveModuleName.replace('index.native.js', 'index.js');
  } else if (
    effectiveModuleName.endsWith('index.native') &&
    context.originModulePath &&
    context.originModulePath.includes('BigInteger')
  ) {
    effectiveModuleName = effectiveModuleName.replace('index.native', 'index');
  }

  // 3. Delegate to default Metro resolver
  const resolved = context.resolveRequest(context, effectiveModuleName, platform);

  // 4. Intercept the resolved file path: redirect any native SRP module to pure JS
  if (resolved && resolved.type === 'sourceFile' && typeof resolved.filePath === 'string') {
    let targetPath = resolved.filePath;
    if (targetPath.endsWith('calculateS.native.js')) {
      targetPath = targetPath.replace('calculateS.native.js', 'calculateS.js');
    } else if (targetPath.endsWith('calculateS.native.mjs')) {
      targetPath = targetPath.replace('calculateS.native.mjs', 'calculateS.mjs');
    } else if (targetPath.endsWith('BigInteger/index.native.js')) {
      targetPath = targetPath.replace('BigInteger/index.native.js', 'BigInteger/index.js');
    } else if (targetPath.endsWith('BigInteger/index.native.mjs')) {
      targetPath = targetPath.replace('BigInteger/index.native.mjs', 'BigInteger/index.mjs');
    } else if (targetPath.endsWith('BigInteger.native.js')) {
      targetPath = targetPath.replace('BigInteger.native.js', 'BigInteger.js');
    } else if (targetPath.endsWith('BigInteger.native.mjs')) {
      targetPath = targetPath.replace('BigInteger.native.mjs', 'BigInteger.mjs');
    }

    if (targetPath !== resolved.filePath) {
      return {
        ...resolved,
        filePath: targetPath,
      };
    }
  }

  return resolved;
};

module.exports = config;
