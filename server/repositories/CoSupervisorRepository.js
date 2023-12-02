'use strict';

const db = require("./db");

exports.findById = (id)=>{
    const sqlCoSupervisor = "SELECT name, surname, email, company FROM CoSupervisor WHERE id = ?";

    return new Promise((resolve, reject)=>{
        db.get(sqlCoSupervisor, [id], (err, row)=>{
            if (err) {
                reject(err);
                return;
            }
            if(!row) 
                resolve({})
            else 
                resolve({name:row.name, surname:row.surname, email:row.surname, company:row.company});

        });
    });
}

exports.getEmailsByThesisId = (id) => {
    const sql = 'SELECT email FROM CoSupervisor  WHERE id IN (SELECT id_cosupervisor AS List FROM CoSupervisorThesis WHERE id_thesis=?)'
  
    return new Promise( (resolve, reject) => {
      db.all(sql, [id], (err, rows) => {
        if(err)
          reject(err)
        else if(rows.length == 0)
          resolve([])
        resolve(rows.map(a => a.email))
      })
    })
  }

exports.findByEmail = (email)=>{
    const sqlCoSupervisor = "SELECT id, name, surname, email, company FROM CoSupervisor WHERE email = ?";

    return new Promise((resolve, reject)=>{
        db.get(sqlCoSupervisor, [email], (err, row)=>{
            if (err) {
                reject(err);
                return;
            }
            if(!row) 
                resolve({})
            else 
                resolve({id:row.id, name:row.name, surname:row.surname, email:row.surname, company:row.company});

        });
    });
}
/**
 * Perfoms a search according to the following possible combinations:
 * 1. surname and name are defined, okay
 * 2. only surname is defined, okay
 * 3. only name is defined, error
 * 4. none of them are defined, error (never possible)
 * 
 * This will return a list of ids because more cosupervisor with same name/lastname pair could exist
 * 
 * @param {String} surname
 * @param {String} name 
 * @returns [id1, id2, ...]
 */
exports.findByNSorS = (surname, name)=>{
    let sql = "SELECT id FROM CoSupervisor WHERE ";
    let params = [];
    if(name != null && surname != null){
        sql+="name LIKE ? AND surname LIKE ?";
        params.push("%"+name+"%");
        params.push("%"+surname+"%");
    }
    else{
            sql+="surname LIKE ?";
            params.push("%"+surname+"%");
    }
    return new Promise((resolve, reject)=>{
        db.all(sql, params, (err, rows)=>{
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
}

exports.getAllCoSupervisorsEmails = () => {
  return new Promise((resolve, reject) => {
    const coSupervisorSql = 'SELECT email FROM CoSupervisor';
    db.all(coSupervisorSql, [], (coSupervisorErr, coSupervisors) => {
      if (coSupervisorErr) {
        console.error("Error retrieving all co-supervisors:", coSupervisorErr.message);
        reject(coSupervisorErr);
        return;
      }

      const coSupervisorEmails = coSupervisors.map((coSupervisor) => coSupervisor.email);
      resolve(coSupervisorEmails);
    });
  });
};
