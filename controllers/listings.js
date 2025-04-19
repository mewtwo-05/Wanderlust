const { express } = require("express");
const Listing = require("../models/listing");
const Reservation = require("../models/reservation.js");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const geocodingClient = mbxGeocoding({ accessToken: mapToken });
const nodemailer = require("nodemailer");
// const { sendConfirmationEmail } = require("../utils/mailer.js"); // Adjust path as needed
// import { sendConfirmationEmail } from "../utils/mailer.js";
const { sendConfirmationEmail } = require("../utils/mailer.js");



module.exports.index = async (req, res) => {
    const { category } = req.query; //Get category from query params
    let filter = {}; //Default: show all listings
    if (category) {
        filter.category = { $regex: new RegExp("^" + category + "$", "i") }; //Apply category filter
    }

    const allListings = await Listing.find(filter);
    res.render("./listings/index.ejs", { allListings, category });
};

module.exports.renderNewForm = (req, res) => {
    // console.log(req.user);
    // if(!req.isAuthenticated()) {
    //     req.flash("error", "you must be logged in to create listing!")
    //     return res.redirect("/login");
    // }
    res.render("./listings/new.ejs");
};

module.exports.showListing = async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews", 
            populate: {
                path: "author",
            },
        })
        .populate("owner")
        .populate("reservations"); // Populate reservations
    if(!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    // console.log(listing);
    res.render("./listings/show.ejs", { listing });
};

module.exports.createListing = async (req,res,next) => {
    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
    }).send()

    let url = req.file.path;
    let filename = req.file.filename;
    // console.log(url, ".." , filename);
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url, filename};
    newListing.geometry = response.body.features[0].geometry;
    newListing.category = req.body.listing.category; //Assigning category
    let savedListing = await newListing.save();
    console.log(savedListing);
    req.flash("success", "New listing Created!");
    res.redirect("/listings");
};

module.exports.renderEditForm = async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300,w_250");
    res.render("./listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req,res) => {
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});

    if(typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req,res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};

module.exports.renderReservationForm = async (req, res) => {
    let { id } = req.params;
    // console.log(id);
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    res.render("./listings/reservation.ejs", { listing });
};

// module.exports.createReservation = async (req, res) => {
//     try {
//         const { id } = req.params;
//         // console.log(id);
//         const { checkin, checkout, guests, email } = req.body;

//         // Validate input data
//         if (!checkin || !checkout || !guests || !email) {
//             req.flash("error", "All fields are required!");
//             return res.redirect(`/listings/${id}/reservation`);
//         }

//         // Find the listing
//         const listing = await Listing.findById(id);
//         if (!listing) {
//             req.flash("error", "Listing not found!");
//             return res.redirect("/listings");
//         }

//         const checkinDate = new Date(checkin);
//         const checkoutDate = new Date(checkout);

//         // Validate dates
//         if (checkoutDate <= checkinDate) {
//             req.flash("error", "Checkout date must be after check-in date!");
//             return res.redirect(`/listings/${id}/reservation`);
//         }

//         // Make sure the listing has a price field
//         if (!listing.price) {
//             req.flash("error", "Price information missing!");
//             return res.redirect(`/listings/${id}/reservation`);
//         }

//         // Calculate total amount
//         const numNights = Math.ceil((checkoutDate - checkinDate) / (1000 * 3600 * 24));
//         const totalAmount = listing.price * numNights;

//         // Create reservation
//         const newReservation = new Reservation({
//             listing: listing._id,
//             user: req.user._id, // Ensure user is logged in
//             email,
//             checkin: checkinDate,
//             checkout: checkoutDate,
//             guests: parseInt(guests), // Store guests as a number
//             totalAmount
//         });

//         await newReservation.save();

//         // Push the reservation ID into the listing's reservations array
//         listing.reservations.push(newReservation);
//         await listing.save();

//         req.flash("success", `Reservation successful! Total: ₹${totalAmount}`);
//         res.redirect(`/listings/${id}`); // Redirect back to listing page

//     } catch (err) {
//         req.flash("error", "Something went wrong! " + err.message);
//         res.redirect(`/listings/${id}/reservation`);
//     }
// };

module.exports.createReservation = async (req, res) => {
    try {
        const { id } = req.params;
        const { checkin, checkout, guests, email, paymentToken, amount} = req.body;
        // console.log("req.body:", req.body);
        // console.log('totalAmount from req.body:', amount);

        const amountInPaise = parseInt(amount * 100); // assuming INR

        if (isNaN(amountInPaise)) {
            return res.status(400).json({ message: 'Invalid totalAmount provided' });
        }

        // Check for overlapping reservations
        const newCheckin = new Date(checkin);
        const newCheckout = new Date(checkout);
        const today = new Date();
        today.setHours(0,0,0,0); //remove time part 

        // Validation: Checkin and checkout must not be in the past
        if (newCheckin < today || newCheckout < today) {
            return res.status(400).json({
                message: 'Check-in and check-out dates must be today or in the future'
            });
        }

        // Validation: Check-in and check-out must not be the same
        if (newCheckin.toDateString() === newCheckout.toDateString()) {
            return res.status(400).json({
                message: 'Check-in and check-out dates cannot be the same'
            });
        }

        // Validation: check for overlapping reservations
        const overlappingReservation = await Reservation.findOne({
            listing: id,
            $or: [
                {
                    checkin: { $lte: newCheckout },
                    checkout: { $gte: newCheckin }
                }
            ]
        });

        // Validate max 10-night stay
        const diffInTime = newCheckout.getTime() - newCheckin.getTime();
        const numNights = Math.ceil(diffInTime / (1000 * 3600 * 24));
        if (numNights > 10) {
            return res.status(400).json({
                message: 'You can only book a stay for up to 10 nights'
            });
        }

        if (overlappingReservation) {
            return res.status(400).json({
                message: 'This listing is already reserved for the selected dates'
            });
        }

        // Create Stripe payment
        const payment = await stripe.charges.create({
            amount: amountInPaise,
            currency: 'inr',
            source: paymentToken,
            description: `Reservation for listing ${id}`
        });

        if (payment.status !== 'succeeded') {
            return res.status(400).json({ message: 'Payment failed' });
        }

        // Save Reservation
        const reservation = await Reservation.create({
            listing: id,
            user: req.user._id,
            amount,
            checkin,
            checkout,
            guests,
            email,
            paymentId: payment.id // Store the Stripe payment ID
        });

        // Send confirmation email
        try {
            await sendConfirmationEmail(
            email,
            "Wanderlust Reservation Confirmed",
            `Hi there!\n\nYour reservation from ${checkin} to ${checkout} for ${guests} guest(s) is confirmed.\n\nThank you for booking with Wanderlust!`
        );
        } catch (emailErr) {
            console.error("Email sending failed:", emailErr.message);
        }
        return res.status(201).json({ message: 'Reservation created', reservation });
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

module.exports.getMyReservations = async (req, res) => {
    const reservations = await Reservation.find({ user: req.user._id }).populate("listing");
    res.render("listings/myReservation.ejs", { reservations });
};

module.exports.cancelReservation = async (req, res) => {
    const { id, reservationId } = req.params;
    const reservation = await Reservation.findById(reservationId).populate("user");

    if (!reservation) {
        req.flash("error", "Reservation not found.");
        return res.redirect("/listings");
    }

    // Ensure only the reservation owner can cancel
    if (!reservation.user.equals(req.user._id)) {
        req.flash("error", "You are not authorized to cancel this reservation.");
        return res.redirect("/listings");
    }

    const userEmail = reservation.user.email; // ✅ Make sure email exists
    if (userEmail) {
        await sendConfirmationEmail(
            userEmail,
            "Reservation Cancelled",
            `Your reservation for listing ID ${reservation.listing} has been successfully cancelled.`
        );
    } else {
        console.warn("No email found for user, skipping cancellation email.");
    }

    await Reservation.findByIdAndDelete(reservationId);

    req.flash("success", "Reservation cancelled successfully.");
    res.redirect("/listings");
};