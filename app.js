require("dotenv").config()

const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const connectDB = require("./config/db")
const flash = require("connect-flash")
const session = require("express-session")
const passport = require("passport")

const app = express();

//Passport congig
require("./config/passport")(passport)

//db
connectDB().then((res)=>console.log({res})).catch((err)=>console.log({err}))

//EJS
app.use(expressLayouts);
app.set("view engine", "ejs")

//Bodyparser
app.use(express.urlencoded({
    extended:false
}))

//Express Session
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
}))
app.use(express.static(__dirname + '/public'));
//Passport middleware
app.use(passport.initialize())
app.use(passport.session())

//Connect flash
app.use(flash())

//Global var.
app.use((req, res, next) =>{
    res.locals.success_msg = req.flash("success_msg")
    res.locals.error_msg = req.flash("error_msg")
    res.locals.error = req.flash("error")
    next();
})

//Routes
app.use("/",require("./routes/index"))
app.use("/users",require("./routes/users"))



module.exports = app;
