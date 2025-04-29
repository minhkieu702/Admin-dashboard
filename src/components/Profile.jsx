import React, { useEffect, useState } from "react";
import axiosInstance from "../services/axiosConfig";
import { Modal, Form, ListGroup, Button, Spinner } from "react-bootstrap";
import { jwtDecode } from "jwt-decode";

const Profile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [artist, setArtist] = useState(null);
  const [services, setServices] = useState([]);
  const [stores, setStores] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [artistStoreForms, setArtistStoreForms] = useState([]);
  const [certificateForms, setCertificateForms] = useState([]);
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
    certificates: [],
  });
  const [selectedServices, setSelectedServices] = useState([]);
  const decodedToken = jwtDecode(localStorage.getItem("token"));
  const id = decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"]

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const uri = "/odata/service?";
      const filter = `$filter=isDeleted eq false`;
      const selectService = `&$select=id,name,description,imageUrl,price`;

      const res = await axiosInstance.get(`${uri}${filter}${selectService}`);
      const servicesRes = res.value;
      setServices(servicesRes);
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStores = async () => {
    setIsLoading(true);
    try {
      const uri = "/odata/store?";
      const filter = `$filter=isDeleted eq false`;
      const selectStore = `&$select=id,province,description,address,imageUrl,latitude,longtitude`;

      const res = await axiosInstance.get(`${uri}${filter}${selectStore}`);
      const storesRes = res.value;
      setStores(storesRes);
    } catch (error) {
      console.error("Error fetching stores:", error);
    } finally {
      setIsLoading(false);
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

  const handleCertificateForm = () => {
    setCertificateForms(prev => [...prev, {
      numerialOrder: 0,
      title: "",
      description: "",
      newImage: null,
      imageUrl: ""
    }]);
  };

  const handleRemoveCertificateForm = (formId) => {
    setCertificateForms(prev => prev.filter(form => form.id !== formId));
  }

  const handleCertificateFormChange = (formId, field, value) => {
    setCertificateForms(prev => {
      // If changing numerialOrder, check for duplicates
      if (field === "numerialOrder") {
        const newValue = parseInt(value);
        // Check if the new value already exists in other forms
        const isDuplicate = prev.some(form => 
          form.id !== formId && form.numerialOrder === newValue
        );
        
        if (isDuplicate) {
          // Find the next available number
          let nextAvailable = newValue;
          while (prev.some(form => form.id !== formId && form.numerialOrder === nextAvailable)) {
            nextAvailable++;
          }
          value = nextAvailable;
        }
      }

      return prev.map(form => {
        if (form.id === formId) {
          return { ...form, [field]: value };
        }
        return form;
      });
    });
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

  const handleShowModal = async () => {
    const dateOfBirth = artist.User?.DateOfBirth
        ? new Date(artist.User.DateOfBirth).toISOString().split("T")[0]
        : "";
    setFormData({
        Level: artist.Level || 1,
        YearsOfExperience: artist.YearsOfExperience || 0,
        FullName: artist.User?.FullName || "",
        ImageUrl: artist.User?.ImageUrl || "",
        PhoneNumber: artist.User?.PhoneNumber || "",
        Email: artist.User?.Email || "",
        DateOfBirth: dateOfBirth,
    });

    // Add existing artist services to selectedServices
    artist.ArtistServices.map(service => {        
        if (service.Service.IsDeleted === false) {
            handleSelectService(service.ServiceId)
        }
    });

    // Add existing certificates to certificateForms
    if (artist.Certificates && artist.Certificates.length > 0) {
      const certificateForms = artist.Certificates.map(cert => ({
        id: Date.now() + Math.random(),
        numerialOrder: cert.NumerialOrder || 0,
        title: cert.Title || "",
        description: cert.Description || "",
        imageUrl: cert.ImageUrl || "",
        newImage: null
      }));
      setCertificateForms(certificateForms);
    }

    // Add artist stores to forms if they are within 3 days from now
    
    const validArtistStores = artist.ArtistStores.map(store => {
        const date = new Date(store.WorkingDate);
        if (date > today) {
          const formatTime = (timeString) => {
            if (!timeString) return "";
            return timeString.split(".")[0].slice(0);
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
      if (validArtistStores.length > 0) {
            setArtistStoreForms(validArtistStores);
      }
    
    await fetchServicesAndStores();
    setShowModal(true);
  };

  const fetchArtist = async () => {
    setIsLoading(true);
    try {
      const uri = "/odata/artist?";
      const filter = `$filter=id eq ${id}`;
      const selectArtist = `&$select=id,username,yearsOfExperience,level,averageRating`;
      const expandUser = `&$expand=user($select=fullName,email,phoneNumber,imageUrl,dateOfBirth)`;
      const expandArtistStore = `,artistStores($select=storeId,workingDate,startTime,endTime,breakTime;$orderby=workingDate desc;$expand=store($select=id,province,address,description,latitude,longtitude,isDeleted))`;
      const expandArtistService = `,artistServices($select=serviceId;$expand=service($select=id,name,description,imageUrl,price,isDeleted))`;
      const expandArtistCertificate = `,certificates($select=Id,ArtistId,NumerialOrder,Title,Description,ImageUrl)`

      const res = await axiosInstance.get(
        `${uri}${filter}${selectArtist}${expandUser}${expandArtistService}${expandArtistStore}${expandArtistCertificate}`
      );

      const artist = res.value[0]
      console.log(artist);
      
      setArtist(artist)
      
    } catch (error) {
      console.error("Error fetching artist:", error);
    } finally {
      setIsLoading(false);
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
      // Add selectedServices and artistStoreForms to formData
      selectedServices.forEach((item, index) => {
        formDataToSend.append(`artistServices[${index}].serviceId`,item)})

      artistStoreForms.forEach((item, index) =>{
        formDataToSend.append(`artistStores[${index}].storeId`,item.StoreId)
        formDataToSend.append(`artistStores[${index}].workingDate`,item.WorkingDate)
        formDataToSend.append(`artistStores[${index}].startTime`,item.StartTime)
        formDataToSend.append(`artistStores[${index}].endTime`,item.EndTime)
        formDataToSend.append(`artistStores[${index}].breakTime`,item.BreakTime)
      })

      // Add certificate forms to formData
      certificateForms.forEach((item, index) => {
        formDataToSend.append(`certificates[${index}].numerialOrder`, item.numerialOrder)
        formDataToSend.append(`certificates[${index}].title`, item.title)
        formDataToSend.append(`certificates[${index}].description`, item.description)
        if (item.newImage) {
          formDataToSend.append(`certificates[${index}].newImage`, item.newImage)
        } else if (item.imageUrl) {
          formDataToSend.append(`certificates[${index}].imageUrl`, item.imageUrl)
        }
      })

      await updateArtist(artist.ID, formDataToSend);
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
      certificates: [],
    });

    // Reset selectedServices
    setSelectedServices([]);

    // Reset artistStoreForms
    setArtistStoreForms([]);

    // Close modal
    setShowModal(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({
      ...prev,
      NewImage: file,
      ImageUrl: URL.createObjectURL(file)
    }));
  };

  useEffect(() => {
    fetchArtist();
  }, []);

  if (isLoading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="container py-5">
        <div className="alert alert-info">Artist information not found</div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row mb-5">
        <div className="col-md-12">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="me-4">
                  <img
                    src={artist.User.ImageUrl}
                    alt={artist.User.FullName}
                    className="rounded-circle"
                    style={{
                      width: "200px",
                      height: "200px",
                      objectFit: "cover",
                    }}
                  />
                </div>
                <div>
                  <h2 className="mb-1">{artist.User.FullName}</h2>
                  <p className="text-muted mb-1">Level: {artist.Level}</p>
                  <p className="text-muted">
                    Years of Experience: {artist.YearsOfExperience}
                  </p>
                  {artist.AverageRating && (
                    <p className="text-muted">
                      Rating: {artist.AverageRating}/5
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12 mb-4">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title border-bottom pb-3">
                Personal Information
              </h4>
              <div className="row">
                <div className="col-md-4">
                  <div className="mb-3">
                    <strong className="text-muted">Email:</strong>
                    <p className="mb-0">{artist.User.Email}</p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="mb-3">
                    <strong className="text-muted">Phone Number:</strong>
                    <p className="mb-0">{artist.User.PhoneNumber}</p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="mb-3">
                    <strong className="text-muted">Date of Birth:</strong>
                    <p className="mb-0">
                      {new Date(artist.User.DateOfBirth).toLocaleDateString(
                        "en-US"
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-12 mb-4">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title border-bottom pb-3">
                Professional Services
              </h4>
              <div className="d-flex flex-wrap gap-2">
                {artist.ArtistServices?.map((as) => {
                    if (as.Service.IsDeleted === false) {
                        return (
                            <span
                              key={as.ServiceId}
                              className="badge bg-secondary rounded-pill"
                            >
                              {as.Service.Name}
                            </span>
                          )
                    }
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-12 mb-4">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title border-bottom pb-3">
                Certificates
              </h4>
              <div className="row">
                {artist.Certificates?.map((cert) => (
                  <div key={cert.Id} className="col-md-4 mb-3">
                    <div className="card h-100">
                      {cert.ImageUrl && (
                        <img 
                          src={cert.ImageUrl} 
                          className="card-img-top" 
                          alt={cert.Title}
                          style={{ height: "200px", objectFit: "cover" }}
                        />
                      )}
                      <div className="card-body">
                        <h5 className="card-title">{cert.Title}</h5>
                        <p className="card-text">{cert.Description}</p>
                        <p className="text-muted">Order: {cert.NumerialOrder}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-12">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title border-bottom pb-3">Work Schedule</h4>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Start Time</th>
                      <th>End Time</th>
                      <th>Break Time</th>
                      <th>Address</th>
                      <th>Store Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {artist.ArtistStores?.map((store) => (
                      <tr key={store.StoreId}>
                        <td>
                          {new Date(store.WorkingDate).toLocaleDateString(
                            "en-US"
                          )}
                        </td>
                        <td>{store.StartTime.slice(0,5)}</td>
                        <td>{store.EndTime.slice(0,5)}</td>
                        <td>{store.BreakTime}</td>
                        <td>{store.Store.Address}</td>
                        <td>{store.Store.Description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <button type="button" className="btn btn-sm btn-primary" onClick={() => handleShowModal()}>
            Modify Profile
          </button>
      </div>
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Modify Profile</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
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
              <Form.Label>Phone Number</Form.Label>
              <Form.Control type="tel" name="PhoneNumber" value={formData.PhoneNumber} onChange={handleInputChange} required disabled={isSubmitting} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Date of Birth</Form.Label>
              <Form.Control type="date" name="DateOfBirth" value={formData.DateOfBirth} onChange={handleInputChange} required disabled={isSubmitting} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Profile Image</Form.Label>
              <Form.Control type="file" onChange={handleImageChange} accept="image/*" disabled={isSubmitting} />
              {formData.ImageUrl && !formData.NewImage && <img src={formData.ImageUrl} alt="Current" className="mt-2" style={{ width: "100px", height: "100px", objectFit: "cover" }} />}
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Professional Services</Form.Label>
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
              <Form.Label>Work Schedule</Form.Label>
              <Button 
                variant="outline-primary" 
                className="mb-3" 
                onClick={handleAddArtistStoreForm}
                disabled={isSubmitting}
              >
                Add Schedule
              </Button>
              {artistStoreForms.map((form) => (
                <div key={form.id} className="border p-3 mb-3 rounded">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="mb-0">New Schedule</h6>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleRemoveArtistStoreForm(form.id)}
                      disabled={isSubmitting}
                    >
                      Remove
                    </Button>
                  </div>
                  <Form.Group className="mb-2">
                    <Form.Label>Store</Form.Label>
                    <Form.Select
                      value={form.StoreId}
                      onChange={(e) => handleArtistStoreFormChange(form.id, "StoreId", e.target.value)}
                      required
                      disabled={isSubmitting}
                    >
                      <option value="">Select Store</option>
                      {stores.map((store) => (
                        <option key={store.ID} value={store.ID}>
                          {store.Address}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Label>Working Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={form.WorkingDate}
                      onChange={(e) => handleArtistStoreFormChange(form.id, "WorkingDate", e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Label>Start Time</Form.Label>
                    <Form.Control
                      type="time"
                      value={form.StartTime}
                      onChange={(e) => handleArtistStoreFormChange(form.id, "StartTime", e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Label>End Time</Form.Label>
                    <Form.Control
                      type="time"
                      value={form.EndTime}
                      onChange={(e) => handleArtistStoreFormChange(form.id, "EndTime", e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Label>Break Time</Form.Label>
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

            <Form.Group className="mb-3">
              <Form.Label>Certificates</Form.Label>
              <Button 
                variant="outline-primary" 
                className="mb-3" 
                onClick={handleCertificateForm}
                disabled={isSubmitting}
              >
                Add Certificate
              </Button>
              {certificateForms.map((form) => (
                <div key={form.id} className="border p-3 mb-3 rounded">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="mb-0">Certificate</h6>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleRemoveCertificateForm(form.id)}
                      disabled={isSubmitting}
                    >
                      Remove
                    </Button>
                  </div>
                  <Form.Group className="mb-2">
                    <Form.Label>Order</Form.Label>
                    <Form.Control
                      type="number"
                      value={form.numerialOrder}
                      onChange={(e) => handleCertificateFormChange(form.id, "numerialOrder", e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Label>Title</Form.Label>
                    <Form.Control
                      type="text"
                      value={form.title}
                      onChange={(e) => handleCertificateFormChange(form.id, "title", e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      value={form.description}
                      onChange={(e) => handleCertificateFormChange(form.id, "description", e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Label>Certificate Image</Form.Label>
                    <Form.Control
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        handleCertificateFormChange(form.id, "newImage", file);
                        handleCertificateFormChange(form.id, "imageUrl", URL.createObjectURL(file));
                      }}
                      accept="image/*"
                      disabled={isSubmitting}
                    />
                    {form.imageUrl && !form.newImage && (
                      <img 
                        src={form.imageUrl} 
                        alt="Current Certificate" 
                        className="mt-2" 
                        style={{ width: "100px", height: "100px", objectFit: "cover" }} 
                      />
                    )}
                  </Form.Group>
                </div>
              ))}
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
    </div>
  );
};

export default Profile;