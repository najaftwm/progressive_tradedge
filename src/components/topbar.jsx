import { UserCircle, Crown } from "lucide-react";
import { useLocation } from "react-router-dom";

const TopBar = () => {
  const location = useLocation();

  const routeTitles = {
    "/home": "Hi",
    "/stocks": "Stocks",
    "/trades": "Trades",
    "/packs": "Packs",
    "/refer": "Refer",
    "/profile": "Profile",
  };

  const title = routeTitles[location.pathname] || "App";

  return (
    <div className="flex justify-between items-center px-4 py-3 bg-white shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center space-x-2">
        <UserCircle className="w-7 h-7 text-black" />
        <span className="text-lg font-medium text-black">{title}</span>
      </div>
      <button className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 py-2 rounded-full font-semibold flex items-center">
        <Crown className="w-5 h-5 mr-1" />
        Buy Pro
      </button>
    </div>
  );
};

export default TopBar;
