const express = require("express");
const router = express.Router();
const supabase = require("../supabaseclient");

// =========================
// HOME PAGE
// =========================

router.get("/", async (req, res) => {
    try {
        res.render("index");
    } catch (error) {
        console.error("Error rendering page:", error);
        res.status(500).send("Unable to load page.");
    }
});

// login

router.get("/adminlogin", async (req, res) => {
  try{
    res.render("login");
  }
  catch (error) {
    console.error('Error fetching login page', error);
  }
});

// =========================
// BOOK EVENT
// =========================

router.post("/book", async (req, res) => {

    console.log("========== NEW BOOKING ==========");
    console.log(req.body);

    const {
        first_name,
        last_name,
        email,
        contact_number,
        event_type,
        event_date,
        venue_location,
        number_of_guest,
        design_motif,
        package
    } = req.body;

    try {

        const { data, error } = await supabase
            .from("booking")
            .insert([
                {
                    first_name,
                    last_name,
                    email,
                    contact_number,
                    event_type,
                    event_date,
                    venue_location,
                    number_of_guest: Number(number_of_guest),
                    design_motif,
                    package
                }
            ])
            .select();

        if (error) {

            console.error("========== SUPABASE ERROR ==========");
            console.error(error);
            console.error("====================================");

            return res.status(500).send(error.message);
        }

        console.log("========== BOOKING SAVED ==========");
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