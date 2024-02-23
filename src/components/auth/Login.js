import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import axios from "../../api/axios";
import useAuth from "../../hooks/useAuth";
const LOGIN_URL = "/client/login";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const { setAuth, persist, setPersist } = useAuth();
  const userRef = useRef();

  const [user, setUser] = useState("");
  const [pwd, setPwd] = useState("");
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    userRef.current.focus();
  }, []);

  useEffect(() => {
    setErrMsg("");
  }, [user, pwd]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        LOGIN_URL,
        { username: user, password: pwd },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      console.log(JSON.stringify(response?.data));
      const username = response?.data?.username;
      const accessToken = response?.data?.accessToken;
      const email = response?.data?.email;
      setAuth({ user: username, accessToken, email });
      setUser("");
      setPwd("");
      navigate(from, { replace: true });
    } catch (err) {
      if (!err?.response) {
        setErrMsg("No server response");
      } else if (err.response?.status === 401) {
        setErrMsg("No username (email) found or wrong password");
      } else if (err.response?.status === 403) {
        setErrMsg("Check your email to finish registration");
      } else {
        setErrMsg("Login failed");
      }
    }
  };

  const togglePersist = () => {
    setPersist((prev) => !prev);
  };

  useEffect(() => {
    localStorage.setItem("persist", persist);
  }, [persist]);

  return (
    <div
      className="card col-md-6 offset-md-3 offset-md-3"
      style={{ marginTop: "10px" }}
    >
      <h3 className="text-center" style={{ marginTop: "5px" }}>
        Sign In
      </h3>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <p className={errMsg ? "alert alert-danger" : "offcanvas"}>
            {errMsg}
          </p>
          <label htmlFor="username">Username (or email):</label>
          <input
            type="text"
            id="username"
            ref={userRef}
            autoComplete="off"
            className="form-control"
            placeholder="username (or email)"
            onChange={(e) => setUser(e.target.value)}
            value={user}
            required
            style={{ marginBottom: "10px" }}
          />

          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            className="form-control"
            placeholder="password"
            onChange={(e) => setPwd(e.target.value)}
            value={pwd}
            required
            style={{ marginBottom: "10px" }}
          />

          <input
            type="checkbox"
            id="persist"
            class="form-check-input"
            onChange={togglePersist}
            checked={persist}
          />
          <label
            htmlFor="persist"
            style={{ marginLeft: "10px", marginTop: "5px" }}
          >
            Trust this computer
          </label>
          <button
            className="btn btn-success"
            style={{ marginTop: "10px", width: "100%" }}
          >
            Sign In
          </button>
        </form>
        <br />
        <span>Need an Account?</span>
        <button
          className="btn btn-info"
          onClick={() => navigate("/register")}
          style={{ marginLeft: "10px" }}
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}
