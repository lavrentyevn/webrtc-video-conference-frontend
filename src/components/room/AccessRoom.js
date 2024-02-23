import { useRef, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import axios from "../../api/axios";
import useAuth from "../../hooks/useAuth";

const ACCESS_ROOM_URL = "/room/access";
const CHECK_INVITATION_URL = "/invitation/check";

export default function AccessRoom() {
  const navigate = useNavigate();
  const { auth } = useAuth();

  const name = useParams();
  const [roomPwd, setRoomPwd] = useState("");

  const userRef = useRef();
  const errRef = useRef();

  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    userRef.current.focus();

    const checkInvitation = async (req, res) => {
      try {
        const response = await axios.post(
          CHECK_INVITATION_URL,
          { email: auth?.email, room: name.name },
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );
        console.log(response.data);
        navigate(`../room/${name.name}`);
      } catch (err) {
        if (!err?.response) {
          console.log("No server response");
        } else if (err.response?.status === 403) {
          console.log("This person is not invited");
        } else {
          console.log("Error in checking invitation");
        }
      }
    };

    checkInvitation();
  }, []);

  const handleAccessRoom = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        ACCESS_ROOM_URL,
        { name: name.name, password: roomPwd },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      console.log(response.data);
      navigate(`../room/${name.name}`);
    } catch (err) {
      if (!err?.response) {
        setErrMsg("No server response");
      } else if (err.response?.status === 404) {
        setErrMsg("No room found");
      } else if (err.response?.status === 401) {
        setErrMsg("Wrong password");
      } else {
        setErrMsg("Accessing room failed");
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
        Join Room
      </h3>
      <div className="card-body">
        <form onSubmit={handleAccessRoom}>
          <p
            ref={errRef}
            className={errMsg ? "alert alert-danger" : "offcanvas"}
          >
            {errMsg}
          </p>

          <label htmlFor="roompwd">Room Password:</label>
          <input
            type="password"
            id="roompwd"
            ref={userRef}
            className="form-control"
            placeholder="Room Password"
            onChange={(e) => setRoomPwd(e.target.value)}
            value={roomPwd}
            required
            style={{ marginBottom: "10px" }}
          />

          <button
            className="btn btn-success"
            style={{ marginTop: "10px", width: "100%" }}
          >
            Join Room
          </button>
        </form>
      </div>
    </div>
  );
}
