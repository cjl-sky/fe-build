/**
 * 工具模块
 */

const path = require('path');
const deployTag = process.env.DEPLOY_TAG;

module.exports = {
  /**
   * 返回当前项目静态资源链接
   * @param  {String} relativePath 资源相对路径，相对于项目 assets 目录下
   * @return {String}      完整 URI
   */
  assetsURL: function(relativePath) {
    // 此文件内的逻辑不能使用 es6 组织，因为此文件的解析会在 babel 转换后，如果含有 es6 代码会导致代码压缩时出错
    var url;
    if (process.env.NODE_ENV === 'development') {
      url = path.join(process.env.ASSETS_URL, relativePath);
    } else {
      url = path.join(window.SERVER_DATA.ASSETS_HOST, process.env.ASSETS_URL, relativePath);
    }
    return '//' + url + '?v=' + deployTag;
  },
  /**
   * 返回 static-files.mama.cn CDN 下的资源链接
   * @param  {String} relativePath 资源相对路径，相对于 static-files 仓库根目录
   * @return {String}      完整 URI
   */
  staticFilesURL: function(relativePath) {
    return '//' + path.join(process.env.STATIC_FILES_HOST, relativePath) + '?v=' + deployTag;
  },
};
