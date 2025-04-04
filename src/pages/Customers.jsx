import React from 'react';
import { Container, Table, Button, Form, InputGroup } from 'react-bootstrap';
import { FaSearch, FaEdit, FaTrash } from 'react-icons/fa';

const Customers = () => {
  const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User', status: 'Inactive' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Editor', status: 'Active' },
  ];

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Users</h2>
        <Button variant="primary">Add New User</Button>
      </div>

      <div className="mb-4">
        <InputGroup>
          <Form.Control
            placeholder="Search users..."
            aria-label="Search users"
          />
          <Button variant="outline-secondary">
            <FaSearch />
          </Button>
        </InputGroup>
      </div>

      <Table responsive striped hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                <span className={`badge bg-${user.status === 'Active' ? 'success' : 'secondary'}`}>
                  {user.status}
                </span>
              </td>
              <td>
                <Button variant="link" className="text-primary p-0 me-2">
                  <FaEdit />
                </Button>
                <Button variant="link" className="text-danger p-0">
                  <FaTrash />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default Customers; 