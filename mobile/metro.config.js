// const { getDefaultConfig } = require('@expo/metro-config')
// const path = require('path')

// const projectRoot = __dirname
// const repoRoot = path.resolve(projectRoot, '..')

// const config = getDefaultConfig(projectRoot)

// config.watchFolders = [
//     path.resolve(repoRoot, 'src'),
//     path.resolve(repoRoot, 'packages/ui/src')
// ]

// config.resolver.extraNodeModules = {
//     '@area/src': path.resolve(repoRoot, 'src'),
//     '@area/ui': path.resolve(repoRoot, 'packages/ui/src')
// }

// module.exports = config
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

module.exports = config;
