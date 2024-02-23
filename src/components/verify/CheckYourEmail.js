import { useEffect } from "react";
import { Navigate } from "react-router";
import { useNavigate, useParams } from "react-router";

export default function CheckYourEmail() {
  const { email } = useParams();
  const navigate = useNavigate();
  const validRequest = JSON.parse(localStorage.getItem("verify"));

  useEffect(() => {
    return () => {
      localStorage.setItem("verify", false);
    };
  }, []);

  return (
    <>
      {validRequest ? (
        <div
          className="card col-md-6 offset-md-3 offset-md-3"
          style={{ marginTop: "10px" }}
        >
          <h3 className="text-center" style={{ marginTop: "5px" }}>
            Check your Email for verification
          </h3>
          <div className="card-body">
            <form onSubmit={() => navigate("/")}>
              <h4>Verification has been sent to:</h4>
              <p>{email}</p>
              <br />
              <p>
                Note that you have <b>1 hour</b> to verify your email
              </p>
              <button
                className="btn btn-success"
                style={{ marginTop: "10px", width: "100%" }}
              >
                Go
              </button>
            </form>
          </div>
        </div>
      ) : (
        <Navigate to={"/"} />
      )}
    </>
  );
}
