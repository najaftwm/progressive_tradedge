import React, { useContext } from "react";
import { UserCircle, Crown } from "lucide-react";
import { useLocation } from "react-router-dom";
import Header from "./Header";
import { useStockContext } from "../context/StockContext";

const TopBar = () => {
  const location = useLocation();
  const userContext = useContext(useStockContext);

  const routeTitles = {
    "/stocks": "Stocks",
    "/trades": "Trades",
    "/packs": "Packs",
    "/refer": "Refer",
    "/profile": "Profile",
  };

  // If on /home, render Header with dynamic greeting and Buy Pro button
  if (location.pathname === "/home") {
    const userName = userContext?.userDetails?.user_full_name || "User";

    return (
      <Header
        title={"Hi " + userName}
        showBuyProButton={true}
      />
    );
  }

  // For other routes, render the existing TopBar UI
  const title = routeTitles[location.pathname] || "App";

  return (
    <div className="flex justify-between items-center px-4 py-3 bg-white shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center space-x-2">
        <UserCircle className="w-7 h-7 text-black" />
        <span className="text-lg font-medium text-black truncate">{title}</span>
      </div>
      <button className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 py-2 rounded-full font-semibold flex items-center hover:opacity-90 transition">
        <Crown className="w-5 h-5 mr-1" />
        Buy Pro
      </button>
    </div>
  );
};

export default TopBar;
