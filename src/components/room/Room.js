import { useNavigate, useParams } from "react-router";
import useWebRTC, { LOCAL_VIDEO } from "../../hooks/useWebRTC";
import { useEffect, useState } from "react";
import "../style.css";
import useAuth from "../../hooks/useAuth";
import axios from "../../api/axios";
import socket from "../../socket";

const LOG_EVENT_URL = "/event/log";

function layout(clientsNumber = 1) {
  if (clientsNumber === 1)
    return [
      {
        width: "70%",
        height: "70%",
        display: "flex",
        alignItems: "center",
      },
    ];
  const pairs = Array.from({ length: clientsNumber }).reduce(
    (acc, next, index, arr) => {
      if (index % 2 === 0) {
        acc.push(arr.slice(index, index + 2));
      }

      return acc;
    },
    []
  );

  const rowsNumber = pairs.length;
  const height = `${100 / rowsNumber}%`;

  return pairs
    .map((row, index, arr) => {
      if (index === arr.length - 1 && row.length === 1) {
        return [
          {
            width: "50%",
            height,
            display: "flex",
            alignItems: "center",
          },
        ];
      }

      return row.map(() => ({
        width: "50%",
        height,
        display: "flex",
        alignItems: "center",
      }));
    })
    .flat();
}

export default function Room() {
  const { id } = useParams();
  const {
    clients,
    usernames,
    provideMediaRef,
    sendMessage,
    messages,
    toggleMedia,
  } = useWebRTC(id);
  const [message, setMessage] = useState("");
  const [cameraToggle, setCameraToggle] = useState(true);
  const [micToggle, setMicToggle] = useState(true);
  const navigate = useNavigate();
  const { auth } = useAuth();
  const videoLayout = layout(clients.length);
  const [time, setTime] = useState({
    sec: 0,
    min: 0,
    hr: 0,
  });

  const [intervalId, setIntervalId] = useState();

  const updateTimer = () => {
    setTime((prev) => {
      let newTime = { ...prev };

      if (newTime.sec < 59) newTime.sec += 1;
      else {
        newTime.min += 1;
        newTime.sec = 0;
      }

      if (newTime.min === 60) {
        newTime.min = 0;
        newTime.hr += 1;
      }

      return newTime;
    });
  };

  useEffect(() => {
    const username = auth.user;
    socket.emit("username", username);
    const logMove = async (move) => {
      try {
        const response = await axios.post(
          LOG_EVENT_URL,
          { email: auth?.email, name: id, move },
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );
      } catch (err) {
        console.log(err);
      }
    };

    logMove("j");

    const handler = () => {
      logMove("l");
    };

    window.addEventListener("beforeunload", handler);

    let id = setInterval(updateTimer, 1000);
    setIntervalId(id);

    return () => {
      window.removeEventListener("beforeunload", handler);

      logMove("l");
    };
  }, []);

  return (
    <div class="wrapper-room">
      <div class="header-room">
        <div class="navbar" style={{ height: "100%" }}>
          <span class="text-black">WebRTC Chatting</span>
          <span class="text-black">{auth.user}</span>
        </div>
      </div>
      <div class="info-room">
        <div class="navbar" style={{ height: "100%" }}>
          <span class="text-black">{id}</span>
          <div class="timer">
            <i
              class="bi bi-record-circle-fill"
              style={{ color: "#FF6347" }}
            ></i>
            <span>{`${time.hr < 10 ? 0 : ""}${time.hr} : ${
              time.min < 10 ? 0 : ""
            }${time.min} : ${time.sec < 10 ? 0 : ""}${time.sec}`}</span>
          </div>
        </div>
      </div>
      <div class="content-room">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
            height: "100%",
          }}
        >
          {clients.map((client, index) => {
            return (
              <div key={client} id={client} style={videoLayout[index]}>
                <div style={{ position: "relative" }}>
                  <video
                    width="100%"
                    style={{
                      borderRadius: "30px",
                      padding: "10px",
                    }}
                    ref={(htmlElement) => {
                      provideMediaRef(client, htmlElement);
                    }}
                    autoPlay
                    playsInline
                    muted={client === LOCAL_VIDEO}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div class="footer-room">
          <button
            class="copy-link"
            onClick={() => {
              let url = document.location.href;
              navigator.clipboard.writeText(url);
            }}
          >
            <i class="bi bi-copy"></i>
            <span>Copy Link</span>
          </button>
          <div class="middle-buttons">
            <button
              className={`rounded-circle btn bi bi-camera-video${
                cameraToggle ? "" : "-off"
              }`}
              style={{
                backgroundColor: `${
                  cameraToggle ? "#dddddd54" : "rgb(255, 99, 71)"
                }`,
                color: `${cameraToggle ? "black" : "white"}`,
                width: "100px",
                height: "50px",
                fontSize: "large",
              }}
              onClick={() => {
                toggleMedia("video");
                setCameraToggle((prev) => !prev);
              }}
            />
            <button
              className={`rounded-circle btn bi bi-mic${
                micToggle ? "" : "-mute"
              }`}
              style={{
                backgroundColor: `${
                  micToggle ? "#dddddd54" : "rgb(255, 99, 71)"
                }`,
                color: `${micToggle ? "black" : "white"}`,
                width: "100px",
                height: "50px",
                fontSize: "large",
              }}
              onClick={() => {
                toggleMedia("audio");
                setMicToggle((prev) => !prev);
              }}
            />
          </div>
          <button
            className="leave-button"
            onClick={() => {
              navigate("/");
            }}
          >
            <span style={{ fontSize: "large" }}>Leave</span>
          </button>
        </div>
      </div>
      <div class="sidebar-room">
        <div className="chat">
          <div className="top">Group Chat</div>
          <div className="messages">
            {messages.map((m, i) => (
              <div key={i} className={`msg${m.sender === "me" ? " dark" : ""}`}>
                {m.sender !== "me" && (
                  <p class="text-muted" style={{ fontSize: "12px" }}>
                    {m.sender}
                  </p>
                )}
                <span>{m.message}</span>
              </div>
            ))}
          </div>
          <div className="bottom">
            <input
              className="input-message"
              type="text"
              placeholder="Type here..."
              onChange={(event) => setMessage(event.target.value)}
              value={message}
            />
            <button
              class="btn btn-success"
              style={{
                margin: "15px",
                borderRadius: "10px",
              }}
              onClick={() => {
                sendMessage(message, id, auth?.email);
                setMessage("");
              }}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
