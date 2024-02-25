# WebRTC Video Conference

This is the frontend part of a full-stack project - WebRTC Video Conference.

It is a **ReactJS** application, that implements authentication and video chat connectivity.

The application uses **Socket.IO** for connecting clients with a server. It also uses **Axios** to access API that the backend server exposes.

## Registration

The user has to type a username and password and confirm it. The sign up button is inactive if nothing is typed. 

<img width="966" alt="Screenshot 2024-02-23 at 17 31 07" src="https://github.com/lavrentyevn/webrtc-video-conference-frontend/assets/111048277/f8d2d50b-a890-4b54-bf27-21f86363c92c">

The registration form also checks what kind of text the user is typing, as it may contain forbidden symbols.

<img width="948" alt="Screenshot 2024-02-23 at 17 32 07" src="https://github.com/lavrentyevn/webrtc-video-conference-frontend/assets/111048277/75507a4b-88fa-4c61-acb3-cd63d7758cdf">

The user can choose between two types of accounts: **Client** and **Guest**.

- Clients are permanent accounts that require username, password and email verification.
- Guests are temporary accounts that last for 30 minutes and require only an email verification.

<img width="939" alt="Screenshot 2024-02-23 at 17 34 45" src="https://github.com/lavrentyevn/webrtc-video-conference-frontend/assets/111048277/1c914e5f-23bd-4a51-8086-5bafdb36e9cf">

## Authentication

The user has to type a username and password. React application sends an axios request to a backend api and proceeds to protected components if it gets a success status code.

<img width="952" alt="Screenshot 2024-02-23 at 17 35 25" src="https://github.com/lavrentyevn/webrtc-video-conference-frontend/assets/111048277/db282a47-266f-4229-93b8-a80b8d86b5fd">

The user can tick a "Trust this computer" checkbox, which persists user information. It means that if this user refreshes this page or opens a new tab, he does not have to authenticate again (as long as he has a refresh token, which can be obtained from a backend api when he logs in). This checkbox boolean is stored in localStorage.

<img width="548" alt="Снимок экрана 2023-11-13 в 14 18 11" src="https://github.com/lavrentyevn/authfrontend/assets/111048277/0035cf06-da93-4ed1-8978-e2562eaab054">

Authentication information is stored is a useContext hook. 

## Protected Routes

Protected routes are wrapped in a **PersistLogin** and **RequireAuth** components.

-  PersistLogin <br />
If the user decides to "Trust this computer", then he does not have to log in again as long as he has a refresh token. The refresh token can be used to obtain a new access token.

-  RequireAuth <br />
This component checks if the user is authenticated.

<img width="500" alt="Screenshot 2024-02-23 at 18 31 14" src="https://github.com/lavrentyevn/webrtc-video-conference-frontend/assets/111048277/2afad80c-a500-496b-b6a5-61713bec9330">



## WebRTC

WebRTC is a technology that allows you to connect two or more users without sending their data to the server. The server is needed for signaling at the start of a video conference. Once clients are connected **no data** gets sent to the server.

<img width="1792" alt="Screenshot 2024-02-23 at 16 32 58" src="https://github.com/lavrentyevn/webrtc-video-conference-backend/assets/111048277/0330471d-a638-4a12-a83a-7f16e44428a0">

WebRTC handshake consists of the following steps

- First user creates a Peer Connection with a list of ICE Servers (they are used to translate NAT into real IP address and vice versa), sets it as his local descriptor, Creates Offer and send his ICE data.
- Second user also creates a Peer Connection with a list of Ice Servers and sets it as his local descriptor. Then he sets Offer as his remote descriptor and adds ICE data as a canditate. Finally he creates an Answer and sends his ICE data.
- First user adds ICE data as a candidate and sets Answer as his remote descriptor.

## Socket io

Socket io is a library that enables real-time, bi-directional communication between clients and servers. In this project it helps to connect users via WebRTC handshake that was explained earlier. This are actions that socket io uses to emit data in this application.

```

const ACTIONS = {
  JOIN: "join",
  LEAVE: "leave",
  SHARE_ROOMS: "share-rooms",
  ADD_PEER: "add-peer",
  REMOVE_PEER: "remove-peer",
  OFFER_SDP: "offer-sdp",
  OFFER_ICE: "offer-ice",
  ICE_CANDIDATE: "ice-candidate",
  SESSION_DESCRIPTION: "session-descriptions",
};

```

For example, this a method that adds ICE data as candidate.

```
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
```

## Design

When first accessing the website it greets you with a list of open (non-event) rooms, that you are able to access if you create an account and know a password.

<img width="1775" alt="Screenshot 2024-02-23 at 17 43 03" src="https://github.com/lavrentyevn/webrtc-video-conference-frontend/assets/111048277/0d5b6242-dd65-4ee2-95b3-f77357cde6c6">

After you log in you are able to see **three** kinds of rooms.

- Event rooms

These are rooms that are accessible only via invitations.

- Free rooms

These are rooms that anyone can join if you know a password.

- Your rooms

These are rooms that might be **event** or **free**. The only difference is that your account created them.

<img width="1776" alt="Screenshot 2024-02-25 at 14 33 30" src="https://github.com/lavrentyevn/webrtc-video-conference-frontend/assets/111048277/7fd77be6-6dfb-4b2a-849b-74c2b35b0c28">


All rooms have the same interior design.

<img width="1792" alt="Screenshot 2024-02-23 at 18 25 56" src="https://github.com/lavrentyevn/webrtc-video-conference-frontend/assets/111048277/1d46876d-3259-4f5b-a803-638821784c51">
