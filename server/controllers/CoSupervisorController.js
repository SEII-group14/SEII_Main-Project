'use strict'
const cosupervisorService = require("../services/CoSupervisorService");

exports.getAllCoSupervisorsEmails = function (req, res) {
  cosupervisorService.getAllCoSupervisorsEmailsService()
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(500).json({message:'Internal server error'});
    })
  };