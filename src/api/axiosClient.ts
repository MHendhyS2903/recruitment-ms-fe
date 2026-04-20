import axios from 'axios';

export const apiBaseUrl = (process.env.REACT_APP_BASE_URL ?? '').trim();

const axiosClient = axios.create({
  baseURL: apiBaseUrl,
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    axiosClient.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }

  delete axiosClient.defaults.headers.common.Authorization;
};

export default axiosClient;
