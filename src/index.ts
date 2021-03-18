import express from "express";
import session from "express-session";

const app = express();
app.use(session({ secret: process.env.SESSION_SECRET || "" }));

app.get("/", (_, res) => {
  res.send("Hello World");
});

app.listen(3000);
