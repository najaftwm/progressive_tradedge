import secureLocalStorage from 'react-secure-storage';

// function to get the local storage
export const getLocalStorage = () => {
  try {
    const data = secureLocalStorage.getItem('data');
    if (data) {
      const localStorageData = {
        access_token: data.access_token,
        access_token_expiry: data.access_token_expiry,
        refresh_token: data.refresh_token,
        refresh_token_expiry: data.refresh_token_expiry,
        session_id: data.session_id,
      };

      return localStorageData;
    }
  } catch (error) {}
};
