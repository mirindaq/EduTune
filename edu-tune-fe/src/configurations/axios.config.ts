import axios from "axios";
import { toast } from "sonner";

// Khởi tạo instance cho Hugging Face API
const huggingFaceAxios = axios.create({
  baseURL: "https://huggingface.co/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30s vì API có thể chậm
});

huggingFaceAxios.interceptors.request.use(
  (config) => {
    // Có thể thêm token nếu cần (Hugging Face có thể yêu cầu token cho một số API)
    // const token = localStorage.getItem('hf_token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => Promise.reject(error)
);

huggingFaceAxios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      if (error.response.status === 404) {
        toast.error("Không tìm thấy dữ liệu");
      } else if (error.response.status === 500) {
        toast.error("Lỗi server, vui lòng thử lại sau");
      } else if (error.response.status === 429) {
        toast.error("Quá nhiều yêu cầu, vui lòng thử lại sau");
      } else {
        toast.error(error.response.data?.error || "Đã xảy ra lỗi");
      }
    } else if (error.request) {
      toast.error("Không thể kết nối đến server");
    } else {
      toast.error("Đã xảy ra lỗi không xác định");
    }
    return Promise.reject(error);
  }
);

export default huggingFaceAxios;

