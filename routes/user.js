const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/users.js");

//Signup(render), Signup
router.route("/signup")
    .get(userController.renderSignupForm)
    .post(wrapAsync(userController.signup));

//Login(render), Login
router.route("/login")
    .get(userController.renderLoginForm)
    .post(saveRedirectUrl, passport.authenticate("local", { 
        failureRedirect: "/login", failureFlash: true
    }), userController.login);

//For Signup or Register user (render)
// router.get("/signup", userController.renderSignupForm);

//For Signup or Register user
// router.post("/signup", wrapAsync(userController.signup));

//For Login and authenticate user (render)
// router.get("/login", userController.renderLoginForm);

//For Login and authenticate user
// router.post("/login", saveRedirectUrl, passport.authenticate("local", { 
//     failureRedirect: "/login", failureFlash: true
// }), userController.login);

//For Logout user
router.get("/logout", userController.logout);

module.exports = router;