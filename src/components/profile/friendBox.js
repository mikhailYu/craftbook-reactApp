import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import getImageFromDb from "../general/getImageFromDb";
import loadProfilePic from "../general/loadProfilePic";

export function FriendBox(props) {
  const navigate = useNavigate();

  const [friend, setFriend] = useState(null);
  const [username, setUsername] = useState(null);
  const [profilePic, setProfilePic] = useState(null);

  useEffect(() => {
    if (!props.friendInfo) {
      return;
    }

    setFriend(props.friendInfo);
    setUsername(props.friendInfo.username);
    if (profilePic == null) {
      loadProfilePic(props.friendInfo.profilePic).then((res) => {
        setProfilePic(res);
      });
    }
  }, [props]);

  return (
    <div
      className="profileFriendsPic"
      style={{
        backgroundImage: "url(" + profilePic + ")",
      }}
      onClick={() => {
        navigate(`/profile/${friend._id}`);
      }}
    >
      <p className="profileFriendsName">{username}</p>
    </div>
  );
}
