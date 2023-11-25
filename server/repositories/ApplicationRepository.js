"use strict";

const dayjs = require('dayjs')

const db = require("./db");

/**
 * Performs queries to the database for retriving all the needed information given a supervisor's id
 * 
 * first applications are obtained throught id_teacher, then for each of them student's information are added (name and lastname) as well as thesis information (title and cds)
 * 
 * @param {*} id_teacher 
 * @returns object { application: application, thesis: thesis, student: student } defined in controller file
 */
exports.listApplication = (id_teacher) => {
  const sqlApplication =
    "SELECT innerTable.id_thesis, innerTable.id, innerTable.id_student, title, S.name, S.surname, innerTable.data, innerTable.path_cv, innerTable.status FROM (SELECT id,id_student,path_cv,status,id_thesis,data FROM Application WHERE id_teacher=?) AS innerTable, Thesis AS T, Student AS S WHERE T.id = innerTable.id_thesis AND S.id = innerTable.id_student";
  // const sqlStudent = "SELECT surname,name,cod_degree FROM Student WHERE id=?";
  // const sqlThesis = "SELECT title,cds FROM Thesis WHERE id=?";
  // let student;
  return new Promise((resolve, reject) => {
    //! QUERY TO THE APPLICATION DATABASE, asks for the whole set of applications given a supervisor's id
    db.all(sqlApplication, [id_teacher], (err, rows) => {
      if (err) {
        console.error("SQLite Error:", err.message);
        reject(err);
        return;
      }
      //! CHECK IF THE APPLICATION EXIST OR NOT
      if (rows.length == 0) {
         reject({ error: "Application not found." });
         return
      } else {
        // const application = rows.map((a) => ({
        //   id_application: a.id,
        //   id_student: a.id_student,
        //   id_thesis: a.id_thesis,
        //   data: a.data,
        //   path_cv: a.path_cv,
        //   status: a.status,
        // }));
        const application = rows.map((a) => ({
          id_student: a.id_student,
          id_application: a.id,
          id_thesis: a.id_thesis,
          title: a.title,
          name: a.name,
          surname: a.surname,
          data: a.data,
          path_cv: a.path_cv,
          status: a.status
        }))

        console.log(application)
        resolve(application);
        /*
        // for each application found student's information are requested
        application.forEach((element) => {
          //! QUERY TO THE STUDENT DATABASE
          db.all(sqlStudent, [element.id_student], (err, rows) => {
            if (err) {
              console.error("SQLite Error:", err.message);
              reject(err);
              return;
            }
            //! CHECK TO SEE IF STUDENT EXIST OR NOT
            if (rows.length == 0) {
              reject({ error: "Student not found." });
              return;
            } else {
              student = rows.map((s) => ({
                surname: s.surname,
                name: s.name,
              }));
            }
            // asks for the thesis linked to the current application's id
            db.all(sqlThesis, [element.id_thesis], (err, rows) => {
              if (err) {
                console.error("SQLite Error:", err.message);
                reject(err);
                return;
              }
              //! CHECK TO SEE IF THE THESIS EXIST OR NOT
              if (rows.length == 0) {
                reject({ error: "Thesis not found." });
                return
              } else {
                const thesis = rows.map((t) => ({
                  title: t.title,
                  cds: t.cds,
                }));
                resolve({
                  thesis: thesis,
                  student: student,
                  application: application,
                });
              }
            });
          });
        });*/
      }
    });
  });
};

exports.addProposal = (studentId, thesisId, cvPath) => {
  return new Promise((resolve, reject) => {
    // Fetch supervisor id based on the given thesisId
    const getSupervisorSql = 'SELECT supervisor FROM Thesis WHERE id = ?';

    db.get(getSupervisorSql, [thesisId], (error, result) => {
      if (error) {
        reject(error);
        return;
      }

      if (!result.supervisor) {
        reject({error: "Not found"});
        return;
      }

      const supervisorId = result.supervisor;
      //Create a current date to add at the new application 
      const currentDate = dayjs().format('YYYY-MM-DD').toString()
      const sql = 'INSERT INTO Application (id_student, id_thesis, data, path_cv, status, id_teacher) VALUES (?, ?, ?, ?, ?, ?)';
      db.run(sql, [studentId, thesisId, currentDate, cvPath, 0, supervisorId], function (err) {
        if (err) {
          reject(err);
        } else {
          // Access the auto-generated ID if needed.
          const insertedId = this.lastID;
          resolve({
            applicationID: insertedId,
            studentId: studentId,
            date: currentDate,
            status: 0,
            professorId: supervisorId
          });
        }
      });
    });
  });
};

exports.acceptApplication = (status, teacherID, applicationID) => {
  return new Promise((resolve, reject) => {
    // 1
    const fetchThesisStudentSQL = 'SELECT id_thesis, id_student FROM Application WHERE id_teacher = ? AND id = ?';
    db.get(fetchThesisStudentSQL, [teacherID, applicationID], (err, row) => {
      if (err) {
        console.error("Error in SQLDatabase:", err.message);
        reject(err);
        return;
      }

      if (!row) {
        reject({ error: "No rows found. Teacher ID or Application ID not found." });
        return;
      }

      const id_thesis = row.id_thesis;
      const id_student = row.id_student;

      // 2
      const updateApplicationSQL = 'UPDATE Application SET status = ? WHERE id_teacher = ? AND id = ?';
      db.run(updateApplicationSQL, [status, teacherID, applicationID], function (err) {
        if (err) {
          console.error("Error in SQLDatabase:", err.message);
          reject(err);
          return;
        }

        if (this.changes === 0) {
          reject({ error: "No rows updated. Teacher ID or Application ID not found." });
          return;
        }

        if (status === 2) {
          // 3
          const updateOtherApplicationsSQL = 'UPDATE Application SET status = 1 WHERE id_thesis = ? AND id_student != ?';
          db.run(updateOtherApplicationsSQL, [id_thesis, id_student], function (err) {
            if (err) {
              console.error("Error in SQLDatabase:", err.message);
              reject(err);
              return;
            }

            // 4
            const updateThesisSQL = 'UPDATE Thesis SET status = 0 WHERE id = ?';
            db.run(updateThesisSQL, [id_thesis], function (err) {
              if (err) {
                console.error("Error in SQLDatabase:", err.message);
                reject(err);
                return;
              }

              if (this.changes === 0) {
                reject({ error: "No rows updated. Thesis ID not found." });
                return;
              }

              resolve({ message: "Application and Thesis updated successfully." });
            });
          });
        } else {
          // If the status is 1 -> rejected, then resolve directly
          resolve({ message: "Application updated successfully." });
        }
      });
    });
  });
};
