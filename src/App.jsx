import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet
} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Artists from "./pages/Artists";
import Bookings from "./pages/Bookings";
import Analytics from "./components/Analytics";
import Customers from "./pages/Customers";
import Designs from "./pages/Designs";
import Services from "./pages/Services";
import Login from "./pages/Login";
import Stores from "./pages/Stores";

// Tạo ProtectedRoute component
const ProtectedRoute = () => {
  const token = localStorage.getItem('token');
  
  // 1. Kiểm tra có token hay không
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    // 2. Giải mã token để kiểm tra hết hạn
    // const decodedToken = jwtDecode(token);
    // const currentTime = Date.now() / 1000;
    
    // // 3. Kiểm tra token hết hạn
    // if (decodedToken.exp < currentTime) {
    //   localStorage.removeItem('token'); // Xóa token hết hạn
    //   return <Navigate to="/login" replace />;
    // }
    // 4. Nếu token hợp lệ, hiển thị layout bảo vệ
    return (
      <div className="admin-container">
        <Sidebar />
        <div className="main-content">
          <Navbar />
          <div className="content-wrapper">
            <Outlet/>
          </div>
        </div>
      </div>
    );

  } catch (error) {
    console.error('Token invalid:', error);
    localStorage.removeItem('token');
    return <Navigate to="/login" replace />;
  }
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Login/>}/>
        <Route element={<ProtectedRoute />}>
          <Route path="/customers" element={<Customers />} />
          <Route path="/dashboard" element={<Dashboard/>}/>
          <Route path="/designs" element={<Designs />} />
          <Route path="/artists" element={<Artists />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/services" element={<Services />} />
          <Route path="/stores" element={<Stores />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
