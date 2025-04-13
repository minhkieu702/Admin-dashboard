import axios from "axios";

// Tạo instance axios với cấu hình mặc định
const axiosInstance = axios.create({
  baseURL: "https://inbsapi-d9hhfmhsapgabrcz.southeastasia-01.azurewebsites.net/", // Thay đổi URL này theo API của bạn
  // baseURL: "https://localhost:7012/",
//   timeout: 10000,
  headers: {
    "Content-Type": "multipart/form-data,application/json"
  }
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Xử lý các lỗi phổ biến
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Xử lý lỗi unauthorized
          localStorage.removeItem("token");
          window.location.href = "/login";
          break;
        case 403:
          // Xử lý lỗi forbidden
          console.error("Bạn không có quyền truy cập");
          break;
        case 404:
          // Xử lý lỗi not found
          console.error("Không tìm thấy tài nguyên");
          break;
        case 500:
          // Xử lý lỗi server
          console.error("Lỗi server");
          break;
        default:
          console.error("Có lỗi xảy ra");
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
