// =========================
// BOOKING FORM
// =========================

const bookingForm = document.getElementById("bookingForm");

if (bookingForm) {

    bookingForm.addEventListener("submit", function (event) {

        const selectedDate = document.getElementById("event_date").value;

        if (!selectedDate) {

            alert("Please select an event date from the calendar.");

            event.preventDefault();

            return;

        }

        const confirmBooking = confirm(
            "Please make sure all the information you entered is correct.\n\nDo you want to submit your booking?"
        );

        if (!confirmBooking) {

            event.preventDefault();

        }

    });

}

// =========================
// CALENDAR
// =========================

document.addEventListener("DOMContentLoaded", async function () {

    const calendarElement = document.getElementById("calendar");

    if (!calendarElement) return;

    // Get booked dates from backend
    const response = await fetch("/booking-dates");
    const bookings = await response.json();

    const bookedDates = bookings.map(item => item.event_date);

    // Today's date
    const today = new Date();
    today.setHours(0,0,0,0);

    const calendar = new FullCalendar.Calendar(calendarElement, {

        initialView: "dayGridMonth",

        selectable: true,

        height: "auto",

        dateClick: function(info){

            const clicked = new Date(info.dateStr);
            clicked.setHours(0,0,0,0);

            // Prevent past dates
            if(clicked < today){

                alert("You cannot book a past date.");

                return;

            }

            // Already booked
            if(bookedDates.includes(info.dateStr)){

                alert("This date has already been booked.");

                return;

            }

            // 3-day notice
            const difference = Math.ceil(
                (clicked - today) /
                (1000 * 60 * 60 * 24)
            );

            if(difference < 3){

                const proceed = confirm(
                    "Bookings should normally be made at least 3 days before the event.\n\nWould you like to continue and request an exception?"
                );

                if(!proceed){

                    return;

                }

            }

            // Save selected date
            document.getElementById("event_date").value = info.dateStr;

            document.getElementById("selectedDateText").innerHTML =
                "📅 Selected Date: <strong>" + info.dateStr + "</strong>";

        },

        events: bookings.map(item => ({

            start: item.event_date,

            display: "background",

            color: "#ff9b9b"

        }))

    });

    calendar.render();

});