import { useCallback, useEffect, useRef, useState } from "react";
import useStateWithCallback from "./useStateWithCallback";
import socket from "../socket";
import ACTIONS from "../socket/actions";
import freeice from "freeice";
import axios from "../api/axios";
import useAuth from "./useAuth";

export const LOCAL_VIDEO = "LOCAL_VIDEO";
const LOG_MESSAGE_URL = "/message";

export default function useWebRTC(id) {
  const [clients, setClients] = useStateWithCallback([]);
  const [usernames, setUsernames] = useState([]);
  const [messages, setMessages] = useState([]);
  const { auth } = useAuth();

  const addNewClient = useCallback(
    (newClient, cb) => {
      if (!clients.includes(newClient)) {
        setClients((list) => [...list, newClient], cb);
      }
    },
    [clients, setClients]
  );

  const peerConnections = useRef({});
  const localMediaStream = useRef(null); // my video and audio stream
  const allMediaElements = useRef({
    [LOCAL_VIDEO]: null, // my video and audio html element
  }); // all video and audio html elements
  const dataChannel = useRef({});

  // adding new clients
  useEffect(() => {
    const handleNewPeer = async ({ peerID, peerUsername, createOffer }) => {
      if (peerID in peerConnections.current) {
        return console.warn(`Already connected to ${peerID}`);
      }

      peerConnections.current[peerID] = new RTCPeerConnection({
        iceServers: freeice(),
      });

      // when new client (candidate) wants to join he has to
      // send to all other clients his 'ice' data (ip, port, etc.)
      peerConnections.current[peerID].onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit(ACTIONS.OFFER_ICE, {
            peerID,
            iceCandidate: event.candidate,
          });
        }
      };

      // number of media elements (1 - video or audio, 2 - video and audio)
      let tracksNumber = 0;
      peerConnections.current[peerID].ontrack = ({
        streams: [remoteStream],
      }) => {
        tracksNumber++;

        // only if we got both audio and video we create a new
        // client, add him and add his media to allMediaElements
        if (tracksNumber == 2) {
          addNewClient(peerID, () => {
            allMediaElements.current[peerID].srcObject = remoteStream;
          });
          if (!usernames.includes(peerUsername)) {
            setUsernames((list) => [...list, peerUsername]);
          }
        }
      };

      // adding my video and audio to the new client
      localMediaStream.current.getTracks().forEach((track) => {
        peerConnections.current[peerID].addTrack(
          track,
          localMediaStream.current
        );
      });

      // if i am the one connecting to the room, then it is me who has
      // to create an offer to other clients and send them my sdp
      // sdp is my media data (video and audio)
      if (createOffer) {
        dataChannel.current[peerID] =
          peerConnections.current[peerID].createDataChannel("test");
        dataChannel.current[peerID].onopen = () => {
          console.log("datachannel is open");
        };
        dataChannel.current[peerID].onmessage = (event) => {
          const senderAndMessage = {
            sender: peerUsername,
            message: event.data,
          };
          setMessages((prev) => [...prev, senderAndMessage]);
        };
        dataChannel.current[peerID].onclose = () => {
          console.log("datachannel closed");
        };

        const offer = await peerConnections.current[peerID].createOffer();

        await peerConnections.current[peerID].setLocalDescription(offer);

        socket.emit(ACTIONS.OFFER_SDP, {
          peerID,
          sessionDescription: offer,
        });
      }
    };
    socket.on(ACTIONS.ADD_PEER, handleNewPeer);

    return () => {
      socket.off(ACTIONS.ADD_PEER);
    };
  }, []);

  // setting remote description and creating answer if we got an offer
  useEffect(() => {
    const setRemoteMedia = async ({
      peerID,
      peerUsername,
      sessionDescription: remoteDescription,
    }) => {
      await peerConnections.current[peerID]?.setRemoteDescription(
        new RTCSessionDescription(remoteDescription)
      );

      if (remoteDescription.type === "offer") {
        peerConnections.current[peerID].ondatachannel = (event) => {
          dataChannel.current[peerID] = event.channel;
          dataChannel.current[peerID].onopen = () => {
            console.log("datachannel is open");
          };
          dataChannel.current[peerID].onmessage = (event) => {
            const senderAndMessage = {
              sender: peerUsername,
              message: event.data,
            };
            setMessages((prev) => [...prev, senderAndMessage]);
            console.log(peerID);
          };
          dataChannel.current[peerID].onclose = () => {
            console.log("datachannel closed");
          };
        };

        const answer = await peerConnections.current[peerID].createAnswer();

        await peerConnections.current[peerID].setLocalDescription(answer);

        socket.emit(ACTIONS.OFFER_SDP, {
          peerID,
          sessionDescription: answer,
        });
      }
    };

    socket.on(ACTIONS.SESSION_DESCRIPTION, setRemoteMedia);

    return () => {
      socket.off(ACTIONS.SESSION_DESCRIPTION);
    };
  }, []);

  // adding ice candidates
  useEffect(() => {
    socket.on(ACTIONS.ICE_CANDIDATE, ({ peerID, iceCandidate }) => {
      peerConnections.current[peerID]?.addIceCandidate(
        new RTCIceCandidate(iceCandidate)
      );
    });
    return () => {
      socket.off(ACTIONS.ICE_CANDIDATE);
    };
  }, []);

  // handling client leaving room
  useEffect(() => {
    const handleRemovePeer = ({ peerID, peerUsername }) => {
      if (peerConnections.current[peerID]) {
        peerConnections.current[peerID].close();
      }

      delete peerConnections.current[peerID];
      delete allMediaElements.current[peerID];
      delete dataChannel.current[peerID];

      setClients((list) => list.filter((c) => c !== peerID));
      setUsernames((list) => list.filter((c) => c !== peerUsername));
    };

    socket.on(ACTIONS.REMOVE_PEER, handleRemovePeer);

    return () => {
      socket.off(ACTIONS.REMOVE_PEER);
    };
  }, []);

  // adding my video and audio and joining room
  useEffect(() => {
    // capture my video and audio
    async function startCapture() {
      localMediaStream.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: {
          width: 1280,
          height: 720,
        },
      });

      // when video and audio are captured, add them to allMediaElements
      // with the id of LOCAL_VIDEO
      addNewClient(LOCAL_VIDEO, () => {
        const localVideoElement = allMediaElements.current[LOCAL_VIDEO];

        if (localVideoElement) {
          localVideoElement.volume = 0;
          localVideoElement.srcObject = localMediaStream.current;
        }
      });
      setUsernames((prev) => [...prev, auth.user]);
    }

    startCapture()
      .then(() => socket.emit(ACTIONS.JOIN, { room: id, username: auth.user }))
      .catch((e) => console.error("Error getting userMedia:", e));

    // when i leave this page i destroy my video and audio
    return () => {
      localMediaStream.current.getTracks().forEach((track) => track.stop());

      socket.emit(ACTIONS.LEAVE);
    };
  }, [id]);

  // link media elements to html tags (by id)
  // the equivalent of
  // var video = document.querySelector("#video");
  const provideMediaRef = useCallback((id, htmlElement) => {
    allMediaElements.current[id] = htmlElement;
  }, []);

  const sendMessage = async (text, roomname, sender) => {
    Object.keys(dataChannel.current).map((key) => {
      dataChannel.current[key].send(text);
    });
    const senderAndMessage = {
      sender: "me",
      message: text,
    };
    setMessages((prev) => [...prev, senderAndMessage]);

    try {
      const response = await axios.post(
        LOG_MESSAGE_URL,
        {
          roomname,
          email: sender,
          message: text,
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
    } catch (err) {
      if (!err?.response) {
        console.log("No server response");
      } else if (err.response?.status === 404) {
        console.log("No user or room found");
      } else {
        console.log("Logging message failed");
      }
    }
  };

  const toggleMedia = (type) => {
    const mediaTrack = localMediaStream.current
      .getTracks()
      .find((track) => track.kind === type);
    if (mediaTrack.enabled) {
      mediaTrack.enabled = false;
    } else {
      mediaTrack.enabled = true;
    }
  };

  return {
    clients,
    provideMediaRef,
    sendMessage,
    messages,
    toggleMedia,
    usernames,
  };
}

// client joins the room page, creates an html video tag for his video,
// captures his video, adds it to allMediaElements
// emits ACTIONS.JOIN with his socket information
// then
// server listens on ACTIONS.JOIN, gets socket (config) as a function return
// gets all clients in this room and new client, and
// emits ACTIONS.ADD_PEER with following configuration:
// old clients emit ACTIONS.ADD_PEER with new client id and createOffer boolean of false
// new client emits ACTIONS.ADD_PEER with all old clients ids and createOffer boolean of true
// new client finally calls socket.io function of socket.join(roomID)
// then
// client listens on ACTIONS.ADD_PEER, gets socket id (peerID) and createOffer boolean as function return
// creates peerConnection[peerID] as a new RTCPeerConnection(iceServers()) where iceServers are free STUN servers
// one (new) client also creates offer where he sends his sdp info and sets it as his localDescription
// client emits ACTIONS.OFFER_ICE and ACTIONS.OFFER_SDP
// then
// server listens on both ACTIONS.OFFER_ICE and ACTIONS.OFFER_SDP
// and send new client sdp and ice to other users
// server emits ACTIONS.ICE_CANDIDATE and ACTIONS.SESSION_DESCRIPTION
// then
// client listens on ACTIONS.ICE_CANDIDATE and calls addIceCandidate(new RTCIceCandidate)
// client also listens on ACTIONS.SESSION_DESCRIPTION and sets arrived info as setRemoteDescription
// if what client got was an offer, then it has to create an answer
// so client calls createAnswer where he sends his sdp info and sets it as his localDescription
// the other client finally does almost the same thing, where he calls addIceCandidate(new RTCIceCandidate)
// and sets arrived info as setRemoteDescription
