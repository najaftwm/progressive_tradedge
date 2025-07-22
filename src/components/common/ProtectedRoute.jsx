import { useState, useContext, useEffect } from "react";
import secureLocalStorage from "react-secure-storage";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { AppContext } from "@context/AppContext";
import { getLocalStorage } from "@utils/getLocalStorage";
import { setLocalStorage } from "@utils/setLocalStorage";
import axiosInstance from "@api/axiosInstance";
import Loader from "@common/Loader";

const ProtectedRoute = ({ element }) => {
  const navigate = useNavigate();

  // getting the function from context to set the active user
  const { setActiveUserData, setDropDownValues } = useContext(AppContext);

  // loading state
  const [loading, setLoading] = useState(false);

  // verifying the user
  const verifyUser = async () => {
   // setLoading(true);

    // checking if the data is available in the local storage
    try {
      if (!getLocalStorage()) {
        window.location.href = "/login";
      }
    } catch (error) {
      toast.error("Error while verifying user");
    }

    const lsData = getLocalStorage();

    if (lsData) {
      axiosInstance(
        "/session/verify",
        "PATCH",
        {
          session_id: lsData?.session_id,
          refresh_token: lsData?.refresh_token,
        },
        lsData.access_token
      )
        .then((responseData) => {
          // if force logout
          if (responseData?.data?.data?.force_logout === 1) {
            localStorage.clear();
            setActiveUserData(null);
            navigate("/login");
          }
          // if session extended or verified successfully
          else if (
            responseData?.data?.messages[0] === "Session Extended" ||
            responseData?.data?.messages[0] === "Verified Successfully"
          ) {
            // setting the active user in context
            setActiveUserData({
              user_name: responseData?.data?.data?.user_name,
              user_id: responseData?.data?.data?.user_id,
              user_position: responseData?.data?.data?.user_role,
            });

            // setting the local storage
            setLocalStorage(
              responseData?.data?.data?.access_token,
              responseData?.data?.data?.access_token_expiry,
              responseData?.data?.data?.refresh_token,
              responseData?.data?.data?.refresh_token_expiry,
              responseData?.data?.data?.session_id
            );
          }
        })
/*         .then(() => {
          getDropdownValues(lsData.session_id, lsData.access_token);
        }) */
        .catch((err) => {
          setLoading(false);
          secureLocalStorage.clear("data");
          setActiveUserData(null);
          window.location.href = "/login";
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };
/*   const getDropdownValues = async (session_id, access_token) => {
    axiosInstance("/ddval/home/" + session_id, "GET", {}, access_token)
      .then((responseData) => {
        setDropDownValues(responseData?.data?.data);
        setLoading(false);
      })
      .catch((error) => {
        toast.error("Error while fetching dropdown values");
      });
  }; */

  useEffect(() => {
    verifyUser();
  }, []);

  if (loading) return <Loader />;
  return element;
};

export default ProtectedRoute;
