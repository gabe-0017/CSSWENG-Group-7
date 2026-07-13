const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

// =========================
// NOTIFY ADMIN OF NEW BOOKING
// =========================
async function notifyAdminNewBooking(booking) {
    await resend.emails.send({
        from: "The Caterer & Co <onboarding@resend.dev>",
        to: process.env.DEV_EMAIL, // change to ADMIN_EMAIL before passing to the client (in .env and render.com as well)
        subject: `New Booking Request — ${booking.first_name} ${booking.last_name}`,
        html: `
            <h2>New Booking Request</h2>
            <p>A new booking has been submitted. Here are the details:</p>
            <table style="border-collapse: collapse; width: 100%;">
                <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Name</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${booking.first_name} ${booking.last_name}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Email</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${booking.email}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Contact</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${booking.contact_number}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Event Type</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${booking.event_type}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Event Date</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${booking.event_date}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Venue</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${booking.venue_location}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Guests</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${booking.number_of_guest}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Package</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${booking.package || "None selected"}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Design Motif</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${booking.design_motif || "None specified"}</td></tr>
            </table>
            <br>
            <p>Log in to the admin panel to accept or reject this booking.</p>
        `
    });
}

// =========================
// NOTIFY CUSTOMER OF ACCEPTANCE
// =========================
async function notifyCustomerAccepted(booking) {
    await resend.emails.send({
        from: "The Caterer & Co <onboarding@resend.dev>",
        to: booking.email,
        subject: `Your Booking has been Confirmed — ${booking.event_date}`,
        html: `
            <h2>Booking Confirmed!</h2>
            <p>Dear ${booking.first_name},</p>
            <p>We're excited to let you know that your booking has been <strong>confirmed</strong>. Here are your booking details:</p>
            <table style="border-collapse: collapse; width: 100%;">
                <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Event Type</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${booking.event_type}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Event Date</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${booking.event_date}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Venue</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${booking.venue_location}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Guests</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${booking.number_of_guest}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Package</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${booking.package || "None selected"}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Design Motif</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${booking.design_motif || "None specified"}</td></tr>
            </table>
            <br>
            <p>If you have any questions, feel free to contact us at <a href="mailto:elimaramosco12345@gmail.com">elimaramosco12345@gmail.com</a> or message us on <a href="https://www.facebook.com/catererco">Facebook</a>.</p>
            <p>We look forward to serving you!</p>
            <p><strong>The Caterer & Co</strong><br>by Amosco Event Catering Services</p>
        `
    });
}

// =========================
// NOTIFY CUSTOMER OF REJECTION
// =========================
async function notifyCustomerRejected(booking, reason) {
    await resend.emails.send({
        from: "The Caterer & Co <onboarding@resend.dev>",
        to: booking.email,
        subject: `Update on Your Booking Request — ${booking.event_date}`,
        html: `
            <h2>Booking Update</h2>
            <p>Dear ${booking.first_name},</p>
            <p>Unfortunately, we are unable to accommodate your booking request for <strong>${booking.event_date}</strong>.</p>
            <p><strong>Reason:</strong> ${reason}</p>
            <br>
            <p>We apologize for the inconvenience. Please feel free to contact us to discuss alternative dates or arrangements.</p>
            <p>You can reach us at <a href="mailto:elimaramosco12345@gmail.com">elimaramosco12345@gmail.com</a> or message us on <a href="https://www.facebook.com/catererco">Facebook</a>.</p>
            <p><strong>The Caterer & Co</strong><br>by Amosco Event Catering Services</p>
        `
    });
}

module.exports = { notifyAdminNewBooking, notifyCustomerAccepted, notifyCustomerRejected };