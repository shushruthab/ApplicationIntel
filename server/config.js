require("dotenv").config();
// require("colors");

const SECRET_KEY = process.env.SECRET_KEY || "secret-dev";

const PORT = +process.env.PORT || 5000;

// Use dev database, testing database, or via env var, production database
function getDatabaseUri() {
    return (process.env.NODE_ENV === "test")
        ? "board_testdb"
        : process.env.DATABASE_URL || "boarddb";
  }

// Speed up bcrypt during tests, since the algorithm safety isn't being tested
//
const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 12;


module.exports = {
    SECRET_KEY,
    PORT,
    BCRYPT_WORK_FACTOR,
    getDatabaseUri,
  };