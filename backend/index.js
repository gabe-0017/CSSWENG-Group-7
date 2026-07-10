const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const routes = require("./routes/routes");
const path = require("path");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// =========================
// View Engine
// =========================

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../frontend"));

// =========================
// Middleware
// =========================

// Parse form data (application/x-www-form-urlencoded)
app.use(express.urlencoded({ extended: true }));

// Parse JSON requests
app.use(express.json());

// Enable CORS
app.use(cors());

// Serve static files (CSS, JS, Images)
app.use(express.static("public"));

// =========================
// Routes
// =========================

app.use("/", routes);

// =========================
// Error Handler
// =========================

app.use((err, req, res, next) => {

    console.error(err.stack);

    res.status(500).send("Something went wrong!");

});

// =========================
// Start Server
// =========================

app.listen(port, () => {

    console.log(`Server is running on port ${port}`);

});