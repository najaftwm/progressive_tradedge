import React, { useContext } from "react";
import { UserCircle, LogOut } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "./Header";
import { AuthContext } from "../context/AuthContext"; // ✅ import your AuthContext

const TopBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { authData, logout,userDetails } = useContext(AuthContext); // ✅ use AuthContext with logout function

  const routeTitles = {
    "/stocks": "Stocks",
    "/trades": "Trades",
    "/packs": "Packs",
    "/refer": "Refer",
    "/profile": "Profile",
  };

  const showBuyProRoutes = ["/stocks", "/trades", "/packs"];
  const showBuyProButton = showBuyProRoutes.includes(location.pathname);
  const showLogoutButton = location.pathname === "/profile"; // ✅ Show logout button only on /profile
  const title = routeTitles[location.pathname] || "App";

  // ✅ For /home page, show greeting with BuyPro
  if (location.pathname === "/home") {
    const userName = userDetails?.user_full_name || authData?.user_name || 'User';
    return (
      <Header
        title={`Hi ${userName}`}
        showBuyProButton={true}
      />
    );
  }

  // Handle logout action
  const handleLogout = () => {
    logout(); // Call logout function from AuthContext
    navigate("/"); // Redirect to login page after logout
  };

  return (
    <div className="flex justify-between items-center px-4 py-3 bg-white shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center space-x-2">
        <UserCircle className="w-7 h-7 text-black" />
        <span className="text-lg font-medium text-black truncate">{title}</span>
      </div>
      {showLogoutButton && (
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      )}
    </div>
  );
};

export default TopBar;