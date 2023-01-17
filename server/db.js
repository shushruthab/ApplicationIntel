/** Database for funnel */

const pg = require("pg");

let DB_URL;

if (process.env.NODE_ENV === "test") {
    DB_URL = "postgresql:///board_testdb";
} else {
    DB_URL = "postgresql:///boarddb";
}

let db = new pg.Client({
    connectionString: DB_URL
});

db.connect();

module.exports = db;