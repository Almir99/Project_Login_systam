const router = require("express").Router();
const bcrypt = require("bcryptjs");
const passport = require("passport")

//User model
const User = require("../models/user")

//Login page
router.get("/login", (req, res) => {
    res.render("login")
})
//Register page
router.get("/register", (req, res) => {
    res.render("register")
})
router.post("/register", (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const password2 = req.body.password2;
    let errors = [];
    const PW_test = /^.{6,12}$/;
    //Check required fields
    if (!name || !email || !password || !password2) {
        errors.push({msg: "Please fill in all fields"})
    }
    //Check passwords match
    if (password !== password2) {
        errors.push({msg: "Passwords do not match"})
    }
    //Check pass length
    if (!(PW_test.test(password))) {
        errors.push({msg: "Passwords should be at least 6 to 12 characters"})
    }

    if (errors.length > 0) {
        res.render("register", {
            errors,
            name,
            email,
            password,
            password2
        });
    } else {
        User.findOne({email: email})
            .then(user => {
                if (user) {
                    //User exists
                    errors.push({msg: "Email is already registered"})
                    res.render("register", {
                        errors,
                        name,
                        email,
                        password,
                        password2
                    });
                } else {
                    const newUser = new User({
                        name,
                        email,
                        password
                    })
                    // Hash Password
                    bcrypt.genSalt(10, (err, salt) =>
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if (err) throw err;
                            //Set password to hashed
                            newUser.password = hash;
                            //Save user
                            newUser.save()
                                .then( () => {
                                    req.flash("success_msg", "You are now registered and can log in")
                                    res.redirect("/users/login")
                                })
                                .catch(err => console.log(err))
                        }))
                }
            })
    }
})

//Login Handle
router.post("/login", (req, res, next) => {
    passport.authenticate("local", {
        successRedirect: "/dashboard",
        failureRedirect: "/users/login",
        failureFlash: true
    }, null)(req, res, next)
})

//Logout Handle
router.get("/logout", (req, res, next) => {
    req.logout(err => {
        if (err) {
            return next(err);
        }
        req.flash("success_msg", "You are logged out")
        res.redirect('/users/login');
    })
})

module.exports = router