const request = require("supertest");
const controller = require("../../controllers/ThesisController.js");
const thesisService = require('../../services/ThesisService.js')

let mockReq; 
let mockRes = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
}; 

beforeEach(() => {
  mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };   
});

describe("INSERT PROPOSAL UNIT TEST", () => {
  const { ValidationError } = require('express-json-validator-middleware');
  
  let mockReq
  let mockValidate
  beforeEach(() => {
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockReq = {
      body:  {
        title: "New thesis is added",
        cosupervisor: ["gigiverdi@mail.com"],
        keywords: ["SoftEng"],
        type: ["abroad"],
        groups: ["group1"],
        description: "new thesis description",
        knowledge: ["none"],
        note: "",
        expiration_date: '2024-10-10',
        level: "Master",
        cds: ["ingInf"],
        status: 1
      },
      user: {
            id: 1,
            name: "Gianni",
            surname: "Altobelli",
            nameID: "gianni.altobelli@email.it",
            role: "teacher",
            group: "group1"
        }
    };
    mockValidate = jest.fn()
  })

  afterEach(() => {
    mockRes.status.mockClear();
    mockRes.json.mockClear();
    mockValidate.mockClear()
  })

  test("U1: missing body", async () => {
    mockReq.body = undefined

    mockValidate.mockImplementation((req, res, callback) => {
      callback(null);
    });
    await controller.addThesis(mockReq, mockRes, mockValidate);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ message: "body is missing" });
  });

  test("U2: user is not logged in or it's not a professor", async () => {
    mockReq.user.role = 'student';

    await controller.addThesis(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ message: "You can not access to this route" });
  });

  test("U10: New thesis proposal is inserted correctly", async () => {

    mockValidate.mockImplementation((req, res, callback) => {
      callback(null);
    });
    jest.spyOn(thesisService, "addThesis").mockResolvedValue(true);          
    await controller.addThesis(mockReq, mockRes, mockValidate)
    expect(mockReq.body.level).toBe(1)
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toBeDefined()
  });

  test("U11: not for this group", async () => {
    mockReq.body.groups = 'ingInfGroup'

    mockValidate.mockImplementation((req, res, callback) => {
      callback(null);
    });
    await controller.addThesis(mockReq, mockRes, mockValidate);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ message: "You are not allowed to add for this group" });
  });


  test("U12: New thesis proposal is inserted correctly for bachelor", async () => {
    mockReq.body.level = 'Bachelor'
    mockValidate.mockImplementation((req, res, callback) => {
      callback(null);
    });
    jest.spyOn(thesisService, "addThesis").mockResolvedValue(true);          
    await controller.addThesis(mockReq, mockRes, mockValidate)
    expect(mockReq.body.level).toBe(0)
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toBeDefined()
  });

  test("U12: New thesis proposal is not inserted due to errors in service", async () => {
    mockValidate.mockImplementation((req, res, callback) => {
      callback(null);
    });
    const spy = jest.spyOn(require('../../services/ThesisService.js'), 'addThesis').mockImplementation(() => {return {message: 'error', status: 500} });
    await controller.addThesis(mockReq, mockRes, mockValidate)
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toBeDefined()
  });
});

describe('SEARCH PROPOSAL UNIT TEST', () => {
  //Magari questo può essere spostato fuori ma deve essere resettato tra describe e non tra test
  mockReq = { 
    body: undefined,
    query: undefined,
    user: {
      id: 1,
      name: "Gianna",
      lastname: "Altobella",
      nameID: "gianni.altobelli@email.it",
      cds: "ingInf",
      cdsCode: "LM"
    }  
  };
  let mockValidate = jest.fn();
  test('case 1: role not present', async () => {
    
    controller.searchThesis(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({message: "Only student or teacher can access list of thesis"});
  }),
  test('case2: role student: validate return error', async()=>{
    mockReq.user.role = 'student';
    const { ValidationError } = require('express-json-validator-middleware');
    mockValidate.mockImplementation((req, res, callback) => {
      callback(new ValidationError('error'));
    });
    controller.searchThesis(mockReq, mockRes, mockValidate);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({message: "error"});
  }),
  test('case3: role student: error in thesis service', async()=>{
    mockReq.query = {};
    mockReq.query.order = "titleD";
    mockReq.query.page = 1;
    mockValidate.mockImplementation((req, res, callback) => {
      callback(null);
    });
    const spy = jest.spyOn(require('../../services/ThesisService.js'), 'advancedResearchThesis').mockRejectedValue({message: 'error'});
    controller.searchThesis(mockReq, mockRes, mockValidate);
    await new Promise(resolve => setImmediate(resolve));
    expect(spy).toHaveBeenCalledWith(1, "titleD", undefined, undefined,undefined,undefined,undefined,undefined,undefined,undefined,"ingInf",undefined,"LM");
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({message: "error"});
  }),
  test('case4: role student: success', async()=>{
    mockValidate.mockImplementation((req, res, callback) => {
      callback(null);
    });
    const spy = jest.spyOn(require('../../services/ThesisService.js'), 'advancedResearchThesis').mockResolvedValue([[{success: 'success', supervisor:{name:"name", surname:"surname"}, coSupervisors:[{name:"name", surname:"surname"}]}], 0]);
    controller.searchThesis(mockReq, mockRes, mockValidate);
    await new Promise(resolve => setImmediate(resolve));
    expect(spy).toHaveBeenCalledWith(1, "titleD", undefined, undefined,undefined,undefined,undefined,undefined,undefined,undefined,"ingInf",undefined,"LM");
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({nPage:0, thesis:[{success: 'success', supervisor:"name surname", coSupervisors:["name surname"]}]});
  }),
  test('case4_BIS: role teacher: status != 0 or 1', async()=>{
    mockReq.user.role = 'teacher';
    mockReq.query = {status: 3}
    controller.searchThesis(mockReq, mockRes);
    await new Promise(resolve => setImmediate(resolve));
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({message: 'status not valid'});
  }),
  test('case5: role teacher: error', async()=>{
    mockReq.query.status = 0;
    const spy = jest.spyOn(require('../../services/ThesisService.js'), 'getActiveBySupervisor').mockRejectedValue({message: 'error'});
    controller.searchThesis(mockReq, mockRes);
    await new Promise(resolve => setImmediate(resolve));
    expect(spy).toHaveBeenCalledWith(1,0);
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({message: 'error'});
  }),
  test('case6: role teacher: success', async()=>{
    const spy = jest.spyOn(require('../../services/ThesisService.js'), 'getActiveBySupervisor').mockResolvedValue({success: 'success'});
    controller.searchThesis(mockReq, mockRes);
    await new Promise(resolve => setImmediate(resolve));
    expect(spy).toHaveBeenCalledWith(1,0);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({nPage:1, thesis:{success: 'success'}});
  })
})

describe("UPDATE PROPOSAL UNIT TEST", () => {
  const { ValidationError } = require('express-json-validator-middleware');
  
  let mockReq
  let mockValidate
  beforeEach(() => {
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockReq = {
      params: {
        id: 1
      },
      body:  {
        title: "New thesis is added",
        cosupervisor: ["gigiverdi@mail.com"],
        keywords: ["SoftEng"],
        type: ["abroad"],
        groups: ["group1"],
        description: "new thesis description",
        knowledge: ["none"],
        note: "",
        expiration_date: '2024-10-10',
        level: "Master",
        cds: ["ingInf"],
        status: 1
      },
      user: {
            id: 1,
            name: "Gianni",
            surname: "Altobelli",
            nameID: "gianni.altobelli@email.it",
            role: "teacher",
            group: "group1"
        }
    };
    mockValidate = jest.fn()
  })

  afterEach(() => {
    mockRes.status.mockClear();
    mockRes.json.mockClear();
    mockValidate.mockClear()
  })

  test("U1: Missing thesis id", async () => {
    mockReq.params.id = undefined

    mockValidate.mockImplementation((req, res, callback) => {
      callback(null);
    });
    await controller.updateThesis(mockReq, mockRes, mockValidate);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ message: "Thesis id is not valid" });
  });
  test("U2: Missing body", async () => {
    mockReq.body = undefined

    mockValidate.mockImplementation((req, res, callback) => {
      callback(new ValidationError('body is missing'));
    });
    await controller.addThesis(mockReq, mockRes, mockValidate);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ message: "body is missing" });
  });

  test("U3: Supervisor is missing", async () => {
    mockReq.user.role = undefined
    
    await controller.updateThesis(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ message: "You can not access to this route" });
  });

  

  test("U11: ThesisId not found", async () => {
    mockValidate.mockImplementation((req, res, callback) => {
      callback(null);
    });
    jest.spyOn(thesisService, "updateThesis").mockImplementation(async () => {
      return Promise.reject({ message: "No rows updated. Thesis ID not found." });
    });
    await expect(controller.updateThesis(mockReq, mockRes, mockValidate)).rejects.toEqual({ message: "No rows updated. Thesis ID not found." });
  });


  test("U12: New thesis proposal is inserted correctly", async () => {
    mockValidate.mockImplementation((req, res, callback) => {
      callback(null);
    });
    jest.spyOn(thesisService, "updateThesis").mockResolvedValue(true);
    await controller.updateThesis(mockReq, mockRes, mockValidate)
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toBeDefined()
  });

  test("U13: New thesis proposal is inserted correctly for bachelor", async () => {
    mockReq.body.level = 'Bachelor'
    mockValidate.mockImplementation((req, res, callback) => {
      callback(null);
    });
    jest.spyOn(thesisService, "updateThesis").mockResolvedValue(true);          
    await controller.updateThesis(mockReq, mockRes, mockValidate)
    expect(mockReq.body.level).toBe(0)
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toBeDefined()
  });

  test("U14: New thesis proposal is not inserted due to messages in service", async () => {
    mockValidate.mockImplementation((req, res, callback) => {
      callback(null);
    });
    const spy = jest.spyOn(require('../../services/ThesisService.js'), 'updateThesis').mockImplementation(() => {return {message: 'error', status: 500} });
    await controller.updateThesis(mockReq, mockRes, mockValidate)
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toBeDefined()
  });

  test("U15: New thesis proposal is not inserted due to not being part of that group", async () => {
    mockReq.body.groups = ['ingIngGroup']
    mockValidate.mockImplementation((req, res, callback) => {
      callback(null);
    });
    const spy = jest.spyOn(require('../../services/ThesisService.js'), 'updateThesis').mockImplementation(() => {return {message: 'error', status: 500} });
    await controller.updateThesis(mockReq, mockRes, mockValidate)
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toBeDefined()
  });
});