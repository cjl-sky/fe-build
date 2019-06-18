<!-- fe-build 默认 scripts 模板 -->
<%
  var jsFiles = htmlWebpackPlugin.files.js;
  var excludeChunks = htmlWebpackPlugin.options.excludeChunks;
  for (var i= 0, len = jsFiles.length; i < len; i++) {
    if (excludeChunks && !excludeChunks.test(jsFiles[i])) {
  %>
  <script crossorigin="anonymous" src="<%= jsFiles[i] %>?v={{serverData.version}}"></script>
  <% }} %>