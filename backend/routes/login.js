const express = require("express");
// const bcrypt = require("bcrypt");
const router = express.Router();
const supabase = require("../supabaseclient");

// =========================
// HOME PAGE
// =========================
/*
router.get("/", async (req, res) => {
    try {
        res.render("index");
    } catch (error) {
        console.error("Error rendering page:", error);
        res.status(500).send("Unable to load page.");
    }
});*/

// =========================
// LOGIN
// =========================


router.post("/login", async (req, res) => {

    console.log("logging in");
    const username = document.getElementsByID("user").value;
    const password = document.getElementsByID("password").value;
    /*console.log(req.body);

    const {
        username, 
        password
    } = req.body;*/

    try {

        const { data, error } = await supabase
            .from("admin_accounts")
            .select("*")
            .eq("username", username)
            .eq("password", password)
            .single();

        if (error) {

            console.error("========== SUPABASE ERROR ==========");
            console.error(error);
            console.error("====================================");

            return res.status(500).send(error.message);
        }

        console.log("========== LOGGED IN ==========");
        console.log(data);
        console.log("===================================");

        res.redirect("/");

    } catch (err) {

        console.error("========== SERVER ERROR ==========");
        console.error(err);
        console.error("==================================");

        res.status(500).send(err.message);
    }

});

module.exports = router;
