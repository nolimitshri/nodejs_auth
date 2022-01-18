const express = require("express");
const router = express.Router();
const bcryptjs = require("bcryptjs");
const passport = require("passport");

// Passport requires
require("../config/passport-local")(passport);

const User = require("../model/User");

router.get("/login", (req, res) => {
    res.render("login", {
        csrfToken: req.csrfToken()
    });
});

router.get("/register", (req, res) => {
    res.render("register", {
        csrfToken: req.csrfToken(),
        errors: []
    });
});

// POSTs Request
router.post("/register", async(req, res) => {
    // Validations..
    const { name, email, password, password2 } = req.body;
    let errors = [];

    if(!name || !email || !password || !password2){
        errors.push({msg: "All fields needed to be filled !!"});
    }
    
    if(password !== password2){
        errors.push({msg: "Password don't match !!"});
    } 
    
    if(password.length < 6){
        errors.push({msg: "Password length must be greater than 6 !!"});
    } 

    if(errors.length > 0){
        res.render("register", {
            errors: errors,
            name,
            email,
            password,
            password2,
            csrfToken: req.csrfToken()
        });

    // If everything is fine..
    } else {
        bcryptjs.genSalt(10, (err, salt) => {
            if (err) throw err;
            bcryptjs.hash(password, salt, (er, hashedPwd) => {
                const newUser = new User({
                    name,
                    email,
                    password: hashedPwd,
                    provider: "email",
                });
                newUser.save()
                .then((user) => {
                    req.flash("success_msg", "You are now registered and can log in !");
                    res.redirect("/login");
                })
                .catch(e => console.log(e));
            })
        })
    }

});

router.post("/login", (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/login',
        failureFlash: true })(req, res, next);
});

router.get("/logout", (req, res) => {
    req.logout();
    req.session.destroy(err => {
        res.redirect("/");
    });
});

module.exports = router;