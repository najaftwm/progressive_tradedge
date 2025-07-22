import axios from "axios";

import { getLocalStorage } from "@utils/getLocalStorage";


// Create an Axios instance with the base URL
const instance = axios.create({
 //baseURL: "http://localhost/finance_backend/",
  baseURL: "https://crm.twmresearchalert.com/gateway",
});

// Function to make a request with or without the access token
const apiInstance = (url, method, data = {},  additionalHeaders = {}) => {

  const localStorageData = getLocalStorage();

  // Determine the content type based on the data type
  const isFormData = data instanceof FormData;
  const headers = {
    "Content-Type": isFormData ? "multipart/form-data" : "application/json",
    Authorization: localStorageData?.access_token,
    ...additionalHeaders, 
  };

  // Make the request using the Axios instance
  return instance({
    url,
    method,
    data,
    headers,
  });
};

export default apiInstance;

