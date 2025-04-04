import React from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup } from 'react-bootstrap';
import { FaSearch, FaEdit, FaTrash } from 'react-icons/fa';

const Services = () => {
  const products = [
    {
      id: 1,
      name: 'Product 1',
      price: 99.99,
      stock: 50,
      image: 'https://via.placeholder.com/150',
      category: 'Electronics',
    },
    {
      id: 2,
      name: 'Product 2',
      price: 149.99,
      stock: 30,
      image: 'https://via.placeholder.com/150',
      category: 'Accessories',
    },
    {
      id: 3,
      name: 'Product 3',
      price: 199.99,
      stock: 20,
      image: 'https://via.placeholder.com/150',
      category: 'Electronics',
    },
    {
      id: 4,
      name: 'Product 4',
      price: 79.99,
      stock: 40,
      image: 'https://via.placeholder.com/150',
      category: 'Accessories',
    },
  ];

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Products</h2>
        <Button variant="primary">Add New Product</Button>
      </div>

      <div className="mb-4">
        <Row>
          <Col md={6}>
            <InputGroup>
              <Form.Control
                placeholder="Search products..."
                aria-label="Search products"
              />
              <Button variant="outline-secondary">
                <FaSearch />
              </Button>
            </InputGroup>
          </Col>
          <Col md={3}>
            <Form.Select aria-label="Filter by category">
              <option>All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Accessories">Accessories</option>
            </Form.Select>
          </Col>
        </Row>
      </div>

      <Row>
        {products.map((product) => (
          <Col key={product.id} lg={3} md={4} sm={6} className="mb-4">
            <Card className="h-100">
              <Card.Img variant="top" src={product.image} />
              <Card.Body>
                <Card.Title>{product.name}</Card.Title>
                <Card.Text>
                  <div className="mb-2">Price: ${product.price}</div>
                  <div className="mb-2">Stock: {product.stock}</div>
                  <div>Category: {product.category}</div>
                </Card.Text>
                <div className="d-flex justify-content-between">
                  <Button variant="outline-primary" size="sm">
                    <FaEdit /> Edit
                  </Button>
                  <Button variant="outline-danger" size="sm">
                    <FaTrash /> Delete
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Services; 