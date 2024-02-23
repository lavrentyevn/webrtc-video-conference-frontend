import axios from "../api/axios";
import useAuth from "./useAuth";

const useLogout = () => {
  const { setAuth } = useAuth();

  const logout = async () => {
    console.log("logging out");
    setAuth({});
    try {
      const response = await axios.put(
        "/logout",
        {},
        {
          withCredentials: true,
        }
      );
      console.log(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  return logout;
};

export default useLogout;
