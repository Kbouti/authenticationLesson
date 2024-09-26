const { Pool } = require("pg");
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

require("dotenv").config();

let host = process.env.DEV_HOST;
let user = process.env.DEV_USER;
let database = process.env.DEV_DATABASE;
let password = process.env.DEV_PASSWORD;
let port = process.env.DEV_PORT;

const pool = new Pool({
  host,
  user,
  database,
  port: 5432,
  //   Hard coding default port for pool. A separate port from .env is used for express app.
});

const app = express();
app.set("views", __dirname);
app.set("view engine", "ejs");

app.use(session({ secret: "cats", resave: false, saveUninitialized: false }));
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

app.listen(port, () => console.log(`App is listening on port: ${port}`));

app.get("/", (req, res) => res.render("index"));
app.get("/sign-up", (req, res) => res.render("signUpForm"));

app.post("/sign-up", async (req, res, next) => {
  console.log(`post route reached`);
  const username = req.body.username;
  const password = req.body.password;
  try {
    await pool.query("INSERT INTO users (username, password) VALUES ($1, $2)", [
      username,
      password,
    ]);
    res.redirect("/");
  } catch (err) {
    return next(err);
  }
});

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const { rows } = await pool.query(
        "SELECT * FROM users WHERE username = $1",
        [username]
      );
      const user = rows[0];

      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      }
      if (user.password !== password) {
        return done(null, false, { message: "Incorrect password" });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [
      id,
    ]);
    const user = rows[0];

    done(null, user);
  } catch (err) {
    done(err);
  }
});
