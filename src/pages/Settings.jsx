import React from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';

const Settings = () => {
  return (
    <Container fluid>
      <h2 className="mb-4">Settings</h2>
      
      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Profile Settings</h5>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control type="text" placeholder="Enter your name" />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" placeholder="Enter your email" />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Profile Picture</Form.Label>
                  <Form.Control type="file" />
                </Form.Group>

                <Button variant="primary" type="submit">
                  Update Profile
                </Button>
              </Form>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <h5 className="mb-0">Change Password</h5>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Current Password</Form.Label>
                  <Form.Control type="password" placeholder="Enter current password" />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control type="password" placeholder="Enter new password" />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Confirm New Password</Form.Label>
                  <Form.Control type="password" placeholder="Confirm new password" />
                </Form.Group>

                <Button variant="primary" type="submit">
                  Change Password
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Notification Settings</h5>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Check 
                    type="switch"
                    id="email-notifications"
                    label="Email Notifications"
                    defaultChecked
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Check 
                    type="switch"
                    id="push-notifications"
                    label="Push Notifications"
                    defaultChecked
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Check 
                    type="switch"
                    id="marketing-emails"
                    label="Marketing Emails"
                  />
                </Form.Group>

                <Button variant="primary" type="submit">
                  Save Preferences
                </Button>
              </Form>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <h5 className="mb-0">Theme Settings</h5>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Theme Mode</Form.Label>
                  <Form.Select>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System Default</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Primary Color</Form.Label>
                  <Form.Control type="color" defaultValue="#0d6efd" />
                </Form.Group>

                <Button variant="primary" type="submit">
                  Save Theme
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Settings; 