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
  FaStoreAlt,
} from "react-icons/fa";
import { getRole } from "../services/helper";

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { 
        path: "/dashboard", 
        icon: <FaHome />,
        title: "Dashboard"
    },
    { 
        path: "/customers",
        icon: <FaUsers />, 
        title: "Customers" 
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
    {
      path: "/stores",
      icon: <FaStoreAlt />,
      title: "Stores",
    },
    { path: "/settings", icon: <FaCog />, title: "Settings" },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-brand">{getRole() == 1 ? "Artist Portal" : getRole() == 2 ? "Admin Dashboard" : ""}</div>
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
