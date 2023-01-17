const express = require("express");
const router = new express.Router();

const jsonschema = require("jsonschema");
const appSearchSchema = require("../schemas/appSearchSchema.json");
const appUpdateSchema = require("../schemas/appUpdateschema.json");
const applicationNewSchema = require("../schemas/applicationNew.json");
const { createToken, extractUserId } = require("../helpers/tokens");
const { BadRequestError } = require("../expressError");
const { ensureLoggedIn } = require("../middleware/auth");
const ApplicationBoard = require("../models/ApplicationBoard");


/** POST / { application } =>  { application }
 *
 * application should be { handle, name, description, numEmployees, logoUrl }
 *
 * Returns { handle, name, description, numEmployees, logoUrl }
 *
 * Authorization required: ensureLoggedIn
 */

router.post("/", async function (req, res, next) {
    try {
      req.body.user_id = extractUserId(req, res);
      const validator = jsonschema.validate(req.body, applicationNewSchema);
      if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack);
        throw new BadRequestError(errs);
      }
      const application = await ApplicationBoard.create(req.body);
      return res.status(201).json({ application });
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
      const applications = await ApplicationBoard.getAll(userid);
      return res.json({ applications });
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
      const application = await ApplicationBoard.get(req.params.id);
      return res.json({ application });
    } catch (err) {
      return next(err);
    }
  });

  /** PATCH /[handle] { fld1, fld2, ... } => { company }
 *
 * Patches applications data.
 *
 * fields can be: { name, description, numEmployees, logo_url }
 *
 * Returns { handle, name, description, numEmployees, logo_url }
 *
 * Authorization required: ensureLoggedIn
 */

router.patch("/:id",  async function (req, res, next) {
    try {
      req.body.user_id = extractUserId(req, res);
      req.body.id = +req.params.id;
      const validator = jsonschema.validate(req.body, appUpdateSchema);
      if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack);
        throw new BadRequestError(errs);
      }
  
      const application = await ApplicationBoard.update(req.params.id, req.body);
      return res.json({ application });
    } catch (err) {
      return next(err);
    }
  });
  
  /** DELETE /[id]  =>  { deleted: id }
 *
 * Authorization: ensureLoggedIn
 */


router.delete("/:id",  async function (req, res, next) {
    try {
      await ApplicationBoard.remove(req.params.id);
      return res.json({ deleted: req.params.id });
    } catch (err) {
      return next(err);
    }
  });
  


module.exports = router;