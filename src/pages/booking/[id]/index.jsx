import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Table,
  Badge,
  Modal,
  Toast,
  ToastContainer,
  ListGroup,
  Image,
  ProgressBar,
} from "react-bootstrap";
import {
  FaEdit,
  FaTrash,
  FaCalendarCheck,
  FaClock,
  FaUser,
  FaPlus,
  FaFilter,
  FaMapMarkerAlt,
  FaCreditCard,
  FaMoneyBillWave,
  FaCheck,
  FaPlay,
  FaStop,
  FaPhone,
  FaEnvelope,
  FaHourglassStart,
} from "react-icons/fa";
import {
  getId,
  getNameOfFinger,
  getRole,
  getServiceStatusInBooking,
  getSideOfFinger,
} from "@services/helper";
import axiosInstance from "@services/axiosConfig";
import Pagination from "@components/Pagination";
import { useParams, useSearchParams } from "react-router-dom";
import MyBreadcrumb from "@components/MyBreadcrumb";

const BookingDetail = () => {
  const [searchParams] = useSearchParams();
  const [booking, setBooking] = useState();
  const [method, setMethod] = useState(0);
  const [startTimes, setStartTimes] = useState({});
  const [elapsedTimes, setElapsedTimes] = useState({});
  const { id } = useParams();

  const payOnline = async (bookingId) => {
    const formDataToSend = new FormData();
    formDataToSend.append(`paymentDetailRequests[0].bookingId`, bookingId);
    const response = await axiosInstance.post(
      `/api/Payment/PayOSUrl`,
      formDataToSend,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response) {
      window.location.href = response;
    }
  };

  const payOffline = async (bookingId) => {
    const formDataToSend = new FormData();
    formDataToSend.append(`paymentDetailRequests[0].bookingId`, bookingId);
    await axiosInstance.post(`/api/Payment/PaymentForCash`, formDataToSend, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  };

  const postIsServing = async (bookingId) => {
    await axiosInstance.post(`/api/Booking/Serving?id=${bookingId}`);
    const baseUrl = "/odata/booking?";
    const filter = `$filter=ID eq ${id.substring(id.indexOf(":") + 1)}`;
    const select = `&$select=status`;
    const url = `${baseUrl}${filter}${select}`;
    const res = await axiosInstance.get(url);

    // Create a new object to trigger re-render
    setBooking((prevBooking) => ({
      ...prevBooking,
      Status: res.value?.[0].Status,
    }));
  };

  const fetchFeedback = async (typeId) => {
    const res = await axiosInstance.get(
      `/odata/feedback?$filter=typeId eq ${typeId} and bookingId eq ${id.substring(id.indexOf(":") + 1)}&$select=id,typeId,lastModifiedAt,rating,content,feedbackType&$expand=customer($select=id;$expand=user($select=fullname)),feedbackImages($select=id,imageUrl,numerialOrder;$orderby=numerialOrder)`
    )
    return res.value
  }    

  const fetchCustomerSelected = async (customerSelectedID) => {
    const response = await axiosInstance.get(
      `/odata/customerSelected?$filter=id eq ${customerSelectedID}&$select=id,customerID&$expand=customer($select=id,description;$expand=user($select=id,fullname,phoneNumber,imageUrl))`
    );

    const customerSelected = response.value?.[0];

    if (!customerSelected) return null;

    const nailDesignServiceSelecteds = await fetchNailDesignServiceSelecteds(
      customerSelectedID
    );
    customerSelected.NailDesignServiceSelecteds = nailDesignServiceSelecteds;
    return customerSelected;
  };

  const fetchNailDesignServiceSelecteds = async (customerSelectedId) => {
    const response = await axiosInstance.get(
      `/odata/nailDesignServiceSelected?$filter=customerSelectedId eq ${customerSelectedId}&$select=nailDesignServiceId`
    );
    const nailDesignServiceSelecteds = response.value ?? [];

    const nailDesignServicePromises = nailDesignServiceSelecteds.map(
      async (c) => {
        c.NailDesignService = await fetchNailDesignService(
          c.NailDesignServiceId
        );
        return c;
      }
    );

    return await Promise.all(nailDesignServicePromises);
  };

  const fetchNailDesignService = async (nailDesignServiceId) => {
    const response = await axiosInstance.get(
      `/odata/nailDesignService?$filter=id eq ${nailDesignServiceId}&$select=id,nailDesignId,serviceId,extraPrice&$expand=nailDesign($select=id,isLeft,nailPosition;$expand=design($select=id,name,trendScore,description,averagerating))`
    );
    const nailDesignService = response.value?.[0];
    if (!nailDesignService) return null;

    const [service, feedback] = await Promise.all([fetchService(nailDesignService.ServiceId), fetchFeedback(nailDesignService.NailDesign.Design.ID)])
    nailDesignService.Status = -1;
    nailDesignService.Service = service;
    nailDesignService.NailDesign.Design.Feedback = feedback

    return nailDesignService;
  };

  const fetchService = async (serviceId) => {
    const response = await axiosInstance.get(
      `/odata/service?$filter=id eq ${serviceId}&$select=id,name,price&$expand=servicePriceHistories($select=id,price,effectiveFrom,effectiveTo)`
    );
    return response.value?.[0];
  };

  const fetchArtistStore = async (artistStoreId) => {
    const response = await axiosInstance.get(
      `/odata/artistStore?$filter=id eq ${artistStoreId}&$select=id,workingDate,startTime,endTime,storeId,artistId&$expand=store($select=id,imageUrl,description,address),artist($select=id,yearsOfExperience,level;$expand=user($select=id,email,fullname, imageUrl))`
    );

    const artistStore = response.value?.[0]

    const [artistFeedback, storeFeedback] = await Promise.all([
      fetchFeedback(artistStore.ArtistId),
      fetchFeedback(artistStore.StoreId),
    ]);

    artistStore.Artist.Feedback = artistFeedback
    artistStore.Store.Feedback = storeFeedback

    return artistStore
  };

  const fetchBookings = async () => {
    try {
      const baseUrl = "/odata/booking?";
      const filter = `$filter=ID eq ${id.substring(id.indexOf(":") + 1)}`;
      const select = `&$select=id,lastModifiedAt,status,startTime,serviceDate,predictEndTime,totalAmount,customerSelectedId,artistStoreId`;
      const url = `${baseUrl}${filter}${select}`;

      const response = await axiosInstance.get(url);

      const bookingRes = response.value[0];

      const [customerSelected, artistStore] = await Promise.all([
        fetchCustomerSelected(bookingRes.CustomerSelectedId),
        fetchArtistStore(bookingRes.ArtistStoreId),
      ]);

      bookingRes.CustomerSelected = customerSelected;
      bookingRes.ArtistStore = artistStore;

      console.log(bookingRes);
      

      setBooking(bookingRes);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handlePayment = async (bookingId) => {
    method === 0 ? await payOnline(bookingId) : await payOffline(bookingId);
  };

  const handleStartService = async (serviceId) => {
    const now = new Date();
    setStartTimes((prev) => ({ ...prev, [serviceId]: now }));
    setElapsedTimes((prev) => ({ ...prev, [serviceId]: 0 }));

    // Start timer
    const timer = setInterval(() => {
      setElapsedTimes((prev) => {
        const elapsed = Math.floor((new Date() - prev[serviceId]) / 1000);
        return { ...prev, [serviceId]: elapsed };
      });
    }, 1000);

    setBooking((prevBooking) => {
      const updatedBooking = { ...prevBooking };
      const serviceIndex =
        updatedBooking.CustomerSelected.NailDesignServiceSelecteds.findIndex(
          (service) => service.NailDesignService.ServiceId === serviceId
        );
      if (serviceIndex !== -1) {
        updatedBooking.CustomerSelected.NailDesignServiceSelecteds[
          serviceIndex
        ].NailDesignService.Status = 0;
      }
      return updatedBooking;
    });

    // Store timer ID to clear later
    setStartTimes((prev) => ({ ...prev, [`${serviceId}_timer`]: timer }));
  };

  const handleCompleteService = async (serviceId) => {
    // Clear interval
    clearInterval(startTimes[`${serviceId}_timer`]);

    // Calculate duration in minutes
    const startTime = startTimes[serviceId];
    const endTime = new Date();
    const durationInSeconds = Math.floor((endTime - startTime) / 1000);
    const durationInMinutes = Math.ceil(durationInSeconds / 60);

    // Reset times
    setStartTimes((prev) => {
      const newTimes = { ...prev };
      delete newTimes[serviceId];
      delete newTimes[`${serviceId}_timer`];
      return newTimes;
    });
    setElapsedTimes((prev) => {
      const newTimes = { ...prev };
      delete newTimes[serviceId];
      return newTimes;
    });

    // Send duration to API
    const formDataToSend = new FormData();
    formDataToSend.append("ServiceId", serviceId);
    formDataToSend.append("Duration", durationInMinutes);
    await axiosInstance.post("/api/NailDesignService/Time", formDataToSend, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    // Update service status to completed (1)
    setBooking((prevBooking) => {
      const updatedBooking = { ...prevBooking };
      const serviceIndex =
        updatedBooking.CustomerSelected.NailDesignServiceSelecteds.findIndex(
          (service) => service.NailDesignService.ServiceId === serviceId
        );
      if (serviceIndex !== -1) {
        updatedBooking.CustomerSelected.NailDesignServiceSelecteds[
          serviceIndex
        ].NailDesignService.Status = 1;
      }
      return updatedBooking;
    });
  };

  const breadcrumbItems = [
    { label: "Bookings", path: "/bookings" },
    {
      label: `Booking #${id?.substring(id.indexOf(":") + 1)}`,
      path: `/bookings/${id}`,
    },
  ];

  return (
    <Container className="w-100 fade-in p-4">
      <MyBreadcrumb items={breadcrumbItems} />
      {booking && (
        <Row>
          <Col md={8}>
            <Card className="mb-4">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Booking Information</h5>
                <div>
                  <Button
                    disabled={![1, 0].includes(booking.Status)}
                    className="me-2"
                    onClick={() => postIsServing(booking.ID)}
                  >
                    <FaPlay className="me-1" />
                    {getServiceStatusInBooking[booking.Status]}
                  </Button>
                  {console.log(
                    booking.Status,
                    getServiceStatusInBooking[booking.Status]
                  )}
                </div>
              </Card.Header>
              <Card.Body>
                <ListGroup variant="flush">
                  <ListGroup.Item className="d-flex justify-content-between">
                    <span>
                      <FaCalendarCheck className="me-2" />
                      Service Date
                    </span>
                    <span>
                      {new Date(booking.ServiceDate).toLocaleDateString()}
                    </span>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between">
                    <span>
                      <FaClock className="me-2" />
                      Start Time
                    </span>
                    <span>{booking.StartTime.slice(0, 8)}</span>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between">
                    <span>
                      <FaClock className="me-2" />
                      Predict End Time
                    </span>
                    <span>{booking.PredictEndTime.slice(0, 8)}</span>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between">
                    <span>Total Amount</span>
                    <span className="fw-bold">
                    {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(booking.TotalAmount)}
                    </span>
                  </ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>

            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Customer Information</h5>
              </Card.Header>
              <Card.Body>
                <div className="d-flex align-items-center mb-3">
                  <Image
                    src={
                      booking.CustomerSelected?.Customer?.User?.ImageUrl ||
                      "https://via.placeholder.com/100"
                    }
                    roundedCircle
                    width={100}
                    height={100}
                    className="me-3"
                  />
                  <div>
                    <h5 className="mb-1">
                      {booking.CustomerSelected?.Customer?.User?.FullName}
                    </h5>
                    <div className="text-muted">
                      <FaPhone className="me-2" />
                      {booking.CustomerSelected?.Customer?.User?.PhoneNumber}
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>

            <Card>
              <Card.Header>
                <h5 className="mb-0">Services</h5>
              </Card.Header>
              <Card.Body>
                <Table responsive>
                  <thead>
                    <tr>
                      <th>Service</th>
                      <th>Design</th>
                      <th>Position</th>
                      <th>Price</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {booking.CustomerSelected?.NailDesignServiceSelecteds?.map(
                      (service, index, array) => {
                        const isLastOfDesign = index === array.length - 1 || 
                          array[index + 1].NailDesignService.NailDesign.Design.ID !== 
                          service.NailDesignService.NailDesign.Design.ID;
                        
                        return (
                          <React.Fragment key={index}>
                            <tr>
                              <td>{service.NailDesignService?.Service?.Name}</td>
                              <td>
                                <div>
                                  <strong>
                                    {
                                      service.NailDesignService?.NailDesign?.Design
                                        ?.Name
                                    }
                                  </strong>
                                  <div className="text-muted small">
                                    {
                                      service.NailDesignService?.NailDesign?.Design
                                        ?.Description
                                    }
                                  </div>
                                </div>
                              </td>
                              <td>
                                {`${
                                  getNameOfFinger[
                                    service.NailDesignService?.NailDesign
                                      ?.NailPosition
                                  ]
                                } (${
                                  getSideOfFinger[
                                    service.NailDesignService?.NailDesign?.IsLeft
                                  ]
                                })`}
                              </td>
                              <td>
                              {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(service.NailDesignService?.Service?.Price)}
                              </td>
                              <td>
                                {service.NailDesignService?.Status === -1 ? (
                                  <Button
                                    variant="primary"
                                    disabled={booking.Status === 2 ? false : true}
                                    size="sm"
                                    onClick={() =>
                                      handleStartService(
                                        service.NailDesignService?.ServiceId
                                      )
                                    }
                                  >
                                    <FaHourglassStart className="me-1" /> Start
                                    Timer
                                  </Button>
                                ) : service.NailDesignService?.Status === 0 ? (
                                  <Button
                                    variant="success"
                                    size="sm"
                                    onClick={() =>
                                      handleCompleteService(
                                        service.NailDesignService?.ServiceId
                                      )
                                    }
                                  >
                                    <FaCheck className="me-1" /> Complete
                                  </Button>
                                ) : (
                                  <Button
                                    variant="success"
                                    disabled={true}
                                    size="sm"
                                  >
                                    <FaCheck className="me-1" /> Complete
                                  </Button>
                                )}
                              </td>
                            </tr>
                            {isLastOfDesign && service.NailDesignService?.NailDesign?.Design?.Feedback?.length > 0 && (
                              <tr className="bg-light">
                                <td colSpan="5">
                                  <div className="p-3">
                                    {service.NailDesignService?.NailDesign?.Design?.Feedback?.map((feedback, feedbackIndex) => (
                                      <div key={feedbackIndex} className="border-bottom pb-2 mb-2">
                                        <div className="d-flex justify-content-between align-items-center">
                                          <div>
                                            <strong>{feedback.Customer?.User?.FullName}</strong>
                                            <div className="text-muted small">
                                              {new Date(feedback.LastModifiedAt).toLocaleDateString()}
                                            </div>
                                          </div>
                                          <div className="text-warning">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                              <span key={i}>
                                                {i < feedback.Rating ? "★" : "☆"}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                        <p className="mb-0 mt-1">{feedback.Content}</p>
                                        {feedback.FeedbackImages?.length > 0 && (
                                          <div className="d-flex gap-2 mt-2">
                                            {feedback.FeedbackImages.map((image) => (
                                              <Image
                                                key={image.Id}
                                                src={image.ImageUrl}
                                                thumbnail
                                                style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                              />
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      }
                    )}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>

            {booking?.Status == 2 || (booking?.CustomerSelected?.NailDesignServiceSelecteds?.every(
              (c) => c.NailDesignService.Status === 1
            )) && (
              <Card className="mb-4">
                <Card.Header>
                  <div className="d-flex align-items-center">
                    <h5 className="mb-0">Payment</h5>
                  </div>
                </Card.Header>
                <Card.Body>
                  <h6 className="text-uppercase mb-3 text-muted">Payment</h6>
                  <Row className="g-3">
                    <Col md={8}>
                      <Form.Group>
                        <Form.Label className="small text-muted">
                          Select Payment Method
                        </Form.Label>
                        <Form.Select
                          onChange={(e) => setMethod(parseInt(e.target.value))}
                          className="form-select-lg"
                        >
                          <option value="0">Online Banking</option>
                          <option value="1">Cash Payment</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={4} className="d-flex align-items-end">
                      <Button
                        className="w-100 py-3"
                        onClick={() => handlePayment(booking.ID)}
                      >
                        {method === 0 ? (
                          <>
                            <FaCreditCard className="me-2" />
                            Pay Online
                          </>
                        ) : (
                          <>
                            <FaMoneyBillWave className="me-2" />
                            Pay Cash
                          </>
                        )}
                      </Button>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            )}
          </Col>

          <Col md={4}>
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Artist Information</h5>
              </Card.Header>
              <Card.Body>
                <div className="d-flex align-items-center mb-3">
                  <Image
                    src={
                      booking.ArtistStore?.Artist?.User?.ImageUrl ||
                      "https://via.placeholder.com/100"
                    }
                    roundedCircle
                    width={100}
                    height={100}
                    className="me-3"
                  />
                  <div>
                    <h5 className="mb-1">
                      {booking.ArtistStore?.Artist?.User?.FullName}
                    </h5>
                    <div className="text-muted">
                      <FaEnvelope className="me-2" />
                      {booking.ArtistStore?.Artist?.User?.Email}
                    </div>
                  </div>
                </div>
                {booking.ArtistStore?.Artist?.Feedback?.length > 0 && (
                  <div className="mt-3">
                    <h6 className="mb-2">Recent Feedback</h6>
                    {booking.ArtistStore?.Artist?.Feedback?.map((feedback, index) => (
                      <div key={index} className="border-bottom pb-2 mb-2">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <strong>{feedback.Customer?.User?.FullName}</strong>
                            <div className="text-muted small">
                              {new Date(feedback.LastModifiedAt).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="text-warning">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span key={i}>
                                {i < feedback.Rating ? "★" : "☆"}
                              </span>
                            ))}
                          </div>
                        </div>
                        <p className="mb-0 mt-1">{feedback.Content}</p>
                        {feedback.FeedbackImages?.length > 0 && (
                          <div className="d-flex gap-2 mt-2">
                            {feedback.FeedbackImages.map((image) => (
                              <Image
                                key={image.Id}
                                src={image.ImageUrl}
                                thumbnail
                                style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card.Body>
            </Card>

            <Card>
              <Card.Header>
                <h5 className="mb-0">Store Information</h5>
              </Card.Header>
              <Card.Body>
                <div className="mb-3">
                  <Image
                    src={
                      booking.ArtistStore?.Store?.ImageUrl ||
                      "https://via.placeholder.com/300x200"
                    }
                    fluid
                    className="mb-3"
                  />
                  <div className="mb-2">
                    <FaMapMarkerAlt className="me-2" />
                    {booking.ArtistStore?.Store?.Address}
                  </div>
                  <div className="text-muted">
                    {booking.ArtistStore?.Store?.Description}
                  </div>
                </div>
                {booking.ArtistStore?.Store?.Feedback?.length > 0 && (
                  <div className="mt-3">
                    <h6 className="mb-2">Recent Feedback</h6>
                    {booking.ArtistStore?.Store?.Feedback?.map((feedback, index) => (
                      <div key={index} className="border-bottom pb-2 mb-2">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <strong>{feedback.Customer?.User?.FullName}</strong>
                            <div className="text-muted small">
                              {new Date(feedback.LastModifiedAt).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="text-warning">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span key={i}>
                                {i < feedback.Rating ? "★" : "☆"}
                              </span>
                            ))}
                          </div>
                        </div>
                        <p className="mb-0 mt-1">{feedback.Content}</p>
                        {feedback.FeedbackImages?.length > 0 && (
                          <div className="d-flex gap-2 mt-2">
                            {feedback.FeedbackImages.map((image) => (
                              <Image
                                key={image.Id}
                                src={image.ImageUrl}
                                thumbnail
                                style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default BookingDetail;
