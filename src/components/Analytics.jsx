import React from 'react';
import { Container, Row, Col, Card, Form } from 'react-bootstrap';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Analytics = () => {
  const revenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue',
        data: [3000, 4500, 3500, 5000, 6000, 7500],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const serviceData = {
    labels: ['Manicure', 'Pedicure', 'Nail Art', 'Acrylic', 'Gel Polish', 'Waxing'],
    datasets: [
      {
        label: 'Number of Services',
        data: [120, 90, 75, 85, 95, 40],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
          'rgba(255, 159, 64, 0.5)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const artistPerformanceData = {
    labels: ['Jenny Thompson', 'Lisa Wang', 'Maria Garcia', 'Sarah Kim'],
    datasets: [
      {
        data: [40, 25, 20, 15],
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Analytics</h2>
        <Form.Select style={{ width: '200px' }}>
          <option>Last 6 Months</option>
          <option>Last 3 Months</option>
          <option>Last Month</option>
          <option>This Year</option>
        </Form.Select>
      </div>

      <Row>
        <Col lg={8} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">Revenue Overview</h5>
            </Card.Header>
            <Card.Body>
              <Line options={chartOptions} data={revenueData} />
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">Artist Workload Distribution</h5>
            </Card.Header>
            <Card.Body>
              <Doughnut data={artistPerformanceData} options={chartOptions} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col lg={12}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Popular Services</h5>
            </Card.Header>
            <Card.Body>
              <Bar options={chartOptions} data={serviceData} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col md={3} sm={6} className="mb-4">
          <Card className="text-center h-100">
            <Card.Body>
              <h3 className="mb-2">$29,500</h3>
              <div className="text-muted">Monthly Revenue</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-4">
          <Card className="text-center h-100">
            <Card.Body>
              <h3 className="mb-2">485</h3>
              <div className="text-muted">Monthly Appointments</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-4">
          <Card className="text-center h-100">
            <Card.Body>
              <h3 className="mb-2">8</h3>
              <div className="text-muted">Active Artists</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-4">
          <Card className="text-center h-100">
            <Card.Body>
              <h3 className="mb-2">4.8</h3>
              <div className="text-muted">Average Rating</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Analytics; 