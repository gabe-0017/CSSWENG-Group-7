const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const routes = require("./routes/routes.js");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
app.set("view engine", "ejs");
app.set("views", "../frontend");

//middlewares
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

//routes

//Error handling middleware

//server listening
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.use("/", routes);
