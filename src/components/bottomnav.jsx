import {
  Home,
  LineChart,
  Crown,
  Compass,
  Headphones,
  User,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const BottomNav = () => {
  const location = useLocation();

  const navItems = [
    { label: "Home", path: "/home", icon: Home },
    { label: "Stocks", path: "/stocks", icon: LineChart },
    { label: "Trades", path: "/trades", icon: Crown },
    { label: "Packs", path: "/packs", icon: Compass },
    { label: "Refer", path: "/refer", icon: Headphones },
    { label: "Profile", path: "/profile", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black text-white flex justify-around py-2 shadow-md z-50">
      {navItems.map(({ label, path, icon: Icon }) => {
        const isActive = location.pathname === path;
        const isTrades = label === "Trades";

        const iconColor = isTrades
          ? "text-orange-500"
          : isActive
          ? "text-blue-500"
          : "text-white";

        return (
          <Link
            key={label}
            to={path}
            className={`flex flex-col items-center text-xs ${iconColor}`}
          >
            <Icon className={`w-5 h-5 mb-1`} />
            <span>{label}</span>
          </Link>
        );
      })}
    </div>
  );
};

export default BottomNav;
