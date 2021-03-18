import express from "express";
import session from "express-session";
import passport from "passport";
import oauth2 from "oauth2strategy";

passport.use(
  new OAuth2Strategy(
    {
      authorizationURL: "https://www.example.com/oauth2/authorize",
      tokenURL: "https://www.example.com/oauth2/token",
      clientID: EXAMPLE_CLIENT_ID,
      clientSecret: EXAMPLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/example/callback",
    },
    function (accessToken, refreshToken, profile, cb) {
      User.findOrCreate({ exampleId: profile.id }, function (err, user) {
        return cb(err, user);
      });
    }
  )
);

const app = express();
app.use(session({ secret: process.env.SESSION_SECRET || "" }));
app.use(passport.initialize());
app.use(passport.session());

app.get("/", (_, res) => {
  res.send("Hello World");
});

app.listen(3000);
