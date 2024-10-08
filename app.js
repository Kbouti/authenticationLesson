const { Pool } = require("pg");

const bcrypt = require("bcryptjs");

const express = require("express");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

require("dotenv").config();

const pool = new Pool({
  host: process.env.DEV_HOST,
  user: process.env.DEV_USER,
  database: process.env.DEV_DATABASE,
  password: process.env.DEV_PASSWORD,
  port: 5432,
});

const app = express();
app.set("views", __dirname);
app.set("view engine", "ejs");

app.use(session({ secret: "cats", resave: false, saveUninitialized: false }));
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

app.listen(3000, () => console.log(`App is listening on port: 3000`));

app.get("/", (req, res) => res.render("index", { user: req.user }));

app.get("/sign-up", (req, res) => res.render("signUpForm"));

app.get("/log-out", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

app.post("/sign-up", async (req, res, next) => {
  console.log(`post route reached`);
  const username = req.body.username;
  const password = req.body.password;

  bcrypt.hash(password, 10, async (err, hashedPassword) => {
    if (err) {
      return err;
    } else {
      try {
        await pool.query(
          "INSERT INTO users (username, password) VALUES ($1, $2)",
          [username, hashedPassword]
        );
        res.redirect("/");
      } catch (err) {
        return next(err);
      }
    }
  });
});

app.post(
  "/log-in",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/",
  })
);

passport.use(
  new LocalStrategy(async (username, password, done) => {
    console.log(`local strategy triggered`);
    try {
      const { rows } = await pool.query(
        "SELECT * FROM users WHERE username = $1",
        [username]
      );
      const user = rows[0];
      if (!user) {
        console.log(`username does not exist`);
        return done(null, false, { message: "Incorrect username" });
      }
    //   Without encryption:
      //   if (user.password !== password) {
      //     return done(null, false, { message: "Incorrect password" });
      //   }
    //   With encryption:
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        console.log(`incorrect password`);
        return done(null, false, { message: "Incorrect password" });
      }
      console.log(`successfull login`)
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
