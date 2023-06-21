import "../../styles/post.css";
import { serverUrl } from "../../configClientDev";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Comment from "./comment";
import uniqid from "uniqid";
import loadProfilePic from "../general/loadProfilePic";
import getImageFromDb from "../general/getImageFromDb";
import themeSettings from "../general/themeSettings";

export default function Post(props) {
  const navigate = useNavigate();

  const [postInfo, setPostInfo] = useState(null);

  const [deleteStyle, setDeleteStyle] = useState("none");
  const [postDisplayStyle, setPostDisplayStyle] = useState("flex");

  const [profilePic, setProfiePic] = useState(null);
  const [username, setUsername] = useState(null);
  const [userId, setUserId] = useState(null);
  const [postId, setPostId] = useState(null);
  const [text, setText] = useState(null);
  const [date, setDate] = useState(null);
  const [likes, setLikes] = useState(null);
  const [likesDisplay, setLikesDisplay] = useState(null);
  const [image, setImage] = useState(null);
  const [themeMain, setThemeMain] = useState(null);
  const [themeSub, setThemeSub] = useState(null);
  const [themeExtra, setThemeExtra] = useState(null);
  const [themePost, setThemePost] = useState(null);
  const [textColor, setTextColor] = useState("none");

  const [imgDisplay, setImgDisplay] = useState("none");

  const [commentInput, setCommentInput] = useState("");
  const [commentList, setCommentList] = useState([]);

  //dictates whether this is on the single post page or not
  const [isSingle, setIsSingle] = useState(false);

  useEffect(() => {
    if (!props.postInfo) {
      return;
    }

    setPostInfo(props.postInfo);
  }, [props]);

  useEffect(() => {
    if (postInfo == null) {
      return;
    }
    loadPostInfo();
    loadTheme();
  }, [postInfo]);

  useEffect(() => {
    if (likes == null) {
      return;
    }

    if (likes.length == 1) {
      setLikesDisplay("1 Like");
    } else {
      setLikesDisplay(`${likes.length} Likes`);
    }
  }, [likes]);

  function loadPostInfo() {
    loadProfilePic(postInfo.user.profilePic).then((res) => {
      setProfiePic(res);
    });

    setUsername(postInfo.user.username);
    setDate(postInfo.dateFormatted);
    setText(postInfo.text);
    setPostId(postInfo._id);
    setUserId(postInfo.user.id);
    setIsSingle(postInfo.isSingle);
    setLikes(postInfo.likes);

    if (postInfo.image != null) {
      getImageFromDb(postInfo.image).then((res) => {
        setImage(res);
        setImgDisplay("flex");
      });
    }

    loadComments();

    if (props.isOwner) {
      setDeleteStyle("block");
    } else {
      setDeleteStyle("none");
    }
  }

  function loadTheme() {
    const mainSrc = require(`../../images/themes/theme_${postInfo.user.theme}/main.png`);
    const subSrc = require(`../../images/themes/theme_${postInfo.user.theme}/sub.png`);
    const extraSrc = require(`../../images/themes/theme_${postInfo.user.theme}/extra.png`);
    const postSrc = require(`../../images/themes/theme_${postInfo.user.theme}/post.png`);

    setThemeMain(mainSrc);
    setThemeSub(subSrc);
    setThemeExtra(extraSrc);
    setThemePost(postSrc);
    setTextColor(themeSettings[postInfo.user.theme].postTextColors);
  }

  function loadComments() {
    if (postInfo.comments.length == 0) {
      return;
    }

    let commentsArr = postInfo.comments.map((comment) => {
      return (
        <Comment
          key={uniqid()}
          commentId={comment}
          user={props.user}
          postInfo={postInfo}
          commentDeleted={commentDeleted}
        />
      );
    });

    setCommentList(commentsArr);
  }

  function handleDeletePost() {
    fetch(`${serverUrl}/post/delete/${postInfo._id}`, {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        userId: postInfo.user,
      }),
    })
      .then((response) => {
        if (response.status === 200) return response.json();
        throw new Error(response.status);
      })
      .then((resObject) => {
        if (isSingle == true) {
          navigate(`/user/${postInfo.user.id}`);
        } else {
          setPostDisplayStyle("none");
        }

        return;
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function handleLiked() {
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

    if (postInfo.user._id === props.user._id) {
      sendNotif = false;
    } else {
      sendNotif = true;
    }

    postLike(userIncludes, sendNotif);
  }

  async function postLike(userIncludes, sendNotif) {
    fetch(`${serverUrl}/post/likeToggle/${postInfo._id}`, {
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
        posterId: postInfo.user._id,
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

  function handleCommentSubmit() {
    if (!props.user || props.user == null || commentInput.length == 0) {
      return;
    }

    if (props.user._id === postInfo.user._id) {
      postComment(false);
    } else {
      postComment(true);
    }
  }

  async function postComment(sendNotif) {
    fetch(`${serverUrl}/comment/create`, {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        userId: props.user._id,
        postId: postInfo._id,
        text: commentInput,
        posterId: postInfo.user._id,
        sendNotif: sendNotif,
      }),
    })
      .then((response) => {
        if (response.status === 200) return response.json();
        throw new Error(response.status);
      })
      .then((res) => {
        setCommentInput("");
        pushComment(res.data._id);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  async function pushComment(commentId) {
    fetch(`${serverUrl}/comment/get/${commentId}`, {
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
        let newComment = (
          <Comment
            key={uniqid()}
            commentId={res.data._id}
            user={props.user}
            postInfo={postInfo}
            commentDeleted={commentDeleted}
          />
        );

        if (Array.isArray(commentList)) {
          setCommentList([...commentList, newComment]);
        } else {
          setCommentList([newComment]);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  async function commentDeleted() {
    // get the post info again and checks if there are still any comments.

    fetch(`${serverUrl}/post/getPost/${props.postInfo._id}`, {
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
        if (res.post.comments.length == 0) {
          setCommentList(null);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  return (
    <div
      className="postCont"
      style={{
        display: postDisplayStyle,
        backgroundImage: "url(" + themeMain + ")",
      }}
    >
      <div className="postUserCont">
        <div
          className="postUpperCont"
          style={{
            backgroundImage: "url(" + themePost + ")",
          }}
        >
          <div className="postUserDetails">
            <div
              className="postUserIcon clickable"
              onClick={() => {
                navigate(`/profile/${userId}`);
              }}
              style={{
                backgroundImage: "url(" + profilePic + ")",
              }}
            ></div>
            <p
              className="clickable"
              style={{ color: textColor }}
              onClick={() => {
                navigate(`/profile/${userId}`);
              }}
            >
              {username}
            </p>
          </div>
          <button
            style={{ display: deleteStyle }}
            type="button"
            className="clickable"
            id="postDeleteButton"
            onClick={handleDeletePost}
          >
            X
          </button>
        </div>
        <div className="postContentCont">
          <p
            className="postDate"
            onClick={() => {
              navigate(`/post/${postId}`);
            }}
          >
            {date}
          </p>
          <div className="postText">
            <p>{text}</p>
          </div>
          <img
            src={image}
            className="postImage"
            style={{ display: imgDisplay }}
            onClick={() => {
              navigate(`/post/${postId}`);
            }}
          />

          <div className="postLikesCont">
            <button
              type="button"
              className="clickable"
              id="postLikeButton"
              onClick={handleLiked}
            >
              ❤️
            </button>
            <p>{likesDisplay}</p>
          </div>
        </div>
      </div>
      <div className="postCommentsCont">
        <div className="postCommentsList">{commentList}</div>
        <div className="postNewCommentCont">
          <form id="postNewCommentForm">
            <input
              id="postNewCommentInput"
              type="text"
              placeholder="Reply to post"
              maxLength={200}
              onChange={(e) => {
                setCommentInput(e.target.value);
              }}
              value={commentInput}
            ></input>
            <button
              className="clickable buttonStyle"
              type="submit"
              id="postNewCommentButton"
              onClick={(e) => {
                e.preventDefault();
                handleCommentSubmit();
              }}
            >
              Post
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
