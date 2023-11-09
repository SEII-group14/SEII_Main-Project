'use strict';
const dayjs = require('dayjs')

const thesisRepository = require("../repositories/ThesisRepository");
const coSupervisorRepository = require("../repositories/CoSupervisorRepository");
const coSupervisorThesisRepository = require("../repositories/CoSupervisorThesisRepository");
const teacherRepository = require("../repositories/TeacherRepository");
const nItem=10;//number of item per page
/**
 * Return a list of thesis that respect all the parameters
 *
 * page Integer //Si parte dalla pagina 1
 * title String  (optional)
 * supervisor String, name defined as: name, surname (optional)
 * coSupervisor Listn, ame defined as: name, surname  (optional)
 * keyword String  (optional)
 * type String  (optional)
 * groups String  (optional)
 * knowledge String  (optional)
 * expiration_date String  (optional)
 * cds String  (optional)
 * creation_date String  (optional)
 * returns thesis
 **/
exports.advancedResearchThesis = async function(page,order,title,supervisor,coSupervisor,keyword,type,groups,knowledge,expiration_date,cds,creation_date) {
    //console.log("dentro thesis services");
    //If we don't find any supervisor or cosupervisors the research can stop
    let ok=!(supervisor || coSupervisor);
    //find information about id of theacer 
    let idSupervisors = null;
    if(supervisor != null){
        const ns = supervisor.split(" ");
        idSupervisors = await teacherRepository.findByNSorS(ns[0], ns[1]);
        if(idSupervisors!=null && idSupervisors.length>0)
            ok=true;
    }
    console.log("info abaut teacher ");
    //find information about id of coSupervisor 
    let idCoSupervisorsThesis = [];
    if(coSupervisor != null){
        for (let i = 0; i < coSupervisor.length; i++) {
            const e = coSupervisor[i];
            const ns = e.split(" ");
            let idsCo = await coSupervisorRepository.findByNSorS(ns[0], ns[1]);
            if (idsCo > 0)
              // Trova tutti gli ID delle tesi con co-supervisore che ha ID = idsCo
              idCoSupervisorsThesis.push(await coSupervisorThesisRepository.findThesisByCoSupervisorId(idsCo));
            if (idCoSupervisorsThesis.length > 0) 
              ok = true;
          }          
    }   
    console.log("info about cosupervisor");
    //Check if has sense make others queries
    if(!ok)
       return [{}];
    //find all thesis
    let res = await thesisRepository.advancedResearch(nItem*(page-1),nItem*page,order,false, title,idSupervisors,idCoSupervisorsThesis,keyword,type,groups,knowledge,expiration_date,cds,creation_date, 1);
    console.log("After thesis "+JSON.stringify(res));
    //find number of page
    let npage = await thesisRepository.numberOfPage(false, title,idSupervisors,idCoSupervisorsThesis,keyword,type,groups,knowledge,expiration_date,cds,creation_date, 1);
    console.log("after page "+JSON.stringify(res));
    //find information about teacher
    for(let i=0;i<res.length;i++){
        const t = await teacherRepository.findById(res[i].supervisor);
        res[i].supervisor=t;
    }
    console.log("info about supervisor "+JSON.stringify(res));
    //find ids about co-supervisors
    for(let i=0;i<res.length;i++){
        const idList = await coSupervisorThesisRepository.findCoSupervisorIdsByThesisId(res[i].id);
        res[i].coSupervisor=[];
        for(let j=0;j<idList.length;j++){
            if(id.idTeacher!=null){
                const t = await teacherRepository.findById(id.idTeacher);
                res[i].coSupervisors.push(teacherRepository.fromTeacherToCoSupervisor(t));
            }
            else{
                res[i].coSupervisors.push(await coSupervisorRepository.findById(id.idCoSupervisor));
            }
        }
    }
    return [res, npage];
}


/**
 * A student send his/her application for thesis {id} and attach his cv as json
 *
 * id Integer 
 **/
exports.addApplication = function(id) {
  
}


/**
 * Behaviour:
 * - if even ONLY 1 co-supervisor is not found (so no entry in COSUPERVISOR), 400 error is returned
 * - if the teacher is not found (so no entry in TEACHER), 400 is returned
 * - if level and/or status are unexpected values, 400 is returned
 * 
 * Add a thesis to the table defining each field as follow:
 * 
 * @param {*} Thesis
 * - id: incremental primary key, not requested
 * - title: string
 * - supervisor: teacher's ID defined into "TEACHER" table
 * - co_supervisor: array of co_supervisors' ID, it could be also empty and added after the thesis creation
 *                  for each co_supervisors, there should be a new entry into "COSUPERVISOR"
 * - keywords: string
 * - type: string
 * - group: string
 * - description: string
 * - knowledge: string
 * - note: string
 * - expiration_date: string (TOBE parsed according to our choiced data format)
 * - level: 0 (bachelor) | 1 (master)
 * - cds: string
 * - creation_date: current date query is performed here
 * - status: MUST BE 1 ~scrum meeting 8 Nov
 * 
 * Moreover a CoSupervisor-Teacher-Thesis entry is added into "COSUPERVISORTHESIS" table for each CoSupervisor
 * 
 * @returns thesis obj
 * 
 * TODO: errors mgmt
 **/
exports.addThesis = async function(thesis) {
    let thesis_res;

    // // an ID in TEACHER must be defined
    // if(!thesis.supervisor) {
    //     console.log('supervisor not found in TEACHER, should return 400')
    // }

    // // look for the supervisor into TEACHER
    // if(!teacherRepository.findById(thesis.supervisor)) {
    //     console.log('supervisor not found in TEACHER, should return 400')
    // }
    thesis.supervisor = 't123456'

    // look for each co-supervisor id into COSUPERVISOR
    if(thesis.co_supervisor) {
        for(let id of thesis.co_supervisor) {
            if(Object.keys( await coSupervisorRepository.findById(id) ).length === 0 ) {
                throw { status: 400, msg: 'supervisor not found in COSUPERVISOR, should return 400'}
            }
        }
    }

    // parse expiration date and creation date
    const exp_date = dayjs(thesis.expiration_date, "MM-DD-YYYY").format('YYYY-MM-DD').toString()
    thesis.expiration_date = exp_date
    const creat_date = dayjs().format('YYYY-MM-DD').toString()
    thesis.creation_date = creat_date;

    // checks level, 0 (bachelor) | 1 (master)
    if( !thesis.level || ( thesis.level != 0 && thesis.level != 1) ){
        throw { status: 400, error: 'level not recognized, should return 400' }
    }

    // checks status, MUST BE 1 (published)
    if( !thesis.status || thesis.status != 1) {
        throw { status: 400, error: 'status not recognized, should return 400' }
    }

    // add an entry into THESIS
    thesis_res = await thesisRepository.addThesis(thesis.title, thesis.supervisor, thesis.keywords, thesis.type, thesis.groups, thesis.description, thesis.knowledge, thesis.note, thesis.expiration_date, thesis.level, thesis.cds, thesis.creation_date, thesis.status)
    if(thesis_res.err) {
        throw { status: 500, error: thesis_res.err }
    }

    // // for each CoSupervisor, add an entry into COSUPERVISORTHESIS
    if(thesis.co_supervisor) {
        for(let id of thesis.co_supervisor) {
            const result = await coSupervisorThesisRepository.addCoSupervisorThesis(thesis_res.id, thesis.supervisor, id)
            if(result.err) {
                throw { status: 500, error: result.err }
            }
        }
    }

    return thesis
}