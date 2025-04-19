const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const Reservation = require("../models/reservation.js");
const wrapAsync = require("../utils/wrapAsync.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");
const listingController  = require("../controllers/listings.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage }); 
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

//Index,Create
router.route("/")
    .get(wrapAsync(listingController.index))
    .post(isLoggedIn, upload.single("listing[image]"), validateListing, wrapAsync(listingController.createListing));

//New Route
router.get("/new", isLoggedIn, listingController.renderNewForm);

//Show,Update,Delete
router.route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put(isLoggedIn, isOwner, upload.single("listing[image]"),validateListing, wrapAsync(listingController.updateListing))
    .delete(isLoggedIn, isOwner,wrapAsync(listingController.destroyListing));

//Index Route
// router.get("/", wrapAsync(listingController.index));

//Create Route
// router.post("/", isLoggedIn, validateListing, wrapAsync(listingController.createListing));

//New Route
// router.get("/new", isLoggedIn, listingController.renderNewForm);

//Show Route
// router.get("/:id", wrapAsync(listingController.showListing));

//Edit Route
router.get("/:id/edit", isLoggedIn, isOwner,wrapAsync(listingController.renderEditForm));

// Route to render the reservation form
router.get("/:id/reservation", isLoggedIn, wrapAsync(listingController.renderReservationForm));

// Route to handle reservation submission
router.post("/:id/reservation", isLoggedIn, wrapAsync(listingController.createReservation));


// Route for myReservation
router.get("/my/reservations", isLoggedIn, wrapAsync(listingController.getMyReservations));

// Cancel Reservation
router.delete("/:id/reservations/:reservationId", isLoggedIn, wrapAsync(listingController.cancelReservation));

//Update Route
// router.put("/:id", isLoggedIn, isOwner,validateListing, wrapAsync(listingController.updateListing));

//Delete Route
// router.delete("/:id", isLoggedIn, isOwner,wrapAsync(listingController.destroyListing));

module.exports = router;