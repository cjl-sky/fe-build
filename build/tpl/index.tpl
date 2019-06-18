<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>fe-build 默认模板</title>
    <%
        var cssFiles = htmlWebpackPlugin.files.css;
        for (var i= 0, len = cssFiles.length; i < len; i++) {
    %>
        <link href="<%= cssFiles[i] %>?v={{serverData.version}}" rel="stylesheet">
        <% } %>
</head>

<body>
    <h1>请打开 console 查看 JS 演示示例</h1>
    <p>使用 scss 引用静态资源演示：</p>
    <p class="scss-assets-demo"></p>
    <%
        var jsFiles = htmlWebpackPlugin.files.js;
        var excludeChunks = htmlWebpackPlugin.options.excludeChunks;
        for (var i= 0, len = jsFiles.length; i < len; i++) {
          if (excludeChunks && !excludeChunks.test(jsFiles[i])) {
    %>
        <script crossorigin="anonymous" src="<%= jsFiles[i] %>?v={{serverData.version}}"></script>
        <% }} %>
</body>

</html>