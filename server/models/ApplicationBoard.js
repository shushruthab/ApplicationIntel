const db = require("../db");
const { extractUserId } = require("../helpers/tokens");
const { sqlForPartialUpdate, sqlForInsert } = require("../helpers/sql");

class ApplicationBoard {
/** Create an application (from data), update db, return new application data.
   *
   * data should be { job_title, applied date, company, application_type }
   *
   * Returns { job_title, applied date, company, application_type }
   **/

static async create (data) {
    
    const { setCols, values, param_q } = sqlForInsert(data, {});

    let sqlQuery = `
      INSERT INTO applications
      (${setCols})
      VALUES
      (${param_q})
      RETURNING *
      `
      const newJob = await db.query(sqlQuery, values);

      return newJob.rows[0];
  }

  static async getAll(userid) {
    const jobRes = await db.query(
        `SELECT * FROM applications
         WHERE user_id = $1`, [userid]);

  const job = jobRes.rows;

  if (!job) throw new NotFoundError(`No job: ${id}`);

  return job;
  }

  /** Find all applications (optional filter on searchFilters).
   *
   * searchFilters (all optional):
   * - company
   * - job_title (will find case-insensitive, partial matches)
   * */

  static async findAll({ company, job_title } = {}) {
    let query = `SELECT * FROM applications`;
    let whereExpressions = [];
    let queryValues = [];

    // For each possible search term, add to whereExpressions and
    // queryValues so we can generate the right SQL

    if (company !== undefined) {
      queryValues.push(`%${company}%`);
      whereExpressions.push(`company ILIKE $${queryValues.length}`);
    }

    if (job_title !== undefined) {
      queryValues.push(`%${job_title}%`);
      whereExpressions.push(`job_title ILIKE $${queryValues.length}`);
    }

    if (whereExpressions.length > 0) {
      query += " WHERE " + whereExpressions.join(" AND ");
    }

    // Finalize query and return results

    query += " ORDER BY company";
    const jobsRes = await db.query(query, queryValues);
    return jobsRes.rows;
  }

  /** Given an application id, return data about application.
   *
   * Throws NotFoundError if not found.
   **/

  static async get(id) {
    const jobRes = await db.query(
          `SELECT * FROM applications
           WHERE id = $1`, [id]);

    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  /** Update application data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Data can include: { job_title, company, timeline for progress into further rounds }
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {});
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE applications 
                      SET ${setCols} 
                      WHERE id = ${idVarIdx} 
                      RETURNING *`;
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No application: ${id}`);

    return job;
  }

  /** Delete given application from database; returns undefined.
   *
   * Throws NotFoundError if application not found.
   **/

  static async remove(id) {
    const result = await db.query(
          `DELETE
           FROM applications
           WHERE id = $1
           RETURNING id`, [id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);
  }
    

}

module.exports = ApplicationBoard;