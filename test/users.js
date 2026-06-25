var assert = require("assert"),
  http = require("http"),
  app = require("../app");
before(function (done) {
  app.start(3000, done);
});

after(function (done) {
  app.server.close(done);
});

describe("Users", function () {
  describe("Signup Form", function () {
    it("should load the signup form", function (done) {
      http
        .get("http://localhost:3000/users/new", function (res) {
          assert.strictEqual(res.statusCode, 200, "signup form loaded");

          var body = "";
          res.setEncoding("utf8");
          res.on("data", function (chunk) {
            body += chunk;
          });
          res.on("end", function () {
            assert.ok(
              /<h1>New Users<\/h1>/.test(body),
              "page contains signup form",
            );
            done();
          });
        })
        .on("error", done);
    });
  });
});
