// src/components/Layout.jsx
import BottomNav from "./bottomnav";
import { Outlet } from "react-router-dom";
import TopBar from "./topbar";

const Layout = () => {
  return (
    <div className="min-h-screen pb-16 bg-black text-white">
      {/* Page content */}
      <Outlet />
      <TopBar />
      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default Layout;
