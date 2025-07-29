import React, { useEffect, useState, useContext } from "react";
import IMAGES from "../images";
import { toast } from "react-toastify";
import { getUserPlatform } from "../utils/getUserPlatform";
import { useNavigate } from "react-router-dom";
import { setLocalStorage } from "../utils/setLocalStorage";
import { AppContext } from "../context/AppContext";
import { getLocalStorage } from "../utils/getLocalStorage";
import axiosInstance from "../api/axiosInstance";
import { useLoggerStore } from "@store/log.jsx";
import LoaderComponent from "../components/common/LoaderComponent";
import { EyeClosed, Eye } from 'lucide-react';
import logo1 from "../../public/logo.png"

const LoginPage = () => {
  const { setActiveUserData, activeUserData } = useContext(AppContext);
  const [whatsAppNumber, setWhatsAppNumber] = useState("");
  const [password, setPassword] = useState("");
  const [userPlatform, setUserPlatform] = useState(null);
  const [loaderActive, setLoaderActive] = useState(false);
  const [showPassword, setShowPassword] = useState(false); 
  const navigate = useNavigate();

  const { updateActivityLog, initializeLogData } = useLoggerStore();

  const handleLogCheck = async (log) => {
    updateActivityLog(log);
  }

  useEffect(() => {
    initializeLogData(activeUserData);
  }, [activeUserData, initializeLogData]);

  useEffect(() => {
    setUserPlatform(getUserPlatform());

    try {
      if (getLocalStorage()) {
        window.location.href = "/";
      }
    } catch (error) {}
  }, []);

  const handleInputChange = (e) => {
      setWhatsAppNumber(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleLogin = async () => {
    setLoaderActive(true);
    const regex = /^[6-9]\d{9}$/;

    // if (!regex.test(whatsAppNumber)) {
    //   toast.error("Invalid Number");
    //   setLoaderActive(false);
    //   return;
    // }

    if (!password) {
      toast.error("Please enter password");
      setLoaderActive(false);
      return;
    }

    try {
      const res = await axiosInstance("/session", "POST", {
        number: whatsAppNumber,
        password: password,
        platform: userPlatform
      });

      handleLogCheck(`Login Success for ${whatsAppNumber}`);
      setActiveUserData({
        user_name: res?.data?.data?.user_name,
        user_id: res?.data?.data?.user_id,
        user_position: res?.data?.data?.user_role,
      });

      setLocalStorage(
        res?.data?.data?.access_token,
        res?.data?.data?.access_token_expiry,
        res?.data?.data?.refresh_token,
        res?.data?.data?.refresh_token_expiry,
        res?.data?.data?.session_id
      );
      navigate("/");
    } catch (error) {
      toast.error(error?.response?.data?.messages[0] || "Login failed");
      handleLogCheck(`Login Failed for ${whatsAppNumber}`);
    } finally {
      setLoaderActive(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword); 
  };

  return (
    <section className="bg-gray-200 flex h-screen items-center justify-center px-4 py-10">
    {loaderActive && <LoaderComponent />}
    <div className="w-full max-w-md space-y-8  border border-gray-200 bg-white px-6 py-8  sm:px-10 sm:py-8">
      <div className="flex flex-col items-center justify-center">
        <img src="/icons/logo.png" alt="Tradedge Logo"  className="w-[300px] max-w-full" />
        {/* <p className="mt-3 text-sm text-gray-600">
          Please enter your User ID and password to log in.
        </p> */}
      </div>
  
      <div className="mt-8 space-y-6">
        <div className="flex items-center  border border-gray-300 bg-gray-50 p-2.5">
          <input
            className="w-full bg-transparent pl-3 font-medium text-gray-700 outline-none"
            type="text"
            placeholder="Username"
            value={whatsAppNumber}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
          />
        </div>
  
        <div className="relative flex items-center  border border-gray-300 bg-gray-50 p-2.5">
          <input
            className="w-full bg-transparent pl-3 font-medium text-gray-700 outline-none"
            type="password"
            placeholder="Password"
            value={password}
            onChange={handlePasswordChange}
            onKeyPress={handleKeyPress}
          />
          {/* <button
            type="button"
            className="absolute right-3"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? <Eye /> : < EyeClosed />} 
          </button> */}
        </div>
  
        <div className="flex justify-center">
          <button
            onClick={handleLogin}
            className="w-full sm:w-[40%] justify-center  bg-blue-600 text-sm py-2 font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  </section>
  );
};

export default LoginPage;
