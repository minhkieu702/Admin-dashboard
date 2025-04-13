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
  ToastContainer
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
} from "react-icons/fa";
import { getId, getNameOfFinger, getRole, getServiceStatusInBooking, getSideOfFinger } from "../services/helper";
import axiosInstance from "../services/axiosConfig";
import Pagination from "../components/Pagination";
import { useSearchParams } from "react-router-dom";

const Bookings = () => {
  const [searchParams] = useSearchParams();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState("success");
  const pageSizeOptions = [8, 16, 24, 32];
  const [bookings, setBookings] = useState([]);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [expandedBooking, setExpandedBooking] = useState(false);
  const [pageSize, setPageSize] = useState(pageSizeOptions[0]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBookings, setSelectedBookings] = useState([]);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [status, setStatus] = useState(-2);
  const [startAt, setStartAt] = useState("");  
  const [isComplete, setIsComplete] = useState(false);
  const [method, setMethod] = useState(0);
  
  const fetchBasicCustomerInfo = async (customerSelectedID) => {
    const response = await axiosInstance.get(
      `/odata/customerSelected?$filter=id eq ${customerSelectedID}&$select=id,customerID&$expand=customer($select=id,description;$expand=user($select=id,fullname))`
    );
    return response.value?.[0];
  };

  const payOnline = async (bookingId) => {
    const formDataToSend = new FormData()
    formDataToSend.append(`paymentDetailRequests[0].bookingId`,bookingId)
    const response = await axiosInstance.post(`/api/Payment/PayOSUrl`, formDataToSend, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    
    if (response) {
      window.location.href = response;
  }
  }

  const payOffline = async (bookingId) => {
    const formDataToSend = new FormData()
    formDataToSend.append(`paymentDetailRequests[0].bookingId`,bookingId)
    await axiosInstance.post(`/api/Payment/PaymentForCash`, formDataToSend, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  const handleSelectedBooking = (bookingId) => {
    setSelectedBookings((prev) => {
      const newBookings = prev.includes(bookingId)
      ? prev.filter((id) => id !== bookingId)
      : [...prev, bookingId]
      return newBookings
    })
  }

  const postIsServing = async (bookingId) => {
    const res = await axiosInstance.post(`/api/Booking/Serving?id=${bookingId}`);
    console.log(res);
    
    setBookings(prevBookings => 
      prevBookings.map(booking => {
        if (booking.ID === bookingId) {
          return {
            ...booking,
            CustomerSelected: {
              ...booking.CustomerSelected,
              NailDesignServiceSelecteds: booking.CustomerSelected.NailDesignServiceSelecteds.map(
                service => ({
                  ...service,
                  NailDesignService: {
                    ...service.NailDesignService,
                    Status: 1
                  }
                })
              )
            }
          };
        }
        return booking;
      })
    );

    setBookingDetails(prevDetails => {
      if (prevDetails && prevDetails.ID === bookingId) {
        return {
          ...prevDetails,
          CustomerSelected: {
            ...prevDetails.CustomerSelected,
            NailDesignServiceSelecteds: prevDetails.CustomerSelected.NailDesignServiceSelecteds.map(
              service => ({
                ...service,
                NailDesignService: {
                  ...service.NailDesignService,
                  Status: 1
                }
              })
            )
          }
        };
      }
      return prevDetails;
    });
  };

  const fetchCustomerSelected = async (customerSelectedID) => {
    const response = await axiosInstance.get(
      `/odata/customerSelected?$filter=id eq ${customerSelectedID}&$select=id,isFavorite,customerID&$expand=customer($select=id,description;$expand=user($select=id,fullname,phoneNumber,imageUrl))`
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
      `/odata/nailDesignServiceSelected?$filter=customerSelectedId eq ${customerSelectedId}&$select=duration,nailDesignServiceId`
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

    const service = await fetchService(nailDesignService.ServiceId);
    nailDesignService.Status = 0
    nailDesignService.Service = service;
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
      `/odata/artistStore?$filter=id eq ${artistStoreId}&$select=id,workingDate,startTime,endTime,storeId,artistId&$expand=store($select=id,imageUrl,description,address),artist($select=id,yearsOfExperience,level;$expand=user($select=id,email,fullname))`
    );
    return response.value?.[0];
  };

  const fetchBookings = async () => {
    try {
      const skip = currentPage * pageSize;
      const id = getId();
      const role = getRole();

      const baseUrl = "/odata/booking?";
      const filter = role == 1 ? `artistStore/artistId eq ${id}` : "";
      const filterStatus = status == -2 ? "" : `status eq ${status}`;
      const combinedFilter = [filter, filterStatus]
        .filter(Boolean)
        .join(" and ");
      const filterQuery = combinedFilter ? `$filter=${combinedFilter}&` : "";
      const count = `$count=true`;
      const pagination = `&$top=${pageSize}&$skip=${skip}`;
      const select = `&$select=id,createdAt,lastModifiedAt,status,startTime,serviceDate,predictEndTime,totalAmount,customerSelectedId,artistStoreId`;
      const expandArtistStore = `&$expand=artistStore($select=workingDate)`
      const orderBy = `&$orderby=lastModifiedAt desc`
      const url = `${baseUrl}${filterQuery}${count}${pagination}${select}${expandArtistStore}${orderBy}`;
      console.log(url);

      const response = await axiosInstance.get(url);

      const totalCount = response["@odata.count"] ?? 0;
      setTotalPages(Math.ceil(totalCount / pageSize));
      setTotalCount(totalCount)
      const bookings = response.value ?? [];

      const bookingPromises = bookings.map(async (booking) => {
        const customerSelected = await fetchBasicCustomerInfo(
          booking.CustomerSelectedId
        );
        booking.CustomerSelected = customerSelected;
        return booking;
      });

      const completedBookings = await Promise.all(bookingPromises);
      console.log(completedBookings);
      
      setBookings(completedBookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  const fetchBookingDetails = async (booking) => {
    const [customerSelected, artistStore] = await Promise.all([
      fetchCustomerSelected(booking.CustomerSelectedId),
      fetchArtistStore(booking.ArtistStoreId),
    ]);
    booking.CustomerSelected = customerSelected
    booking.ArtistStore = artistStore
    console.log(booking);
    
    setBookingDetails(booking)
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const checkAllServicesCompleted = (services) => {
    return services.every(service => service.NailDesignService.Status === 3);
  };

  const handleUpdateTime = async (serviceId) => {
    const now = new Date();
    const timeString = now.toTimeString().split(" ")[0];
    let formDataToSend = new FormData()
    formDataToSend.append("ServiceId", serviceId)
    formDataToSend.append("startAt", startAt)
    formDataToSend.append("endAt", timeString)
    await axiosInstance.post('/api/Service/Time', formDataToSend, {
      headers:{
        "Content-Type": "multipart/form-data",
      }
    })
    setStartAt("")
    setBookingDetails(prevDetails => {
      if (prevDetails) {
        const updatedDetails = {
          ...prevDetails,
          CustomerSelected: {
            ...prevDetails.CustomerSelected,
            NailDesignServiceSelecteds: prevDetails.CustomerSelected.NailDesignServiceSelecteds.map(
              service => service.NailDesignService.ServiceId === serviceId
                ? {
                    ...service,
                    NailDesignService: {
                      ...service.NailDesignService,
                      Status: 3
                    }
                  }
                : service
            )
          }
        };
        
        // Check if all services are completed
        const allCompleted = checkAllServicesCompleted(updatedDetails.CustomerSelected.NailDesignServiceSelecteds);
        setIsComplete(allCompleted);
        
        return updatedDetails;
      }
      return prevDetails;
    });
  };

  const hanldeStartService = (serviceId) => {
    const now = new Date();
    const timeString = now.toTimeString().split(" ")[0];
    setStartAt(timeString);

    setBookingDetails(prevDetails => {
      if (prevDetails) {
        return {
          ...prevDetails,
          CustomerSelected: {
            ...prevDetails.CustomerSelected,
            NailDesignServiceSelecteds: prevDetails.CustomerSelected.NailDesignServiceSelecteds.map(
              service => service.NailDesignService.ServiceId === serviceId
                ? {
                    ...service,
                    NailDesignService: {
                      ...service.NailDesignService,
                      Status: 2
                    }
                  }
                : service
            )
          }
        };
      }
      return prevDetails;
    });
  };

  const viewBookingDetails = async (booking) => {
    if (expandedBooking === true) {
      setExpandedBooking(false);
    } else {
      setExpandedBooking(true);
      await fetchBookingDetails(booking);
    }
  };

  const handleCloseModal = async () => {
    setExpandedBooking(false)
  }

  useEffect(() => {
    fetchBookings();
    console.log(status);
    
  }, [currentPage, pageSize, status, searchTerm]);

  useEffect(() => {
    const status = searchParams.get("status");
    if (status) {
      if (status === "PAID") {
        setToastMessage("Payment completed successfully!");
        setToastVariant("success");
      } else {
        setToastMessage("Payment failed or was cancelled.");
        setToastVariant("danger");
      }
      setShowToast(true);
    }
  }, [searchParams]);

const handlePayment = async (bookingId) => {
  method === 0 ? await payOnline(bookingId) : await payOffline(bookingId)
}

  return (
    <Container className="w-100 fade-in p-4">
      <ToastContainer position="top-end" className="p-3">
        <Toast 
          show={showToast} 
          onClose={() => setShowToast(false)}
          delay={5000}
          autohide
          bg={toastVariant}
        >
          <Toast.Header closeButton>
            <strong className="me-auto">
              {toastVariant === "success" ? "Success" : "Error"}
            </strong>
          </Toast.Header>
          <Toast.Body className={toastVariant === "success" ? "text-white" : ""}>
            {toastMessage}
          </Toast.Body>
        </Toast>
      </ToastContainer>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Bookings</h2>
          <p className="text-muted mb-0">Manage your salon bookings</p>
        </div>
      </div>

      <Card className="mb-4">
        <Card.Header>
          <div className="d-flex align-items-center">
            <FaFilter className="text-primary me-2" />
            <h5 className="mb-0">Filters</h5>
          </div>
        </Card.Header>
        <Card.Body>
          <Row>
            {/* <Col md={3}>
              <Form.Group className="mb-3 mb-md-0">
                <Form.Label>Artist</Form.Label>
                <Form.Select>
                  <option>All Artists</option>
                  <option value="1">Jenny Thompson</option>
                  <option value="2">Lisa Wang</option>
                  <option value="3">Maria Garcia</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3 mb-md-0">
                <Form.Label>Service</Form.Label>
                <Form.Select>
                  <option>All Services</option>
                  <option value="Manicure">Manicure</option>
                  <option value="Pedicure">Pedicure</option>
                  <option value="Nail Art">Nail Art</option>
                  <option value="Acrylic">Acrylic</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3 mb-md-0">
                <Form.Label>Date</Form.Label>
                <Form.Control type="date" />
              </Form.Group>
            </Col> */}
            <Col md={3}>
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Select onChange={(e) => setStatus(e.target.value)}>
                  <option value="-2">All Status</option>
                  <option value="-1">Cancelled</option>
                  <option value="0">Waiting</option>
                  <option value="1">Confirmed</option>
                  <option value="2">In Progress</option>
                  <option value="3">Completed</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body className="p-0">
          <Table responsive hover className="align-middle">
            <thead>
              <tr>
                <th>Client</th>
                <th>Time</th>
                <th>End Time Prediction</th>
                <th>Working Date</th>
                <th>Price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.ID} onDoubleClick={() => viewBookingDetails(booking)}>
                  <td>
                    <div className="d-flex align-items-center">
                      <div className="me-3">
                        <div className="avatar-circle bg-primary-soft">
                          <FaUser className="text-primary" />
                        </div>
                      </div>
                      <div>
                        <div className="fw-medium">{booking.CustomerSelected.Customer.User.FullName}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ width: '180px' }}>
                    <div className="d-flex align-items-center">
                      <div>
                        <div className="fw-medium">
                          {booking.StartTime.slice(0,5)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ width: '180px' }}>
                    <div className="d-flex align-items-center">
                      <div>
                        <div className="fw-medium">
                          {booking.PredictEndTime.slice(0,5)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ width: '180px' }}>
                    <div className="d-flex align-items-center">
                      <div>
                        <div className="fw-medium">
                          {booking.ArtistStore.WorkingDate}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="fw-medium"><span className="fw-medium">
                            {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND'
                            }).format(booking.TotalAmount)}
                        </span></div>
                  </td>
                  <td>
                    <Badge bg={
                      booking.Status === -1 ? 'danger' :
                      booking.Status === 0 ? 'info' :
                      booking.Status === 1 ? 'primary' :
                      booking.Status === 2 ? 'warning' :
                      booking.Status === 3 ? 'success' : 'secondary'
                    } className="badge-soft">
                      {booking.Status === -1 ? 'Canceled' :
                      booking.Status === 0 ? 'Waiting' :
                      booking.Status === 1 ? 'Confirmed' :
                      booking.Status === 2 ? 'Serving' :
                      booking.Status === 3 ? 'Completed' : 'No Info'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <div className="d-flex justify-content-between align-items-center mt-4">
        <div className="text-muted">
          Showing {bookings.length} of {totalCount} artists
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      {
        bookingDetails?.ArtistStore !== null && 
        bookingDetails?.ArtistStore !== undefined && (
          <Modal show={expandedBooking} onHide={handleCloseModal} size="lg">
            <Modal.Header closeButton className="bg-light">
              <Modal.Title>Booking Details</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
              <div className="mb-4">
                <Card className="border-0 shadow-sm">
                  <Card.Body>
                    <div className="d-flex align-items-center mb-3">
                      <div className="avatar-circle bg-primary me-3">
                        <FaUser className="text-white" />
                      </div>
                      <div>
                        <h5 className="mb-1">{bookingDetails.ArtistStore.Artist.User.FullName}</h5>
                        <p className="text-muted mb-0">
                          <FaMapMarkerAlt className="me-2" />
                          {bookingDetails.ArtistStore.Store.Address}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="primary" 
                      className="w-100"
                      onClick={() => postIsServing(bookingDetails.ID)}
                    >
                      Start Serving
                    </Button>
                  </Card.Body>
                </Card>
              </div>

              <div className="mb-4">
                <h6 className="text-uppercase mb-3 text-muted">Services</h6>
                {bookingDetails.CustomerSelected.NailDesignServiceSelecteds.map(nailDesignServiceSelected => (
                  <Card key={nailDesignServiceSelected.NailDesignService.ID} className="mb-3 border-0 shadow-sm">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-1">{nailDesignServiceSelected.NailDesignService.NailDesign.Design.Name}</h6>
                          <p className="text-muted mb-0 small">
                            {getNameOfFinger[nailDesignServiceSelected.NailDesignService.NailDesign.NailPosition]} - 
                            {getSideOfFinger[nailDesignServiceSelected.NailDesignService.NailDesign.IsLeft]}
                          </p>
                        </div>
                        {console.log( nailDesignServiceSelected.NailDesignService.Status)}
                        <Button 
                          variant={
                            nailDesignServiceSelected.NailDesignService.Status === 0 ? "outline-secondary" :
                            nailDesignServiceSelected.NailDesignService.Status === 1 ? "outline-primary" :
                            nailDesignServiceSelected.NailDesignService.Status === 2 ? "outline-warning" : "outline-success"
                          }
                          disabled={nailDesignServiceSelected.NailDesignService.Status === 0 || nailDesignServiceSelected.NailDesignService.Status === 3}
                          onClick={() => {
                            nailDesignServiceSelected.NailDesignService.Status === 1 
                              ? hanldeStartService(nailDesignServiceSelected.NailDesignService.ServiceId) 
                              : handleUpdateTime(nailDesignServiceSelected.NailDesignService.ServiceId)
                          }}
                        >
                          {getServiceStatusInBooking[nailDesignServiceSelected.NailDesignService.Status]}
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </div>

              <div hidden={(bookingDetails.Status !== 2 ? true : false) && !isComplete}>
                <Card className="border-0 shadow-sm bg-light">
                  <Card.Body>
                    <h6 className="text-uppercase mb-3 text-muted">Payment</h6>
                    <Row className="g-3">
                      <Col md={8}>
                        <Form.Group>
                          <Form.Label className="small text-muted">Select Payment Method</Form.Label>
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
                          variant={method === 0 ? "primary" : "success"}
                          className="w-100 py-3"
                          onClick={() => handlePayment(bookingDetails.ID)}
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
              </div>
            </Modal.Body>
          </Modal>
        )
      }
    </Container>
  );
};
export default Bookings;
