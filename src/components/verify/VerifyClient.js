import { useEffect } from "react";
import { useParams } from "react-router";
import { Navigate } from "react-router";
import axios from "../../api/axios";

const VERIFY_CLIENT_URL = "/client/verify?token=";

export default function VerifyClient() {
  const token = useParams();

  useEffect(() => {
    const finishRegister = async (e) => {
      try {
        const response = await axios.put(
          VERIFY_CLIENT_URL + token.token,
          {},
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );
        console.log(JSON.stringify(response?.data));
      } catch (err) {
        if (!err?.response) {
          console.log("No server response");
        } else {
          console.log("Login failed");
        }
      }
    };

    finishRegister();
  }, []);

  return <Navigate to={"/"} />;
}
