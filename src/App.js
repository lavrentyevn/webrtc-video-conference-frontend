import { Route, Routes } from "react-router-dom";
import Main from "./components/Main";
import Room from "./components/room/Room";
import Layout from "./components/Layout";
import Missing from "./components/Missing";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import PersistLogin from "./components/checkAuth/PersistLogin";
import RequireAuth from "./components/checkAuth/RequireAuth";
import Profile from "./components/Profile";
import CreateRoom from "./components/room/CreateRoom";
import AccessRoom from "./components/room/AccessRoom";
import CheckYourEmail from "./components/verify/CheckYourEmail";
import VerifyGuest from "./components/verify/VerifyGuest";
import VerifyClient from "./components/verify/VerifyClient";

function App() {
  return (
    <div>
      <Routes>
        <Route exact path="/" element={<Layout />}>
          {/* public routes */}
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="checkemail/:email" element={<CheckYourEmail />} />
          <Route path="verifyguest/:token" element={<VerifyGuest />} />
          <Route path="verifyclient/:token" element={<VerifyClient />} />

          <Route element={<PersistLogin />}>
            <Route path="" element={<Main />} />

            {/* protected routes */}
            <Route element={<RequireAuth />}>
              <Route path="profile" element={<Profile />} />
              <Route path="createroom" element={<CreateRoom />} />
              <Route path="accessroom/:name" element={<AccessRoom />} />
              <Route path="room/:id" element={<Room />} />
            </Route>
          </Route>

          {/* catch all */}
          <Route path="*" element={<Missing />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
