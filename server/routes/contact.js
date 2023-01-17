const express = require("express");
const router = new express.Router();

const jsonschema = require("jsonschema");
const newcontactschema = require("../schemas/newContactSchema.json");
const appUpdateSchema = require("../schemas/appUpdateschema.json");
const updateSchema = require("../schemas/updateContactSchema.json");
const { createToken, extractUserId } = require("../helpers/tokens");
const { BadRequestError, UnauthorizedError } = require("../expressError");
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");
const ApplicationBoard = require("../models/ApplicationBoard");
const Contacts = require("../models/Contacts");


router.post("/", async function (req, res, next) {
    try {
      req.body.user_id = extractUserId(req, res);
      const validator = jsonschema.validate(req.body, newcontactschema);
      if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack);
        throw new BadRequestError(errs);
      }
      const contact = await Contacts.create(req.body);
      return res.status(201).json({ contact });
    } catch (err) {
      return next(err);
    }
  });
  
/** GET /  =>
 *   { companies: [ { handle, name, description, numEmployees, logoUrl }, ...] }
 *
 * Authorization required: ensureLoggedIn
 */

router.get("/", ensureLoggedIn, async function (req, res, next) {
    try {
      const userid = extractUserId(req, res);
      const contacts = await Contacts.getAll(userid);
      return res.json({ contacts });
    } catch (err) {
      return next(err);
    }
  });
  
  /** GET /[id]  =>  { application }
   *
   * Authorization required: ensureLoggedIn
   */
  
  router.get("/:id", ensureLoggedIn, async function (req, res, next) {
    try {
      const userid = extractUserId(req, res);
      const contact = await Contacts.get(req.params.id);
      if (contact.user_id !== userid) {
        throw new UnauthorizedError(); 
      }
      return res.json({ contact });
    } catch (err) {
      return next(err);
    }
  });


router.patch("/:id", ensureLoggedIn, async function (req, res, next) {
    try {
      req.body.user_id = extractUserId(req, res);
      req.body.id = +req.params.id;
      const validator = jsonschema.validate(req.body, updateSchema);
      if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack);
        throw new BadRequestError(errs);
      }
  
      const contact = await Contacts.update(req.params.id, req.body);
      return res.json({ contact });
    } catch (err) {
      return next(err);
    }
  });
  
  /** DELETE /[id]  =>  { deleted: id }
 *
 * Authorization: ensureLoggedIn
 */


router.delete("/:id", async function (req, res, next) {
    try {
      await Contacts.remove(req.params.id);
      return res.json({ deleted: req.params.id });
    } catch (err) {
      return next(err);
    }
  });
  


module.exports = router;