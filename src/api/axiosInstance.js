import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://cned.fly.dev/',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

//토큰 자동 주입기(차후 사용할 예정)
// axiosInstance.interceptors.request.use(async (config) => {
//   const token = await AsyncStorage.getItem('access_token');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// 공통 응답 인터셉터
axiosInstance.interceptors.response.use(
  (response) => {
    return response; // 성공 응답 그대로 전달
  },
  async (error) => {
    if (error.response?.status === 401) {
      // 토큰 재발급 로직 or 강제 로그아웃 처리
    }
    return Promise.reject(error);
  }
);



export default axiosInstance;
