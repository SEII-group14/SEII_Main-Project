'use strict';

const thesisService = require('../services/ThesisService');

exports.advancedResearchThesis = function advancedResearchThesis (req, res, next) {
  const orderType = ["titleD", "titleA", "supervisorD", "supervisorA", "co-supervisorD","co-supervisorA","keywordD", "keywordA", "typeD", "typeA","groupsD","groupsA","knowledgeD","knowledgeA", "expiration_dateD","expiration_dateA", "cdsD", "cdsA", "creation_dateD", "creation_dateA"]
  /*  
  if(!(req.query.page && req.query.page>0 && (orderType.indexOf(req.query.order)>=0 || (req.query.title && req.query.title instanceof String) || (req.query.supervisor && req.query.supervisor instanceof String) || (req.query.coSupervisor && req.query.coSupervisor instanceof String) ||
    (req.query.keyword && req.query.keyword instanceof String) || (req.query.type && req.query.type instanceof String) || (req.query.groups && req.query.groups instanceof String) || (req.query.knowledge && req.query.knowledge instanceof String) ||
    (req.query.expiration_date && req.query.expiration_date instanceof String) || (req.query.cds && req.query.cds instanceof String) || (req.query.creation_date && req.query.creation_date instanceof String)))){
      res.status(400).json({error:""});
      return;
    }
    */
    console.log("Controller")
    const order = req.query.order?req.query.order:"titleD";
    thesisService.advancedResearchThesis(req.query.page,order,req.query.title,req.query.supervisor,req.query.coSupervisor,req.query.keyword,req.query.type,req.query.groups,req.query.knowledge,req.query.expiration_date,req.query.cds,req.query.creation_date)
      .then(function (response) {
        console.log("Controller response1 "+ JSON.stringify(response))
        let nPage = response[1];
        response = response[0];
        console.log("Controller response2 "+ response)
        response.forEach((e)=>{
          e.supervisor = e.supervisor.name+" "+e.supervisor.surname;
          if(e.coSupervisors)
            e.coSupervisors.forEach((e1, index, v) => {
              v[index] = e1.name+" "+e1.surname;
            });
          res.status(200).json({"nPage":nPage, "thesis":response});
        });
      })
  };
  
  exports.addApplication = function addApplication (req, res, next) {
    thesisService.addApplication(req.params.id)
      .then(function (response) {
        res.status(201).json(response);
      })
      .catch(function (response) {

      });
  };
  
exports.addThesis = function addThesis (req, res, next) { 
  thesisService.addThesis(req.body)
      .then(function (response) {
        res.status(201).json(response);
      })
      .catch(function (err) {
        res.status(err.status).json({error: err})
      });
  };
  