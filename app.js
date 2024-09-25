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

console.log(`checking process.env variable user: ${user}`);

const pool = new Pool({
  // add your configuration
  host,
  user,
  database,
  password,
  port,
});

const app = express();
app.set("views", __dirname);
app.set("view engine", "ejs");

app.use(session({ secret: "cats", resave: false, saveUninitialized: false }));
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => res.render("index"));

app.listen(3000, () => console.log("app listening on port 3000!"));
