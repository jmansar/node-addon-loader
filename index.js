var loaderUtils = require("loader-utils");
var path = require("path");

module.exports = function(content) {
  this.cacheable && this.cacheable();

  // defaults
  var config = {
    name: "[hash].[ext]",
    basePath: undefined,
    rewritePath: undefined,
    relativePath: false
  };
  var query = this.query;
  var context = this.rootContext;

  // query takes precedence over config
  Object.keys(query).forEach(function(attr) {
    config[attr] = query[attr];
  });

  // Build the output file name
  var url = loaderUtils.interpolateName(this, config.name, {
    context: context,
    content: content
  });

  // write the file to the output dir
  if (this.emitFile) {
    this.emitFile(url, content, false);
    this.addDependency(this.resourcePath);
  }

  // Build the javascript to load the .node at runtime
  var finalUrl;
  if (config.rewritePath) {
    finalUrl = JSON.stringify(path.join(config.rewritePath, url));
  } else if (config.basePath) {
    var basePath = path.relative(
      config.basePath,
      this._compiler.options.output.path
    );
    finalUrl = JSON.stringify(path.join(basePath, url));
  } else {
    finalUrl = "__webpack_public_path__ + " + JSON.stringify(url);
  }
  if (config.relativePath) {
    finalUrl = '__dirname + "/" + ' + finalUrl;
  }
  return (
    "try { global.process.dlopen(module, " +
    finalUrl +
    "); } catch(e) {" +
    "throw new Error('Cannot open ' + " +
    finalUrl +
    " + ': ' + e);}"
  );
};
module.exports.raw = true;
