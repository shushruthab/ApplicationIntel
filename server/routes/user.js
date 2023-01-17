const express = require("express");
const router = new express.Router();

const jsonschema = require("jsonschema");
const { ensureLoggedIn } = require("../middleware/auth");
const User = require("../models/User");
const userUpdateSchema = require("../schemas/userUpdateSchema.json");
  
  

  
  /** GET /[username] => { user }
   *
   * Returns { email, firstName, lastName, isAdmin, applications }
   *
   * Authorization required: ensureLoggedIn
   **/
  
  router.get("/:id", ensureLoggedIn, async function (req, res, next) {
    try {
      const user = await User.get(req.params.id);
      return res.json({ user });
    } catch (err) {
      return next(err);
    }
  });
  
  
  /** PATCH /[username] { user } => { user }
   *
   * Data can include:
   *   { firstName, lastName, password, email }
   *
   * Returns { username, firstName, lastName, email, isAdmin }
   *
   * Authorization required: ensureLoggedIn
   **/
  
  router.patch("/:id", ensureLoggedIn, async function (req, res, next) {
    try {
      const validator = jsonschema.validate(req.body, userUpdateSchema);
      if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack);
        throw new BadRequestError(errs);
      }
  
      const user = await User.update(req.params.id, req.body);
      return res.json({ user });
    } catch (err) {
      return next(err);
    }
  });
  
  
  /** DELETE /[username]  =>  { deleted: username }
   *
   * Authorization required: admin or same-user-as-:username
   **/
  
  router.delete("/:id", ensureLoggedIn, async function (req, res, next) {
    try {
      await User.remove(req.params.username);
      return res.json({ deleted: req.params.username });
    } catch (err) {
      return next(err);
    }
  });
  
  
  /** POST /[username]/jobs/[id]  { state } => { application }
   *
   * Returns {"applied": jobId}
   *
   * Authorization required: admin or same-user-as-:username
   * */
  
  router.post("/:username/jobs/:id", ensureLoggedIn, async function (req, res, next) {
    try {
      const jobId = +req.params.id;
      await User.applyToJob(req.params.username, jobId);
      return res.json({ applied: jobId });
    } catch (err) {
      return next(err);
    }
  });
  


module.exports = router;