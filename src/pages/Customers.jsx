import React, { useEffect, useState } from 'react';
import { Container, Table, Button, Form, InputGroup, Image, Row, Col } from 'react-bootstrap';
import { FaSearch, FaEdit, FaTrash } from 'react-icons/fa';
import axiosInstance from '../services/axiosConfig';
import Pagination from '../components/Pagination';

const Customers = () => {
  const pageSizeOptions = [8, 16, 24, 32];
const [customers, setCustomers] = useState([]);
// const [selectedCustomer, setSelectedCustomer] = useState(null);
// const [showDeleteModal, setShowDeleteModal] = useState(false);
const [pageSize, setPageSize] = useState(pageSizeOptions[0]);
const [currentPage, setCurrentPage] = useState(0);
const [totalPages, setTotalPages] = useState(0);
const [totalCount, setTotalCount] = useState(0);
const [searchTerm, setSearchTerm] = useState("");
const [feedbacks, setFeedbacks] = useState([]);

  const fetchCustomers = async () => {
    try {
      const uri = "/odata/customer"
      let filter = ""
      if (searchTerm) {
        filter = `$filter=conaints(user/fullName, '${searchTerm}')`
      }
      const select =  `${filter ? '&' : ''}$select=id,description`
      const skip = pageSize * currentPage
      const pagination =  `$top=${pageSize}&$skip=${skip}`
      const count = `$count=true`
      const expandUser = `$expand=user($select=id,createdAt,lastModifiedAt,email,fullName,phoneNumber,dateOfBirth,imageUrl)`
      console.log(`${uri}?${filter}&${select}&${pagination}&${count}&${expandUser}`);
      
      const res = await axiosInstance.get(`${uri}?${filter}&${select}&${pagination}&${count}&${expandUser}`)
      console.log(res);
      const totalCountValue = res["@odata.count"] ?? 0;
      setTotalCount(totalCountValue);
      setTotalPages(Math.ceil(totalCountValue / pageSize));
      
      const customersRes = res.value;
      console.log(customersRes);
      
      setCustomers(customersRes)

    } catch (error) {
      console.log(error);
    }
  }

  // const handleShowDeleteModal = (artist) => {
  //   console.log(artist);
    
  //   setSelectedCustomer(artist);
  //   setShowDeleteModal(true);
  // };

  // const handleCloseDeleteModal = () =>{
  //   fetchCustomers();
  //   setSelectedCustomer(false)
  //   setShowDeleteModal(false)
  // }


  const handleSearch = (e) => {
    const searchTerm = e.target.value;
    setSearchTerm(searchTerm);
    setCurrentPage(0); // Reset to first page when searching
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleViewFeedback = async (customer) => {
    const res = await axiosInstance.get(`/odata/feedback?$filter=customerId eq ${customer.ID}&$select=typeId,content,rating,feedbackType`)
    const feedbackRes = res.value
    setFeedbacks(feedbackRes)
  }

  useEffect(() => {
    fetchCustomers();
  }, [currentPage, pageSize, searchTerm]);
  
  return (
    <Container >
      <Row className="mb-4">
        <Col>
        <InputGroup>
          <Form.Control
            placeholder="Search users..."
            aria-label="Search users"
            onChange={handleSearch}
          />
          <Button variant="outline-secondary">
            <FaSearch />
          </Button>
        </InputGroup>
        </Col>
        <Col>
        <Form.Select 
            value={pageSize} 
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(0); // Reset to first page when changing page size
            }}
          >
            {pageSizeOptions.map(size => (
              <option key={size} value={size}>
                {size} per page
              </option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      <Table responsive striped hover>
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone Number</th>
          
            {/* <th>Actions</th> */}
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.ID}>
              <td>
                <Image src={`${customer.User.ImageUrl}`} 
                alt={`Customer ${customer.ID}`}
                roundedCircle // (tuỳ chọn) bo tròn ảnh
                thumbnail // (tuỳ chọn) thêm border
                style={{ width: '50px', height: '50px' }} // Tuỳ chỉnh kích thước
              />
              </td>
              <td>{customer.User.FullName}</td>
              <td>{customer.User.Email}</td>
              <td>{customer.User.PhoneNumber}</td>
     
              {/* <td>
                <Button variant="link" className="text-danger p-0" onSubmit={handle}>
                  <FaTrash />
                </Button>
              </td> */}
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="d-flex justify-content-between align-items-center mt-4">
        <div className="text-muted">
          Showing {customers.length} of {totalCount} customers
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </Container>
  );
};

export default Customers; 