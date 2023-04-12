const express = require("express");
const config = require("./config/config");
const app = express();
//const dotenv = require("dotenv");
//dotenv.config({ path: "./config.env" });

port = config.port;
app.get("/app", (req, res) => {
  return res.status(200).send({ message: "App Response from server1!" });
});

app.get("/", (req, res) => {
  return res.send("Welcome to app");
});

app.listen(port, () => {
  console.table([
    {
      port: `${port}`,
    },
  ]);
});

module.exports = {
  app,
  express,
};
