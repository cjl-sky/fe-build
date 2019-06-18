<!-- fe-build 默认 styles 模板 -->
<%
  var cssFiles = htmlWebpackPlugin.files.css;
  for (var i= 0, len = cssFiles.length; i < len; i++) {
  %>
  <link href="<%= cssFiles[i] %>?v={{serverData.version}}" rel="stylesheet">
  <% } %>