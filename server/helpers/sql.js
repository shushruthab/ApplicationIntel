const { BadRequestError } = require("../expressError");

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
    const keys = Object.keys(dataToUpdate);
    if (keys.length === 0) throw new BadRequestError("No data");
  
    // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
    const cols = keys.map((colName, idx) =>
        `"${jsToSql[colName] || colName}"=$${idx + 1}`,
    );
  
    return {
      setCols: cols.join(", "),
      values: Object.values(dataToUpdate),
    };
  }

  function sqlForInsert(dataToUpdate, jsToSql) {
    const keys = Object.keys(dataToUpdate)
    const vals = Object.values(dataToUpdate);
    // {firstName: 'Aliya', age: 32} => ['"first_name", "age"']
    const cols = keys.map((colName) =>
        `"${jsToSql[colName] || colName}"`,
    );

    const idxs = vals.map((values, id) => 
        `$${id + 1}`)

    
    return {
      setCols: cols.join(", "),
      values: Object.values(dataToUpdate),
      param_q: idxs.join(", "),
    };
  }


  
  module.exports = { sqlForPartialUpdate, sqlForInsert };
  