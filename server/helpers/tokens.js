const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

/** return signed JWT from user data. */

function createToken(user) {
 
  let payload = {
    id: user.id,
    email: user.email,
  };

  return jwt.sign(payload, SECRET_KEY);
}

/**Extract user id from payload */

function extractUserId(req, res) {
  // Check if res.locals.user is defined
  if (res.locals.user) {
    // Extract the id field from res.locals.user
    const userId = res.locals.user.id;
    return userId;
  }
  // If res.locals.user is not defined, return null
  return null;
}

module.exports = { createToken, extractUserId };