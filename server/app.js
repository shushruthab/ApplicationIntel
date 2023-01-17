const express = require('express');
const cors = require("cors");

const ExpressError = require("./expressError")
const authRoutes = require("./routes/auth");
const dashboard = require("./routes/applications")
const users = require("./routes/user");
const contacts = require("./routes/contact");
const { authenticateJWT } = require("./middleware/auth");

const app = express();
app.use(cors());
app.use(express.json());
app.use(authenticateJWT);


app.use("/auth", authRoutes);
app.use("/applications", dashboard);
app.use("/users", users);
app.use("/contacts", contacts);


/** 404 handler */

app.use(function(req, res, next) {
    const err = new ExpressError("Not Found", 404);
    return next(err);
  });
  
  /** general error handler */
  
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
  
    return res.json({
      error: err,
      message: err.message
    });
  });
  
  
  module.exports = app;
  
