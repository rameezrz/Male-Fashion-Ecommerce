const express = require("express");
const ejsLayout = require("express-ejs-layouts");
const dotenv = require("dotenv");
const flash = require("connect-flash");
const mongoose = require("mongoose");
const session = require('express-session')
const cookieParser = require('cookie-parser')
const nocache = require('nocache')
const logger= require('morgan')
const app = express();

//environment variables
dotenv.config({ path: "./.env" });

app.use(express.json())
app.use(express.urlencoded({ extended: true })); 
app.use(logger('dev'))

//view engine
app.set("view engine", "ejs");
app.use(ejsLayout);
app.set('adminLayout', 'layouts/adminLayout'); 
app.set('adminLayoutBlank', 'layouts/adminLayoutBlank'); 
app.set('blankLayout', 'layouts/blankLayout'); 

//cookie Parser
app.use(cookieParser())


//no cache
app.use(nocache())

app.use(session({
    secret: "secret",
    saveUninitialized: true,
    resave:true
}))

//flash Messages
app.use(flash())

//Global Variables
app.use((req, res, next) => {
    res.locals.successMsg = req.flash('successMsg')
    res.locals.errorMsg = req.flash('errorMsg')
    next()
})

//db config
mongoose
  .connect(process.env.MONGO_DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connection Successful"))
  .catch((e) => console.log("Error : ", e));

//ejs layouts
app.use(ejsLayout);
app.set("layout", "layouts/layout");

//public folder
app.use(express.static("public"));

//Routes
app.use("/", require("./routes/userRoute"));
app.use("/", require("./routes/adminRoute"));

app.listen(process.env.PORT);
