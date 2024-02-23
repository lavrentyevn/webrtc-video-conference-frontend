import axios from "../api/axios";
import useAuth from "./useAuth";

const useRefreshToken = () => {
  const { setAuth } = useAuth();

  const refresh = async () => {
    const response = await axios.get("/refresh", {
      withCredentials: true,
    });
    setAuth((prev) => {
      console.log(JSON.stringify(prev));
      console.log(response.data);
      return {
        user: response.data.username || "Guest",
        accessToken: response.data.accessToken,
        email: response.data.email,
      };
    });
    return response.data.accessToken;
  };
  return refresh;
};

export default useRefreshToken;
