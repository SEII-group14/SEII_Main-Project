import React, { useState, useEffect } from 'react';
import { Button , Container, Row, Col, Accordion, Badge, Card } from 'react-bootstrap';
import toast, { Toaster } from 'react-hot-toast';
import PropTypes from 'prop-types';
import API from '../API';

function StudentList(props) {
    
    const [dirty, setDirty] = useState(true);
   
    const [list, setList] = useState([]);
    useEffect(() => {

        API.listApplication(props.user.role)
            .then((list) => {
                setList(list);
                setDirty(false);
            })
            .catch((err)=>{toast.error(err.message)})

    }, [dirty]);

    const handleGetCV = (cv, id) => {
      API.getStudentCv(cv, id).catch((err)=>{toast.error(err.message)})
    }


    return (
        <div className="flex-column rounded" style={{ backgroundColor: '#fff' }} >
            <Toaster position="top-center" reverseOrder={false} />
            <div>
                {list.map((application) => (
                    <Card key={application.id_application} style={{ marginBottom: '10px' }}>
                        <Accordion>
                            <Accordion.Item eventKey={application.id_application}>
                                <Accordion.Header>
                                    <Container fluid>
                                        <Row className="d-md-flex justify-content-center align-items-center">
                                            <Col md='4' sm='4' xs='12'>
                                                <strong>Title:</strong> {application.title}
                                            </Col>
                                            <Col md='4' sm='4' xs='12'>
                                                <strong>Supervisor:</strong> {application.supervisor_name + ' ' + application.supervisor_surname}
                                            </Col>                                  
                                            <Col md='3' sm='3' xs='12'>
                                                <strong>Status:</strong>{' '}
                                                {application.status == '0' ? (
                                                    <Badge pill bg="warning">PEN</Badge>
                                                ) : (
                                                    application.status == '1' ? (
                                                        <Badge pill bg="success">ACC</Badge>
                                                    ) : (
                                                        application.status == '2' ? (
                                                            <Badge pill bg="danger">REJ</Badge>
                                                        ) : 
                                                        <Badge pill bg="secondary">CAN</Badge>
                                                    )
                                                    )
                                                }
                                            </Col>
                                            <Col md='1' sm='1' xs='12'>
                                                <img src="./info-circle.svg"
                                                    alt="info"
                                                    className="img-responsive" />

                                            </Col>
                                        </Row>
                                    </Container>
                                </Accordion.Header>
                                <Accordion.Body>
                                    <strong className="mb-2 text-danger">Thesis Info:</strong> 
                                    <br />
                                    <strong>Keywords:</strong> {application.keywords}
                                    <br />
                                    <strong>Type:</strong> {application.type}
                                    <br />
                                    <strong>Groups:</strong> {application.groups}
                                    <br />
                                    <strong>Description:</strong> {application.description}
                                    <br />
                                    <strong>Knowledge:</strong> {application.knowledge}
                                    <br />
                                    <strong>Note:</strong> {application.note}
                                    <br />
                                    <strong>Level:</strong> {application.level === 1 ? 'Master' : 'Bachelor'}
                                    <br />
                                    <strong>Expiration Date:</strong> {application.expiration_date}                                    
                                    <br />
                                    <strong>CdS:</strong> {application.cds}
                                    <br />
                                    <br />
                                    <strong className="mb-2 text-danger">Application Info:</strong> 
                                    <br />
                                    <strong>Application Date:</strong> {application.application_data}
                                    <br />
                                    <strong>Student Cv: </strong><br /><Button variant='danger' style={{marginTop:'2px'}} onClick={()=>handleGetCV(application.path_cv,props.user.id)}><img src="./file-earmark-pdf-fill.svg"
                                    alt="Logo"
                                    className="mr-2" style={{marginBottom:'4px'}}></img></Button>
                                    <br />
                                    <br />
                                    <br />
                                    
                                </Accordion.Body>
                            </Accordion.Item>
                        </Accordion>
                    </Card>
                ))}
            </div>
        </div>);

}

StudentList.propTypes = {
    user : PropTypes.object.isRequired,
  };

export default StudentList;
