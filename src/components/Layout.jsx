import BottomNav from "./bottomnav";
import { Outlet, useLocation } from "react-router-dom";
import TopBar from "./topbar";

const Layout = () => {
  const location = useLocation();

  // Hide BottomNav for /BuyPackageOffer route
  const hideBottomNav = location.pathname === "/BuyPackageOffer";

  return (
    <div className="min-h-screen pb-16 bg-black text-white">
      {/* Page content */}
      <Outlet />
      <TopBar />
      {/* Bottom Navigation */}
      {!hideBottomNav && <BottomNav />}
    </div>
  );
};

export default Layout;