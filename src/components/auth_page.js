import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/auth.css";

export default function Auth_page(props) {
  const navigate = useNavigate();
  useEffect(() => {
    if (!props.user || props.user === null) {
      return;
    } else if (props.user.setUpComplete) {
      navigate("/feed");
    } else {
      navigate("/settings ");
    }
  }, [props.user]);

  return (
    <div className="authCont">
      <p>Authenticating...</p>
    </div>
  );
}
