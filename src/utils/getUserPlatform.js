// function to get the user platform
export const getUserPlatform = () => {
  const userAgent = navigator.userAgent;

  if (
    /(Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone)/i.test(userAgent)
  ) {
    return "Mobile";
  } else {
    return "Browser";
  }
};
