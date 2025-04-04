import React, { useEffect, useState } from 'react';
import { Navbar as BootstrapNavbar, Container, Nav, NavDropdown } from 'react-bootstrap';
import { FaBell, FaUserCircle } from 'react-icons/fa';
import axiosInstance from '../services/axiosConfig';
import { getId } from '../services/helper';

const Navbar = () => {
    const [notifications, setNotifications] = useState([]);
    
    useEffect(() => {
        fetchNotification()
    }, [])

    const fetchNotification = async () => {
        const res = await axiosInstance.get(`/odata/notification?$filter=userId eq ${getId()}&$select=ID,LastModifiedAt,IsDeleted,Status,NotificationType,Content,Title&$count=true`)
        console.log(res);
        setNotifications(res.value)
    }
    
  return (
    <BootstrapNavbar bg="white" expand="lg" className="navbar">
      <Container fluid>
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <NavDropdown title={<FaBell size={20} />} id="basic-nav-dropdown" align="end">
                {
                    notifications.map((notification) => (
                        <NavDropdown.Item>
                            {notification.Content}
                        </NavDropdown.Item>
                    ))
                }
            </NavDropdown>
            <Nav.Link href="#" className="position-relative">
              <FaBell size={20} />
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                3
              </span>
            </Nav.Link>
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