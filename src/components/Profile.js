import useAuth from "../hooks/useAuth";
import useLogout from "../hooks/useLogout";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { auth } = useAuth();
  const logout = useLogout();
  const navigate = useNavigate();

  const signOut = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div
      className="card col-md-6 offset-md-3 offset-md-3"
      style={{ marginTop: "10px" }}
    >
      <h3 className="text-center" style={{ marginTop: "5px" }}>
        Your Profile
      </h3>
      <div className="card-body">
        <form onSubmit={signOut}>
          <h5>Username:</h5>
          <p>{auth?.user}</p>
          <h5>Email:</h5>
          <p>{auth?.email}</p>
          <button
            className="btn btn-success"
            style={{ marginTop: "10px", width: "100%" }}
          >
            Sign Out
          </button>
        </form>
      </div>
    </div>
  );
}
