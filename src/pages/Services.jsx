import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  InputGroup,
  Badge,
  Modal,
  Spinner,
  ListGroup,
  Table,
  Image
} from "react-bootstrap";
import { FaSearch, FaEdit, FaTrash, FaStar, FaEllipsisV } from "react-icons/fa";
import axiosInstance from "../services/axiosConfig";
import Pagination from "../components/Pagination";


const Services = () => {
  const pageSizeOptions = [8, 16, 24, 32];
  const [services, setServices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedService, setselectedService] = useState();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [formData, setFormData] = useState({
    Name: "",
    Description: "",
    Price: 0,
    ImageUrl: "",
    NewImage: null,
    });
  const [pageSize, setPageSize] = useState(pageSizeOptions[0]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const uri = `/odata/service?`;
      const filter = searchTerm
        ? `$filter=contains(concat(name,description), '${searchTerm}')&`
        : "";
      const count = `$count=true`;
      const skip = currentPage * pageSize;
      const pagination = `&$top=${pageSize}&$skip=${skip}`;
      const selectStore = `&$select=id,name,price,imageUrl,description,isdeleted,imageDescriptionUrl`;
      const expandCategory = `&$expand=categoryServices`
      const res = await axiosInstance.get(
        `${uri}${filter}${count}${pagination}${selectStore}${expandCategory}`
      );
      
      console.log(res);
          
      const totalCountValue = res["@odata.count"] ?? 0;
      setTotalCount(totalCountValue)
      setTotalPages(Math.ceil(totalCountValue / pageSize));
      
      setServices(res.value);
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectCategory = (serviceId) => {

    console.log(serviceId);
    
    setSelectedCategories((prev) => {
      const newServices = prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId];
      return newServices;
    });    
  };

  useEffect(() => {
    fetchServices(currentPage);
  }, [currentPage, pageSize, searchTerm]);

  useEffect(() => {
    const getCategories = async () => {
      try {
        const res = await axiosInstance.get("api/Adjective/Categories");
        setCategories(res);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    getCategories();
  }, []);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleShowModal = (service = null) => {
    if (service) {
      setEditingService(service);
      setFormData({
        Name: service.Name,
        Description: service.Description,
        Price: service.Price,
        ImageUrl: service.ImageUrl,
        NewImage: null,
        ImageDescriptionUrl: service.ImageDescriptionUrl,
        NewImageDescription: null
      });
      console.log(service.CategoryServices);
      
      service?.CategoryServices?.map(category => {
        console.log(category.CategoryId);
        
        handleSelectCategory(category.CategoryId)
      })
    } else {
      setEditingService(null);
      setFormData({
        Name: "",
        Description: "",
        Price: 0,
        ImageUrl: "",
        NewImage: null,
        ImageDescriptionUrl: "",
        NewImageDescription: null
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingService(null);
    setFormData({
      Name: "",
        Description: "",
        Price: 0,
        ImageUrl: "",
        NewImage: null,
    })
    setSelectedCategories([])
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({
      ...prev,
      NewImage: file,
      ImageUrl: URL.createObjectURL(file),
    }));
  };

  const handleImageDescriptionChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({
      ...prev,
      NewImageDescription: file,
      ImageDescriptionUrl: URL.createObjectURL(file),
    }));
  };

  const handleSearch = (e) =>  {
    const search = e.target.value
    setSearchTerm(search);
    setCurrentPage(0)
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();

      // Handle basic fields
      formDataToSend.append("Name", formData.Name);
      formDataToSend.append("Description", formData.Description);
      formDataToSend.append("Price", formData.Price);

      // Handle image
      if (formData.NewImage) {
        formDataToSend.append("NewImage", formData.NewImage);
      }
      if (formData.ImageUrl) {
        formDataToSend.append("ImageUrl", formData.ImageUrl);
      }

      if (formData.NewImageDescription) {
        formDataToSend.append("NewImageDescription", formData.NewImageDescription);
      }
      if (formData.ImageDescriptionUrl) {
        formDataToSend.append("ImageDescriptionUrl", formData.ImageDescriptionUrl);
      }

      // Handle categories
      selectedCategories.forEach((id, index) => {
        formDataToSend.append(`CategoryIds[${index}]`, id);
      });

      if (editingService) {
        await axiosInstance.put(
          `/api/Service?id=${editingService.ID}`,
          formDataToSend,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        await axiosInstance.post("/api/Service", formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      handleCloseModal();
      // Refresh services list
      fetchServices(currentPage);
    } catch (error) {
      console.error("Error saving service:", error);
      if (error.response?.data?.errors) {
        console.error("Validation errors:", error.response.data.errors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShowDeleteModal = (Store) => {
    setselectedService(Store);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () =>{
    fetchServices();
    setselectedService(false)
    setShowDeleteModal(false)
  }
  const deleteService = async () => {
    console.log(selectedService.IsDeleted);
    
    try {
      await axiosInstance.patch(`/api/Service?id=${selectedService.ID}`, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Service updated successfully");
      handleCloseDeleteModal()
    } catch (error) {
      console.error("Error updating service:", error);
      throw error;
    }
  };
  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Services</h2>
        <Button variant="primary" onClick={() => handleShowModal()}>Add New Service</Button>
      </div>

      <div className="mb-4">
        <Row>
          <Col md={6}>
            <InputGroup>
              <Form.Control
                placeholder="Search services..."
                aria-label="Search services"
                onChange={handleSearch}
              />
              <Button variant="outline-secondary">
                <FaSearch />
              </Button>
            </InputGroup>
          </Col>
          <Col md={2}>
            <Form.Select 
              value={pageSize} 
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(0);
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
      </div>

      <Row>
        {services.map((service) => (
          <Col key={service.ID} md={3} className="mb-4">
            <Card>
              <Card.Img 
                variant="top" 
                src={service.ImageUrl} 
                style={{ height: '200px', objectFit: 'cover' }}
              />
              <Card.Body>
                <Card.Title>{service.Name}</Card.Title>
                <Card.Text>{service.Description}</Card.Text>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="h5 mb-0">${service.Price}</span>
                  <div>
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      className="me-2"
                      onClick={() => handleShowModal(service)}
                    >
                      <FaEdit />
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleShowDeleteModal(service)}
                    >
                      <FaTrash />
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <div className="d-flex justify-content-between align-items-center mt-4">
        <div className="text-muted">
          Showing {services.length} of {totalCount} services
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingService ? 'Edit Service' : 'Add New Service'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Service Name</Form.Label>
              <Form.Control
                type="text"
                name="Name"
                value={formData.Name}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="Description"
                value={formData.Description}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Price</Form.Label>
              <Form.Control
                type="number"
                name="Price"
                value={formData.Price}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Service Image</Form.Label>
              <Form.Control
                type="file"
                onChange={handleImageChange}
                accept="image/*"
                disabled={isSubmitting}
              />
              {formData.ImageUrl && !formData.NewImage && (
                <img 
                  src={formData.ImageUrl} 
                  alt="Current" 
                  className="mt-2" 
                  style={{ width: "100px", height: "100px", objectFit: "cover" }} 
                />
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Categories</Form.Label>
              <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                <ListGroup>
                  {categories.map((category) => (
                    <ListGroup.Item key={category.ID}>
                      <Form.Check 
                        type="checkbox" 
                        id={`${category.ID}`} 
                        label={category.Name}  
                        onChange={() => handleSelectCategory(category.ID)} 
                        checked={selectedCategories.includes(category.ID)}
                        disabled={isSubmitting} 
                      />
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </div>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Service</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this service?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal}>
            Cancel
          </Button>
          <Button variant="danger" onClick={deleteService}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Services;
