import React, { useEffect, useState } from 'react';
import { Navbar as BootstrapNavbar, Container, Nav, NavDropdown, Badge } from 'react-bootstrap';
import { FaBell, FaUserCircle, FaCheckCircle, FaInfoCircle, FaExclamationCircle } from 'react-icons/fa';
import { formatDistanceToNow, format } from 'date-fns';
import { vi } from 'date-fns/locale';
import axiosInstance from '../services/axiosConfig';
import { getId } from '../services/helper';

const Navbar = () => {
    const [notifications, setNotifications] = useState([]);
    const [count, setCount] = useState(0);
    
    useEffect(() => {
        fetchNotification()
    }, [])

    const fetchNotification = async () => {
        const res = await axiosInstance.get(`/odata/notification?$filter=userId eq ${getId()}&$select=ID,LastModifiedAt,IsDeleted,Status,NotificationType,Content,Title&$orderby=LastModifiedAt desc&$count=true`)
        setCount(res["@odata.count"])
        setNotifications(res.value)
    }

    const getNotificationIcon = (type) => {
        switch (type) {
            case '0':
                return <FaCheckCircle className="text-success" />;
            case '1':
                return <FaInfoCircle className="text-info" />;
            case '2':
                return <FaExclamationCircle className="text-warning" />;
            default:
                return <FaBell className="text-primary" />;
        }
    };

    const getNotificationStatus = (status) => {
        switch (status) {
            case 'Read':
                return 'bg-light';
            case 'Unread':
                return 'bg-white';
            default:
                return 'bg-white';
        }
    };

    // Thêm hàm format time
    const formatTime = (dateString) => {
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffInHours = Math.abs(now - date) / 36e5; // Convert to hours

            if (diffInHours < 24) {
                // Nếu trong vòng 24h, hiển thị "... giờ trước"
                return formatDistanceToNow(date, { addSuffix: true, locale: vi });
            } else {
                // Nếu hơn 24h, hiển thị ngày giờ cụ thể
                return format(date, "HH:mm - dd/MM/yyyy", { locale: vi });
            }
        } catch (error) {
            return "Không xác định";
        }
    };
    
    return (
        <BootstrapNavbar bg="white" expand="lg" className="navbar">
            <Container fluid>
                <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
                <BootstrapNavbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto">
                        <NavDropdown 
                            title={
                                <div className="position-relative">
                                    <FaBell size={20} className="text-muted" />
                                    {count > 0 && (
                                        <Badge 
                                            bg="danger" 
                                            className="position-absolute top-0 start-100 translate-middle rounded-circle"
                                            style={{ fontSize: '0.6rem', padding: '0.35em 0.5em' }}
                                        >
                                            {count}
                                        </Badge>
                                    )}
                                </div>
                            } 
                            id="notifications-dropdown" 
                            align="end"
                            className="notification-dropdown"
                        >
                            <div className="notification-header p-3 border-bottom">
                                <h6 className="mb-0">Thông báo ({count})</h6>
                            </div>
                            <div className="notification-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                {notifications.length > 0 ? (
                                    notifications.map((notification) => (
                                        <NavDropdown.Item 
                                            key={notification.ID}
                                            className={`p-3 border-bottom ${getNotificationStatus(notification.Status)}`}
                                        >
                                            <div className="d-flex align-items-start gap-2">
                                                <div className="notification-icon mt-1">
                                                    {getNotificationIcon(notification.NotificationType)}
                                                </div>
                                                <div className="notification-content flex-grow-1">
                                                    <h6 className="mb-1 text-dark">{notification.Title}</h6>
                                                    <p className="mb-1 text-muted small">{notification.Content}</p>
                                                    <small className="text-muted">
                                                        {formatTime(notification.LastModifiedAt)}
                                                    </small>
                                                </div>
                                            </div>
                                        </NavDropdown.Item>
                                    ))
                                ) : (
                                    <div className="text-center p-4">
                                        <FaBell size={40} className="text-muted mb-3" />
                                        <p className="text-muted mb-0">Không có thông báo mới</p>
                                    </div>
                                )}
                            </div>
                            {/* {notifications.length > 0 && (
                                <div className="notification-footer p-2 border-top text-center">
                                    <button className="btn btn-link btn-sm text-decoration-none">
                                        Xem tất cả thông báo
                                    </button>
                                </div>
                            )} */}
                        </NavDropdown>

                        <NavDropdown title={<FaUserCircle size={20} />} id="basic-nav-dropdown" align="end">
                            <NavDropdown.Item href="#profile">Profile</NavDropdown.Item>
                            <NavDropdown.Item href="#settings">Settings</NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item href="#logout">Logout</NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                </BootstrapNavbar.Collapse>
            </Container>
        </BootstrapNavbar>
    );
};

export default Navbar; 