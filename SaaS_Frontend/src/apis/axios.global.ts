import Axios from "axios";
import { API_LINK } from "../config";
import getToken from "../utils/getToken";

/**
 * This is the Axios interceptor with our custom settings.
 * @returns {AxiosConfig}
 */

const axios = Axios.create({
  baseURL: API_LINK,
});

axios.interceptors.request.use((config: any) => {
  const token = getToken();
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default axios;
