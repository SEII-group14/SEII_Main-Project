"use strict";
const fs = require('fs');
const applicationRepository = require("../repositories/ApplicationRepository");
const teacherService = require("../services/TeacherService");

/**
 * Add a new application
 *
 * @param {*} studentId Integer
 * @param {*} thesisId Integer
 * @param {*} cv codified file in an js object wich has at least originalFilename and filepath as propreties
 * @returns 
 * in case of success
 *  object{ applicationID: "integer",
            studentId: "integer",
            date: "string",
            status: 0,
            professorId: "integer"
          }
 * in case of error
 *  object {error: "string"}
 **/
exports.addApplication = function (studentId, thesisId, cv, supervisorId) {
  return new Promise((resolve, reject) => {
    //At the begginning the file is saved in tmp 
    let oldPath = cv.filepath;
    let newPath = './/file//' + cv.originalFilename;
    //move the file from the old path to the new 
    fs.rename(oldPath, newPath, (err) => {
      if (err) {
        reject(new Error(err.message));
      }
      else {
        applicationRepository.addApplication(studentId, thesisId, newPath, supervisorId)
          .then(res => {
            //! Function to send the mail to the professor when an application is made. Test needs to be changed when this function is added
            teacherService._sendTeacherEmail(supervisorId, thesisId, studentId).then(()=>resolve(res)).catch(err => reject(new Error(err.message))) 
          })
          .catch(err => reject(new Error(err.message)))
      }
    });
  });
};
