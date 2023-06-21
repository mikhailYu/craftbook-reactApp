import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "../../configClientDev";
import getImageFromDb from "../general/getImageFromDb";
import loadProfilePic from "../general/loadProfilePic";
import defaultImage from "../../images/assets/notif_imageless.png";
import heartDefaultImage from "../../images/assets/notifHeart.png";

export default function NotifSingle(props) {
  // for the post icon, either have the pic or
  // have a default graphic for text only posts

  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [username, setUsername] = useState(null);
  const [profilePic, setProfilePic] = useState(null);
  const [postImage, setPostImage] = useState(null);

  const [reqDisp, setReqDisp] = useState("none");
  const [acceptDisp, setAcceptDisp] = useState("none");
  const [likePostDisp, setLikePostDisp] = useState("none");
  const [commentPostDisp, setCommentPostDisp] = useState("none");
  const [likeCommentDisp, setLikeCommentDisp] = useState("none");
  const [notifDisplay, setNotifDisplay] = useState("flex");

  // types of notifs: req, accept, likePost, commentPost, likeComment

  useEffect(() => {
    if (!props.notifInfo) {
      return;
    }

    getUserData();

    if (
      props.notifInfo.type == "likePost" ||
      props.notifInfo.type == "commentPost" ||
      props.notifInfo.type == "likeComment"
    ) {
      loadPostData();
    }

    return;
  }, [props.notifInfo]);

  useEffect(() => {
    if (user == null) {
      return;
    }

    setUsername(user.username);
    loadProfilePic(user.profilePic).then((res) => {
      setProfilePic(res);
    });
  }, [user]);

  async function getUserData() {
    fetch(`${serverUrl}/user/getUserData/${props.notifInfo.senderId}`, {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Access-Control-Allow-Credentials": true,
      },
    })
      .then((response) => {
        if (response.status === 200) return response.json();
        throw new Error("Profile not found");
      })
      .then((resObject) => {
        setUser(resObject.user);
        setTemplate();
      })
      .catch((err) => {
        console.log(err);
      });
  }

  async function loadPostData() {
    fetch(`${serverUrl}/post/getPost/${props.notifInfo.postId}`, {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Access-Control-Allow-Credentials": true,
      },
    })
      .then((response) => {
        if (response.status === 200) return response.json();
        throw new Error(response.status);
      })
      .then((resObject) => {
        if (resObject.success == true) {
          loadPostImage(resObject.post.image);
          return;
        } else {
          setNotifDisplay("none");
        }
      })
      .catch((err) => {
        setNotifDisplay("none");
      });
  }

  function loadPostImage(imageId) {
    if (imageId == null) {
      if (
        props.notifInfo.type == "likePost" ||
        props.notifInfo.type == "likeComment"
      ) {
        setPostImage(heartDefaultImage);
      } else {
        setPostImage(defaultImage);
      }
    } else {
      getImageFromDb(imageId).then((res) => {
        setPostImage(res);
      });
    }
  }

  function setTemplate() {
    if (props.notifInfo.type == "req") {
      setReqDisp("flex");
      return;
    }

    if (props.notifInfo.type == "accept") {
      setAcceptDisp("flex");
      return;
    }

    if (props.notifInfo.type == "likePost") {
      setLikePostDisp("flex");
      return;
    }

    if (props.notifInfo.type == "commentPost") {
      setCommentPostDisp("flex");
      return;
    }

    if (props.notifInfo.type == "likeComment") {
      setLikeCommentDisp("flex");
      return;
    }
  }

  function goToProfile() {
    navigate(`/profile/${user._id}`);
  }

  function goToPost() {
    if (!props.notifInfo.postId) {
      return;
    }
    navigate(`/post/${props.notifInfo.postId}`);
  }

  async function handleAcceptReq() {
    await fetch(`${serverUrl}/user/acceptFriendReq`, {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        senderId: props.user._id,
        receiverId: user._id,
      }),
    })
      .then((response) => {
        if (response.status === 200) return response.json();
        throw new Error(response.status);
      })
      .then((resObject) => {
        setNotifDisplay("none");
        props.checkNotifCount();
      })
      .catch((err) => {
        console.log(err);
      });
  }

  async function handleCancelReq() {
    await fetch(`${serverUrl}/user/cancelFriendReq`, {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        senderId: user._id,
        receiverId: props.user._id,
      }),
    })
      .then((response) => {
        if (response.status === 200) return response.json();
        throw new Error(response.status);
      })
      .then((resObject) => {
        setNotifDisplay("none");
        props.checkNotifCount();
      })
      .catch((err) => {
        console.log(err);
      });
  }

  return (
    <div className="notifSingleCont" style={{ display: notifDisplay }}>
      <div className="notifFriendReq" style={{ display: reqDisp }}>
        <div className="notifFriendReqTop">
          <div
            className="notifUserIcon clickable"
            style={{
              backgroundImage: "url(" + profilePic + ")",
            }}
            onClick={goToProfile}
          ></div>
          <div className="notifTextFriendReq">
            <span className="notifLinkUser" onClick={goToProfile}>
              {username}
            </span>
            <span> would like to be your friend.</span>
          </div>
        </div>
        <div className="notifButtons">
          <button
            className="clickable"
            id="notifAcceptBtn"
            type="button"
            onClick={handleAcceptReq}
          >
            Accept
          </button>
          <button
            className="clickable"
            id="notifDeclineBtn"
            type="button"
            onClick={handleCancelReq}
          >
            Decline
          </button>
        </div>
      </div>

      <div className="notifFriendAccepted" style={{ display: acceptDisp }}>
        <div
          className="notifUserIcon clickable"
          style={{
            backgroundImage: "url(" + profilePic + ")",
          }}
          onClick={goToProfile}
        ></div>
        <div className="notifText">
          <span className="notifLinkUser " onClick={goToProfile}>
            {username}
          </span>
          <span> accepted your friend request.</span>
        </div>
      </div>

      <div className="notifLikedPost" style={{ display: likePostDisp }}>
        <div
          className="notifUserIcon clickable"
          style={{
            backgroundImage: "url(" + profilePic + ")",
          }}
          onClick={goToProfile}
        ></div>
        <div className="notifText">
          <span className="notifLinkUser " onClick={goToProfile}>
            {username}
          </span>
          <span> liked your </span>
          <span className="notifLink" onClick={goToPost}>
            post.
          </span>
        </div>
        <div
          className="notifPostIcon clickable"
          style={{
            backgroundImage: "url(" + postImage + ")",
          }}
          onClick={goToPost}
        ></div>
      </div>

      <div className="notifCommentedPost" style={{ display: commentPostDisp }}>
        <div
          className="notifUserIcon clickable"
          style={{
            backgroundImage: "url(" + profilePic + ")",
          }}
          onClick={goToProfile}
        ></div>
        <div className="notifText">
          <span className="notifLinkUser " onClick={goToProfile}>
            {username}
          </span>
          <span> commented on your </span>
          <span className="notifLink" onClick={goToPost}>
            post.
          </span>
        </div>
        <div
          className="notifPostIcon clickable"
          style={{
            backgroundImage: "url(" + postImage + ")",
          }}
          onClick={goToPost}
        ></div>
      </div>

      <div className="notifLikedComment" style={{ display: likeCommentDisp }}>
        <div
          className="notifUserIcon clickable"
          style={{
            backgroundImage: "url(" + profilePic + ")",
          }}
          onClick={goToProfile}
        ></div>
        <div className="notifText">
          <span className="notifLinkUser " onClick={goToProfile}>
            {username}
          </span>
          <span> liked your </span>
          <span className="notifLink" onClick={goToPost}>
            comment.
          </span>
        </div>
        <div
          className="notifPostIcon clickable"
          style={{
            backgroundImage: "url(" + postImage + ")",
          }}
          onClick={goToPost}
        ></div>
      </div>
    </div>
  );
}
