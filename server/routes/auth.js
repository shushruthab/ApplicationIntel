const express = require("express");
const router = new express.Router();

const jsonschema = require("jsonschema");
const userAuthSchema = require("../schemas/userAuth.json");
const userRegisterSchema = require("../schemas/userRegister.json");

const { createToken } = require("../helpers/tokens");
const User = require("../models/User");
const { BadRequestError } = require("../expressError");

/** POST /auth/login:  { email, password } => { token }
 *
 * Returns JWT token which can be used to authenticate further requests.
 *
 * Authorization required: none
 */

router.post("/login", async function (req, res, next) {
    try {
      const validator = jsonschema.validate(req.body, userAuthSchema);
      if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack);
        throw new BadRequestError(errs);
      }
  
      const { email, password } = req.body;
      const user = await User.authenticate(email, password);
      const token = createToken(user);
      return res.json({ token });
    } catch (err) {
      return next(err);
    }
  });

/** POST /auth/register:   { user } => { token }
 *
 * user must include { email, password, firstname, lastname }
 *
 * Returns JWT token which can be used to authenticate further requests.
 *
 * Authorization required: none
 */



router.post("/register", async function (req, res, next) {
    try {
      const validator = jsonschema.validate(req.body, userRegisterSchema);
      if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack);
        throw new BadRequestError(errs);
      }
  
      const newUser = await User.register({ ...req.body});
      const token = createToken(newUser);
      return res.status(201).json({ token });
    } catch (err) {
      return next(err);
    }
  });
  

module.exports = router;