const express = require("express");
const router = express.Router();
const Listing = require("../models/listing");
const wrapAsync = require("../utils/wrapAsync");
const searchController = require("../controllers/search.js");

const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");
const listingController  = require("../controllers/listings.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage }); 


router.route("/")
    .get(wrapAsync(searchController.search));    

module.exports = router;

//This is only make the code more readable or stuctural and organized format.