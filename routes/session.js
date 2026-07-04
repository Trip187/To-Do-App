var Plates = require("plates"),
  fs = require("fs"),
  couchdb = require("../lib/couchDB"),
  layout = require("../templates/layout"), // ✅ one require, here
  dbName = "users",
  db = couchdb.db.use(dbName);

var templates = {
  new: fs.readFileSync(__dirname + "/../templates/session/new.html", "utf8"),
};

module.exports = function () {
  this.get("/new", function () {
    this.res.writeHead(200, { "Content-Type": "text/html" });
    this.res.end(layout(templates["new"], "Log In"));
  });

  this.post("/", function () {
    var res = this.res;
    var req = this.req;
    var login = this.req.body;

    if (!login.email || !login.password) {
      return res.end(
        layout(templates["new"], "Log In", {
          error: "Invalid email or password",
        }),
      );
    }
    login.email = login.email.trim().toLowerCase();
    db.get(login.email, function (err, user) {
      console.log("Looking up email:", JSON.stringify(login.email));
      if (err) {
        console.log(err);
        if (err.statusCode === 404) {
          return res.end(
            layout(templates["new"], "Log In", { error: "User not found" }),
          );
        }
        console.error(err.trace);
        res.writeHead(500, { "Content-Type": "text/html" });
        return res.end(err.message);
      }

      if (user.password !== login.password) {
        res.writeHead(403, { "Content-Type": "text/html" });
        return res.end(
          layout(templates["new"], "Log In", { error: "Invalid password" }),
        );
      }

      req.session.user = user;
      res.writeHead(302, { Location: "/todo" });
      res.end();
    });
  });
};
