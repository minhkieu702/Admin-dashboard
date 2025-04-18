import React, { useEffect, useState } from "react";
import axiosInstance from "@services/axiosConfig";
import { Modal, Form, ListGroup, Button, Spinner } from "react-bootstrap";
import { useParams } from "react-router-dom";
import MyBreadcrumb from "@components/MyBreadcrumb";
import { getArtistStoreStatus } from "../../../services/helper";

const ArtistDetail = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [artist, setArtist] = useState(null);
  const [services, setServices] = useState([]);
  const [stores, setStores] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [artistStoreForms, setArtistStoreForms] = useState([]);
  const { id } = useParams();
  const today = new Date();

  const breadcrumbItems = [
    { label: "Artists", path: "/artists" },
    {
      label: artist?.User?.FullName || "Artist Detail",
      path: `/artists/${id}`,
    },
  ];

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
    setArtistStoreForms((prev) => [
      ...prev,
      {
        id: Date.now(), // unique id for each form
        StoreId: "",
        WorkingDate: "",
        StartTime: "",
        EndTime: "",
        BreakTime: "",
      },
    ]);
  };

  const handleRemoveArtistStoreForm = (formId) => {
    setArtistStoreForms((prev) => prev.filter((form) => form.id !== formId));
  };

  const handleArtistStoreFormChange = (formId, field, value) => {
    setArtistStoreForms((prev) =>
      prev.map((form) => {
        if (form.id === formId) {
          return { ...form, [field]: value };
        }
        return form;
      })
    );
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
    artist.ArtistServices.map((service) => {
      console.log(service.Service.IsDeleted);

      if (service.Service.IsDeleted === false) {
        handleSelectService(service.ServiceId);
      }
    });

    // Add artist stores to forms if they are within 3 days from now

    const validArtistStores = artist.ArtistStores.map((store) => {
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
          BreakTime: store.BreakTime,
        };
      }
      return null; // Hoặc undefined nếu không return gì
    }).filter((store) => store !== null && store !== undefined); // Lọc bỏ giá trị null/undefined

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
      const filter = `$filter=id eq ${id.substring(id.indexOf(":") + 1)}`;
      const selectArtist = `&$select=id,username,yearsOfExperience,level,averageRating`;
      const expandUser = `&$expand=user($select=fullName,email,phoneNumber,imageUrl,dateOfBirth)`;
      const expandArtistStore = `,artistStores($select=storeId,workingDate,startTime,endTime,breakTime,status;$orderby=workingDate desc;$expand=store($select=id,province,address,description,latitude,longtitude,isDeleted))`;
      const expandArtistService = `,artistServices($select=serviceId;$expand=service($select=id,name,description,imageUrl,price,isDeleted))`;

      const res = await axiosInstance.get(
        `${uri}${filter}${selectArtist}${expandUser}${expandArtistService}${expandArtistStore}`
      );

      const artist = res.value[0];
      setArtist(artist);
    } catch (error) {
      console.error("Error fetching artist:", error);
    } finally {
      setIsLoading(false);
    }
  };

const handleUpdateArtistStoreStatus = async (artistStoreId, status) => {
  const formDataToSend = new FormData()
  formDataToSend.append("status", status)
  await axiosInstance.post(`/api/ArtistStoreCommand?artistStoreId=${artistStoreId}`, formDataToSend, {
    headers: {
      "Content-Type": "multipart/form-data",
    }
})
await fetchArtist()
}

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
        console.log(pair[0] + ": " + pair[1]);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
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
        formDataToSend.append(`artistServices[${index}].serviceId`, item);
      });

      artistStoreForms.forEach((item, index) => {
        console.log(`artistStores[${index}].storeId`, item.StoreId);

        formDataToSend.append(`artistStores[${index}].storeId`, item.StoreId);
        formDataToSend.append(
          `artistStores[${index}].workingDate`,
          item.WorkingDate
        );
        formDataToSend.append(
          `artistStores[${index}].startTime`,
          item.StartTime
        );
        formDataToSend.append(`artistStores[${index}].endTime`, item.EndTime);
        formDataToSend.append(
          `artistStores[${index}].breakTime`,
          item.BreakTime
        );
      });

      //   formDataToSend.append('artistServices', JSON.stringify(selectedServices));
      //   formDataToSend.append('artistStores', JSON.stringify(artistStoreForms));
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
      ImageUrl: URL.createObjectURL(file),
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
        <div className="alert alert-info">Không tìm thấy thông tin artist</div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <MyBreadcrumb items={breadcrumbItems} />
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
                    Kinh nghiệm: {artist.YearsOfExperience} năm
                  </p>
                  {artist.AverageRating && (
                    <p className="text-muted">
                      Đánh giá: {artist.AverageRating}/5
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
                Thông tin cá nhân
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
                    <strong className="text-muted">Số điện thoại:</strong>
                    <p className="mb-0">{artist.User.PhoneNumber}</p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="mb-3">
                    <strong className="text-muted">Ngày sinh:</strong>
                    <p className="mb-0">
                      {new Date(artist.User.DateOfBirth).toLocaleDateString(
                        "vi-VN"
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
                Dịch vụ chuyên môn
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
                    );
                  }
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-12">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title border-bottom pb-3">Lịch làm việc</h4>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Ngày làm việc</th>
                      <th>Giờ bắt đầu</th>
                      <th>Giờ kết thúc</th>
                      <th>Thời gian giải lao</th>
                      <th>Địa chỉ</th>
                      <th>Mô tả của cửa hàng</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {artist.ArtistStores?.map((store) => (
                      <tr key={store.StoreId}>
                        <td>
                          {new Date(store.WorkingDate).toLocaleDateString(
                            "vi-VN"
                          )}
                        </td>
                        <td>{store.StartTime}</td>
                        <td>{store.EndTime}</td>
                        <td>{store.BreakTime}</td>
                        <td>{store.Store.Address}</td>
                        <td>{store.Store.Description}</td>
                        <td>
                          {store.Status === 0 ? (
                            <>
                              <Button
                               onClick={() => handleUpdateArtistStoreStatus(store.ID, -1)}
                              >Rejected</Button>
                              <Button
                              onClick={() => handleUpdateArtistStoreStatus(store.ID, 1)}
                              >Accept</Button>
                            </>
                          ) : (
                            getArtistStoreStatus[store.Status]
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <button
          type="button"
          className="btn btn-sm btn-primary"
          onClick={() => handleShowModal()}
        >
          Sửa Thông Tin
        </button>
      </div>
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Sửa thông tin</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Họ ttên</Form.Label>
              <Form.Control
                type="text"
                name="FullNameFullName"
                value={formData.FullName}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="Email"
                value={formData.Email}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Số điện thoại</Form.Label>
              <Form.Control
                type="tel"
                name="PhoneNumber"
                value={formData.PhoneNumber}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Ngày sinh</Form.Label>
              <Form.Control
                type="date"
                name="DateOfBirth"
                value={formData.DateOfBirth}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Số năm kinh nghiệm</Form.Label>
              <Form.Control
                type="number"
                name="YearsOfExperience"
                value={formData.YearsOfExperience}
                onChange={handleInputChange}
                min="0"
                required
                disabled={isSubmitting}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Cấp độ</Form.Label>
              <Form.Select
                name="Level"
                value={formData.Level}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
              >
                <option value={1}>Beginner</option>
                <option value={2}>Intermediate</option>
                <option value={3}>Expert</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Hình ảnh</Form.Label>
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
                  style={{
                    width: "100px",
                    height: "100px",
                    objectFit: "cover",
                  }}
                />
              )}
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
                      onChange={(e) =>
                        handleArtistStoreFormChange(
                          form.id,
                          "StoreId",
                          e.target.value
                        )
                      }
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
                      onChange={(e) =>
                        handleArtistStoreFormChange(
                          form.id,
                          "WorkingDate",
                          e.target.value
                        )
                      }
                      required
                      disabled={isSubmitting}
                    />
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Label>Giờ bắt đầu</Form.Label>
                    <Form.Control
                      type="time"
                      value={form.StartTime}
                      onChange={(e) =>
                        handleArtistStoreFormChange(
                          form.id,
                          "StartTime",
                          e.target.value
                        )
                      }
                      required
                      disabled={isSubmitting}
                    />
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Label>Giờ kết thúc</Form.Label>
                    <Form.Control
                      type="time"
                      value={form.EndTime}
                      onChange={(e) =>
                        handleArtistStoreFormChange(
                          form.id,
                          "EndTime",
                          e.target.value
                        )
                      }
                      required
                      disabled={isSubmitting}
                    />
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Label>Thời gian giải lao</Form.Label>
                    <Form.Control
                      type="text"
                      value={form.BreakTime}
                      onChange={(e) =>
                        handleArtistStoreFormChange(
                          form.id,
                          "BreakTime",
                          e.target.value
                        )
                      }
                      required
                      disabled={isSubmitting}
                    />
                  </Form.Group>
                </div>
              ))}
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={handleCloseModal}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  "Đang cập nhật..."
                </>
              ) : (
                "Cập nhật"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default ArtistDetail;
