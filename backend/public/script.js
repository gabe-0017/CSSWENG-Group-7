// =========================
// BOOKING FORM
// =========================

const bookingForm = document.getElementById("bookingForm");

if (bookingForm) {

    bookingForm.addEventListener("submit", function (event) {

        const confirmBooking = confirm(
            "Please make sure all the information you entered is correct.\n\nDo you want to submit your booking?"
        );

        if (!confirmBooking) {
            event.preventDefault();
        }

    });

}

// =========================
// PREVENT PAST DATES
// =========================

const eventDateInput = document.querySelector(
    'input[name="event_date"]'
);

if (eventDateInput) {

    const today = new Date()
        .toISOString()
        .split("T")[0];

    eventDateInput.min = today;

}