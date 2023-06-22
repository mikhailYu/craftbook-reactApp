import "../styles/signUp.css";
import { authLink } from "../configClientDev";
import { serverUrl } from "../configClientDev";
import uniqid from "uniqid";
import { useNavigate } from "react-router-dom";

export default function SignUp_Page(props) {
  const navigate = useNavigate();

  async function authenticate() {
    window.open(authLink, "_self");
  }

  async function authGuest() {
    const guestID = uniqid();
    await fetch(`${serverUrl}/user/authGuest`, {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Access-Control-Allow-Credentials": true,
        withCredentials: true,
      },
      body: JSON.stringify({
        username: guestID,
        password: guestID,
      }),
    })
      .then((response) => {
        if (response.status === 200) return response.json();
        throw new Error(response.status);
      })
      .then((resObject) => {
        console.log(resObject);
        // navigate("/authenticate");
      })
      .catch((err) => {
        console.log(err);
      });
  }
  return (
    <div className="signUpCont">
      <div className="signUpSplash">
        <div className="signUpInfoCont">
          <p className="signUpInfo">
            Welcome to Craftbook! A social media website to share your creations
            with the world!
          </p>
          <p className="signUpInfo">
            Get in touch with other ambitious artists, craftsmen, engineers,
            programmers and creators. Share your hard work and take a peek at
            what others are making!
          </p>
        </div>
      </div>

      <div className="signUpFormCont">
        <div className="signUpAuthCont">
          <p>Authenticate with:</p>
          <div className="signUpGoogleBtn clickable" onClick={authenticate}>
            <img src={require("../images/assets/google.png")} />
            <p>Google</p>
          </div>
          <p>or</p>
          <button className="signUpGuestBtn clickable" onClick={authGuest}>
            Continue as a Guest
          </button>
        </div>
      </div>
    </div>
  );
}
