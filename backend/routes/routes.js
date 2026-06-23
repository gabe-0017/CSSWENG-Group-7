const express = require("express");
const router = express.Router();
const supabase = require("../supabaseclient");

//renders main page
router.get("/", async (req, res) => {
  try{
    const { data: test, error } = await supabase
      .from('test')
      .select('*')

    console.log('Fetched data:', test);
    console.log(test[0].name);
    res.render("index");
  }
  catch (error) {
    console.error('Error fetching tasks:', error);
  }
});

module.exports = router;