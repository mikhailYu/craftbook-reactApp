import { useEffect, useState } from "react";
import "../../styles/comment.css";
import { serverUrl } from "../../configClientDev";
import loadProfilePic from "../general/loadProfilePic";
import { useNavigate } from "react-router-dom";
import themeSettings from "../general/themeSettings";

export default function Comment(props) {
  const navigate = useNavigate();
  const [commentData, setCommentData] = useState(null);

  const [username, setUsername] = useState("");
  const [date, setDate] = useState("");
  const [text, setText] = useState("");

  const [likes, setLikes] = useState(null);
  const [likesDisplay, setLikesDisplay] = useState(null);

  const [deleteStyle, setDeleteStyle] = useState("none");
  const [commentDisplay, setCommentDisplay] = useState("flex");

  const [profilePic, setProfilePic] = useState(null);

  const [themeComment, setThemeComment] = useState(null);
  const [textColor, setTextColor] = useState("none");

  useEffect(() => {
    if (!props.commentId) {
      return;
    }
    getComment();
  }, [props]);

  useEffect(() => {
    if (likes == null) {
      return;
    }

    setLikesDisplay(likes.length);
  }, [likes]);

  useEffect(() => {
    if (!commentData || commentData == null) {
      return;
    }

    loadComment();
  }, [commentData]);

  async function getComment() {
    fetch(`${serverUrl}/comment/get/${props.commentId}`, {
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
      .then((res) => {
        setCommentData(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function loadComment() {
    setUsername(commentData.userId.username);
    setDate(commentData.dateFormatted);
    setText(commentData.text);
    setLikes(commentData.likes);
    enableDelete();
    loadTheme();
    loadProfilePic(commentData.userId.profilePic).then((res) => {
      setProfilePic(res);
    });
  }

  function loadTheme() {
    const commentSrc = require(`../../images/themes/theme_${commentData.userId.theme}/comment.png`);
    setThemeComment(commentSrc);
    setTextColor(themeSettings[commentData.userId.theme].postTextColors);
  }

  function enableDelete() {
    if (!props.user || props.user == null) {
      setDeleteStyle("none");
      return;
    }

    if (props.user._id === commentData.userId._id) {
      setDeleteStyle("flex");
    }
  }

  async function handleDelete() {
    fetch(`${serverUrl}/comment/delete`, {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        postId: props.postInfo._id,
        commentId: commentData._id,
      }),
    })
      .then((response) => {
        if (response.status === 200) return response.json();
        throw new Error(response.status);
      })
      .then((resObject) => {
        setCommentDisplay("none");
        props.commentDeleted();
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function handleLike() {
    if (likes == null || props.user == null) {
      return;
    }

    let userIncludes;
    let sendNotif;

    if (likes.includes(props.user._id)) {
      var filteredArray = likes.filter((e) => e !== props.user._id);
      setLikes(filteredArray);
      userIncludes = true;
    } else {
      let likesArr = [...likes, props.user._id];
      setLikes(likesArr);
      userIncludes = false;
    }

    if (props.user._id === commentData.userId._id) {
      sendNotif = false;
    } else {
      sendNotif = true;
    }

    commentLike(userIncludes, sendNotif);
  }

  async function commentLike(userIncludes, sendNotif) {
    fetch(`${serverUrl}/comment/like/${props.commentId}`, {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        userId: props.user._id,
        userIncludes: userIncludes,
        posterId: commentData.userId._id,
        postId: props.postInfo._id,
        sendNotif: sendNotif,
      }),
    })
      .then((response) => {
        if (response.status === 200) return response.json();
        throw new Error(response.status);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  return (
    <div
      className="commentCont"
      style={{
        display: commentDisplay,
      }}
    >
      <div
        className="commentUpperCont"
        style={{
          backgroundImage: "url(" + themeComment + ")",
        }}
      >
        <div className="commentUserCont" style={{ color: textColor }}>
          <div
            className="commentUserIcon clickable"
            style={{
              backgroundImage: "url(" + profilePic + ")",
            }}
            onClick={() => {
              navigate(`/profile/${commentData.userId._id}`);
            }}
          ></div>
          <div
            className="commentUsername"
            onClick={() => {
              navigate(`/profile/${commentData.userId._id}`);
            }}
          >
            {username}
          </div>
        </div>
        <button
          id="commentDelete"
          className="clickable"
          style={{ display: deleteStyle }}
          onClick={handleDelete}
        >
          x
        </button>
      </div>

      <p className="commentDate">{date}</p>
      <p className="commentText">{text}</p>
      <div className="commentLikesCont">
        <button
          id="commentLikeBtn"
          className="clickable"
          type="button"
          onClick={handleLike}
        >
          ❤️
        </button>
        <p className="commentLikesCount">{likesDisplay}</p>
      </div>
    </div>
  );
}
