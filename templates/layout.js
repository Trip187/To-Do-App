var Plates = require("plates"),
  fs = require("fs");

var templates = {
  layout: fs.readFileSync("./templates/layout.html", "utf8"),
  alert: fs.readFileSync("./templates/alert.html", "utf8"),
};

module.exports = function (main, title, options) {
  if (!options) {
    options = {};
  }

  var data = {
    "main-body": main,
    title: title,
    messages: "",
  };

  ["error", "info"].forEach(function (messageType) {
    if (options[messageType]) {
      data.messages += Plates.bind(templates.alert, {
        message: options[messageType],
      });
    }
  });

  return Plates.bind(templates.layout, data);
};
