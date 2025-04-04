import React from 'react';
import { Container, Row, Col, Card, Button, Form, Table, Badge } from 'react-bootstrap';
import { FaEdit, FaTrash, FaCalendarCheck, FaClock, FaUser, FaPlus, FaFilter } from 'react-icons/fa';

const Bookings = () => {
  const appointments = [
    {
      id: 1,
      client: 'Emma Wilson',
      artist: 'Jenny Thompson',
      service: 'Manicure + Nail Art',
      date: '2024-04-15',
      time: '10:00',
      status: 'Upcoming',
      duration: '60 min',
      price: 45,
    },
    {
      id: 2,
      client: 'Sophie Chen',
      artist: 'Lisa Wang',
      service: 'Full Set Acrylic',
      date: '2024-04-15',
      time: '11:30',
      status: 'In Progress',
      duration: '90 min',
      price: 75,
    },
    {
      id: 3,
      client: 'Isabella Martinez',
      artist: 'Maria Garcia',
      service: 'Pedicure Deluxe',
      date: '2024-04-15',
      time: '14:00',
      status: 'Completed',
      duration: '45 min',
      price: 55,
    },
  ];

  return (
    <Container fluid className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Appointments</h2>
          <p className="text-muted mb-0">Manage your salon appointments</p>
        </div>
        <Button variant="primary" className="d-flex align-items-center">
          <FaPlus className="me-2" /> New Appointment
        </Button>
      </div>

      <Card className="mb-4">
        <Card.Header>
          <div className="d-flex align-items-center">
            <FaFilter className="text-primary me-2" />
            <h5 className="mb-0">Filters</h5>
          </div>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={3}>
              <Form.Group className="mb-3 mb-md-0">
                <Form.Label>Artist</Form.Label>
                <Form.Select>
                  <option>All Artists</option>
                  <option value="1">Jenny Thompson</option>
                  <option value="2">Lisa Wang</option>
                  <option value="3">Maria Garcia</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3 mb-md-0">
                <Form.Label>Service</Form.Label>
                <Form.Select>
                  <option>All Services</option>
                  <option value="Manicure">Manicure</option>
                  <option value="Pedicure">Pedicure</option>
                  <option value="Nail Art">Nail Art</option>
                  <option value="Acrylic">Acrylic</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3 mb-md-0">
                <Form.Label>Date</Form.Label>
                <Form.Control type="date" />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Select>
                  <option>All Status</option>
                  <option value="Upcoming">Upcoming</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body className="p-0">
          <Table responsive hover className="align-middle">
            <thead>
              <tr>
                <th>Time</th>
                <th>Client</th>
                <th>Artist</th>
                <th>Service</th>
                <th>Duration</th>
                <th>Price</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td style={{ width: '180px' }}>
                    <div className="d-flex align-items-center">
                      <div className="me-3">
                        <div className="avatar-circle">
                          <FaCalendarCheck className="text-primary" />
                        </div>
                      </div>
                      <div>
                        <div className="fw-medium">{appointment.date}</div>
                        <div className="small text-muted">
                          <FaClock className="me-1" />
                          {appointment.time}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      <div className="me-3">
                        <div className="avatar-circle bg-primary-soft">
                          <FaUser className="text-primary" />
                        </div>
                      </div>
                      <div>
                        <div className="fw-medium">{appointment.client}</div>
                        <div className="small text-muted">Client #{appointment.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="fw-medium">{appointment.artist}</div>
                  </td>
                  <td>{appointment.service}</td>
                  <td>{appointment.duration}</td>
                  <td>
                    <div className="fw-medium">${appointment.price}</div>
                  </td>
                  <td>
                    <Badge bg={
                      appointment.status === 'Upcoming' ? 'primary' :
                      appointment.status === 'In Progress' ? 'warning' :
                      appointment.status === 'Completed' ? 'success' : 'secondary'
                    } className="badge-soft">
                      {appointment.status}
                    </Badge>
                  </td>
                  <td className="text-end">
                    <Button variant="light" size="sm" className="btn-icon me-2">
                      <FaEdit className="text-primary" />
                    </Button>
                    <Button variant="light" size="sm" className="btn-icon">
                      <FaTrash className="text-danger" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Bookings; 