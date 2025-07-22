import React, { useContext, useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from "react-router-dom";
import { AppContext } from "@context/AppContext";
import secureLocalStorage from "react-secure-storage";
import axiosInstance from "@api/axiosInstance";
import { 
  Home, 
  BarChart2, 
  UserRound, 
  Crown,
  Tag, 
  LayoutDashboard, 
  Phone, 
  Bell,
  NotebookTabs,
  ClipboardList, 
  ArrowLeftRight,
  Menu,
  ChartArea,
  ChevronLeft,
  LogOut,
  Send,
  FileClock,
  HeartHandshake,
  Clock10,
  AlignHorizontalDistributeCenter,
  Library,
  ChevronDown,
  BarChart
} from 'lucide-react';
import logo1 from "../../../public/logomain.png";

const MenuItem = ({ path, icon: Icon, label, isSidebarVisible, isActive, subItems, pathname }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (subItems) {
    return (
      <div>
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className={`
            flex items-center justify-between gap-4 px-2 py-2 mb-1 mx-2 rounded-lg cursor-pointer
            transition-all duration-200 ease-in-out hover:bg-gray-100 text-gray-600 hover:text-gray-900
            ${isActive ? 'bg-blue-50 text-[#0052CC]' : ''}
          `}
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-8 h-8">
              <Icon size={18} />
            </div>
            {isSidebarVisible && (
              <span className="text-sm font-medium whitespace-nowrap">
                {label}
              </span>
            )}
          </div>
          {isSidebarVisible && (
            <ChevronDown 
              size={16} 
              className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} text-gray-500`} 
            />
          )}
        </div>
        {isOpen && isSidebarVisible && (
          <div className="ml-2">
            {subItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <div className={`
                  flex items-center gap-2 py-2 px-4 text-sm rounded-lg cursor-pointer mb-1
                  transition-all duration-200 ease-in-out
                  ${pathname === item.path 
                    ? 'bg-blue-50 text-[#0052CC]' 
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'}
                `}>
                  {item.icon && <item.icon size={16} />}
                  {item.label}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link to={path}>
      <div className={`
        flex items-center gap-4 px-2 py-2 mb-1 mx-2 rounded-lg cursor-pointer
        transition-all duration-200 ease-in-out
        ${isActive 
          ? 'bg-blue-50 text-[#0052CC]' 
          : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'}
      `}>
        <div className="flex items-center justify-center w-8 h-8">
          <Icon size={18} />
        </div>
        {isSidebarVisible && (
          <span className="text-sm font-medium whitespace-nowrap">
            {label}
          </span>
        )}
      </div>
    </Link>
  );
};

const Sidebar = ({ isSidebarVisible, setIsSidebarVisible }) => {
  const { pathname } = useLocation();
  const { activeUserData, setActiveUserData } = useContext(AppContext);
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const userPosition = activeUserData?.user_position;

  const navigationConfig = {
    admin: [
      { path: '/', label: 'Dashboard', icon: Home }
    ],
    sales: [
      { path: '/', label: 'Dashboard', icon: Home }
    ],
    manager: [
      { path: '/', label: 'Dashboard', icon: Home }
    ]
  };

  const navItems = 
    userPosition === "1" ? navigationConfig.admin : 
    userPosition === "2" ? navigationConfig.manager : 
    navigationConfig.sales;

  const handleLogout = async () => {
    if (isLoggingOut) return; 
    setIsLoggingOut(true);

    // Clear local storage and update UI state
    secureLocalStorage.clear("data");
    setActiveUserData(null);

    // Navigate to login page
    navigate("/login");

    // Perform logout request
    try {
      const lsData = secureLocalStorage.getItem("data");
      if (lsData && lsData.session_id && lsData.access_token) {
        //await apiInstance(`/users.php`, 'DELETE', { session_id: lsData.session_id });
        await axiosInstance(
          `/session/logout?session=${lsData.session_id}`,
          "DELETE",
          {},
          lsData.access_token
        );
      }
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <aside className={`
      fixed left-0 top-0 h-screen bg-white border-r border-gray-200
      transition-all duration-300 ease-in-out z-20
      ${isSidebarVisible ? 'w-[220px]' : 'w-18'}
    `}>
      {/* Header */}
      <div className="flex items-center justify-between p-2 h-12 border-b border-gray-200">
        {isSidebarVisible && (
          <div className="flex items-center gap-3">
            <img src={logo1} alt="" className="w-[160px] pl-5" />
          </div>
        )}
        <button 
          onClick={() => setIsSidebarVisible(!isSidebarVisible)}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {!isSidebarVisible ? <Menu size={18} className='ml-4' /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Menu Items */}
      <div className="py-2 h-[calc(100vh-7rem)] overflow-y-auto">
        {navItems.map((item) => (
          <MenuItem 
            key={item.path || item.label}
            {...item}
            pathname={pathname}
            isSidebarVisible={isSidebarVisible}
            isActive={pathname === item.path}
          />
        ))}
      </div>

      {/* Logout Section */}
      <div className='p-4 border-t border-gray-200'>
        <button 
          className='flex items-center gap-2 w-full text-gray-700 hover:bg-gray-100 rounded-lg p-2 transition-colors' 
          onClick={handleLogout} 
          disabled={isLoggingOut}
        >
          <LogOut size={18} />
          {isSidebarVisible && <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
