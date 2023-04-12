const { express, app } = require("../../app");
const morgan = require("morgan");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const cors = require("cors");

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(express.static("uploadfile"));
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());

require("../../routes");
