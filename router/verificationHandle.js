const express = require("express");
const router = express.Router();

const crypto = require("crypto");

const User = require("../model/User");
const Token = require("../model/Token");

const { ensureAuthenticated } = require("../middlewares/authorizationReq");

const mailer = require("./mailer");

router.get("/sendVerificationEmail", ensureAuthenticated, async(req, res) => {
    if(req.user.provider === 'google' || req.user.isVerified){
        res.redirect("/dashboard");
    } else {
        var token = crypto.randomBytes(32).toString("hex");

        const newToken = new Token({
            token: token,
            email: req.user.email
        });

        try{
            const tok = await newToken.save();
            mailer.sendVerifyEmail(req.user.email, token);
            res.render("dashboard", {
                user: req.user,
                emailSent: true
            });
        }catch(e){
            console.log(e);
        }
    }
});

router.get("/user/verifyEmail", async(req, res) => {
    const token = req.query.token;

    if(token){
        var tokenCheck = await Token.findOne({token: token});

        if(tokenCheck){
            const userData = await User.findOneAndUpdate({email: tokenCheck.email}, {isVerified: true}, {new: true, runValidators: true});
            const deleteToken = await Token.findOneAndDelete({token: token});
            res.redirect("/dashboard");
        } else {
            res.render("dashboard", {
                user: req.user,
                emailSent: true,
                err: "Invalid Token or Token is required"
            })
        }
    } else {
        res.redirect("/dashboard");
    }
});


module.exports = router;