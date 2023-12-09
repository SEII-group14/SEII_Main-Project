"use strict";
const applicationsService = require("../services/ApplicationService");
const teacherService = require('../services/TeacherService');
const studentService = require('../services/StudentService')
const studentRepository = require("../repositories/StudentRepository");
const teacherRepository = require("../repositories/TeacherRepository");
const formidable = require('formidable');
const applicationRepository = require('../repositories/ApplicationRepository')
/**
 * wrapper function for showing the list of application for the teacher or for the student based on the role
 * @param {*} req in params.id_professor or params.id_student is stored the id
 * @param {*} res the returned object is defined as follow:
 * for the student application:
 * @returns an array of objects defined as
 * {
 *  title: string,
 *  supervisor_name: string,
 *  supervisor_surname: string,
 *  keywords: array of string,
 *  type: array of string,
 *  groups: array of string,
 *  description: string,
 *  knowledge: array of string,
 *  note: string,
 *  expiration_date: string,
 *  level: integer,
 *  cds: array of string,
 *  application_data: string,
 *  path_cv: string,
 *  status: integer,(this is application status) 
 * }
 * for the professor application
 * @returns an array of object 
 * { 
 * id_student: integer,
 * id_application: integer,
 * id_thesis: integer,
 * title: string,
 * name: string,
 * surname: string,
 * data: date,
 * path_cv: string,
 * status: integer
 * }
 */
exports.listApplication = function listApplication(req, res) {
    if (req.user.role != "teacher" && req.user.role != "student") {
        return res.status(401).json({ message: "You can't access to this route. You're not a student or a professor" });
    }
    if (req.user.role == 'teacher') {
        if (!req.user.id) {
            res.status(500).json({ message: "Given supervisor's id is not valid" })
            return
        }
        teacherService
            .browseApplicationProfessor(req.user.id)
            .then(function (response) {
                res.status(200).json(response)
            })
            .catch(function (response) {
              res.status(500).json(response);
            });
    }else if (req.user.role == 'student') {
        if (!req.user.id) {
          res.status(500).json({ message: "Given student's id is not valid" })
          return
        }
        studentService
            .browserApplicationStudent(req.user.id)
            .then(function (response) {
                res.status(200).json(response)
            })
            .catch(function (response) {
                res.status(500).json(response);
            });
    }
};

exports.acceptApplication = function acceptApplication(req, res) {
    if (req.user.role !== 'teacher') {
        res.status(401).json({ message: "You can not access to this route" })
        return;
    }
    if (!req.params.id_application || req.params.id_application < 0) {
        res.status(400).json({ message: "Wronged id application" });
        return;
    }
    if (req.body === undefined) {
        res.status(400).json({ message: "Body is missing" });
        return;
    }
    if (req.body.status == undefined) {
        res.status(400).json({ message: "Missing new status acceptApplication" });
        return;
    }
    if (req.body.status == 1 || req.body.status == 2) {
        teacherService
            .acceptApplication(req.body.status, req.user.id, req.params.id_application)
            .then(function (response) {
                res.status(200).json(response);
            })
            .catch(function (response) {
                res.status(500).json(response);
            });
    }
    else {
        res.status(400).json({ message: "Invalid new status entered" })
    }
};

/**
 * wrapper function for apply to a thesis proposal with id = id_thesis 
 * @param {*} req in req.params.id_thesis there is an iteger for the thesis
 *                in req.body.cv there is the cv in a PDF form
 * @returns object = {applicationID : integer, studentId: integer,date : date, status: 0, professorId: integer}
 */
exports.applyForProposal = async function (req, res) {
  if (req.user.role !== 'student') {
    res.status(401).json({ message: "You can not access to this route" })
    return;
  }
  if (!req.body) {
    res.status(400).json({ message: "Body is missing" });
    return;
  }
  const checkApp = await applicationRepository.getActiveByStudentId(req.user.id);
  if (checkApp != undefined) {
    res.status(400).json({ message: "You already have an application for a thesis" });
    return;
  }
  const supervisorId = await teacherRepository.getIdByThesisId(req.params.id_thesis);
  if (supervisorId == undefined) {
    res.status(400).json({ message: "Supervisor not found" });
    return;
  }
  if (req.params.id_thesis != null) {
    //Initializes an object that is used to handle the input file in the multipart/form-data format 
    const form = new formidable.IncomingForm();
    //Translate the file into a js object and call it files
    form.parse(req, function (err, fields, files) {
      if (err){
        res.status(500).json({ message: "Internal Error" });
        return;
      }
      if (!files?.cv?.[0] || files.cv.length > 1){
        res.status(400).json({ message: "Missing file or multiple" });
        return;
      }
      const file = files.cv[0];
      applicationsService.addApplication(req.user.id, req.params.id_thesis, file, supervisorId)
        .then(function (response) {
          res.status(201).json(response);
        })
        .catch(function (response) {
          res.status(500).json(response);
        });
    })
  } else {
    res.status(400).json({ message: "Missing required parameters" });
  }
};