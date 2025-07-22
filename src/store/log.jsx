import { create } from 'zustand';
import { AppContext } from "@context/AppContext";
import { useContext, useEffect } from "react";
import apiInstance from "@api/apiInstance";

let logData2 = [];

// Define the Zustand store
export const useLoggerStore = create((set, get) => ({
    // Define the logData object
    logData: {
        user_ip: "",
        user_agent: "",
        user_id: "",
        user_name: "",
        date_time: "",
        log: "",
    },

    // Function to asynchronously initialize logData with predefined values
    initializeLogData: async (userData) => {
        try {
            const ipResponse = await fetch('https://api.ipify.org?format=json');
            if (!ipResponse.ok) {
                throw new Error('Network response was not ok');
            }
            const ipData = await ipResponse.json();


            logData2.push({
                user_ip: ipData?.ip,
                user_agent: navigator.userAgent,
                user_id: userData?.user_id,
                user_name: userData?.user_name,
                date_time: new Date().toLocaleString(),
            });

            set({
                logData: {
                    user_ip: ipData.ip,
                    user_agent: navigator.userAgent,
                    user_id: userData?.user_id,
                    user_name: userData?.user_name,
                    date_time: new Date().toLocaleString(),
                    log: "",
                }
            });
        } catch (error) {
            console.error('Error In logger:', error);
            // Optionally set a default value for user_ip in case of error
            set((state) => ({
                logData: { ...state.logData, user_ip: "Unavailable" }
            }));
        }
    },

    // Function to update only the log field and send a POST request
    updateActivityLog: async (newLog) => {
        set((state) => ({
            logData: { ...state.logData, log: newLog }
        }));

        const { logData } = get();

        try {
            const hello = 0;
        } catch (error) {
            console.error('Error sending log data:', error);
        }
    },
}));
