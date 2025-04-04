import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup, Badge, Modal, Spinner, ListGroup } from 'react-bootstrap';
import { FaSearch, FaEdit, FaTrash, FaStar, FaCalendarPlus } from 'react-icons/fa';
import axiosInstance from '../services/axiosConfig';

const Artists = () => {
  const [artists, setArtists] = useState([]);
  const [services, setServices] = useState([]);
  const [stores, setStores] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [artistStoreForms, setArtistStoreForms] = useState([]);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const today = new Date();
  
  const [formData, setFormData] = useState({
    Level: 1,
    YearsOfExperience: 0,
    FullName: "",
    NewImage: null,
    ImageUrl: "",
    PhoneNumber: "",
    Email: "",
    DateOfBirth: "",
    artistServices: [],
    artistStores: [],
  });
  const [selectedServices, setSelectedServices] = useState([]);
  // const decodedToken = jwtDecode(localStorage.getItem("token"));
  // const id = decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"]
console.log("hfiwhifuwiu");

  const fetchServices = async () => {
    try {
      const uri = "/odata/service?";
      const filter = `$filter=isDeleted eq false`;
      const selectService = `&$select=id,name,description,imageUrl,price`;

      const res = await axiosInstance.get(`${uri}${filter}${selectService}`);
      const servicesRes = res.value;
      setServices(servicesRes);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const fetchStores = async () => {
    try {
      const uri = "/odata/store?";
      const filter = `$filter=isDeleted eq false`;
      const selectStore = `&$select=id,province,description,address,imageUrl,latitude,longtitude`;

      const res = await axiosInstance.get(`${uri}${filter}${selectStore}`);
      const storesRes = res.value;
      setStores(storesRes);
    } catch (error) {
      console.error("Error fetching stores:", error);
    }
  };
  

  const handleAddArtistStoreForm = () => {
    setArtistStoreForms(prev => [...prev, {
      id: Date.now(), // unique id for each form
      StoreId: "",
      WorkingDate: "",
      StartTime: "",
      EndTime: "",
      BreakTime: ""
    }]);
  };

  const handleRemoveArtistStoreForm = (formId) => {
    setArtistStoreForms(prev => prev.filter(form => form.id !== formId));
  };

  const handleArtistStoreFormChange = (formId, field, value) => {
    setArtistStoreForms(prev => prev.map(form => {
      if (form.id === formId) {
        return { ...form, [field]: value };
      }
      return form;
    }));
  };

  const handleShowModal = async (artist) => {
    console.log(artist);
    
    setSelectedArtist(artist ? artist : null);
    const dateOfBirth = artist?.User?.DateOfBirth
        ? new Date(artist?.User?.DateOfBirth).toISOString().split("T")[0]
        : "";
    setFormData({
        Level: artist?.Level || 1,
        YearsOfExperience: artist?.YearsOfExperience || 0,
        FullName: artist?.User?.FullName || "",
        ImageUrl: artist?.User?.ImageUrl || "",
        PhoneNumber: artist?.User?.PhoneNumber || "",
        Email: artist?.User?.Email || "",
        DateOfBirth: dateOfBirth,
    });

    // Add existing artist services to selectedServices
    artist?.ArtistServices?.map(service => {
        console.log(service.Service.IsDeleted);
        
        if (service.Service.IsDeleted === false) {
            handleSelectService(service.ServiceId)
        }
    });

    // Add artist stores to forms if they are within 3 days from now
    
    const validArtistStores = artist?.ArtistStores?.map(store => {
        const date = new Date(store.WorkingDate);
        if (date > today) {
          const formatTime = (timeString) => {
            if (!timeString) return "";
            return timeString.split(".")[0].slice(0, 5);
          };
          return {
            id: Date.now() + Math.random(),
            StoreId: store.StoreId,
            WorkingDate: new Date(store.WorkingDate).toISOString().split("T")[0],
            StartTime: formatTime(store.StartTime),
            EndTime: formatTime(store.EndTime),
            BreakTime: store.BreakTime
          };
        }
        return null; // Hoặc undefined nếu không return gì
      }).filter(store => store !== null && store !== undefined); // Lọc bỏ giá trị null/undefined
      
      // Kiểm tra xem có dữ liệu hay không
      if (validArtistStores && validArtistStores.length > 0) {
            setArtistStoreForms(validArtistStores);
      }
    
    await fetchServicesAndStores();
    setShowModal(true);
  };

  const fetchArtist = async () => {
    try {
      const uri = "/odata/artist?";
      // const filter = `$filter=id eq ${id}`;
      const selectArtist = `$select=id,username,yearsOfExperience,level,averageRating`;
      const expandUser = `&$expand=user($select=fullName,email,phoneNumber,imageUrl,dateOfBirth,isDeleted)`;
      const expandArtistStore = `,artistStores($select=storeId,workingDate,startTime,endTime,breakTime;$orderby=workingDate desc;$expand=store($select=id,province,address,description,latitude,longtitude,isDeleted))`;
      const expandArtistService = `,artistServices($select=serviceId;$expand=service($select=id,name,description,imageUrl,price,isDeleted))`;

      const res = await axiosInstance.get(
        `${uri}${selectArtist}${expandUser}${expandArtistService}${expandArtistStore}`
      );

      const artist = res.value
      console.log(artist);
      
      setArtists(artist)
      
    } catch (error) {
      console.error("Error fetching artist:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const fetchServicesAndStores = async () => {
    await Promise.all([fetchServices(), fetchStores()]);
  };
  
  const updateArtist = async (id, formDataToSend) => {
    try {
      // Log all values in FormData
      console.log("FormData contents:");
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }
        
      await axiosInstance.put(`/api/Artist?id=${id}`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Store updated successfully");
    } catch (error) {
      console.error("Error updating store:", error);
      throw error;
    }
  };

  const handleShowDeleteModal = (artist) => {
    console.log(artist);
    
    setSelectedArtist(artist);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () =>{
    fetchArtist();
    setSelectedArtist(false)
    setShowDeleteModal(false)
  }

  const deleteArtist = async () => {
    console.log(selectedArtist.User.IsDeleted);
    
    try {
      await axiosInstance.patch(`/api/Artist?id=${selectedArtist.ID}`, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Store updated successfully");
      handleCloseDeleteModal()
    } catch (error) {
      console.error("Error updating store:", error);
      throw error;
    }
  };

  const createArtist = async (formDataToSend) => {
    try {
      // Log all values in FormData
      console.log("FormData contents:");
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }
        
      await axiosInstance.post(`/api/Artist`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Store created successfully");
    } catch (error) {
      console.error("Error creating store:", error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    console.log(artistStoreForms);
    
    try {
      console.log("Submitting with selectedServices:", selectedServices);
      console.log("Submitting with artistStoreForms:", artistStoreForms);
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null) {
          formDataToSend.append(key, formData[key]);
        }
      });
      // Add selectedServices and artistStoreForms to formData
      selectedServices.forEach((item, index) => {
        formDataToSend.append(`artistServices[${index}].serviceId`,item)})

      artistStoreForms.forEach((item, index) =>{
        console.log(`artistStores[${index}].storeId`,item.StoreId);
        
        formDataToSend.append(`artistStores[${index}].storeId`,item.StoreId)
        formDataToSend.append(`artistStores[${index}].workingDate`,item.WorkingDate)
        formDataToSend.append(`artistStores[${index}].startTime`,item.StartTime)
        formDataToSend.append(`artistStores[${index}].endTime`,item.EndTime)
        formDataToSend.append(`artistStores[${index}].breakTime`,item.BreakTime)
      })

    //   formDataToSend.append('artistServices', JSON.stringify(selectedServices));
    //   formDataToSend.append('artistStores', JSON.stringify(artistStoreForms));
      if (selectedArtist && selectedArtist.ID) {
        await updateArtist(selectedArtist.ID, formDataToSend);
      } else {
        await createArtist(formDataToSend);
      }
      await fetchArtist();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving store:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectService = (serviceId) => {
    setSelectedServices((prev) => {
      const newServices = prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId];
      return newServices;
    });
  };

  const handleCloseModal = async () => {
    // Reset formData
    setFormData({
      Level: 1,
      YearsOfExperience: 0,
      FullName: "",
      NewImage: null,
      ImageUrl: "",
      PhoneNumber: "",
      Email: "",
      DateOfBirth: "",
      artistServices: [],
      artistStores: [],
    });

    setSelectedArtist(null);
    // Reset selectedServices
    setSelectedServices([]);

    // Reset artistStoreForms
    setArtistStoreForms([]);

    // Close modal
    setShowModal(false);
  };

  const handleImageChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      NewImage: e.target.files[0]
    }));
  };

  const handleSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredArtists = artists.filter(artist => 
      artist.User?.FullName?.toLowerCase().includes(searchTerm)
    );
    setArtists(filteredArtists);
  };

  useEffect(() => {
    console.log("some");
    
    fetchArtist();
  }, []);
  
  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Nail Artists Management</h2>
        <Button variant="primary" onClick={() => handleShowModal()}>
          Add New Artist
        </Button>
      </div>

      <Row className="mb-4">
        <Col md={6}>
          <InputGroup>
            <Form.Control
              placeholder="Search artists..."
              aria-label="Search artists"
            />
            <Button variant="outline-secondary">
              <FaSearch />
            </Button>
          </InputGroup>
        </Col>
      </Row>

      <Row>
        {artists.map((artist) => (
          <Col key={artist.ID} lg={3} md={4} sm={6} className="mb-4">
            <Card className="h-100">
              <Card.Img variant="top" src={artist.User?.ImageUrl} />
              <Card.Body>
                <Card.Title className="d-flex justify-content-between align-items-center">
                  {artist.User?.FullName}
                  <Badge bg={artist.User?.IsDeleted === false ? 'success' : 'warning'}>
                    {artist.User?.IsDeleted === false ? 'Active' : 'Inactive'}
                  </Badge>
                </Card.Title>
                <div className="card-details">
                  <div className="mb-2">
                    <strong>Services:</strong>
                    <div className="mt-1">
                      {artist.ArtistServices?.map((service) => (
                        <Badge key={service.ServiceId} bg="info" className="me-1 mb-1">
                          {service.Service?.Name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="mb-2">
                    <strong>Experience:</strong> {artist.YearsOfExperience}
                  </div>
                  <div className="mb-2">
                    <strong>Level:</strong> {artist.Level}
                  </div>
                  <div className="mb-2">
                    Rating: {artist.AverageRating} <FaStar className="text-warning" />
                  </div>
                </div>
                <div className="d-flex justify-content-between mt-3">
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={() => handleShowModal(artist)}
                  >
                    <FaEdit className="me-1" /> Edit
                  </Button>
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    onClick={() => handleShowDeleteModal(artist)}
                  >
                    <FaTrash className="me-1" /> {artist.User.IsDeleted === true? 'Active' : 'Deactive'}
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Sửa thông tin</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Họ tên</Form.Label>
              <Form.Control
                type="text"
                name="FullName"
                value={formData.FullName}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" name="Email" value={formData.Email} onChange={handleInputChange} required disabled={isSubmitting} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Số điện thoại</Form.Label>
              <Form.Control type="tel" name="PhoneNumber" value={formData.PhoneNumber} onChange={handleInputChange} required disabled={isSubmitting} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Ngày sinh</Form.Label>
              <Form.Control type="date" name="DateOfBirth" value={formData.DateOfBirth} onChange={handleInputChange} required disabled={isSubmitting} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Số năm kinh nghiệm</Form.Label>
              <Form.Control type="number" name="YearsOfExperience" value={formData.YearsOfExperience} onChange={handleInputChange} min="0" required disabled={isSubmitting} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Cấp độ</Form.Label>
              <Form.Select name="Level" value={formData.Level} onChange={handleInputChange} required disabled={isSubmitting}>
                <option value={1}>Beginner</option>
                <option value={2}>Intermediate</option>
                <option value={3}>Expert</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Hình ảnh</Form.Label>
              <Form.Control type="file" onChange={handleImageChange} accept="image/*" disabled={isSubmitting} />
              {formData.ImageUrl && !formData.NewImage && <img src={formData.ImageUrl} alt="Current" className="mt-2" style={{ width: "100px", height: "100px", objectFit: "cover" }} />}
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Dịch vụ</Form.Label>
              <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                <ListGroup>
                  {services.map((service) => (
                    <ListGroup.Item key={service.ID}>
                      <Form.Check 
                        type="checkbox" 
                        id={`${service.ID}`} 
                        label={service.Name}  
                        onChange={() => handleSelectService(service.ID)} 
                        checked={selectedServices.includes(service.ID)}
                        disabled={isSubmitting} 
                      />
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Lịch làm việc</Form.Label>
              <Button 
                variant="outline-primary" 
                className="mb-3" 
                onClick={handleAddArtistStoreForm}
                disabled={isSubmitting}
              >
                Thêm lịch làm việc
              </Button>
              {artistStoreForms.map((form) => (
                <div key={form.id} className="border p-3 mb-3 rounded">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="mb-0">Lịch làm việc mới</h6>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleRemoveArtistStoreForm(form.id)}
                      disabled={isSubmitting}
                    >
                      Xóa
                    </Button>
                  </div>
                  <Form.Group className="mb-2">
                    <Form.Label>Cửa hàng</Form.Label>
                    <Form.Select
                      value={form.StoreId}
                      onChange={(e) => handleArtistStoreFormChange(form.id, "StoreId", e.target.value)}
                      required
                      disabled={isSubmitting}
                    >
                      <option value="">Chọn cửa hàng</option>
                      {stores.map((store) => (
                        <option key={store.ID} value={store.ID}>
                          {store.Address}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Label>Ngày làm việc</Form.Label>
                    <Form.Control
                      type="date"
                      value={form.WorkingDate}
                      onChange={(e) => handleArtistStoreFormChange(form.id, "WorkingDate", e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Label>Giờ bắt đầu</Form.Label>
                    <Form.Control
                      type="time"
                      value={form.StartTime}
                      onChange={(e) => handleArtistStoreFormChange(form.id, "StartTime", e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Label>Giờ kết thúc</Form.Label>
                    <Form.Control
                      type="time"
                      value={form.EndTime}
                      onChange={(e) => handleArtistStoreFormChange(form.id, "EndTime", e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Label>Thời gian giải lao</Form.Label>
                    <Form.Control
                      type="text"
                      value={form.BreakTime}
                      onChange={(e) => handleArtistStoreFormChange(form.id, "BreakTime", e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                  </Form.Group>
                </div>
              ))}
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
                  "Đang cập nhật..."
                </>
              ) : (
                "Cập nhật"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      {
        (selectedArtist?.User !== undefined && selectedArtist?.User !== null) && (
          <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to {selectedArtist.User?.IsDeleted === true? 'active' : 'deactive'} {selectedArtist.User?.FullName}? Customer can {selectedArtist.User?.IsDeleted === true? '' : 'not'} see this artist.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal}>
            Cancel
          </Button>
          <Button variant="danger" onClick={deleteArtist}>
          {selectedArtist.User.IsDeleted === true? 'Active' : 'Deactive'}
          </Button>
        </Modal.Footer>
      </Modal>
        )
      }
    </Container>
  );
};

export default Artists; 