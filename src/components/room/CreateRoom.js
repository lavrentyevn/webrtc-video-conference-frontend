import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router";
import axios from "../../api/axios";
import useAuth from "../../hooks/useAuth";
import useLogout from "../../hooks/useLogout";

const CREATE_ROOM_URL = "/room";
const INVITE_URL = "/invitation";
const CREATE_EVENT_URL = "/event";

export default function CreateRoom() {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const logout = useLogout();

  const [roomName, setRoomName] = useState("");
  const [roomPwd, setRoomPwd] = useState("");
  const [roomDescription, setRoomDescription] = useState("");

  const userRef = useRef();
  const errRef = useRef();

  const [errMsg, setErrMsg] = useState("");

  const [sendInvitations, setSendInvitations] = useState(false);

  const [createEvent, setCreateEvent] = useState(false);

  useEffect(() => {
    auth?.user != "Guest" && userRef.current.focus();
  }, []);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        CREATE_ROOM_URL,
        JSON.stringify({
          name: roomName,
          password: roomPwd,
          description: roomDescription,
          creator: auth?.user,
        }),
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      sendInvitations && handleInvite();

      createEvent && handleEvent();

      navigate(`../room/${roomName}`);
    } catch (err) {
      if (!err?.response) {
        setErrMsg("No server response");
      } else if (err.response?.status === 409) {
        setErrMsg("Room name taken");
      } else if (err.response?.status === 404) {
        setErrMsg("No user found");
      } else {
        setErrMsg("Creating room failed");
      }
      errRef.current.focus();
    }
  };

  const handleInvite = async () => {
    const li = document
      .getElementById("invitations")
      .getElementsByTagName("li");
    const email = [];
    for (let i = 0; i <= li.length - 1; i++) {
      email.push(li[i].innerHTML);
    }
    try {
      const invite = await axios.post(
        INVITE_URL,
        JSON.stringify({
          email,
          room: roomName,
        }),
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
    } catch (err) {
      console.log(err);
    }
  };

  const handleEvent = async () => {
    try {
      const event = await axios.post(
        CREATE_EVENT_URL,
        JSON.stringify({
          room: roomName,
        }),
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
    } catch (err) {
      console.log(err);
    }
  };

  const handleGuestProhibition = async () => {
    await logout();
    navigate("/register");
  };

  return (
    <>
      {auth?.user != "Guest" ? (
        <div
          className="card col-md-6 offset-md-3 offset-md-3"
          style={{ marginTop: "10px" }}
        >
          <h3 className="text-center" style={{ marginTop: "5px" }}>
            Create Room
          </h3>
          <div className="card-body">
            <form>
              <p
                ref={errRef}
                className={errMsg ? "alert alert-danger" : "offcanvas"}
              >
                {errMsg}
              </p>
              <label htmlFor="roomname">Room Name:</label>
              <input
                type="text"
                id="roomname"
                ref={userRef}
                autoComplete="off"
                className="form-control"
                placeholder="Room name"
                onChange={(e) => setRoomName(e.target.value)}
                value={roomName}
                required
                style={{ marginBottom: "10px" }}
              />
              <label htmlFor="roompwd">Room Password:</label>
              <input
                type="password"
                id="roompwd"
                className="form-control"
                placeholder="Room Password"
                onChange={(e) => setRoomPwd(e.target.value)}
                value={roomPwd}
                required
                style={{ marginBottom: "10px" }}
              />
              <label htmlFor="description">Room Description:</label>
              <input
                type="text"
                id="description"
                className="form-control"
                placeholder="Room Description"
                onChange={(e) => setRoomDescription(e.target.value)}
                value={roomDescription}
                required
                style={{ marginBottom: "10px" }}
              />
              <input
                class="form-check-input"
                type="checkbox"
                id="flexCheckDefault1"
                checked={sendInvitations}
                onChange={() => setSendInvitations((prev) => !prev)}
              />
              <label
                class="form-check-label"
                for="flexCheckDefault1"
                style={{ marginLeft: "10px", marginTop: "5px" }}
              >
                Send invitations
              </label>
              <br />
              <input
                class="form-check-input"
                type="checkbox"
                id="flexCheckDefault2"
                checked={createEvent}
                onChange={() => setCreateEvent((prev) => !prev)}
              />
              <label
                class="form-check-label"
                for="flexCheckDefault2"
                style={{ marginLeft: "10px", marginTop: "5px" }}
              >
                Create Event
              </label>
              {sendInvitations && (
                <div style={{ marginTop: "10px" }}>
                  <h4>Write users email addresses below</h4>
                  <ol id="invitations" class="list-group">
                    <li class="list-group-item" contentEditable="true">
                      example@gmail.com
                    </li>
                  </ol>
                  <button
                    className="btn btn-info"
                    style={{ marginTop: "10px" }}
                    onClick={(e) => {
                      e.preventDefault();
                      const li = document.createElement("li");
                      li.className = "list-group-item";
                      li.contentEditable = true;
                      document.getElementById("invitations").appendChild(li);
                    }}
                  >
                    Add Invitation
                  </button>

                  <button
                    className="btn btn-danger"
                    style={{ marginTop: "10px", marginLeft: "10px" }}
                    onClick={(e) => {
                      e.preventDefault();
                      const list = document.getElementById("invitations");
                      var allItems =
                        document.querySelectorAll("#invitations li");
                      const last = allItems.length - 1;
                      if (last > 0) list.removeChild(allItems[last]);
                    }}
                  >
                    Delete Invitation
                  </button>
                </div>
              )}
              <button
                className="btn btn-success"
                style={{ marginTop: "10px", width: "100%" }}
                onClick={handleCreateRoom}
              >
                Create Room
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div
          className="card col-md-6 offset-md-3 offset-md-3"
          style={{ marginTop: "10px" }}
        >
          <h3 className="text-center">You are not allowed to create rooms</h3>
          <div className="card-body">
            <form>
              <p>
                Guests are <b>not</b> allowed to create rooms
              </p>

              <p>If you want to create rooms, you can register an account</p>
              <button
                className="btn btn-success"
                style={{ marginTop: "10px", width: "100%" }}
                onClick={handleGuestProhibition}
              >
                Create An Account
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
