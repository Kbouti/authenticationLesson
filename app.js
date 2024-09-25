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
app.get("/sign-up", (req, res) => res.render("signUpForm"));


app.post("/sign-up", async (req, res, next) => {
console.log(`post route reached`)


// Why do we do the weird thing with the $1, $2.... I feel like that's tripping us up. 
    try {
    console.log(`About to run query`);
      await pool.query("INSERT INTO users (username, password) VALUES ($1, $2)", [
        req.body.username,
        req.body.password,
      ]);
      res.redirect("/");
    } catch(err) {
      return next(err);
    }
  });
  

app.listen(3000, () => console.log("app listening on port 3000!"));
