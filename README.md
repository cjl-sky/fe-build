# fe-build

## 安装

全局安装即可.

```bash
npm config set sass_binary_site https://npm.taobao.org/mirrors/node-sass/
npm install -g git+ssh://git@github.com:cjl-sky/fe-build.git
```

## 使用

1、在需要使用代码构建的项目的 package.json 里添加以下 scripts 配置

```json
"scripts": {
    "dev": "fe-build --d",
    "prod": "fe-build --p"
}
```

2、添加构建配置文件

在项目静态目录下（与 package.json 同级）添加配置文件 `build.config.js`，最基本的 `build.config.js` 配置为：

```js
module.exports = {
  projectRelativePath: '/demo/normal-project/',
};
```

## 注意事项

- 迭代时要维护好 unit test
- 提交代码后要注意 CI 平台、邮件是否有单测失败反馈
