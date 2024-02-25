import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import useAuth from "../hooks/useAuth";
import axios from "../api/axios";

const CHECK_ROOMS_URL = "/room/check";

const options = {
  year: "numeric",
  month: "long",
  day: "numeric",
};

export default function Main() {
  const [rooms, setRooms] = useState([]);
  const navigate = useNavigate();
  const aliveNode = useRef();

  const [eventRooms, setEventRooms] = useState(0);
  const [freeRooms, setFreeRooms] = useState(0);
  const [yourRooms, setYourRooms] = useState(0);

  const { auth } = useAuth();

  useEffect(() => {
    const checkRooms = async () => {
      try {
        const response = await axios.post(
          CHECK_ROOMS_URL,
          { username: auth?.user },
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );

        console.log(response.data);

        response.data.map((roomID) => {
          if (roomID.room_id == null) setFreeRooms((prev) => prev + 1);
          else if (roomID.username == auth.user)
            setYourRooms((prev) => prev + 1);
          else setEventRooms((prev) => prev + 1);
        });

        if (aliveNode) {
          setRooms(response.data);
        }
      } catch (err) {
        console.log(err);
      }
    };

    checkRooms();
  }, []);

  return (
    <div class="wrapper-main">
      <div class="header-main">
        <div class="navbar navbar-dark bg-dark box-shadow">
          <div class="container d-flex justify-content-between">
            <span class="text-white">WebRTC Chatting</span>
            {!auth?.accessToken ? (
              <button
                className="btn btn-info"
                onClick={() => navigate("/login")}
                style={{
                  display: "inline-block",
                  float: "right",
                  height: "100%",
                }}
              >
                Sign In
              </button>
            ) : (
              <button
                className="btn btn-info"
                onClick={() => navigate("/profile")}
                style={{
                  display: "inline-block",
                  float: "right",
                  height: "100%",
                }}
              >
                {auth?.user}
              </button>
            )}
          </div>
        </div>
      </div>

      <div class="content-main">
        <section class="jumbotron text-center" style={{ padding: "50px" }}>
          <div class="container">
            {auth?.accessToken ? (
              <div>
                <h1 class="jumbotron-heading">Welcome, {auth.user}</h1>
                <p class="lead text-muted">You are able to join:</p>
                <p class="lead" style={{ color: "#483D8B" }}>
                  {eventRooms} event rooms
                </p>
                <p class="lead" style={{ color: "#00BFFF" }}>
                  {freeRooms} free rooms
                </p>
                <p class="lead" style={{ color: "#3CB371" }}>
                  {yourRooms} your rooms
                </p>
                <p>
                  <div
                    class="btn btn-success my-2"
                    onClick={() => {
                      navigate("createroom");
                    }}
                  >
                    Create new room
                  </div>
                  &nbsp;
                  <div
                    class="btn btn-secondary my-2"
                    onClick={() => navigate("/profile")}
                  >
                    View profile
                  </div>
                </p>
              </div>
            ) : (
              <div>
                <h1 class="jumbotron-heading">Welcome</h1>
                <p class="lead text-muted">
                  Create and join rooms after creating an account{" "}
                </p>
                <p>
                  <div
                    class="btn btn-success my-2"
                    onClick={() => {
                      navigate("/register");
                    }}
                  >
                    Create account
                  </div>
                  &nbsp;
                  <div
                    class="btn btn-secondary my-2"
                    onClick={() => navigate("/login")}
                  >
                    Log in
                  </div>
                </p>
              </div>
            )}
          </div>
        </section>

        <div class="album py-5 bg-light">
          <div class="container">
            <div class="row">
              {rooms.map((roomID) => (
                <div class="col-md-4">
                  <div class="card mb-4 box-shadow">
                    <div
                      class={`joinroom-main btn`}
                      style={{
                        backgroundColor: `${
                          roomID.room_id == null
                            ? `#00BFFF`
                            : roomID.username == auth.user
                            ? "#3CB371"
                            : `#483D8B`
                        }`,
                        color: "white",
                      }}
                      onClick={() => {
                        navigate(`accessroom/${roomID.name}`);
                      }}
                    >
                      <p className="text-middle" style={{ fontSize: "25px" }}>
                        {roomID.name}
                      </p>
                      {roomID.room_id != null && (
                        <i
                          style={{
                            float: "right",
                            top: "-45px",
                            position: "relative",
                            fontSize: "25px",
                          }}
                          class="bi bi-calendar-event"
                        ></i>
                      )}
                    </div>
                    <div class="card-body">
                      <p class="card-text">{roomID.description}</p>
                      <div class="d-flex justify-content-between align-items-center">
                        <small class="text-muted">
                          {roomID.username == auth.user
                            ? "You"
                            : roomID.username}
                        </small>
                        <small class="text-muted">
                          {new Date(roomID.created_at).toLocaleDateString(
                            undefined,
                            options
                          )}
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
