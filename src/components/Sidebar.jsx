import React from "react";
import { Nav } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaUsers,
  FaBox,
  FaCog,
  FaUserCog,
  FaCalendarAlt,
  FaChartBar,
  FaServicestack,
  FaHandPaper,
} from "react-icons/fa";

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { 
        path: "/", 
        icon: <FaHome />,
        title: "Dashboard"
    },
    { 
        path: "/customers",
        icon: <FaUsers />, 
        title: "Users" 
    },
    { 
        path: "/designs", 
        icon: <FaHandPaper />, 
        title: "Designs" 
    },
    {
      path: "/artists",
      icon: <FaUserCog />,
      title: "Nail Artists",
    },
    {
      path: "/bookings",
      icon: <FaCalendarAlt />,
      title: "Bookings",
    },
    {
      path: "/services",
      icon: <FaServicestack />,
      title: "Services",
    },
    { path: "/settings", icon: <FaCog />, title: "Settings" },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-brand">INBS Admin</div>
      <Nav className="sidebar-menu flex-column">
        {menuItems.map((item) => (
          <Nav.Item key={item.path}>
            <Link
              to={item.path}
              className={`sidebar-menu-item nav-link d-flex align-items-center ${
                location.pathname === item.path ? "active" : ""
              }`}
            >
              {item.icon}
              <span className="ms-2">{item.title}</span>
            </Link>
          </Nav.Item>
        ))}
      </Nav>
    </div>
  );
};

export default Sidebar;
