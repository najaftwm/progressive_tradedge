// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import { AppProvider, AppContext } from "./context/AppContext";
// import ProtectedRoute from "./components/common/ProtectedRoute";
// import { ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import Sidebar from "@components/common/Sidebar"; 
// import Header from "@components/common/Header"; 
// import React, { useState, useContext } from "react";

// // Page imports
// import LoginPage from "@pages/LoginPage";
// import Dashboard from "@pages/Dashboard";

// const Layout = ({ children }) => {
//   const [isSidebarVisible, setIsSidebarVisible] = useState(
//     window.innerWidth >= 1024 
//   );
//   const { activeUserData } = useContext(AppContext);

//   // Handle window resize
//   React.useEffect(() => {
//     const handleResize = () => {
//       if (window.innerWidth < 1024 && isSidebarVisible) {
//         setIsSidebarVisible(false);
//       } else if (window.innerWidth >= 1024 && !isSidebarVisible) {
//         setIsSidebarVisible(true);
//       }
//     };
    
//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, [isSidebarVisible]);

//   return (
//     <div className="flex min-h-screen bg-gray-50">
//       <Sidebar
//         isSidebarVisible={isSidebarVisible}
//         setIsSidebarVisible={setIsSidebarVisible}
//       />
//       <div className={`
//         flex-1 transition-all duration-300 ease-in-out
//         w-full
//         ${isSidebarVisible 
//           ? 'lg:ml-[220px] ml-0' 
//           : 'lg:ml-16 ml-0'}
//       `}>
//         <div className="fixed top-0 right-0 left-0 z-10 border-gray-200 h-14 lg:h-16">
//           <Header />
//         </div>
//         <main className="pt-14 lg:pt-16 p-2 md:p-4 lg:p-2">
//           {children}
//         </main>
//       </div>
//     </div>
//   );
// };

// // Route configuration
// const routes = [
//   {
//     path: "/login",
//     element: LoginPage,
//     protected: false
//   },
//   {
//     path: "/",
//     element: Dashboard,
//     protected: true,
//     key: "dashboard-page",
//     role: "admin"
//   }
// ];

// const AppContent = () => {
//   const renderRoute = (route) => {
//     const Component = route.element;
    
//     if (!route.protected) {
//       return <Route key={route.path} path={route.path} element={<Component />} />;
//     }

//     return (
//       <Route
//         key={route.path}
//         path={route.path}
//         element={
//           <ProtectedRoute
//             element={
//               <Layout>
//                 <Component />
//               </Layout>
//             }
//             key={route.key}
//             role={route.role}
//           />
//         }
//       />
//     );
//   };

//   return (
//     <>
//     <ToastContainer 
//       autoClose={1000}
//       position="top-right"
//       hideProgressBar={false}
//       newestOnTop
//       closeOnClick
//       rtl={false}
//       pauseOnFocusLoss
//       draggable
//       pauseOnHover
//       className="z-50"
//     />
//     <BrowserRouter>
//       <Routes>
//         {routes.map(renderRoute)}
//       </Routes>
//     </BrowserRouter>
//     </>
//   );
// };

// const App = () => {
//   return (
//     <AppProvider>
//       <AppContent />
//     </AppProvider>
//   );
// };

// export default App;
// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { StockProvider } from './context/StockContext';
import OtpLogin from './components/Login/OtpLogin';
import Layout from './components/Layout';
import Home from './screens/Home';
import Stocks from './screens/Stocks';
import Trades from './screens/Trades';
import Packs from './screens/Packs';
import Refer from './screens/Refer';
import Profile from './screens/Profile';
import Tradedetails from './screens/TradeDetails';
import BuyPackageOffer from './components/Home/BuyPackages';
import PaymentResult from './components/PaymentResult';
import TradeDetailedCard from './components/Home/Tradedetailedcard';
import PackagesScreen from './screens/main/buy-packages';
import TransactionHistoryPage from './components/TransactionHistory';

function App() {
  return (
    <AuthProvider>
      <StockProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<OtpLogin />} />
            {/* Routes with BottomNav */}
            <Route element={<Layout />}>
              <Route path="/home" element={<Home />} />
              <Route path="/stocks" element={<Stocks />} />
              <Route path="/trades" element={<Trades />} />
              <Route path="/packs" element={<Packs />} />
              <Route path="/refer" element={<Refer />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/Tradedetails" element={<Tradedetails />} />
              <Route path="/BuyPackageOffer" element={<BuyPackageOffer />} />
              <Route path="/paymentResult" element={<PaymentResult />} />
              <Route path="/main/TradeDetailedCard" element={<TradeDetailedCard />} />
              <Route path="/user_package" element={<PackagesScreen />} />
              <Route path="/transactions-history" element={<TransactionHistoryPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </StockProvider>
    </AuthProvider>
  );
}

export default App;

