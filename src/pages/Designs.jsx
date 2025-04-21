import React, { useState, useEffect } from 'react';
import { Modal, ListGroup, Button, Form, InputGroup, Spinner, Container, Row, Col, Card, Badge } from 'react-bootstrap';
import { FaChevronDown, FaChevronRight, FaFire, FaStar, FaPencilAlt, FaTrashAlt, FaPlus, FaSearch, FaEdit, FaTrash } from 'react-icons/fa';
import axiosInstance from '../services/axiosConfig';
import Image from 'react-bootstrap/Image';

const Designs = () => {
  const [designs, setDesigns] = useState([]);
  const [expandedDesigns, setExpandedDesigns] = useState(new Set());
  const [designDetails, setDesignDetails] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    Name: "",
    Description: "",
    NewImage: null,
    ImageUrl: "",
    TrendScore: 0,
    AverageRating: 0
  });
  const [colors, setColors] = useState([]);
  const [occasions, setOccasions] = useState([]);
  const [skintones, setSkintones] = useState([]);
  const [paintTypes, setPaintTypes] = useState([]);
  const [services, setServices] = useState([]);

  useEffect(() => {
    const getDesigns = async () => {
      setIsLoading(true);
      try {
        const res = await axiosInstance.get(`/odata/design?$select=id,name,trendscore,averageRating&$expand=medias($orderby=numerialOrder asc;$top=1;$select=imageUrl)`);
        const designs = res.value || [];
        setDesigns(designs);
      } catch (error) {
        console.error("Error fetching designs:", error);
        setDesigns([]);
      } finally {
        setIsLoading(false);
      }
    };
    getDesigns();
  }, []);

  useEffect(() => {
    const fetchOptions = async () => {
      setIsLoading(true);
      try {
        const [colorsRes, occasionsRes, skintonesRes, paintTypesRes, servicesRes] = await Promise.all([axiosInstance.get("/api/Adjective/Colors"), axiosInstance.get("/api/Adjective/Occasions"), axiosInstance.get("/api/Adjective/Skintone"), axiosInstance.get("/api/Adjective/PaintType"), axiosInstance.get(`/odata/service?$filter= isDeleted eq false&$select=id,name,price,imageUrl,description`)]);
        setColors(colorsRes);
        setOccasions(occasionsRes);
        setSkintones(skintonesRes);
        setPaintTypes(paintTypesRes);
        setServices(servicesRes.value);
      } catch (error) {
        console.error("Error fetching options:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOptions();
  }, []);

  const handleShowModal = (design = null) => {
    if (design) {
      setSelectedDesign(design);
      setFormData({
        Name: design.Name,
        Description: design.Description,
        NewImage: null,
        ImageUrl: design.ImageUrl,
        TrendScore: design.TrendScore,
        AverageRating: design.AverageRating
      });
    } else {
      setSelectedDesign(null);
      setFormData({
        Name: "",
        Description: "",
        NewImage: null,
        ImageUrl: "",
        TrendScore: 0,
        AverageRating: 0
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedDesign(null);
    setFormData({
      Name: "",
      Description: "",
      NewImage: null,
      ImageUrl: "",
      TrendScore: 0,
      AverageRating: 0
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({
      ...prev,
      NewImage: file,
      ImageUrl: URL.createObjectURL(file)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null) {
          formDataToSend.append(key, formData[key]);
        }
      });

      if (selectedDesign) {
        await axiosInstance.put(`/api/Design?id=${selectedDesign.ID}`, formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        await axiosInstance.post("/api/Design", formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      await fetchDesigns();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving design:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDesignDetails = async (id) => {
    setIsLoading(true);
    try {
      const designRes = await axiosInstance.get(`/odata/design?$filter=id eq ${id}&$select=id,name,description,trendscore&$expand=medias($select=numerialOrder,imageUrl,mediatype),preferences,nailDesigns($select=id,imageUrl,nailposition,isleft)`);
      const design = designRes.value[0];

      const nailDesignServiceRequests = design.NailDesigns.map((NailDesign) => axiosInstance.get(`/odata/NailDesignService?$filter=nailDesignId eq ${NailDesign.ID}&$select=id,serviceId`));
      const nailDesignServicesRes = await Promise.all(nailDesignServiceRequests);

      const nailDesignServices = nailDesignServicesRes.reduce((acc, res, index) => {
        acc[design.NailDesigns[index].ID] = res.value ?? [];
        return acc;
      }, {});

      const allServices = Object.values(nailDesignServices).flat();
      const serviceIds = [...new Set(allServices.map((service) => service?.ServiceId))];

      const serviceRequests = serviceIds.map((serviceId) => axiosInstance.get(`/odata/service?$filter=id eq ${serviceId}&$select=id,name,imageUrl,price,isAdditional,averageDuration`));
      const servicesRes = await Promise.all(serviceRequests);
      const services = servicesRes.map((res) => res.value[0]);

      const nailDesignsWithServices = design.NailDesigns.map((NailDesign) => ({
        ...NailDesign,
        nailDesignServices: (nailDesignServices[NailDesign.ID] || []).map((nds) => ({
          ...nds,
          service: services.find((s) => s.ID === nds.ServiceId)
        }))
      }));

      setDesignDetails((prev) => ({
        ...prev,
        [id]: {
          ...design,
          NailDesigns: nailDesignsWithServices
        }
      }));
    } catch (error) {
      console.error("Error fetching design details:", error);
      alert("Không thể tải thông tin design. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDesign = (id) => {
    setExpandedDesigns((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
        if (!designDetails[id]) {
          getDesignDetails(id);
        }
      }
      return newSet;
    });
  };

  useEffect(() => {
    return () => {
      if (formData.ImageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(formData.ImageUrl);
      }
    };
  }, [formData.ImageUrl]);

  return (
    <Container className="w-100 fade-in p-4">
      <div className="card-header bg-white py-3">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0">Design Management</h5>
          <div className="d-flex gap-2">
            <div className="position-relative">
              <input
                type="search"
                className="form-control form-control-sm"
                placeholder="Tìm kiếm design..."
                aria-label="Tìm kiếm"
              />
              <span className="position-absolute top-50 end-2 translate-middle-y text-muted">
                <FaSearch size={14} />
              </span>
            </div>
            <button type="button" className="btn btn-sm btn-primary d-flex align-items-center gap-1" onClick={() => handleShowModal()}>
              <FaPlus size={14} /> Adding Design
            </button>
          </div>
        </div>
      </div>
      <div className="card-body">
        <div className="table-responsive">
          {isLoading ? (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "200px" }}>
              <Spinner animation="border" role="status" variant="primary">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : (
            <table className="table table-hover">
              <thead>
                <tr>
                  <th style={{ width: "50px" }}></th>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Trend Score</th>
                  <th>Rating</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {designs.map((design) => (
                  <React.Fragment key={design.ID}>
                    <tr>
                      <td>
                        <button className="btn btn-sm btn-link p-0" onClick={() => toggleDesign(design.ID)}>
                          {expandedDesigns.has(design.ID) ? <FaChevronDown /> : <FaChevronRight />}
                        </button>
                      </td>
                      <td>
                        <img 
                          src={design.Medias?.[0]?.ImageUrl || "https://via.placeholder.com/50"} 
                          alt={design.Name} 
                          className="img-thumbnail" 
                          style={{ width: "50px", height: "50px", objectFit: "cover" }} 
                        />
                      </td>
                      <td>{design.Name}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <FaFire className="text-danger me-1" />
                          <span>{design.TrendScore}</span>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <FaStar className="text-warning me-1" />
                          <span>{design.AverageRating.toFixed(1)}</span>
                        </div>
                      </td>
                      <td>
                        <div className="btn-group">
                          <button 
                            className="btn btn-sm btn-outline-primary"
                            title="Chỉnh sửa"
                            aria-label="Chỉnh sửa"
                            onClick={() => handleShowModal(design)}
                          >
                            <FaPencilAlt size={14} />
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-danger"
                            title="Xóa"
                            aria-label="Xóa"
                          >
                            <FaTrashAlt size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedDesigns.has(design.ID) && designDetails[design.ID] && (
                      <tr>
                        <td colSpan="6">
                          <div className="p-3 bg-light">
                            <h6 className="mb-3">Chi tiết Design</h6>
                            <div className="table-responsive">
                              <table className="table table-bordered table-sm">
                                <thead>
                                  <tr>
                                    <th style={{ width: "100px" }}>Image</th>
                                    <th>Position</th>
                                    <th>Side</th>
                                    <th>Service</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {designDetails[design.ID].NailDesigns.map((nailDesign) => (
                                    <tr key={nailDesign.ID}>
                                      <td>
                                        <div className="d-flex justify-content-center">
                                          <img
                                            src={nailDesign.ImageUrl}
                                            alt={`Nail Design ${nailDesign.NailPosition}`}
                                            style={{
                                              width: "80px",
                                              height: "80px",
                                              objectFit: "cover",
                                              borderRadius: "4px"
                                            }}
                                          />
                                        </div>
                                      </td>
                                      <td>{nailDesign.NailPosition}</td>
                                      <td>{nailDesign.isleft ? "Trái" : "Phải"}</td>
                                      <td>
                                        <div className="table-responsive">
                                          <table className="table table-sm table-bordered mb-0">
                                            <thead>
                                              <tr>
                                                <th>Service Name</th>
                                                <th>Price</th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {nailDesign.nailDesignServices.map((nds) => (
                                                <tr key={nds.ID}>
                                                  <td>{nds.service.Name}</td>
                                                  <td className="text-primary">{nds.service.Price.toLocaleString()}đ</td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </table>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{selectedDesign ? 'Edit Design' : 'Add New Design'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="Name"
                    value={formData.Name}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Trend Score</Form.Label>
                  <Form.Control
                    type="number"
                    name="TrendScore"
                    value={formData.TrendScore}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="Description"
                value={formData.Description}
                onChange={handleInputChange}
                rows={3}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Image</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {formData.ImageUrl && (
                <div className="mt-2">
                  <Image
                    src={formData.ImageUrl}
                    thumbnail
                    style={{ maxWidth: '200px' }}
                  />
                </div>
              )}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
                <span className="ms-2">Saving...</span>
              </>
            ) : (
              'Save'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Designs; 