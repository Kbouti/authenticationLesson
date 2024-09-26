const { Pool } = require("pg");
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

// const { Client } = require("pg");

require("dotenv").config();

let host = process.env.DEV_HOST;
let user = process.env.DEV_USER;
let database = process.env.DEV_DATABASE;
let password = process.env.DEV_PASSWORD;
let port = process.env.DEV_PORT;


console.log(`host: ${host}`);
console.log(`user: ${user}`);
console.log(`database: ${database}`);
console.log(`password: ${password}`);
console.log(`port: ${port}`);

console.log(`initializing pool`);
const pool = new Pool({
  // add your configuration
  host,
  user,
  database,
  password,
  port: 5432
// Hard coding 5432 instead of using 3000 - Perhaps there's a conflict with the port our server is using?
});

// let connectionString = `postgresql://${user}:${password}@${host}:${port}/${database}`;
// const pool = new Pool({
//     connectionString
// })
// Didn't work with connection string either.....




const app = express();
app.set("views", __dirname);
app.set("view engine", "ejs");

app.use(session({ secret: "cats", resave: false, saveUninitialized: false }));
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => res.render("index"));
app.get("/sign-up", (req, res) => res.render("signUpForm"));

app.post("/sign-up", async (req, res, next) => {
  console.log(`post route reached`);

  const username = req.body.username;
  const password = req.body.password;
  console.log(`username: ${username}`);
  console.log(`password: ${password}`);

  const testQuery = `insert into users (username, password) values ('steve', 'Buscemi');`;

  //   We've got a problem with our db pool.
  // Which means there must be a problem with the credentials we gave it?????
  const response = await pool.query('select * from users;');

  //   try {
  //     console.log(`About to run query`);
  //     // await pool.query(testQuery);
  //     await pool.query("INSERT INTO users (username, password) VALUES ($1, $2)", [
  //       username,
  //       password,
  //     ]);
  res.redirect("/");
  //   } catch (err) {
  //     return next(err);
  //   }
});

app.listen(port, () => console.log(`App is listening on port: ${port}`));
