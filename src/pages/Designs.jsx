import React, { useState, useEffect } from 'react';
import { Modal, ListGroup, Button, Form, InputGroup, Spinner, Container } from 'react-bootstrap';
import { FaChevronDown, FaChevronRight, FaFire, FaStar, FaPencilAlt, FaTrashAlt, FaPlus, FaSearch } from 'react-icons/fa';
import axiosInstance from '../services/axiosConfig';

const Designs = () => {
  const [designs, setDesigns] = useState([]);
  console.log("designs", designs);
const [expandedDesigns, setExpandedDesigns] = useState(new Set());
const [designDetails, setDesignDetails] = useState({});
const [showModal, setShowModal] = useState(false);
const [isLoading, setIsLoading] = useState(false);
const [isSubmitting, setIsSubmitting] = useState(false);
const [formData, setFormData] = useState({
  Name: "",
  TrendScore: 0,
  Description: "",
  ColorIds: [],
  OccasionIds: [],
  SkintoneIds: [],
  PaintTypeIds: [],
  medias: [],
  nailDesigns: []
});
const [colors, setColors] = useState([]);
const [occasions, setOccasions] = useState([]);
const [skintones, setSkintones] = useState([]);
const [paintTypes, setPaintTypes] = useState([]);
const [services, setServices] = useState([]);
const [editingDesign, setEditingDesign] = useState(null);

useEffect(() => {
  const getDesigns = async () => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.get(`/odata/design?$select=id,name,description,trendscore,averageRating&$expand=medias($orderby=numerialOrder asc;$top=1;$select=imageUrl)`);
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

const handleShowModal = () => {
  setShowModal(true);
};

const handleCloseModal = () => {
  setShowModal(false);
  setEditingDesign(null);
  setFormData({
    Name: "",
    TrendScore: 0,
    Description: "",
    ColorIds: [],
    OccasionIds: [],
    SkintoneIds: [],
    PaintTypeIds: [],
    medias: [],
    nailDesigns: []
  });
};

const handleInputChange = (e) => {
  const { name, value } = e.target;
  
  if (name === 'TrendScore') {
    const score = parseFloat(value);
    if (isNaN(score) || score < 0 || score > 100) {
      alert("Trend Score phải từ 0-100");
      return;
    }
  }

  setFormData((prev) => ({
    ...prev,
    [name]: value
  }));
};

const handleCheckboxChange = (id, field) => {
  setFormData((prev) => ({
    ...prev,
    [field]: prev[field].includes(id) ? prev[field].filter((item) => item !== id) : [...prev[field], id]
  }));
};

const handleMediaChange = (e) => {
  const files = Array.from(e.target.files || []);
  
  if (files.length > 10) {
    alert("Vui lòng chọn tối đa 10 hình ảnh");
    e.target.value = '';
    return;
  }

  const invalidFiles = files.filter(file => {
    if (file.size > 5 * 1024 * 1024) return true;
    if (!file.type.match('image.*')) return true;
    return false;
  });

  if (invalidFiles.length > 0) {
    alert("Một số file không hợp lệ. Vui lòng chọn file hình ảnh < 5MB");
    e.target.value = '';
    return;
  }

  setFormData((prev) => ({
    ...prev,
    medias: files.map((file, index) => ({
      newImage: file,
      imageUrl: URL.createObjectURL(file),
      numerialOrder: index + 1
    }))
  }));
};

const handleNailDesignChange = (e, index) => {
  const { name, value } = e.target;
  setFormData((prev) => ({
    ...prev,
    nailDesigns: prev.nailDesigns.map((design, i) => (i === index ? { ...design, [name]: value } : design))
  }));
};

const addNailDesign = () => {
  setFormData((prev) => ({
    ...prev,
    nailDesigns: [
      ...prev.nailDesigns,
      {
        newImage: null,
        imageUrl: "",
        nailPosition: 0,
        isLeft: true,
        nailDesignServices: []
      }
    ]
  }));
};

const removeNailDesign = (index) => {
  setFormData((prev) => ({
    ...prev,
    nailDesigns: prev.nailDesigns.filter((_, i) => i !== index)
  }));
};

const handleEditClick = async (design) => {
  setEditingDesign(design);
  setIsLoading(true);
  try {
    await getDesignDetails(design.ID);
    console.log("designDetails", designDetails);
    setShowModal(true);
  } catch (error) {
    console.error("Error loading design details:", error);
    alert("Không thể tải thông tin design. Vui lòng thử lại sau.");
  } finally {
    setIsLoading(false);
  }
};

const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!formData.Name.trim()) {
    alert("Vui lòng nhập tên design");
    return;
  }
  
  if (!formData.TrendScore) {
    alert("Vui lòng nhập Trend Score");
    return;
  }

  if (!formData.Description.trim()) {
    alert("Vui lòng nhập mô tả");
    return;
  }

  setIsSubmitting(true);
  try {
    const formDataToSend = new FormData();

    formDataToSend.append("Name", formData.Name);
    formDataToSend.append("TrendScore", parseFloat(formData.TrendScore));
    formDataToSend.append("Description", formData.Description);

    formData.ColorIds.forEach((id, index) => {
      formDataToSend.append(`ColorIds[${index}]`, id);
    });

    formData.OccasionIds.forEach((id, index) => {
      formDataToSend.append(`OccasionIds[${index}]`, id);
    });

    formData.SkintoneIds.forEach((id, index) => {
      formDataToSend.append(`SkintoneIds[${index}]`, id);
    });

    formData.PaintTypeIds.forEach((id, index) => {
      formDataToSend.append(`PaintTypeIds[${index}]`, id);
    });

    formData.medias.forEach((media, index) => {
      if (media.newImage) {
        formDataToSend.append(`medias[${index}].newImage`, media.newImage);
        formDataToSend.append(`medias[${index}].numerialOrder`, media.numerialOrder);
      }
    });

    formData.nailDesigns.forEach((design, index) => {
      if (design.newImage) {
        formDataToSend.append(`nailDesigns[${index}].newImage`, design.newImage);
      }
      if (design.imageUrl) {
        formDataToSend.append(`nailDesigns[${index}].imageUrl`, design.imageUrl);
      }
      formDataToSend.append(`nailDesigns[${index}].nailPosition`, design.nailPosition);
      formDataToSend.append(`nailDesigns[${index}].isLeft`, design.isLeft);

      design.nailDesignServices.forEach((service, serviceIndex) => {
        formDataToSend.append(`nailDesigns[${index}].nailDesignServices[${serviceIndex}].serviceId`, service.serviceId);
        formDataToSend.append(`nailDesigns[${index}].nailDesignServices[${serviceIndex}].extraPrice`, service.extraPrice);
      });
    });

    if (editingDesign) {
      await axiosInstance.put(`/api/Design?id=${editingDesign.ID}`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
    } else {
      await axiosInstance.post("/api/Design", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
    }

    handleCloseModal();
    const res = await axiosInstance.get(`/odata/design?$select=id,name,description,trendscore,averageRating&$expand=medias($orderby=numerialOrder asc;$top=1;$select=imageUrl)`);
    setDesigns(res.value);
  } catch (error) {
    console.error("Error saving design:", error);
    if (error.response?.data?.errors) {
      console.error("Validation errors:", error.response.data.errors);
    }
  } finally {
    setIsSubmitting(false);
  }
};

const getDesignDetails = async (id) => {
  setIsLoading(true);
  try {
    const designRes = await axiosInstance.get(`/odata/design?$filter=id eq ${id}&$select=id,name,description,trendscore&$expand=medias($select=numerialOrder,imageUrl,mediatype),nailDesigns($select=id,imageUrl,nailposition,isleft),preferences`);
    const design = designRes.value[0];
   

    const nailDesignServiceRequests = design.NailDesigns.map((NailDesign) => axiosInstance.get(`/odata/NailDesignService?$filter=nailDesignId eq ${NailDesign.ID}&$select=id,serviceId`));
    const nailDesignServicesRes = await Promise.all(nailDesignServiceRequests);

    const nailDesignServices = nailDesignServicesRes.reduce((acc, res, index) => {
      acc[design.NailDesigns[index].ID] = res.value ?? [];
      return acc;
    }, {});

    const allServices = Object.values(nailDesignServices).flat();
    const serviceIds = [...new Set(allServices.map((service) => service?.ServiceId))];

    const serviceRequests = serviceIds.map((serviceId) => axiosInstance.get(`/odata/service?$filter=id eq ${serviceId}&$select=id,name,imageUrl,price,averageDuration`));
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
    console.log("aaaaaaa", design);
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
    formData.medias.forEach(media => {
      if (media.imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(media.imageUrl);
      }
    });
  };
}, [formData.medias]);

// Thêm useEffect để theo dõi designDetails
useEffect(() => {
  if (editingDesign && designDetails[editingDesign.ID]) {
    const designDetail = designDetails[editingDesign.ID];
    
    // Lọc Preferences theo type và lấy Data
    const colors = designDetail.Preferences?.filter(p => p.PreferenceType === 0).map(p => p.Data) || [];
    const occasions = designDetail.Preferences?.filter(p => p.PreferenceType === 1).map(p => p.Data) || [];
    const paintTypes = designDetail.Preferences?.filter(p => p.PreferenceType === 2).map(p => p.Data) || [];
    const skintones = designDetail.Preferences?.filter(p => p.PreferenceType === 3).map(p => p.Data) || [];

    setFormData({
      Name: designDetail.Name,
      TrendScore: designDetail.TrendScore,
      Description: designDetail.Description,
      ColorIds: colors.map(c => c.ID),
      OccasionIds: occasions.map(o => o.ID),
      SkintoneIds: skintones.map(s => s.ID),
      PaintTypeIds: paintTypes.map(p => p.ID),
      medias: designDetail.Medias?.map(m => ({
        imageUrl: m.ImageUrl,
        numerialOrder: m.NumerialOrder
      })) || [],
      nailDesigns: designDetail.NailDesigns?.map(nd => ({
        imageUrl: nd.ImageUrl,
        nailPosition: nd.NailPosition,
        isLeft: nd.IsLeft,
        nailDesignServices: nd.nailDesignServices?.map(nds => ({
          serviceId: nds.ServiceId,
          extraPrice: nds.ExtraPrice
        })) || []
      })) || []
    });
  }
}, [designDetails, editingDesign]);

return (
  <>
    
  <Container className="w-100 fade-in p-4">
    <div className="card-header bg-white py-3">
      <div className="d-flex justify-content-between align-items-center">
        <h5 className="card-title mb-0">Design management</h5>
        <div className="d-flex gap-2">
          <div className="position-relative">
            <input
              type="search"
              className="form-control form-control-sm"
              placeholder="Search design..."
              aria-label="Search"
            />
            <span className="position-absolute top-50 end-2 translate-middle-y text-muted">
              <FaSearch size={14} />
            </span>
          </div>
          <button type="button" className="btn btn-sm btn-primary d-flex align-items-center gap-1" onClick={handleShowModal}>
            <FaPlus size={14} /> Add New Design
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
                <th style={{ width:"50px" }}></th>
                <th>Image</th>
                <th>Design Name</th>
                <th>Description</th>
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
                    <td>{design.Description}</td>
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
                          onClick={() => handleEditClick(design)}
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
                          <h6 className="mb-3">Design details</h6>
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
        <Modal.Title>{editingDesign ? 'Chỉnh sửa Design' : 'Thêm Design mới'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Tên Design</Form.Label>
            <Form.Control type="text" name="Name" value={formData.Name} onChange={handleInputChange} required disabled={isSubmitting} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Trend Score</Form.Label>
            <Form.Control type="number" name="TrendScore" value={formData.TrendScore} onChange={handleInputChange} required disabled={isSubmitting} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Mô tả</Form.Label>
            <Form.Control as="textarea" name="Description" value={formData.Description} onChange={handleInputChange} required disabled={isSubmitting} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Màu sắc</Form.Label>
            <div style={{ maxHeight: "200px", overflowY: "auto" }}>
              <ListGroup>
                {colors.map((color) => (
                  <ListGroup.Item key={color.id}>
                    <Form.Check type="checkbox" id={`color-${color.id}`} label={color.colorName} checked={formData.ColorIds.includes(color.id)} onChange={() => handleCheckboxChange(color.id, "ColorIds")} disabled={isSubmitting} />
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </div>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Dịp</Form.Label>
            <div style={{ maxHeight: "200px", overflowY: "auto" }}>
              <ListGroup>
                {occasions.map((occasion) => (
                  <ListGroup.Item key={occasion.id}>
                    <Form.Check type="checkbox" id={`occasion-${occasion.id}`} label={occasion.name} checked={formData.OccasionIds.includes(occasion.id)} onChange={() => handleCheckboxChange(occasion.id, "OccasionIds")} disabled={isSubmitting} />
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </div>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Màu da</Form.Label>
            <div style={{ maxHeight: "200px", overflowY: "auto" }}>
              <ListGroup>
                {skintones.map((skintone) => (
                  <ListGroup.Item key={skintone.id}>
                    <Form.Check type="checkbox" id={`skintone-${skintone.id}`} label={skintone.name} checked={formData.SkintoneIds.includes(skintone.id)} onChange={() => handleCheckboxChange(skintone.id, "SkintoneIds")} disabled={isSubmitting} />
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </div>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Loại sơn</Form.Label>
            <div style={{ maxHeight: "200px", overflowY: "auto" }}>
              <ListGroup>
                {paintTypes.map((paintType) => (
                  <ListGroup.Item key={paintType.id}>
                    <Form.Check type="checkbox" id={`paintType-${paintType.id}`} label={paintType.name} checked={formData.PaintTypeIds.includes(paintType.id)} onChange={() => handleCheckboxChange(paintType.id, "PaintTypeIds")} disabled={isSubmitting} />
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </div>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Hình ảnh Design</Form.Label>
            <Form.Control type="file" multiple onChange={handleMediaChange} accept="image/*" disabled={isSubmitting} />
            <div className="d-flex flex-wrap gap-2 mt-2">
              {formData.medias.map((media, index) => (
                <img key={index} src={media.imageUrl} alt={`Design ${index + 1}`} style={{ width: "100px", height: "100px", objectFit: "cover" }} />
              ))}
            </div>
          </Form.Group>

          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="mb-0">Nail Designs</h6>
              <Button variant="outline-primary" size="sm" onClick={addNailDesign} disabled={isSubmitting}>
                <FaPlus size={14} className="me-1" /> Thêm Nail Design
              </Button>
            </div>
            {formData.nailDesigns.map((design, index) => (
              <div key={index} className="border p-3 mb-3 rounded">
                <div className="d-flex justify-content-between mb-2">
                  <h6 className="mb-0">Nail Design {index + 1}</h6>
                  <Button variant="outline-danger" size="sm" onClick={() => removeNailDesign(index)} disabled={isSubmitting}>
                    <FaTrashAlt size={14} />
                  </Button>
                </div>
                <Form.Group className="mb-2">
                  <Form.Label>Hình ảnh</Form.Label>
                  <Form.Control
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      handleNailDesignChange(
                        {
                          target: {
                            name: "newImage",
                            value: file
                          }
                        },
                        index
                      );
                      handleNailDesignChange(
                        {
                          target: {
                            name: "imageUrl",
                            value: URL.createObjectURL(file)
                          }
                        },
                        index
                      );
                    }}
                    accept="image/*"
                    disabled={isSubmitting}
                  />
                  {design.imageUrl && <img src={design.imageUrl} alt={`Nail Design ${index + 1}`} className="mt-2" style={{ width: "100px", height: "100px", objectFit: "cover" }} />}
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Vị trí</Form.Label>
                  <Form.Control type="number" name="nailPosition" value={design.nailPosition} onChange={(e) => handleNailDesignChange(e, index)} required disabled={isSubmitting} />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Bên</Form.Label>
                  <Form.Select name="isLeft" value={design.isLeft} onChange={(e) => handleNailDesignChange(e, index)} required disabled={isSubmitting}>
                    <option value={true}>Trái</option>
                    <option value={false}>Phải</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Dịch vụ</Form.Label>
                  <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                    <ListGroup>
                      {services.map((service) => (
                        <ListGroup.Item key={service.ID}>
                          <Form.Check
                            type="checkbox"
                            id={`service-${service.ID}-${index}`}
                            label={`${service.Name} - ${service.Price.toLocaleString()}đ`}
                            checked={design.nailDesignServices.some((s) => s.serviceId === service.ID)}
                            onChange={() => {
                              const newServices = design.nailDesignServices.some((s) => s.serviceId === service.ID) ? design.nailDesignServices.filter((s) => s.serviceId !== service.ID) : [...design.nailDesignServices, { serviceId: service.ID, extraPrice: 0 }];
                              handleNailDesignChange(
                                {
                                  target: {
                                    name: "nailDesignServices",
                                    value: newServices
                                  }
                                },
                                index
                              );
                            }}
                            disabled={isSubmitting}
                          />
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </div>
                </Form.Group>
              </div>
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button variant="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                Đang thêm mới...
              </>
            ) : (
              "Thêm mới"
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  </Container>
  </>
);
};

export default Designs; 