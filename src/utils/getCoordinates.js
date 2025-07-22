// function to  get the user coordinates
export const getCoordinates = async () => {
  try {
    if ("geolocation" in navigator) {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const data = {
        longitude: position.coords.longitude,
        latitude: position.coords.latitude,
      };

      return data;
    }
  } catch (error) {
    console.log(error);
  }
};
