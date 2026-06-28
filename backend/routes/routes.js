const express = require("express");
const router = express.Router();
const supabase = require("../supabaseclient");
const bcrypt = require("bcrypt");

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

// =========================
// GET BOOKED DATES
// =========================

router.get("/booking-dates", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("booking")
            .select("event_date");

        if (error) throw error;

        res.json(data);

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Unable to fetch booking dates."
        });
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

        // =========================
        // RULE 1 - Prevent duplicate bookings
        // =========================

        const { data: existingBooking, error: bookingError } =
            await supabase
                .from("booking")
                .select("id")
                .eq("event_date", event_date);

        if (bookingError) throw bookingError;

        if (existingBooking && existingBooking.length > 0) {
            return res.status(400).send(
                "This date has already been booked. Please choose another date."
            );
        }

        // =========================
        // RULE 2 - STRICT 3-DAY BLOCK (ACTUAL: 4-DAY MINIMUM BOOKING)
        // =========================

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Earliest booking = today + 3 days
        const minAllowedDate = new Date(today);
        minAllowedDate.setDate(today.getDate() + 3);

        const selectedDate = new Date(event_date);
        selectedDate.setHours(0, 0, 0, 0);

        if (selectedDate < minAllowedDate) {
            return res.status(400).send(
                "Bookings must be made at least 3 days in advance."
            );
        }

        // =========================
        // SAVE BOOKING
        // =========================

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
            return res.status(500).send(error.message);
        }

        console.log("========== BOOKING SAVED ==========");
        console.log(data);

        res.redirect("/");

    } catch (err) {
        console.error("========== SERVER ERROR ==========");
        console.error(err);
        res.status(500).send(err.message);
    }
});

//register page

router.get("/register-page", async (req, res) => {
  try{
    res.render("register");
  }
  catch (error) {
    console.error('Error fetching login page', error);
  }
});

// register
router.post("/register", async (req, res) => {

    const { user, password } = req.body;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
        .from("admin_accounts")
        .insert([
            {
                username: user,
                password: hashedPassword
            }
        ]);

    if (error) {
        return res.send(error.message);
    }

    console.log(data);
    res.redirect("/adminlogin");
    res.send("Account Registered Successfully!");
});


//render login page

router.get("/adminlogin", async (req, res) => {
  try{
    res.render("login");
  }
  catch (error) {
    console.error('Error fetching login page', error);
  }
});

// =========================
// LOGIN
// =========================


router.post("/login", async (req, res) => {

    console.log("logging in");
    console.log(req.body);
    const { logUser, logPassword } = req.body;
    console.log(logUser, logPassword);
    try {

        const { data, error } = await supabase
            .from("admin_accounts")
            .select("*")
            .eq("username", logUser.trim())
            .single();

        console.log(data);
        console.log(error);
        const samePassword = await bcrypt.compare(logPassword, data.password);

        if (!samePassword) {
        return res.render("login", {
            error: "Invalid username or password"
        });
    }

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