const db = require("../db");
const { sqlForPartialUpdate, sqlForInsert } = require("../helpers/sql");


class Contacts {

static async create (data) {

    const { setCols, values, param_q } = sqlForInsert(data, {});

    let sqlQuery = `
      INSERT INTO contacts
      (${setCols})
      VALUES
      (${param_q})
      RETURNING *
      `
      const contact = await db.query(sqlQuery, values);

      return contact.rows[0];
  }

  static async getAll(userid) {
    const contacts = await db.query(
        `SELECT * FROM contacts
         WHERE user_id = $1`, [userid]);

  const res = contacts.rows;

  if (!res) throw new NotFoundError(`No contacts: ${id}`);

  return res;
  }


  static async get(id) {
    const res = await db.query(
          `SELECT * FROM contacts
           WHERE id = $1`, [id]);

    const contact = res.rows[0];

    if (!contact) throw new NotFoundError(`No contact: ${id}`);

    return contact;
  }


  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {});
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE contacts 
                      SET ${setCols} 
                      WHERE id = ${idVarIdx} 
                      RETURNING *`;
    const result = await db.query(querySql, [...values, id]);
    const contact = result.rows[0];

    if (!contact) throw new NotFoundError(`No contact: ${id}`);

    return contact;
  }

  /** Delete given contact from database; returns undefined.
   *
   * Throws NotFoundError if contact not found.
   **/

  static async remove(id) {
    const result = await db.query(
          `DELETE
           FROM contacts
           WHERE id = $1
           RETURNING id`, [id]);
    const contact = result.rows[0];

    if (!contact) throw new NotFoundError(`No contact: ${id}`);
  }
    

}

module.exports = Contacts;