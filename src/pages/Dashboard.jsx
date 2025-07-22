import React, { useEffect, useContext, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "@context/AppContext";
import apiInstance from "@api/apiInstance";
import LoaderComponent from "@components/common/LoaderComponent.jsx";
import { useTable, usePagination, useSortBy } from "react-table";
import {
  FiGrid,
  FiBarChart2
} from 'react-icons/fi';



const Dashboard = () => {
  const { activeUserData } = useContext(AppContext);
  const [loaderActive, setLoaderActive] = useState(false);
  const [viewMode, setViewMode] = useState("table");
  const navigate = useNavigate();

  useEffect(() => {
    if (
      activeUserData &&
      activeUserData?.user_position !== "1" &&
      activeUserData?.user_position !== "2"
    ) {
      navigate("/salesDashhboard");
    }
  }, [activeUserData, navigate]);



  // const fetchReportData = async () => {
  //   setLoaderActive(true);
  //   try {
  //     const [reportRes, dashboardRes] = await Promise.all([
  //       apiInstance('/admin_report.php', 'POST'),
  //       apiInstance('/adminDashboard.php', 'GET')
  //     ]);

  //     if (dashboardRes?.data?.status && dashboardRes.data.data) {
  //       setGraphData(dashboardRes.data.data);
  //     } else {
  //       console.warn("Graph data might be missing or in unexpected format:", dashboardRes?.data);
  //       setGraphData([]);
  //     }

  //     const data = reportRes?.data?.data || [];
  //     setReportData(data);

  //     const totals = data.reduce(
  //       (acc, curr) => {
  //         acc.total_assigned_leads += parseInt(curr.total_assigned_leads, 10) || 0;
  //         acc.total_tagged += parseInt(curr.tagged, 10) || 0;
  //         acc.tagged_today += parseInt(curr.tagged_today_per_user, 10) || 0;
  //         acc.assigned_today += parseInt(curr.assigned_today, 10) || 0;
  //         acc.total_amount += parseFloat(curr.total_amount_till_now_per_user) || 0;
  //         acc.total_amount_collected_today += parseFloat(curr.total_amount_today_per_user) || 0;
  //         acc.total_leads = parseInt(data[0]?.total_leads, 10) || 0;
  //         acc.amount_this_month = Number(curr.amount_this_month) || 0;
  //         return acc;
  //       },
  //       {
  //         total_assigned_leads: 0,
  //         total_tagged: 0,
  //         tagged_today: 0,
  //         assigned_today: 0,
  //         total_amount: 0,
  //         total_amount_collected_today: 0,
  //         amount_this_month: 0,
  //         total_leads: 0
  //       }
  //     );

  //     setSummaryData(totals);
  //   } catch (error) {
  //     console.error("Error fetching dashboard data:", error);
  //   } finally {
  //     setLoaderActive(false);
  //   }
  // };

  // useEffect(() => {
  //   if (activeUserData?.user_position === "1" || activeUserData?.user_position === "2") {
  //     fetchReportData();
  //   }
  // }, [activeUserData]);




  return (
    <>
      {loaderActive && <LoaderComponent />}
      <section className="flex-1 p-2  min-h-screen">
        <div className=" mx-auto">
          {/* Header */}
          <div className="mb-2 flex justify-between items-center">
            <div className="flex items-center space-x-1 bg-gray-200 p-1 rounded-md">
              <button
                onClick={() => setViewMode("table")}
                className={`px-2 py-1 rounded-md text-sm font-medium flex items-center ${viewMode === "table" ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
                aria-label="Table View"
              >
                <FiGrid className="mr-1" size={14}/> Table
              </button>
              <button
                onClick={() => setViewMode("transaction")}
                className={`px-2 py-1 rounded-md text-sm font-medium flex items-center ${viewMode === "transaction" ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
                aria-label="Transaction View"
              >
                <FiBarChart2 className="mr-1" size={14}/> Transaction
              </button>
            </div>
          </div>



        </div>
      </section>
    </>
  );
};

export default Dashboard;