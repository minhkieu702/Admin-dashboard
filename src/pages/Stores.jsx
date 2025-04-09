import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Form, InputGroup, Modal, Spinner } from 'react-bootstrap';
import axiosInstance from "../services/axiosConfig";
import { FaEdit, FaEye, FaSearch } from "react-icons/fa";
import Pagination from "../components/Pagination";

const Stores = () => {
    const pageSizeOptions = [8, 16, 24, 32];
    const apiKey = 'acgv5qe4CqAiZV3MCMWmMdbpMMvSX4qqyNyvPLsE'

    const [stores, setStores] = useState([]);
    const [selectedStore, setSelectedStore] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [pageSize, setPageSize] = useState(pageSizeOptions[0]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [formData, setFormData] = useState({
        ImageUrl: "",
        Description: "",
        Address: "",
        Province: "",
        Latitude: "",
        Longtitude: "",
        Status: "",
        NewImage:null
    });

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      console.log(name, value);
      
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    };
    
    const handleShowDeleteModal = (Store) => {
      setSelectedStore(Store);
      setShowDeleteModal(true);
    };
  
    const handleCloseDeleteModal = () =>{
      fetchStores();
      setSelectedStore(false)
      setShowDeleteModal(false)
    }

    const fetchStores = async () => {
        try {
          const uri = "/odata/store?";
          const filter = searchTerm ? `$filter=contains(concat(address,description),'${searchTerm}')&`:  '';
          const count = `$count=true`;
          const skip = currentPage * pageSize;
          const pagination = `&$top=${pageSize}&$skip=${skip}`;
          const selectStore = `&$select=id,province,description,address,imageUrl,latitude,longtitude,isDeleted,averageRating,status`;
    
          const res = await axiosInstance.get(`${uri}${filter}${count}${pagination}${selectStore}`);
          console.log(res);
          
          const totalCountValue = res["@odata.count"] ?? 0;
          setTotalCount(totalCountValue)
          setTotalPages(Math.ceil(totalCountValue / pageSize));
          
          const storesRes = res.value;
          setStores(storesRes);
        } catch (error) {
          console.error("Error fetching stores:", error);
        }
      };
    
      useEffect(() => {
        fetchStores();        
      }, [currentPage, pageSize, searchTerm])

      const deleteStore = async () => {
        console.log(selectedStore.IsDeleted);
        
        try {
          await axiosInstance.patch(`/api/Store?id=${selectedStore.ID}`, {
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
  
      const updateStore = async (id, formDataToSend) => {
        try {
          // Log all values in FormData
          console.log("FormData contents:");
          for (let pair of formDataToSend.entries()) {
            console.log(pair[0] + ': ' + pair[1]);
          }
            
          await axiosInstance.put(`/api/Store?id=${id}`, formDataToSend, {
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
    
      const createStore = async (formDataToSend) => {
        try {
          // Log all values in FormData
          console.log("FormData contents:");
          for (let pair of formDataToSend.entries()) {
            console.log(pair[0] + ': ' + pair[1]);
          }
            
          await axiosInstance.post(`/api/Store`, formDataToSend, {
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

      const handleCloseModal = () => {
        setShowModal(false);
        setSelectedStore(null);
      };    
      
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null) {
          console.log(formData[key]);
          
          formDataToSend.append(key, formData[key]);
        }
      });

      if (selectedStore) {
        await updateStore(selectedStore.ID, formDataToSend);
      } else {
        await createStore(formDataToSend);
      }

      handleCloseModal();
      fetchStores();
    } catch (error) {
      console.error("Error saving store:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({
      ...prev,
      NewImage: file,
      ImageUrl: URL.createObjectURL(file)
    }));
  };

      const handleSearch = (e) =>  {
        const search = e.target.value
        setSearchTerm(search);
        setCurrentPage(0)
      }

      const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
      };

      const handleShowModal = (store = null) => {
        if (store) {
          setSelectedStore(store);
          console.log(store.Status);
          
          setFormData({
            Province: store.Province,
            Address: store.Address,
            Description: store.Description,
            ImageUrl: store.ImageUrl,
            NewImage: null,
            Status: store.Status,
            IsDeleted: store.IsDeleted,
            Latitude: store.Latitude,
            Longtitude: store.Longtitude
          });
        } else {
          setSelectedStore(null);
          setFormData({
            Province: "",
            Address: "",
            Description: "",
            ImageUrl: "",
            NewImage: null,
            Status: 0,
            IsDeleted: true,
            Latitude: null,
            Longtitude: null
          });
        }
        setShowModal(true);
      };

      return(
        <Container fluid>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>stores</h2>
            <Button variant="primary">Add New store</Button>
          </div>
    
          <div className="mb-4">
            <Row>
              <Col md={6}>
                <InputGroup>
                  <Form.Control
                    placeholder="Search stores..."
                    aria-label="Search stores"
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
          </div>
    
          <Row>
            {stores.map((store) => (
              <Col key={store.ID} lg={3} md={4} sm={6} className="mb-4">
                <Card className="h-100">
                  <Card.Img variant="top" src={store.ImageUrl} />
                  <Card.Body>
                    <Card.Title>{store.Address}</Card.Title>
                    <Card.Text>
                      Province: {store.Province}
                    </Card.Text>
                    <Card.Text>
                    Description: {store.Description}
                    </Card.Text>
                    <Card.Text>
                      Average Rating: {store.AverageRating}
                      </Card.Text>
                    <div className="d-flex justify-content-between">
                      <Button variant="outline-primary" size="sm" onClick={() => handleShowModal(store)}>
                        <FaEdit /> Edit
                      </Button>
                      <Button variant="outline-danger" size="sm" onClick={() => handleShowDeleteModal(store)}>
                        <FaEye /> Delete
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>


          <div className="d-flex justify-content-between align-items-center mt-4">
        <div className="text-muted">
          Showing {stores.length} of {totalCount} artists
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>


          <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{selectedStore ? "Chỉnh sửa Store" : "Thêm Store mới"}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <AddressFormGroup
              formData={formData}
              setFormData={setFormData}
              isSubmitting={isSubmitting}
              apiKey={apiKey}
            />
            <Form.Group className="mb-3">
              <Form.Label>Tỉnh</Form.Label>
              <Form.Control type="text" name="Province" value={formData.Province} onChange={handleInputChange} required disabled={isSubmitting} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Mô tả</Form.Label>
              <Form.Control as="textarea" name="Description" value={formData.Description} onChange={handleInputChange} required disabled={isSubmitting} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Hình ảnh</Form.Label>
              <Form.Control type="file" onChange={handleImageChange} accept="image/*" disabled={isSubmitting} />
              {formData.ImageUrl && !formData.NewImage && <img src={formData.ImageUrl} alt="Current" className="mt-2" style={{ width: "100px", height: "100px", objectFit: "cover" }} />}
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Trạng thái</Form.Label>
              {console.log(formData.Status, formData.Address)}
              <Form.Select name="Status" value={formData.Status} onChange={handleInputChange} required disabled={isSubmitting}>
                <option value={0}>Hoạt động</option>
                <option value={1}>Không hoạt động</option>
              </Form.Select>
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
                  {selectedStore ? "Đang cập nhật..." : "Đang thêm mới..."}
                </>
              ) : selectedStore ? (
                "Cập nhật"
              ) : (
                "Thêm mới"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
          {
        (selectedStore !== undefined && selectedStore !== null) && (
          <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to{" "}
            {selectedStore.IsDeleted === true ? "active" : "deactive"}{" "}
            {selectedStore.Address}? Customer can{" "}
            {selectedStore.IsDeleted === true ? "" : "not"} see this
            store.
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseDeleteModal}>
              Cancel
            </Button>
            <Button variant="danger" onClick={deleteStore}>
              {selectedStore.IsDeleted === true
                ? "Active"
                : "Deactive"}
            </Button>
          </Modal.Footer>
        </Modal>
        )
      }
        </Container>
      )
    
}


const AddressFormGroup = ({ formData, setFormData, isSubmitting, apiKey }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [searchText, setSearchText] = useState(formData.Address || '');
  const [isLoading, setIsLoading] = useState(false);
  const [lastSearchLength, setLastSearchLength] = useState(0);

  useEffect(() => {
    setSearchText(formData.Address || '');
  }, [formData.Address]);

  const handleAddressChange = (e) => {
    const value = e.target.value;
    setSearchText(value);

    // Chỉ gọi API khi độ dài text hiện tại so với lần search trước tăng thêm 3 ký tự
    if (value.length >= 3 && value.length >= lastSearchLength + 3) {
      setIsLoading(true);
      setLastSearchLength(value.length);

      const delayDebounce = setTimeout(async () => {
        try {
          const response = await axiosInstance.get(
            `https://rsapi.goong.io/Place/AutoComplete?api_key=${apiKey}&input=${encodeURIComponent(value)}`
          );
          console.log(response);
          
          setSuggestions(response.predictions || []);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
          setSuggestions([]);
        } finally {
          setIsLoading(false);
        }
      }, 300);

      return () => clearTimeout(delayDebounce);
    } else if (value.length < 3) {
      // Reset khi text ngắn hơn 3 ký tự
      setSuggestions([]);
      setLastSearchLength(0);
    }
  };

  const handleSelectAddress = async (place) => {
    try {
      setIsLoading(true);
      // Gọi API Detail để lấy lat, lng
      const detailResponse = await axiosInstance.get(
        `https://rsapi.goong.io/Place/Detail?place_id=${place.place_id}&api_key=${apiKey}`
      );
console.log(detailResponse);

      const location = detailResponse.result.geometry.location;
      
      setSearchText(place.description);
      setSuggestions([]);
      setLastSearchLength(0);
      
      setFormData(prev => ({
        ...prev,
        Address: place.structured_formatting.main_text,
        Description: place.description,
        Province: place.terms ? place.terms[place.terms.length - 1].value : '',
        Latitude: location.lat,
        Longtitude: location.lng
      }));
    } catch (error) {
      console.error('Error fetching place details:', error);
      // Fallback nếu có lỗi
      setFormData(prev => ({
        ...prev,
        Address: place.description,
        Province: place.terms ? place.terms[place.terms.length - 1].value : ''
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form.Group className="mb-3">
      <Form.Label>Địa chỉ</Form.Label>
      <div className="position-relative">
        <div className="input-group">
          <Form.Control
            type="text"
            value={searchText}
            onChange={handleAddressChange}
            placeholder="Nhập địa chỉ..."
            disabled={isSubmitting}
          />
          {isLoading && (
            <span className="input-group-text">
              <span className="spinner-border spinner-border-sm" />
            </span>
          )}
        </div>
        {suggestions.length > 0 && (
          <ul className="list-group position-absolute w-100" style={{ zIndex: 1000 }}>
            {suggestions.map((place, index) => (
              <li
                key={index}
                className="list-group-item list-group-item-action"
                onClick={() => handleSelectAddress(place)}
              >
                {place.description}
              </li>
            ))}
          </ul>
        )}
      </div>
      {searchText.length > 0 && searchText.length < 3 && (
        <Form.Text className="text-muted">
          Nhập thêm {3 - searchText.length} ký tự để bắt đầu tìm kiếm
        </Form.Text>
      )}
    </Form.Group>
  );
};

export default Stores