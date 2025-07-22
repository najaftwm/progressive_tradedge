import { useContext, useState, useEffect } from "react";
import Pusher from 'pusher-js';
import { AppContext } from "@context/AppContext";
import { useLoggerStore } from "@store/log.jsx";
import { UserRound, Timer, ChevronDown } from "lucide-react";
import apiInstance from "@api/apiInstance";


const Header = () => {
  const { activeUserData, setActiveUserData } = useContext(AppContext);
  const { updateActivityLog, initializeLogData } = useLoggerStore();
  const [at_status, setAt_status] = useState(null);
  const [notifications, setNotifications] = useState([]); 

  // --- Break system states ---
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [breakStartTime, setBreakStartTime] = useState(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [breakType, setBreakType] = useState(null);
  const [currentStatus, setCurrentStatus] = useState({ type: 'online', label: 'Online' });
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  // --- Break system effects ---
  useEffect(() => {
    const activeBreak = localStorage.getItem('activeBreak');
    if (activeBreak) {
      const { isOnBreak: storedIsOnBreak, startTime, breakType: storedBreakType } = JSON.parse(activeBreak);
      const startTimeDate = new Date(startTime);
      const now = new Date();
      const elapsed = Math.floor((now - startTimeDate) / 1000);
      setIsOnBreak(storedIsOnBreak);
      setBreakStartTime(startTimeDate);
      setTimeElapsed(elapsed);
      setBreakType(storedBreakType);
      setCurrentStatus({ type: 'break', label: storedBreakType });
    }
  }, []);

  useEffect(() => {
    let interval;
    if (isOnBreak) {
      interval = setInterval(() => {
        const now = new Date().getTime();
        const elapsed = Math.floor((now - breakStartTime) / 1000);
        setTimeElapsed(elapsed);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOnBreak, breakStartTime]);

  // --- Break system handlers ---
  const formatLocalTime = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleStatusChange = async (newStatus) => {
    setStatusDropdownOpen(false);
    if (isOnBreak && newStatus.type !== 'break') {
      await endBreak();
    }
    if (newStatus.type === 'break' && !isOnBreak) {
      const startTime = new Date();
      setIsOnBreak(true);
      setBreakStartTime(startTime);
      setBreakType(newStatus.label.toLowerCase());
      const localStartTime = formatLocalTime(startTime);
      localStorage.setItem('activeBreak', JSON.stringify({
        isOnBreak: true,
        startTime: localStartTime,
        breakType: newStatus.label.toLowerCase(),
      }));
    }
    setCurrentStatus(newStatus);
  };

  const endBreak = async () => {
    if (!isOnBreak) return;
    const endTime = new Date();
    const duration = Math.floor((endTime - breakStartTime) / 1000);
    const localStartTime = formatLocalTime(breakStartTime);
    const localEndTime = formatLocalTime(endTime);
    const breakData = {
      user_id: activeUserData?.user_id?.replace("LNUSR", ""),
      start_time: localStartTime,
      end_time: localEndTime,
      duration: duration,
      break_type: breakType,
    };
    try {
      const response = await apiInstance('/break.php', 'PATCH', { breakData });
      if (response.data.status === 'success') {
        console.log('Break ended successfully');
      }
    } catch (error) {
      console.error('Error:', error);
    }
    localStorage.removeItem('activeBreak');
    setIsOnBreak(false);
    setBreakStartTime(null);
    setTimeElapsed(0);
    setBreakType(null);
    setCurrentStatus({ type: 'online', label: 'Online' });
  };

  const fetchAttendanceStatus = async (user_id) => {
    try {
      const response = await apiInstance(`/attendance.php?user_id=${user_id}`, 'GET');
      const records = response?.data?.data?.records;
      if (records?.length === 0) {
        setAt_status("none");
      } else if (records[0]?.start_time && records[0]?.end_time) {
        setAt_status("none");
      } else {
        setAt_status(records[0]?.start_time);
      }
    } catch (error) {
      console.error('Error fetching attendance status:', error);
    }
  };

  // Pusher setup for notifications
  useEffect(() => {
    const user_id = activeUserData?.user_id?.replace('LNUSR', '');
    if (!user_id) return;

    // Fetch attendance status
    fetchAttendanceStatus(user_id);

    // Initialize Pusher
    const pusher = new Pusher('0608b070c25191598ff3', {
      cluster: 'mt1',
      forceTLS: true
    });

    const channel = pusher.subscribe('notifications-all');

    channel.bind('new-notification', (data) => {
      setNotifications(prev => [...prev, { ...data, read: false }]);
      if (Notification.permission === 'granted') {
        new Notification('Follow-up Reminder', {
          body: `${data.message} (Lead ID: ${data.lead_id})`
        });
      }
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [activeUserData]);

  const username = activeUserData?.user_name;

  const handleAttendance = async (log) => {
    const user_id = activeUserData?.user_id?.replace('LNUSR', '');
    const time = new Date();
    const localTime = formatLocalTime(time); // "2025-07-10T09:22:16"
    const [at_date, startOrEndTime] = localTime.split('T');

    const inRequestBody = {
      user_id,
      punch: log,
      at_date,
      [log === "in" ? "start_time" : "end_time"]: startOrEndTime
    };

    await apiInstance(`/attendance.php`, 'PATCH', inRequestBody);
    fetchAttendanceStatus(user_id);
  };

  useEffect(() => {
    initializeLogData(activeUserData);
  }, [activeUserData, initializeLogData]);

  // Notification handlers
  const clearNotifications = () => {
    setNotifications([]);
  };

  const markAsRead = (index) => {
    setNotifications(prev => {
      const updatedNotifications = [...prev];
      updatedNotifications[index] = { ...updatedNotifications[index], read: true };
      return updatedNotifications;
    });
  };

  return (
    <header className="sticky top-0 left-0 h-12 flex min-w-full items-center justify-end w-full px-8 py-2 bg-white border-b border-gray-200 shadow-sm">
      <button className="group  relative flex select-none items-center bg-[#0052CC] border border-gray-200 py-1 px-2 shadow-md">
        <div className="flex items-center">
          <div className="mr-2">
            <UserRound size={20} color="white" />
          </div>
          <div className="text-white text-sm font-medium">
            {username}
          </div>
        </div>
      </button>
    </header>
  );
};

export default Header;