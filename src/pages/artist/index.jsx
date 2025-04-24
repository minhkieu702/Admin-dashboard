import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup, Badge, Modal, Spinner, ListGroup, Table, Image } from 'react-bootstrap';
import { FaSearch, FaEdit, FaTrash, FaStar } from 'react-icons/fa';
import axiosInstance from '@services/axiosConfig';
import Pagination from '@components/Pagination';
import { useNavigate } from 'react-router-dom';

const Artists = () => {
  const pageSizeOptions = [8, 16, 24, 32];
  const [artists, setArtists] = useState([]);
  const [services, setServices] = useState([]);
  const [stores, setStores] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [artistStoreForms, setArtistStoreForms] = useState([]);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pageSize, setPageSize] = useState(pageSizeOptions[0]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

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
      const filter = `$filter=isDeleted eq false&`;
      const count = `$count=true`;
      const skip = currentPage * pageSize;
      const pagination = `&$top=${pageSize}&$skip=${skip}`;
      const selectStore = `&$select=id,province,description,address,imageUrl,latitude,longtitude`;

      const res = await axiosInstance.get(`${uri}${filter}${count}${pagination}${selectStore}`);
      
      const totalCount = res["@odata.count"] ?? 0;
      setTotalPages(Math.ceil(totalCount / pageSize));
      
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
  const navigate = useNavigate();
  const handleShowModal = async (artist) => {
    navigate(`/artist/:${artist.ID}`);

  };

  const fetchArtist = async () => {
    try {
      const uri = "/odata/artist?";
      let filterQuery = "";
      
      // Add search filter if searchTerm exists
      if (searchTerm) {
        filterQuery = `$filter=contains(user/fullName, '${searchTerm}')`;
      }

      const selectArtist = `${filterQuery ? '&' : ''}$select=id,username,yearsOfExperience,level,averageRating`;
      const expandUser = `&$expand=user($select=fullName,email,phoneNumber,imageUrl,dateOfBirth,isDeleted)`;
      const expandArtistStore = `,artistStores($select=storeId,workingDate,startTime,endTime,breakTime;$orderby=workingDate desc;$expand=store($select=id,province,address,description,latitude,longtitude,isDeleted))`;
      const expandArtistService = `,artistServices($select=serviceId;$expand=service($select=id,name,description,imageUrl,price,isDeleted))`;
      const count = `&$count=true`;
      const skip = currentPage * pageSize;
      const pagination = `&$top=${pageSize}&$skip=${skip}`;

      const res = await axiosInstance.get(
        `${uri}${filterQuery}${selectArtist}${expandUser}${expandArtistService}${expandArtistStore}${count}${pagination}`
      );

      const totalCountValue = res["@odata.count"] ?? 0;
      setTotalCount(totalCountValue);
      setTotalPages(Math.ceil(totalCountValue / pageSize));
      
      const artist = res.value;
      setArtists(artist);
      
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
    const file = e.target.files[0];
    setFormData((prev) => ({
      ...prev,
      NewImage: file,
      ImageUrl: URL.createObjectURL(file)
    }));
  };

  const handleSearch = (e) => {
    const searchTerm = e.target.value;
    setSearchTerm(searchTerm);
    setCurrentPage(0); // Reset to first page when searching
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  useEffect(() => {
    fetchArtist();
  }, [currentPage, pageSize, searchTerm]);
  
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
            {pageSizeOptions.map(size => (
              <option key={size} value={size}>
                {size} per page
              </option>
            ))}
          </Form.Select>
        </Col>
      </Row>

   
<Table responsive bordered hover>
  <thead>
    <tr>
      <th>Image</th>
      <th>Full Name</th>
      <th>Status</th>
      <th>Services</th>
      <th>Experience</th>
      <th>Level</th>
      <th>Rating</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {artists.map((artist) => (
      <tr key={artist.ID}>
        <td>
          <Image
            src={artist.User?.ImageUrl}
            alt="Artist"
            thumbnail
            style={{ width: "80px", height: "80px", objectFit: "cover" }}
          />
        </td>
        <td>{artist.User?.FullName}</td>
        <td>
          <Badge bg={artist.User?.IsDeleted === false ? "success" : "warning"}>
            {artist.User?.IsDeleted === false ? "Active" : "Inactive"}
          </Badge>
        </td>
        <td>
          {artist.ArtistServices?.map((service) => (
            <Badge
              key={service.ServiceId}
              bg="info"
              className="me-1 mb-1"
            >
              {service.Service?.Name}
            </Badge>
          ))}
        </td>
        <td>{artist.YearsOfExperience}</td>
        <td>{artist.Level}</td>
        <td>
          {artist.AverageRating} <FaStar className="text-warning" />
        </td>
        <td>
          <Button
            variant="outline-primary"
            size="sm"
            className="me-1"
            onClick={() => handleShowModal(artist)}
          >
            <FaEdit className="me-1" /> View Details
          </Button>
          <Button
          
            variant={artist.User?.IsDeleted === true ? "outline-success" : "outline-danger"}
            size="sm"
            onClick={() => handleShowDeleteModal(artist)}
          >
            <FaTrash className="me-1" />{" "}
            {artist.User?.IsDeleted === true ? "Active" : "Deactive"}
          </Button>
        </td>
      </tr>
    ))}
  </tbody>
</Table>

      <div className="d-flex justify-content-between align-items-center mt-4">
        <div className="text-muted">
          Showing {artists.length} of {totalCount} artists
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
      
      {
  selectedArtist?.User && (
    <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
      <Modal.Header closeButton>
        <Modal.Title>
          {selectedArtist.User.IsDeleted ? 'Confirm Reactivate' : 'Confirm Deactivate'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {selectedArtist.User.IsDeleted ? (
          <>
            Are you sure you want to <strong>reactivate</strong> <strong>{selectedArtist.User.FullName}</strong>?<br />
            Customers will be able to see and book this artist again.
          </>
        ) : (
          <>
            Are you sure you want to <strong>deactivate</strong> <strong>{selectedArtist.User.FullName}</strong>?<br />
            This artist will be hidden from customers.
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleCloseDeleteModal}>
          Cancel
        </Button>
        <Button  variant={selectedArtist.User.IsDeleted ? 'success' : 'danger'} onClick={deleteArtist}>
          {selectedArtist.User.IsDeleted ? 'Reactivate' : 'Deactivate'}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

    </Container>
  );
};

export default Artists; 