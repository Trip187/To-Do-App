var plates = require("plates"),
  fs = require("fs"),
  couchdb = require("../lib/couchDB"),
  getWeather = require("../weatherApi"),
  getNews = require("../currentNews"),
  dbName = "todo",
  db = couchdb.db.use(dbName),
  layout = require("../templates/layout"),
  loggedIn = require("../templates/middleware/logged_in");

var templates = {
  index: fs.readFileSync(__dirname + "/../templates/todo/index.html", "utf8"),
  new: fs.readFileSync(__dirname + "/../templates/todo/new.html", "utf8"),
};

function insert(email, todo, callback) {
  var tries = 0,
    lastError;

  (function doInsert() {
    tries++;
    if (tries >= 3) return callback(lastError);

    db.get(email, function (err, todos) {
      if (err && err.statusCode !== 404) return callback(err);

      if (!todos) todos = { todos: [] };
      todos.todos.unshift(todo);

      db.insert(todos, email, function (err) {
        if (err) {
          if (err.statusCode === 404) {
            lastError = err;
            // database does not exist, need to create it
            couchdb.db.create(dbName, function (err) {
              if (err) {
                return callback(err);
              }
              doInsert();
            });
            return;
          }
          return callback(err);
        }
        return callback();
      });
    });
  })();
}

module.exports = function () {
  this.get("/", [
    loggedIn(),
    function () {
      console.log("Entered /todo");
      console.log("Session user:", this.req.session.user);

      var res = this.res;

      console.log("Looking for todo document:", this.req.session.user.email);

      db.get(this.req.session.user.email, async function (err, todos) {
        console.log("Todo error:", err);
        console.log("Todo document:", todos);

        if (err && err.statusCode !== 404) {
          res.writeHead(500);
          return res.end(err.stack);
        }

        if (!todos) {
          todos = { todos: [] };
        }

        todos = todos.todos;

        todos.forEach(function (todo, idx) {
          todo.pos = idx + 1;
          todo.created = new Date(todo.created_at).toLocaleString();
        });

        try {
          const weather = await getWeather("Nairobi");
          console.log(weather);
          const news = await getNews();

          var map = plates.Map();

          map.className("todo").to("todo");
          map.className("pos").to("pos");
          map.className("what").to("what");
          map.className("created").to("created");

          map.className("city").to("city");
          map.className("temperature").to("temperature");
          map.className("description").to("description");
          map.className("weather-icon").to("weatherIcon").as("src");

          map.className("news").to("news");
          map.className("title").to("title");
          map.className("news-description").to("description");
          map.className("url").to("url");
          map.where("class").is("image").use("image").as("src");
          map.className("url").to("url").as("href");
          map.where("name").is("pos").use("pos").as("value");
          console.log({
            weatherIcon: `https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`,
          });
          var main = plates.bind(
            templates.index,
            {
              todo: todos,
              city: weather.name,
              temperature: weather.main.temp,
              description: weather.weather[0].description,
              weatherIcon: `https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`,
              //current News
              news: news.slice(0, 6),
            },
            map,
          );

          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(layout(main, "To-Dos"));
        } catch (err) {
          console.error("Weather Error:", err);
          res.writeHead(500);
          res.end("Unable to retrieve weather.");
        }
      });
    },
  ]);

  this.get("/new", [
    loggedIn(),
    function () {
      this.res.writeHead(200, { "Content-Type": "text/html" });
      this.res.end(layout(templates["new"], "New To-Do"));
    },
  ]);

  this.post("/", [
    loggedIn(),
    function () {
      var req = this.req,
        res = this.res,
        todo = this.req.body;
      if (!todo.what) {
        res.writeHead(200, { "Content-Type": "text/html" });
        return res.end(
          layout(templates["new"], "New To-Do", {
            error: "Please fill in the To-Do description",
          }),
        );
      }

      todo.created_at = Date.now();

      insert(req.session.user.email, todo, function (err) {
        if (err) {
          res.writeHead(500);
          return res.end(err.stack);
        }

        res.writeHead(303, { Location: "/todo" });
        res.end();
      });
    },
  ]);

  this.post("/sort", [
    loggedIn(),
    function () {
      var res = this.res,
        order = this.req.body.order && this.req.body.order.split(","),
        newOrder = [];
      db.get(this.req.session.user.email, function (err, todosDoc) {
        if (err) {
          res.writeHead(500);
          return res.end(err.stack);
        }

        var todos = todosDoc.todos;

        if (order.length !== todos.length) {
          res.writeHead(409);
          return res.end("Conflict");
        }

        order.forEach(function (order) {
          newOrder.push(todos[parseInt(order, 10) - 1]);
        });

        todosDoc.todos = newOrder;

        db.insert(todosDoc, function (err) {
          if (err) {
            res.writeHead(500);
            return res.end(err.stack);
          }
          res.writeHead(200);
          res.end();
        });
      });
    },
  ]);

  this.post("/delete", [
    loggedIn(),
    function () {
      var req = this.req,
        res = this.res,
        pos = parseInt(req.body.pos, 10);
      db.get(this.req.session.user.email, function (err, todosDoc) {
        if (err) {
          res.writeHead(500);
          return res.end(err.stack);
        }

        var todos = todosDoc.todos;
        todosDoc.todos = todos.slice(0, pos - 1).concat(todos.slice(pos));

        db.insert(todosDoc, function (err) {
          if (err) {
            res.writeHead(500);
            return res.end(err.stack);
          }
          res.writeHead(303, { Location: "/todo" });
          res.end();
        });
      });
    },
  ]);
};
