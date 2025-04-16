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
  ButtonGroup,
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
import { getId, getRole } from "@services/helper";
import axiosInstance from "@services/axiosConfig";
import Pagination from "@components/Pagination";
import { Link, useNavigate } from "react-router-dom";

const Bookings = () => {
  const pageSizeOptions = [8, 16, 24, 32];
  const [bookings, setBookings] = useState([]);
  const [pageSize, setPageSize] = useState(pageSizeOptions[0]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [status, setStatus] = useState(-2);
  const [method, setMethod] = useState(0);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [selectedBookings, setSelectedBookings] = useState([]);

  const payOnline = async (formDataToSend) => {
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

  const payOffline = async (formDataToSend) => {
    await axiosInstance.post(`/api/Payment/PaymentForCash`, formDataToSend, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  };

  const handleSelectedBooking = (bookingId) => {
    setSelectedBookings((prev) => {
      const newBookings = prev.includes(bookingId)
        ? prev.filter((id) => id !== bookingId)
        : [...prev, bookingId];
      return newBookings;
    });
  };

  const handlePayment = async () => {
    console.log(selectedBookings.length);

    const formDataToSend = new FormData();
    selectedBookings.forEach((item, index) => {
      formDataToSend.append(
        `paymentDetailRequests[${index}].bookingId`,
        item.ID
      );
    });
    // method === 0 ? await payOnline(formDataToSend) : await payOffline(formDataToSend)
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
      const expandArtistStore = `&$expand=artistStore($select=workingDate;$expand=artist($select=ID,username;$expand=user($select=fullname)),store($select=Address)),customerSelected($select=id;$expand=customer($select=id;$expand=user($select=fullName,email,phoneNumber)))`;
      const orderBy = `&$orderby=lastModifiedAt desc`;
      const url = `${baseUrl}${filterQuery}${count}${pagination}${select}${expandArtistStore}${orderBy}`;
      console.log(url);

      const response = await axiosInstance.get(url);

      const totalCount = response["@odata.count"] ?? 0;
      setTotalPages(Math.ceil(totalCount / pageSize));
      setTotalCount(totalCount);
      console.log(response.value);

      setBookings(response.value);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  useEffect(() => {
    fetchBookings();
  }, [currentPage, pageSize, status]);

  const navigate = useNavigate();
  const viewBookingDetails = (id) => {
    console.log(id);

    navigate(`/booking/:${id}`);
  };

  return (
    <Container className="w-100 fade-in p-4">
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
                  <option value="2">Serving</option>
                  <option value="3">Completed</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

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
                onClick={() => handlePayment()}
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

      <Card>
        <Card.Body className="p-0">
          <Table responsive hover className="align-middle">
            <thead>
              <tr>
                <th></th>
                <th>Client</th>
                <th>Phone number</th>
                <th>Artist</th>
                <th>Address</th>
                <th>Time</th>
                <th>End Time Prediction</th>
                <th>Working Date</th>
                <th>Price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr
                  key={booking.ID}
                  onDoubleClick={() => viewBookingDetails(booking.ID)}
                >
                  <td>
                    <Form.Check
                      type="checkbox"
                      id={booking.ID}
                      onChange={() => handleSelectedBooking(booking.ID)}
                      checked={selectedBookings.includes(booking.ID)}
                      disabled={booking.Satus === 2 ? false : true}
                    />
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      <div className="me-3">
                        <div className="avatar-circle bg-primary-soft">
                          <FaUser className="text-primary" />
                        </div>
                      </div>
                      <div>
                        <div className="fw-medium">
                          {booking.CustomerSelected.Customer.User.FullName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ width: "180px" }}>
                    <div className="d-flex align-items-center">
                      <div>
                        <div className="fw-medium">
                          {booking.CustomerSelected.Customer.User.PhoneNumber}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ width: "180px" }}>
                    <div className="d-flex align-items-center">
                      <div>
                        <div className="fw-medium">
                          {booking.ArtistStore.Artist.User.FullName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ width: "180px" }}>
                    <div className="d-flex align-items-center">
                      <div>
                        <div className="fw-medium">
                          {booking.ArtistStore.Store.Address}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ width: "180px" }}>
                    <div className="d-flex align-items-center">
                      <div>
                        <div className="fw-medium">
                          {booking.StartTime.slice(0, 5)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ width: "180px" }}>
                    <div className="d-flex align-items-center">
                      <div>
                        <div className="fw-medium">
                          {booking.PredictEndTime.slice(0, 5)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ width: "180px" }}>
                    <div className="d-flex align-items-center">
                      <div>
                        <div className="fw-medium">
                          {booking.ArtistStore.WorkingDate}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="fw-medium">
                      <span className="fw-medium">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(booking.TotalAmount)}
                      </span>
                    </div>
                  </td>
                  <td>
                    <Badge
                      bg={
                        booking.Status === -1
                          ? "danger"
                          : booking.Status === 0
                          ? "info"
                          : booking.Status === 1
                          ? "primary"
                          : booking.Status === 2
                          ? "warning"
                          : booking.Status === 3
                          ? "success"
                          : "secondary"
                      }
                      className="badge-soft"
                    >
                      {booking.Status === -1
                        ? "Canceled"
                        : booking.Status === 0
                        ? "Waiting"
                        : booking.Status === 1
                        ? "Confirmed"
                        : booking.Status === 2
                        ? "Serving"
                        : booking.Status === 3
                        ? "Completed"
                        : "No Info"}
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
    </Container>
  );
};
export default Bookings;
