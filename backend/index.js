const express = require("express");
const session = require("express-session");
const routes = require("./routes/routes");
const dotenv = require("dotenv");
const cors = require("cors");
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

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // set to true once HTTPS is confirmed working on Render
        maxAge: 1000 * 60 * 60 * 8 // 8 hours
    }
}));

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