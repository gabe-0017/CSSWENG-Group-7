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

    const bookedDates = bookings.map(item => item.event_date.split("T")[0]);

    // Today's date
    const today = new Date();
    today.setHours(0,0,0,0);

    // Earliest booking = today + 3 days
    const minimumBookingDate = new Date(today);
    minimumBookingDate.setDate(today.getDate() + 4);

    // Build a YYYY-MM-DD string for a given Date object
    function toDateStr(dateObj) {
        const y = dateObj.getFullYear();
        const m = String(dateObj.getMonth() + 1).padStart(2, "0");
        const d = String(dateObj.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    }

    const calendar = new FullCalendar.Calendar(calendarElement, {

        initialView: "dayGridMonth",

        selectable: true,

        height: "auto",

        dayCellDidMount: function (info) {
            const cellDateStr = toDateStr(info.date);
            const cellDate = new Date(info.date);
            cellDate.setHours(0, 0, 0, 0);
        
            if (cellDate < today) {
                // white — past dates (do nothing)
            } else if (bookedDates.includes(cellDateStr)) {
                info.el.style.backgroundColor = "#ffb3b3"; // red — booked dates
            } else if (cellDate < minimumBookingDate) {
                info.el.style.backgroundColor = "#fff0a0"; // yellow — grace period
            } else {
                info.el.style.backgroundColor = "#d4f5ef"; // green — available dates
            }
        },

        dateClick: function(info){

            const clicked = new Date(info.dateStr);
            clicked.setHours(0,0,0,0);

            // Block past dates
            if(clicked < today){
                alert("You cannot book a date in the past.");
                return;
            }

            // Block dates before the minimum booking date
            if(clicked < minimumBookingDate){
                alert("Bookings must be made at least 3 days in advance.");
                return;
            }

            // Block already booked dates 
            if(bookedDates.includes(info.dateStr)){
                alert("This date has already been booked.");
                return;
            }

            document.querySelectorAll(".fc-daygrid-day.selected-date")
                .forEach(el => el.classList.remove("selected-date"));
            info.dayEl.classList.add("selected-date");

            // Save selected date
            document.getElementById("event_date").value = info.dateStr;

            document.getElementById("selectedDateText").innerHTML =
                "Selected Date: <strong>" + info.dateStr + "</strong>";

        },

    });

    calendar.render();

});
