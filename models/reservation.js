const mongoose = require("mongoose");
const { type } = require("os");

const reservationSchema = new mongoose.Schema({
    listing: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Listing", 
        required: true 
    },
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    email: { 
        type: String, 
        required: true,
        match: /.+\@.+\..+/  // Basic email validation
    },
    checkin: { 
        type: Date, 
        required: true 
    },
    checkout: { 
        type: Date, 
        required: true 
    },
    guests: { 
        type: Number, 
        required: true, 
        min: 1 
    },
    amount: { 
        type: Number, 
        required: true 
    },
    paymentId: {
        type: String,
        unique: true,
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model("Reservation", reservationSchema);
