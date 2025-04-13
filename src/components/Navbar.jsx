import React, { useEffect, useState } from 'react';
import { Navbar as BootstrapNavbar, Container, Nav, NavDropdown, Badge, Toast, ToastContainer } from 'react-bootstrap';
import { FaBell, FaUserCircle, FaCheckCircle, FaInfoCircle, FaExclamationCircle } from 'react-icons/fa';
import { formatDistanceToNow, format } from 'date-fns';
import { vi } from 'date-fns/locale';
import axiosInstance from '../services/axiosConfig';
import { getId } from '../services/helper';
import signalRService from '../services/signalR';

const Navbar = () => {
    const [notifications, setNotifications] = useState([]);
    const [count, setCount] = useState(0);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState({ title: '', message: '' });
    
    useEffect(() => {
        fetchNotification();
        
        // Set up SignalR notification handlers
        signalRService.onBookingNotification((title, message) => {
            fetchNotification();
            setToastMessage({ title, message });
            setShowToast(true);
        });

        signalRService.onBookingUpdate((title, message) => {
            fetchNotification();
            setToastMessage({ title, message });
            setShowToast(true);
        });

        signalRService.onBookingCancellation((title, message) => {
            fetchNotification();
            setToastMessage({ title, message });
            setShowToast(true);
        });

        signalRService.onArtistStoreUpdated((title,message) => {
            fetchNotification();
            setToastMessage({ title, message });
            setShowToast(true);
        });

        signalRService.onArtistStoreIsCreated((title,message) => {
            fetchNotification();
            setToastMessage({ title, message });
            setShowToast(true);
        });

        signalRService.onFeedback((title,message) => {
            fetchNotification();
            setToastMessage({ title, message });
            setShowToast(true);
        });

        return () => {
            // Cleanup SignalR handlers
            signalRService.onBookingNotification(null);
            signalRService.onBookingUpdate(null);
            signalRService.onBookingCancellation(null);
            signalRService.onArtistStoreUpdated(null);
            signalRService.onArtistStoreIsCreated(null);
            signalRService.onFeedback(null);
        };
    }, []);

    const fetchNotification = async () => {
        try {
            const res = await axiosInstance.get(`/odata/notification?$filter=userId eq ${getId()}&$select=ID,LastModifiedAt,IsDeleted,Status,NotificationType,Content,Title&$orderby=LastModifiedAt desc&$count=true`);
            await fetchCount();
            setNotifications(res.value);
        } catch (err) {
            console.error('Error fetching notifications:', err);
        }
    };

    const fetchCount = async () => {
        try {
            const res = await axiosInstance.get(`/odata/notification?$filter=userId eq ${getId()} and status eq 0&$select=ID&$count=true`);
            setCount(res["@odata.count"]);
        } catch (err) {
            console.error('Error fetching notifications:', err);
        }
    };

    const handleNotificationDropdownToggle = async (isOpen) => {
        if (isOpen && count > 0) {
            await setNotificationsAreRead();
            await fetchCount(); // Refresh the count after marking as read
        }
    };

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
            console.log(error);
            return "Không xác định";
        }
    };

    const setNotificationsAreRead = async () => {
        try {
            await axiosInstance.post("/api/Notification", null, {
                headers: {
                    "Content-Type": "application/json"
                }
            });
            await fetchCount();
        } catch (err) {
            console.error('Error marking notifications as read:', err);
        }
    };

    const logout = async () => {
        try {
            // 1. Disconnect SignalR
            await signalRService.stopConnection();

            // 2. Get device token
            const deviceToken = localStorage.getItem('deviceToken');
            if (deviceToken) {
                // 3. Create form data
                const formData = new FormData();
                formData.append('deviceToken', deviceToken);

                // 4. Unregister device token
                await axiosInstance.delete('/api/DeviceToken', {
                    data: formData,
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                });
            }

            // 5. Clear local storage and redirect
            localStorage.clear();
            window.location.href = "/";
        } catch (err) {
            console.error('Error during logout:', err);
            // Still clear storage and redirect even if there's an error
            localStorage.clear();
            window.location.href = "/";
        }
    };
    
    return (
        <>
            <BootstrapNavbar bg="white" expand="lg" className="navbar">
                <Container fluid>
                    {/* <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" /> */}
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
                                onToggle={handleNotificationDropdownToggle}
                            >
                                <div className="notification-header p-3 border-bottom">
                                    <h6 className="mb-0">Notification</h6>
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
                            </NavDropdown>

                            <NavDropdown title={<FaUserCircle size={20} />} id="basic-nav-dropdown" align="end">
                                <NavDropdown.Item href="#profile">Profile</NavDropdown.Item>
                                <NavDropdown.Item href="#settings">Settings</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item onClick={logout}>Logout</NavDropdown.Item>
                            </NavDropdown>
                        </Nav>
                    </BootstrapNavbar.Collapse>
                </Container>
            </BootstrapNavbar>

            {/* Toast Notification */}
            <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1 }}>
                <Toast 
                    show={showToast} 
                    onClose={() => setShowToast(false)}
                    delay={3000}
                    autohide
                >
                    <Toast.Header>
                        <FaBell className="me-2" />
                        <strong className="me-auto">New Notification</strong>
                        <small>just now</small>
                    </Toast.Header>
                    <Toast.Body>
                        <h6>{toastMessage.title}</h6>
                        <p className="mb-0">{toastMessage.message}</p>
                    </Toast.Body>
                </Toast>
            </ToastContainer>
        </>
    );
};

export default Navbar; 