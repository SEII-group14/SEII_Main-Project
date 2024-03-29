import React from 'react';
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import PropTypes from 'prop-types';
import Form from 'react-bootstrap/Form';
import { Container, Row, Col } from 'react-bootstrap';

function FilterContainer(props) {

  return (
    <Container>
    <Row className="d-flex align-items-center justify-content-center">
    <Col md={6}>
    <Card style={{marginBottom: '20px'}}>
      <Accordion>
        <Accordion.Item eventKey="0">
          <Accordion.Header>
            <img src='./search.svg' alt='search'/>&nbsp; Search
          </Accordion.Header>
          <Accordion.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Control
                  type="text"
                  name="title"
                  value={props.filters.title}
                  onChange={props.handleFilterChange}
                  placeholder="Title"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Control
                  type="text"
                  name="supervisor"
                  value={props.filters.supervisor}
                  onChange={props.handleFilterChange}
                  placeholder="Supervisor Surname"
                />
              </Form.Group>
              <Form.Group className="mb-3 d-md-flex">
                <Form.Control
                  type="text"
                  name="cosupervisor"
                  value={props.filters.cosupervisor}
                  onChange={props.handleFilterCoSupChange}
                  placeholder="CoSuperv Surnames"
                />
              </Form.Group>
              <p><strong>From Creation Date</strong></p>
              <Form.Group className="mb-3">
                <Form.Control
                  type="date"
                  name="creatDate"
                  value={props.filters.creatDate}
                  onChange={props.handleFilterChange}
                />
              </Form.Group>
              <p><strong>To Expiration Date</strong></p>
              <Form.Group className="mb-3">
                <Form.Control
                  type="date"
                  name="expDate"
                  value={props.filters.expDate}
                  onChange={props.handleFilterChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Control
                  type="text"
                  name="keywords"
                  value={props.filters.keywords}
                  onChange={props.handleFilterCoSupChange}
                  placeholder="Keywords"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Control
                  type="text"
                  name="type"
                  value={props.filters.type}
                  onChange={props.handleFilterCoSupChange}
                  placeholder="Type"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Control
                  type="text"
                  name="groups"
                  value={props.filters.groups}
                  onChange={props.handleFilterCoSupChange}
                  placeholder="Groups"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Control
                  type="text"
                  name="know"
                  value={props.filters.know}
                  onChange={props.handleFilterCoSupChange}
                  placeholder="Knowledge"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <p><strong>Ordering</strong></p>
                <Form.Control
                  as="select"
                  name="order"
                  value={props.filters.order}
                  onChange={props.handleFilterChange}
                >
                  <option value="">Order</option>
                  <option value="A">Ascendent</option>
                  <option value="D">Descendent</option>
                </Form.Control>
                <Form.Control
                  as="select"
                  name="orderby"
                  value={props.filters.orderby}
                  onChange={props.handleFilterChange}
                >
                  <option value="">Order by</option>
                  <option value="title">Title</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="expDate">ExpDate</option>
                </Form.Control>
              </Form.Group>
              {/* Add other filter input fields here */}
              <Button variant="primary" onClick={props.handleApplyFilters}>
                Search
              </Button>
              <br />
              <Button variant="danger" onClick={props.handleResetChange} style={{ marginTop: '5px' }}>
                Reset Filters
              </Button>
            </Form>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </Card>
    </Col> 
    </Row>
    </Container>
  );
}

FilterContainer.propTypes = {
  filters : PropTypes.object.isRequired,
  handleFilterChange : PropTypes.func.isRequired,
  handleFilterCoSupChange : PropTypes.func.isRequired,
  handleResetChange : PropTypes.func.isRequired,
  handleApplyFilters : PropTypes.func.isRequired,
};

export { FilterContainer };