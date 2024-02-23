import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import axios from "../../api/axios";

const EMAIL_REGEX = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
const USER_REGEX = /^[A-z][A-z0-9-_]{3,23}$/;
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;
const REGISTER_CLIENT_URL = "/client";
const REGISTER_GUEST_URL = "/guest";

export default function Register() {
  const navigate = useNavigate();

  const emailRef = useRef();
  const userRef = useRef();
  const errRef = useRef();

  const [email, setEmail] = useState("");
  const [validEmail, setValidEmail] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);

  const [user, setUser] = useState("");
  const [validName, setValidName] = useState(false);
  const [userFocus, setUserFocus] = useState(false);

  const [pwd, setPwd] = useState("");
  const [validPwd, setValidPwd] = useState(false);
  const [pwdFocus, setPwdFocus] = useState(false);

  const [matchPwd, setMatchPwd] = useState("");
  const [validMatch, setValidMatch] = useState(false);
  const [matchFocus, setMatchFocus] = useState(false);

  const [loading, setLoading] = useState(false);
  const [regularRegister, setRegularRegister] = useState(true);

  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    emailRef.current.focus();
  }, []);

  useEffect(() => {
    const result = EMAIL_REGEX.test(email);
    console.log(result);
    console.log(email);
    setValidEmail(result);
  }, [email]);

  useEffect(() => {
    const result = USER_REGEX.test(user);
    console.log(result);
    console.log(user);
    setValidName(result);
  }, [user]);

  useEffect(() => {
    const result = PWD_REGEX.test(pwd);
    console.log(result);
    console.log(pwd);
    setValidPwd(result);
    const match = pwd === matchPwd;
    setValidMatch(match);
  }, [pwd, matchPwd]);

  useEffect(() => {
    setErrMsg("");
  }, [email, user, pwd, matchPwd]);

  const handleRegisterClient = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        REGISTER_CLIENT_URL,
        { email: email, username: user, password: pwd },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      console.log(response.data);
      console.log(response.accessToken);
      localStorage.setItem("verify", true);
      setLoading(false);
      navigate(`/checkemail/${email}`);
    } catch (err) {
      setLoading(false);
      if (!err?.response) {
        setErrMsg("No server response");
      } else if (err.response?.status === 409) {
        setErrMsg("Username or email taken");
      } else {
        setErrMsg("Registration failed");
      }
      errRef.current.focus();
    }
  };

  const handleRegisterGuest = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        REGISTER_GUEST_URL,
        { email },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      console.log(response.data);
      localStorage.setItem("verify", true);
      setLoading(false);
      navigate(`/checkemail/${email}`);
    } catch (err) {
      setLoading(false);
      if (!err?.response) {
        setErrMsg("No server response");
      } else if (err.response?.status === 409) {
        setErrMsg("Email already used");
      } else {
        setErrMsg("Registration failed");
      }
      errRef.current.focus();
    }
  };

  return (
    <div
      className="card col-md-6 offset-md-3 offset-md-3"
      style={{ marginTop: "10px" }}
    >
      <h3 className="text-center" style={{ marginTop: "5px" }}>
        Register
      </h3>
      <div
        class="btn-group"
        role="group"
        aria-label="Basic radio toggle button group"
        style={{ width: "50%", margin: "0 auto" }}
      >
        <input
          type="radio"
          class="btn-check"
          id="btnradio1"
          checked={regularRegister}
          onChange={() => setRegularRegister((prev) => !prev)}
        />
        <label class="btn btn-outline-primary" for="btnradio1">
          Registration
        </label>
        <input
          type="radio"
          class="btn-check"
          id="btnradio2"
          checked={!regularRegister}
          onChange={() => setRegularRegister((prev) => !prev)}
        />
        <label class="btn btn-outline-primary" for="btnradio2">
          Fast Email
        </label>
      </div>

      <>
        {regularRegister ? (
          <div className="card-body">
            <form onSubmit={handleRegisterClient}>
              <p
                ref={errRef}
                className={errMsg ? "alert alert-danger" : "offcanvas"}
              >
                {errMsg}
              </p>
              <label htmlFor="email">
                Email:
                <span className={validEmail ? "text-success" : "offcanvas"}>
                  <i class="bi bi-check"></i>
                </span>
                <span
                  className={validEmail || !email ? "offcanvas" : "text-danger"}
                >
                  <i class="bi bi-x"></i>
                </span>
              </label>
              <input
                type="text"
                id="email"
                ref={emailRef}
                autoComplete="off"
                className="form-control"
                placeholder="email"
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-invalid={validEmail ? "false" : "true"}
                aria-describedby="emailnote"
                onFocus={() => setEmailFocus(true)}
                onBlur={() => setEmailFocus(false)}
                style={{ marginBottom: "10px" }}
              />
              <p
                id="emailnote"
                className={
                  emailFocus && email && !validEmail
                    ? "alert alert-secondary"
                    : "offcanvas"
                }
              >
                <i class="bi bi-info-circle"></i>
                <span style={{ marginLeft: "5px" }}>
                  Must be a valid email address
                </span>
              </p>

              <label htmlFor="username">
                Username:
                <span className={validName ? "text-success" : "offcanvas"}>
                  <i class="bi bi-check"></i>
                </span>
                <span
                  className={validName || !user ? "offcanvas" : "text-danger"}
                >
                  <i class="bi bi-x"></i>
                </span>
              </label>
              <input
                type="text"
                id="username"
                ref={userRef}
                autoComplete="off"
                className="form-control"
                placeholder="username"
                onChange={(e) => setUser(e.target.value)}
                required
                aria-invalid={validName ? "false" : "true"}
                aria-describedby="uidnote"
                onFocus={() => setUserFocus(true)}
                onBlur={() => setUserFocus(false)}
                style={{ marginBottom: "10px" }}
              />
              <p
                id="uidnote"
                className={
                  userFocus && user && !validName
                    ? "alert alert-secondary"
                    : "offcanvas"
                }
              >
                <i class="bi bi-info-circle"></i>
                <span style={{ marginLeft: "5px" }}>
                  4 to 24 characters. <br />
                  Must begin with a letter. <br />
                  Letters, numbers, underscores, hyphens allowed.
                </span>
              </p>

              <label htmlFor="password">
                Password:
                <span className={validPwd ? "text-success" : "offcanvas"}>
                  <i class="bi bi-check"></i>
                </span>
                <span
                  className={validPwd || !pwd ? "offcanvas" : "text-danger"}
                >
                  <i class="bi bi-x"></i>
                </span>
              </label>
              <input
                type="password"
                id="password"
                className="form-control"
                placeholder="password"
                onChange={(e) => setPwd(e.target.value)}
                required
                aria-invalid={validPwd ? "false" : "true"}
                aria-describedby="pwdnote"
                onFocus={() => setPwdFocus(true)}
                onBlur={() => setPwdFocus(false)}
                style={{ marginBottom: "10px" }}
              />
              <p
                id="pwdnote"
                className={
                  pwdFocus && !validPwd ? "alert alert-secondary" : "offcanvas"
                }
              >
                <i class="bi bi-info-circle"></i>
                <span style={{ marginLeft: "5px" }}>
                  8 to 24 characters. <br />
                  Must include uppercase and lowercase letters, a number and a
                  special character.
                </span>
              </p>

              <label htmlFor="confirm_pwd">
                Confirm Password:
                <span
                  className={
                    validMatch && matchPwd ? "text-success" : "offcanvas"
                  }
                >
                  <i class="bi bi-check"></i>
                </span>
                <span
                  className={
                    validMatch || !matchPwd ? "offcanvas" : "text-danger"
                  }
                >
                  <i class="bi bi-x"></i>
                </span>
              </label>
              <input
                type="password"
                id="confirm_pwd"
                className="form-control"
                placeholder="password"
                onChange={(e) => setMatchPwd(e.target.value)}
                required
                aria-invalid={validMatch ? "false" : "true"}
                aria-describedby="confirmnote"
                onFocus={() => setMatchFocus(true)}
                onBlur={() => setMatchFocus(false)}
                style={{ marginBottom: "10px" }}
              />
              <p
                id="confirmnote"
                className={
                  matchFocus && !validMatch
                    ? "alert alert-secondary"
                    : "offcanvas"
                }
              >
                <i class="bi bi-info-circle"></i>
                <span style={{ marginLeft: "5px" }}>
                  Must match the first password input field
                </span>
              </p>

              <button
                disabled={
                  !validName ||
                  !validPwd ||
                  !validMatch ||
                  !validEmail ||
                  loading
                    ? true
                    : false
                }
                className="btn btn-success"
                style={{ marginTop: "10px", width: "100%" }}
              >
                Sign Up
              </button>
            </form>
            <br />
            <span>Already registered?</span>
            <button
              className="btn btn-info"
              onClick={() => navigate("/login")}
              style={{ marginLeft: "10px" }}
            >
              Login
            </button>
          </div>
        ) : (
          <div className="card-body">
            <form onSubmit={handleRegisterGuest}>
              <p>Fast Email allows you to get a Guest Account</p>
              <p>Verify email = 30 minutes access to chats</p>
              <p
                ref={errRef}
                className={errMsg ? "alert alert-danger" : "offcanvas"}
              >
                {errMsg}
              </p>
              <label htmlFor="email">
                Email:
                <span className={validEmail ? "text-success" : "offcanvas"}>
                  <i class="bi bi-check"></i>
                </span>
                <span
                  className={validEmail || !email ? "offcanvas" : "text-danger"}
                >
                  <i class="bi bi-x"></i>
                </span>
              </label>
              <input
                type="text"
                id="email"
                ref={emailRef}
                autoComplete="off"
                className="form-control"
                placeholder="email"
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-invalid={validEmail ? "false" : "true"}
                aria-describedby="emailnote"
                onFocus={() => setEmailFocus(true)}
                onBlur={() => setEmailFocus(false)}
                style={{ marginBottom: "10px" }}
              />
              <p
                id="emailnote"
                className={
                  emailFocus && email && !validEmail
                    ? "alert alert-secondary"
                    : "offcanvas"
                }
              >
                <i class="bi bi-info-circle"></i>
                <span style={{ marginLeft: "5px" }}>
                  Must be a valid email address
                </span>
              </p>
              <button
                disabled={!validEmail || loading ? true : false}
                className="btn btn-success"
                style={{ marginTop: "10px", width: "100%" }}
              >
                Sign Up
              </button>
            </form>
          </div>
        )}
      </>
    </div>
  );
}
