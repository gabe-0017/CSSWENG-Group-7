const express = require("express");
const router = express.Router();
const supabase = require("../supabaseclient");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

// =========================
// HOME PAGE
// =========================

router.get("/", async (req, res) => {
    try {
        const { data: portfolioItems, error: portfolioError } = await supabase
      .from('portfolio')
      .select('*')
      .order('created_at', { ascending: false });

    if (portfolioError) throw portfolioError;

    const { data: allImages, error: imagesError } = await supabase
      .from('portfolio_images')
      .select('portfolio_id, image_url');

    if (imagesError) throw imagesError;

    // Attach images to each portfolio item without relying on a DB-level FK join
    const itemsWithImages = portfolioItems.map(item => ({
      ...item,
      portfolio_images: (allImages || []).filter(img => img.portfolio_id === item.id)
    }));

    res.render("index", { portfolioItems: itemsWithImages });
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

// Creates a new portfolio item with optional image uploads
router.post("/portfolio", upload.array('images', 10), async (req, res) => {
  const { title, description } = req.body;
  const files = req.files;

  if (!title || !description) {
    return res.status(400).json({ error: "Both title and description are required." });
  }

  try {
    const { data: portfolio, error: portfolioError } = await supabase
      .from('portfolio')
      .insert([{ portfolio_title: title, portfolio_desc: description }])
      .select()
      .single();

    if (portfolioError) throw portfolioError;

    if (files && files.length > 0) {
      for (const file of files) {
        const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
        const storagePath = `${portfolio.id}/${Date.now()}-${safeName}`;

        const { error: uploadError } = await supabase.storage
          .from('portfolio-images')
          .upload(storagePath, file.buffer, { contentType: file.mimetype });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('portfolio-images')
          .getPublicUrl(storagePath);

        const { error: imageError } = await supabase
          .from('portfolio_images')
          .insert([{ portfolio_id: portfolio.id, image_url: urlData.publicUrl }]);

        if (imageError) throw imageError;
      }
    }

    res.status(201).json({ success: true, message: "Portfolio item saved successfully!", data: portfolio });
  } catch (error) {
    console.error('Error saving portfolio item:', error);
    res.status(500).json({ error: "Failed to upload portfolio item to the database." });
  }
});

// Renders individual portfolio item detail page
router.get("/portfolio/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const { data: item, error: itemError } = await supabase
      .from('portfolio')
      .select('*')
      .eq('id', id)
      .single();

    if (itemError) throw itemError;

    const { data: images, error: imagesError } = await supabase
      .from('portfolio_images')
      .select('id, image_url')
      .eq('portfolio_id', id);

    if (imagesError) throw imagesError;

    res.render("portfolio-item", { item, images });
  } catch (error) {
    console.error('Error fetching portfolio item:', error);
    res.status(404).send("Portfolio item not found.");
  }
});

// Updates portfolio item (title and/or description)
router.put("/portfolio/:id", async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: "Both title and description are required." });
  }

  try {
    const { error } = await supabase
      .from('portfolio')
      .update({ portfolio_title: title, portfolio_desc: description })
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true, message: "Portfolio item updated successfully!" });
  } catch (error) {
    console.error('Error updating portfolio item:', error);
    res.status(500).json({ error: "Failed to update portfolio item." });
  }
});

// Updates portfolio cover image
router.put("/portfolio/:id/cover", upload.single('cover'), async (req, res) => {
  const { id } = req.params;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "No image provided." });
  }

  try {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `${id}/cover-${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from('portfolio-images')
      .upload(storagePath, file.buffer, { contentType: file.mimetype });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from('portfolio-images')
      .getPublicUrl(storagePath);

    // Update the first image in portfolio_images as the cover
    const { data: firstImage, error: fetchError } = await supabase
      .from('portfolio_images')
      .select('id')
      .eq('portfolio_id', id)
      .order('id', { ascending: true })
      .limit(1)
      .single();

    if (fetchError || !firstImage) {
      // No existing images — just insert as new
      const { error: insertError } = await supabase
        .from('portfolio_images')
        .insert([{ portfolio_id: Number(id), image_url: urlData.publicUrl }]);

      if (insertError) throw insertError;
    } else {
      // Update the first image's URL
      const { error: updateError } = await supabase
        .from('portfolio_images')
        .update({ image_url: urlData.publicUrl })
        .eq('id', firstImage.id);

      if (updateError) throw updateError;
    }

    res.json({ success: true, message: "Cover image updated successfully!", image_url: urlData.publicUrl });
  } catch (error) {
    console.error('Error updating cover image:', error);
    res.status(500).json({ error: "Failed to update cover image." });
  }
});

// Adds images to existing portfolio item
router.post("/portfolio/:id/images", upload.array('images', 10), async (req, res) => {
  const { id } = req.params;
  const files = req.files;

  if (!files || files.length === 0) {
    return res.status(400).json({ error: "No images provided." });
  }

  try {
    const uploadedImages = [];

    for (const file of files) {
      const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storagePath = `${id}/${Date.now()}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from('portfolio-images')
        .upload(storagePath, file.buffer, { contentType: file.mimetype });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('portfolio-images')
        .getPublicUrl(storagePath);

      const { data: imageRow, error: imageError } = await supabase
        .from('portfolio_images')
        .insert([{ portfolio_id: Number(id), image_url: urlData.publicUrl }])
        .select()
        .single();

      if (imageError) throw imageError;

      uploadedImages.push(imageRow);
    }

    res.status(201).json({ success: true, images: uploadedImages });
  } catch (error) {
    console.error('Error adding images:', error);
    res.status(500).json({ error: "Failed to upload images." });
  }
});

// Deletes single image in a portfolio item
router.delete("/portfolio/:id/images/:imageId", async (req, res) => {
  const { id, imageId } = req.params;

  try {
    const { data: image, error: fetchError } = await supabase
      .from('portfolio_images')
      .select('image_url')
      .eq('id', imageId)
      .single();

    if (fetchError) throw fetchError;

    // Extract storage path from the public URL
    const urlParts = image.image_url.split('/portfolio-images/');
    const storagePath = urlParts[1];

    const { error: storageError } = await supabase.storage
      .from('portfolio-images')
      .remove([storagePath]);

    if (storageError) throw storageError;

    const { error: dbError } = await supabase
      .from('portfolio_images')
      .delete()
      .eq('id', imageId);

    if (dbError) throw dbError;

    res.json({ success: true, message: "Image deleted successfully." });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: "Failed to delete image." });
  }
});

// Deletes all images in a portfolio item
router.delete("/portfolio/:id/images", async (req, res) => {
  const { id } = req.params;

  try {
    const { data: images, error: fetchError } = await supabase
      .from('portfolio_images')
      .select('image_url')
      .eq('portfolio_id', id);

    if (fetchError) throw fetchError;

    if (images && images.length > 0) {
      const storagePaths = images.map(img => {
        const urlParts = img.image_url.split('/portfolio-images/');
        return urlParts[1];
      });

      const { error: storageError } = await supabase.storage
        .from('portfolio-images')
        .remove(storagePaths);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('portfolio_images')
        .delete()
        .eq('portfolio_id', id);

      if (dbError) throw dbError;
    }

    res.json({ success: true, message: "All images deleted successfully." });
  } catch (error) {
    console.error('Error deleting all images:', error);
    res.status(500).json({ error: "Failed to delete all images." });
  }
});

// Deletes an entire portfolio item
router.delete("/portfolio/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch all images first
    const { data: images, error: fetchError } = await supabase
      .from('portfolio_images')
      .select('image_url')
      .eq('portfolio_id', id);

    if (fetchError) throw fetchError;

    // Delete from storage if images exist
    if (images && images.length > 0) {
      const storagePaths = images.map(img => {
        const urlParts = img.image_url.split('/portfolio-images/');
        return urlParts[1];
      });

      const { error: storageError } = await supabase.storage
        .from('portfolio-images')
        .remove(storagePaths);

      if (storageError) throw storageError;
    }

    // Delete from portfolio_images table
    const { error: imagesDbError } = await supabase
      .from('portfolio_images')
      .delete()
      .eq('portfolio_id', id);

    if (imagesDbError) throw imagesDbError;

    // Delete the portfolio item itself
    const { error: portfolioError } = await supabase
      .from('portfolio')
      .delete()
      .eq('id', id);

    if (portfolioError) throw portfolioError;

    res.json({ success: true, message: "Portfolio item deleted successfully." });
  } catch (error) {
    console.error('Error deleting portfolio item:', error);
    res.status(500).json({ error: "Failed to delete portfolio item." });
  }
});

module.exports = router;