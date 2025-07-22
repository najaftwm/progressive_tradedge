import axios from "axios";

// Create an Axios instance with the base URL and default headers
const instance = axios.create({
  baseURL: "https://crmapi.twmresearchalert.com/",
  //baseURL: "http://localhost/finance_backend/auth/",

});

// Function to make a request with or without the access token
const axiosInstance = (url, method, data = {}, access_token = null) => {
  const headers = {
    "Content-Type": "application/json",
    Authorization: access_token,
  };

  // Make the request using Axios instance
  return instance({
    url,
    method,
    data,
    headers,
  });
};

export default axiosInstance;
