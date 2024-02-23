import { useEffect } from "react";
import { useParams } from "react-router";
import { Navigate } from "react-router";
import axios from "../../api/axios";
import useAuth from "../../hooks/useAuth";

const VERIFY_GUEST_URL = "/guest/verify?token=";

export default function VerifyGuest() {
  const { setAuth, persist, setPersist } = useAuth();
  const token = useParams();

  useEffect(() => {
    const fastLogin = async (e) => {
      try {
        const response = await axios.put(
          VERIFY_GUEST_URL + token.token,
          {},
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );
        console.log(JSON.stringify(response?.data));
        const accessToken = response?.data?.accessToken;
        const email = response?.data?.email;
        setAuth({ user: "Guest", accessToken, email });
        setPersist(true);
      } catch (err) {
        if (!err?.response) {
          console.log("No server response");
        } else {
          console.log("Login failed");
        }
      }
    };

    fastLogin();
  }, []);

  useEffect(() => {
    localStorage.setItem("persist", persist);
  }, [persist]);

  return <Navigate to={"/"} />;
}
