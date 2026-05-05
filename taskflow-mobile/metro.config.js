const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.watchFolders = [];
config.resolver.blockList = [
  /android\/app\/build\/.*/,
  /android\/build\/.*/,
  /ios\/build\/.*/,
];

module.exports = config;