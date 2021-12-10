const isProduction = process.env.NODE_ENV === "production";

export default {
  isProduction,
  apiUrl: process.env.REACT_APP_API_URL,
};
