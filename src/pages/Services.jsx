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
} from "react-bootstrap";
import { FaSearch, FaEdit, FaTrash, FaStar } from "react-icons/fa";
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
    IsAdditional: false
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
      const selectStore = `&$select=id,name,price,imageUrl,description,isAdditional,isdeleted,imageDescriptionUrl`;
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
        IsAdditional: service.IsAdditional,
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
        IsAdditional: false,
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
        IsAdditional: false,
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
      formDataToSend.append("IsAdditional", formData.IsAdditional);

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
        <h2>Nail Services Management</h2>
        <Button variant="primary" onClick={() => handleShowModal()}>
          Add New Service
        </Button>
      </div>

      <Row className="mb-4">
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
              setCurrentPage(0); // Reset to first page when changing page size
            }}
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size} per page
              </option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      <Row>
        {services.map((service) => (
          <Col key={service.ID} lg={3} md={4} sm={6} className="mb-4">
            <Card className="h-100">
              <Card.Img variant="top" src={service.ImageUrl} />
              <Card.Body>
                <Card.Title className="d-flex justify-content-between align-items-center">
                  {service.FullName}
                  <Badge
                    bg={
                      service.IsDeleted === false ? "success" : "warning"
                    }
                  >
                    {service.IsDeleted === false ? "Active" : "Inactive"}
                  </Badge>
                </Card.Title>
                <div className="card-details">
                  <div className="mb-2">
                    <strong>Services:</strong>
                    <div className="mt-1">
                      {service.ServiceServices?.map((service) => (
                        <Badge
                          key={service.ServiceId}
                          bg="info"
                          className="me-1 mb-1"
                        >
                          {service.Service?.Name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="mb-2">
                    <strong>Experience:</strong> {service.YearsOfExperience}
                  </div>
                  <div className="mb-2">
                    <strong>Level:</strong> {service.Level}
                  </div>
                  <div className="mb-2">
                    Rating: {service.AverageRating}{" "}
                    <FaStar className="text-warning" />
                  </div>
                </div>
                <div className="d-flex justify-content-between mt-3">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handleShowModal(service)}
                  >
                    <FaEdit className="me-1" /> Edit
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleShowDeleteModal(service)}
                  >
                    <FaTrash className="me-1" />{" "}
                    {service.IsDeleted === true ? "Active" : "Deactive"}
                  </Button>
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
          <Modal.Title>{editingService ? "Chỉnh sửa Dịch vụ" : "Thêm Dịch vụ mới"}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Tên Dịch vụ</Form.Label>
              <Form.Control type="text" name="Name" value={formData.Name} onChange={handleInputChange} required disabled={isSubmitting} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Mô tả</Form.Label>
              <Form.Control as="textarea" name="Description" value={formData.Description} onChange={handleInputChange} required disabled={isSubmitting} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Giá</Form.Label>
              <Form.Control type="number" name="Price" value={formData.Price} onChange={handleInputChange} required disabled={isSubmitting} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Hình ảnh</Form.Label>
              <Form.Control type="file" onChange={handleImageChange} accept="image/*" disabled={isSubmitting} />
              {formData.ImageUrl && <img src={formData.ImageUrl} alt="Preview" className="mt-2" style={{ width: "100px", height: "100px", objectFit: "cover" }} />}
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Hình ảnh</Form.Label>
              <Form.Control type="file" onChange={handleImageDescriptionChange} accept="image/*" disabled={isSubmitting} />
              {formData.ImageDescriptionUrl && <img src={formData.ImageDescriptionUrl} alt="Preview" className="mt-2" style={{ width: "100px", height: "100px", objectFit: "cover" }} />}
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check type="checkbox" name="IsAdditional" label="Dịch vụ bổ sung" checked={formData.IsAdditional} onChange={handleInputChange} disabled={isSubmitting} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Danh mục</Form.Label>
              <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                <ListGroup>
                  {categories.map((category) => (
                    <ListGroup.Item key={category.id}>
                      <Form.Check type="checkbox" id={`category-${category.id}`} label={category.name} checked={selectedCategories.includes(category.id)} onChange={() => handleSelectCategory(category.id)} disabled={isSubmitting} />
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </div>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                  {editingService ? "Đang cập nhật..." : "Đang thêm mới..."}
                </>
              ) : editingService ? (
                "Cập nhật"
              ) : (
                "Thêm mới"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
      {/* Delete Confirmation Modal */}
      {selectedService !== undefined &&
        selectedService !== null && (
          <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
            <Modal.Header closeButton>
              <Modal.Title>Confirm Delete</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              Are you sure you want to{" "}
              {selectedService.IsDeleted === true ? "active" : "deactive"}{" "}
              {selectedService.Name}? Customer can{" "}
              {selectedService.IsDeleted === true ? "" : "not"} see this
              service.
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseDeleteModal}>
                Cancel
              </Button>
              <Button variant="danger" onClick={deleteService}>
                {selectedService.IsDeleted === true
                  ? "Active"
                  : "Deactive"}
              </Button>
            </Modal.Footer>
          </Modal>
        )}
    </Container>
  );
};

export default Services;
