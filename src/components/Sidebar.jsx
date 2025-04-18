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
  const role = getRole();

  const menuItems = [
    { 
        path: "/dashboard", 
        icon: <FaHome />,
        title: "Dashboard",
        role: 1
    },
    { 
        path: "/customers",
        icon: <FaUsers />, 
        title: "Customers",
        role: 2
    },
    { 
        path: "/designs", 
        icon: <FaHandPaper />, 
        title: "Designs" ,
        role: 2
    },
    {
      path: "/artists",
      icon: <FaUserCog />,
      title: "Nail Artists",
      role: 2
    },
    {
      path: "/bookings",
      icon: <FaCalendarAlt />,
      title: "Bookings",
      role: 1
    },
    {
      path: "/services",
      icon: <FaServicestack />,
      title: "Services",
      role: 2
    },
    {
      path: "/stores",
      icon: <FaStoreAlt />,
      title: "Stores",
      role: 2
    },
  ];
  // Filter menu items based on role
  const filteredMenuItems = menuItems.filter(item => 
    role == 2 || (role == 1 && item.role === 1)
  );

  console.log(filteredMenuItems, role);
  

  return (
    <div className="sidebar">
      <div className="sidebar-brand">{role == 1 ? "Artist Portal" : role == 2 ? "Admin Dashboard" : ""}</div>
      <Nav className="sidebar-menu flex-column">
        {filteredMenuItems.map((item) => (
          <Nav.Item key={item.path}>
            {console.log(item.title)}
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
