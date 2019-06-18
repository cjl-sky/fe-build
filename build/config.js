/**
 * 配置处理
 * @author chenjialin
 */

'use strict';

const slash = require('slash');
const path = require('path');
const ip = require('ip');
const extend = require('node.extend');

const NODE_ENV = process.env.NODE_ENV;
const isProduction = NODE_ENV === 'production';
const isACT = process.env.isACT;
const isLib = process.env.isLib;
const projectPath = process.env.projectPath;
const cmsPath = process.env.cmsPath;
const srcPath = path.join(projectPath, 'src');
const defaultStaticPublicProjectPath = projectPath.replace('static-source', 'static-src');

// 接收具体项目工程化配置
const projectBuildConfig = require(path.join(isACT ? cmsPath : projectPath, 'build.config'));

let defaultInjectAllTPL = path.join(__dirname, '/tpl/index.tpl');
let defaultInjectStylesTPL = path.join(__dirname, '/tpl/styles.tpl');
let defaultInjectScriptsTPL = path.join(__dirname, '/tpl/scripts.tpl');

let defaultInjectAllTarget = path.join(projectPath, 'index.html');
let defaultInjectStylesTarget = path.join(projectPath, 'styles.html');
let defaultInjectScriptsTarget = path.join(projectPath, 'scripts.html');

let defaultEntry = {
  app: path.join(srcPath, 'js/app.js'),
  vendor: path.join(srcPath, 'js/vendor.js'),
};

let defaultBuildConfig = {
  entry: defaultEntry,
  projectRelativePath: '/projectRelativePath/',
  outputNamingPattern: 'hash',
  devServerPort: 'random',
  enableIPHost: true,
  sourceMap: false,
  dropConsole: true,
  staticPublicProjectPath: defaultStaticPublicProjectPath,
  staticHost: '{{serverData.STATIC_HOST}}',
  injectAllFiles: {
    template: defaultInjectAllTPL,
    target: defaultInjectAllTarget,
  },
  injectStylesFiles: {
    template: defaultInjectStylesTPL,
    target: defaultInjectStylesTarget,
  },
  injectScriptsFiles: {
    template: defaultInjectScriptsTPL,
    target: defaultInjectScriptsTarget,
  },
};

const buildConfig = extend(defaultBuildConfig, projectBuildConfig);

if (process.env.staticPublicProjectPath) {
  // 优先取命令行参数
  buildConfig.staticPublicProjectPath = process.env.staticPublicProjectPath;
}

const staticFilesHost = 'static-file.thereclub.cn';
const staticHost = buildConfig.staticHost;

let devServerPort = Math.floor(Math.random() * 9000) + 1000; // 随机生成端口号，避免多项目同时开发时端口被占用（极端情况下会出现重复端口，重新运行命令即可）
let devServerHost = 'localhost';
if (buildConfig.enableIPHost) {
  devServerHost = ip.address();
}
if (buildConfig.devServerPort !== 'random' && !isNaN(buildConfig.devServerPort)) {
  devServerPort = buildConfig.devServerPort;
}
const devServer = '//' + devServerHost + ':' + devServerPort + '/';

/**
 * 注意：会被打包到打包文件的路径都要考虑系统分隔符的差异
 */
let publicPath;
let assetsURL; // 兼容 Unix/Windows 路径分隔符

if (NODE_ENV === 'development') {
  publicPath = devServer;
  assetsURL = devServerHost + ':' + devServerPort + '/asset/';
} else {
  publicPath = '//' + slash(path.join(staticHost, buildConfig.projectRelativePath, 'dist/')); // 兼容 Unix/Windows 路径分隔符
  assetsURL = slash(path.join(buildConfig.projectRelativePath, 'asset/'));
}

let distName = isLib ? '' : 'dist';
let distPatn = buildConfig.staticPublicProjectPath
  ? path.join(buildConfig.staticPublicProjectPath, distName)
  : path.join(projectPath, distName);

exports.paths = {
  projectPath: projectPath,
  cmsPath: cmsPath,
  staticFilesHost: staticFilesHost,
  assetsURL: assetsURL,
  src: srcPath,
  dist: distPatn,
  publicPath: publicPath,
};
exports.inject = {
  defaultInjectAllTPL,
  defaultInjectStylesTPL,
  defaultInjectScriptsTPL,
  defaultInjectAllTarget,
  defaultInjectStylesTarget,
  defaultInjectScriptsTarget,
};
exports.buildConfig = buildConfig;
exports.deployTag = 'drvOf6y'; // deployTag
exports.devServerPort = devServerPort;
exports.isProduction = isProduction;
