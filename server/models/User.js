/** Users */

const db = require("../db");
const bcrypt = require("bcrypt");
const { BadRequestError, UnauthorizedError, NotFoundError } = require("../expressError");
const { BCRYPT_WORK_FACTOR } = require("../config");
const { sqlForPartialUpdate, sqlForInsert } = require("../helpers/sql");

/** Users of the board. */

class User {
  /** authenticate user with username, password.
   *
   * Returns { id, first_name, last_name, email }
   *
   * Throws UnauthorizedError is user not found or wrong password.
   **/

   static async authenticate(email, password) {
    // try to find the user first
    const result = await db.query(
          `SELECT email,
                  password,
                  firstname,
                  lastname,
                  id
           FROM users
           WHERE email = $1`,
        [email],
    );

    const user = result.rows[0];

    if (user) {
      // compare hashed password to a new hash from password
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid === true) {
        delete user.password;
        return user;
      }
    }

    throw new UnauthorizedError("Invalid username/password");
  }

  /** Register user with data.
   *
   * Returns { id, firstName, lastName, email }
   *
   * Throws BadRequestError on duplicates.
   **/

  static async register ( {firstname, lastname, email, password }) {
    const duplicateCheck = await db.query(`
      SELECT email 
      FROM users
      WHERE email = $1
    `, [email],)

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`User with email: ${email} already exists. Enter a new email id.`)
    }

    const hashedpwd = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const newUser = await db.query(`
      INSERT INTO users 
      (firstname, lastname, email, password)
      VALUES ($1, $2, $3, $4)
      RETURNING id, email, firstname, lastname`, 
      [firstname, 
        lastname, 
        email, 
        hashedpwd])
    
    const user = newUser.rows[0];
    
    return user;
  }

  /** Find all users.
   *
   * Returns [{ id, firstName, lastName, email }, ...]
   **/

  static async findAll() {
    const allUsers = await db.query(
      `SELECT id, 
         firstname,  
         lastname, 
         email
       FROM users
       ORDER BY lastname, firstname`
    );
    return allUsers.rows;
  }
  /** --------------------------------------------------------------------------- */
   /** Given email, return data about user.
   *
   *  Returns { id, first_name, last_name, email }
   *   where jobs is { id, title, company_handle, company_name, state }
   *
   * Throws NotFoundError if user not found.
   **/

  static async get(id) {
    const userRes = await db.query(`
    SELECT id,
            firstname,
            lastname,
            email
        FROM users
        WHERE id = $1`, [id]);

    const user = userRes.rows[0];

    if (!user) throw new NotFoundError(`No user with id: ${id}`);

    const userApplicationsRes = await db.query(
      `SELECT * FROM applications AS a
       WHERE a.user_id = $1`, [user.id]);

    user.applications = userApplicationsRes.rows.map(a => a);
    return user;
  }

  /** Update user data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Data can include:
   *   { firstName, lastName, password, email }
   *
   * Returns { firstName, lastName, email }
   *
   * Throws NotFoundError if not found.
   *
   * WARNING: this function can set a new password.
   * Callers of this function must be certain they have validated inputs to this
   * or serious security risks are opened.
   */

   static async update(id, data) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
    }

    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
          firstname: "firstname",
          lastname: "lastname",
          email: "email",
        });
    const usernameVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE users 
                      SET ${setCols} 
                      WHERE id = ${usernameVarIdx} 
                      RETURNING email,
                                firstname,
                                lastname,
                                email`;
    const result = await db.query(querySql, [...values, id]);
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${id}`);

    delete user.password;
    return user;
  }


  /** Delete given user from database; returns undefined. */

  static async remove(email) {
    let result = await db.query(
          `DELETE
           FROM users
           WHERE email = $1
           RETURNING email`,
        [email],
    );

    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${email}`);
  }


}
module.exports = User;
