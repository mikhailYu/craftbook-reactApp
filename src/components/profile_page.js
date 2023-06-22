import Post from "./post/post";
import "../styles/profile.css";
import { serverUrl } from "../configClientDev";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import convertBase64 from "./general/convertBase64";
import getImageFromDb from "./general/getImageFromDb";
import loadProfilePic from "./general/loadProfilePic";

import { FriendBox } from "./profile/friendBox";

import uniqid from "uniqid";
import NewPost from "./post/createNewPost";
import themeSettings from "./general/themeSettings";

export default function Profile_page(props) {
  const params = useParams();
  const navigate = useNavigate();
  const reactLocation = useLocation();

  const [profileData, setProfileData] = useState(null);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [friendsCount, setFriendsCount] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [themeMain, setThemeMain] = useState(null);
  const [themeSub, setThemeSub] = useState(null);
  const [themeExtra, setThemeExtra] = useState(null);
  const [themeHeader, setThemeHeader] = useState(null);
  const [themeProfile, setThemeProfile] = useState(null);
  const [textColor, setTextColor] = useState("none");

  const [postsList, setPostsList] = useState([]);

  const [hideNewPostInput, setHideNewPostInput] = useState(true);

  const [friendList, setFriendList] = useState(null);

  const [btnAdd, setBtnAdd] = useState("none");
  const [btnAccept, setBtnAccept] = useState("none");
  const [btnCancel, setBtnCancel] = useState("none");
  const [btnUnfriend, setBtnUnfriend] = useState("none");

  useEffect(() => {
    setProfileData(null);
    hideFriendButtons();
    getProfileData();
  }, [reactLocation]);

  useEffect(() => {
    if (!profileData) {
      return;
    }

    loadProfileData();
  }, [profileData]);

  useEffect(() => {
    if (!props.user) {
      return;
    }

    setUserFlags();
  }, [props.user]);

  useEffect(() => {
    if (profileData == null || props.user == null) {
      return;
    }
    if (props.user._id === params.id) {
      return;
    }
    loadFriendData();
  }, [props.user, profileData]);

  async function getProfileData() {
    fetch(`${serverUrl}/user/getUserData/${params.id}`, {
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
        console.log(resObject);
        if (resObject.success == true) {
          setProfileData(resObject.user);
          return;
        } else {
          navigate("/invalid");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function handleAddFriend() {
    hideFriendButtons();
    sendFriendRequest().then(() => {
      setBtnAdd("none");
      setBtnCancel("flex");
    });
  }

  async function handleAcceptReq() {
    hideFriendButtons();
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
        receiverId: profileData._id,
      }),
    })
      .then((response) => {
        if (response.status === 200) return response.json();
        throw new Error(response.status);
      })
      .then((resObject) => {
        hideFriendButtons();
        setBtnUnfriend("flex");
      })
      .catch((err) => {
        console.log(err);
      });
  }

  async function handleUnfriend() {
    hideFriendButtons();
    await fetch(`${serverUrl}/user/unfriend`, {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        senderId: props.user._id,
        receiverId: profileData._id,
      }),
    })
      .then((response) => {
        if (response.status === 200) return response.json();
        throw new Error(response.status);
      })
      .then((resObject) => {
        hideFriendButtons();
        setBtnAdd("flex");
      })
      .catch((err) => {
        console.log(err);
      });
  }

  async function handleCancelReq() {
    hideFriendButtons();
    await fetch(`${serverUrl}/user/cancelFriendReq`, {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        senderId: props.user._id,
        receiverId: profileData._id,
      }),
    })
      .then((response) => {
        if (response.status === 200) return response.json();
        throw new Error(response.status);
      })
      .then((resObject) => {
        hideFriendButtons();
        setBtnAdd("flex");
      })
      .catch((err) => {
        console.log(err);
      });
  }

  async function loadFriendData() {
    await fetch(`${serverUrl}/user/getFriendData`, {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        userId: props.user._id,
        profileId: profileData._id,
      }),
    })
      .then((response) => {
        if (response.status === 200) return response.json();
        throw new Error(response.status);
      })
      .then((res) => {
        loadFriendButton(res[0].userData, res[1].profileData);
      })

      .catch((err) => {
        console.log(err);
      });
  }

  function loadFriendButton(userLocalData, profileLocalData) {
    if (!props.user || !profileData) {
      return;
    }

    const user = props.user;

    if (userLocalData.pendingFriends.includes(profileData._id)) {
      hideFriendButtons();
      setBtnAccept("flex");
      return;
    }

    if (profileLocalData.pendingFriends.includes(user._id)) {
      hideFriendButtons();
      setBtnCancel("flex");
      return;
    }

    if (
      profileLocalData.friends.includes(user._id) &&
      userLocalData.friends.includes(profileData._id)
    ) {
      hideFriendButtons();
      setBtnUnfriend("flex");
      return;
    }

    if (checkIfNotFriend()) {
      hideFriendButtons();
      setBtnAdd("flex");
      return;
    }

    function checkIfNotFriend() {
      if (
        userLocalData.friends.includes(profileData._id) == false &&
        profileLocalData.friends.includes(user._id) == false &&
        userLocalData.pendingFriends.includes(profileData._id) == false &&
        user._id != params.id
      ) {
        return true;
      } else {
        return false;
      }
    }
  }

  async function sendFriendRequest() {
    await fetch(`${serverUrl}/user/sendFriendReq`, {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        senderId: props.user._id,
        receiverId: profileData._id,
      }),
    })
      .then((response) => {
        if (response.status === 200) return response.json();
        throw new Error(response.status);
      })
      .then((resObject) => {
        return;
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function setUserFlags() {
    if (props.user._id === params.id) {
      document.getElementById("profileHeaderEditButton").style.display = "flex";
      setHideNewPostInput(false);
    } else {
      document.getElementById("profileHeaderEditButton").style.display = "none";
      setHideNewPostInput(true);
    }
  }
  function loadProfileData() {
    setUsername(profileData.username);

    if (profileData.bio.length > 0) {
      setBio(profileData.bio);
    } else {
      setBio("The user has not provided a bio.");
    }

    if (profileData.location.length > 0) {
      const text = (
        <p className="profileAboutFrom">
          From{" "}
          <span
            className="clickable"
            onClick={() => {
              window.open(
                `https://www.google.com/search?q=${profileData.location}`
              );
            }}
          >
            {profileData.location}
          </span>
        </p>
      );
      setLocation(text);
    } else {
      const text = (
        <p className="profileAboutFrom">
          No <span> Location</span>
        </p>
      );
      setLocation(text);
    }

    if (profileData.friends.length == 1) {
      setFriendsCount(`1 Friend`);
    } else {
      setFriendsCount(`${profileData.friends.length} Friends`);
    }
    loadFriends();

    loadPosts();
    loadProfilePic(profileData.profilePic).then((res) => {
      setProfilePic(res);
    });
    loadTheme();
  }
  function loadTheme() {
    const mainSrc = require(`../images/themes/theme_${profileData.theme}/main.png`);
    const subSrc = require(`../images/themes/theme_${profileData.theme}/sub.png`);
    const extraSrc = require(`../images/themes/theme_${profileData.theme}/extra.png`);
    const headerSrc = require(`../images/themes/theme_${profileData.theme}/header.png`);
    const profileSrc = require(`../images/themes/theme_${profileData.theme}/profile.png`);

    setThemeMain(mainSrc);
    setThemeSub(subSrc);
    setThemeExtra(extraSrc);
    setThemeHeader(headerSrc);
    setThemeProfile(profileSrc);
    setTextColor(themeSettings[profileData.theme].textColors);
  }

  function loadFriends() {
    const friends = profileData.friends.slice(0, 9).map((friend) => {
      return <FriendBox key={uniqid()} friendInfo={friend} />;
    });

    setFriendList(friends);
  }

  function loadPosts() {
    if (profileData.posts.length == 0) {
      if (!props.user) {
        setPostsList(`${profileData.username} has no posts.`);
        return;
      } else if (props.user.id != params.id) {
        setPostsList(`${profileData.username} has no posts.`);
        return;
      }
    }
    const posts = profileData.posts.map((post) => {
      let isOwner = false;
      if (!props.user) {
        isOwner = false;
      } else if (props.user.id == post.user.id) {
        isOwner = true;
      }

      return (
        <Post
          postInfo={post}
          isOwner={isOwner}
          key={uniqid()}
          isSingle={false}
          user={props.user}
        />
      );
    });

    setPostsList(posts);
  }

  function hideFriendButtons() {
    setBtnAdd("none");
    setBtnAccept("none");
    setBtnCancel("none");
    setBtnUnfriend("none");
  }

  function pushPost(post) {
    const newPost = (
      <Post
        user={post.user}
        postInfo={post}
        isOwner={true}
        key={uniqid()}
        isSingle={false}
      />
    );

    setPostsList([newPost, ...postsList]);
  }

  return (
    <div
      className="profilePageCont"
      style={{
        backgroundImage: "url(" + themeSub + ")",
      }}
    >
      <div className="profilePageArea">
        <div
          className="profileHeaderCont"
          style={{
            backgroundImage: "url(" + themeHeader + ")",
          }}
        >
          <div
            className="profileHeaderInfoCont"
            style={{
              backgroundImage: "url(" + themeProfile + ")",
            }}
          >
            <div className="profileHeaderPicCont">
              <div
                className="profileHeaderPic"
                style={{
                  backgroundImage: "url(" + profilePic + ")",
                }}
              ></div>
            </div>
            <div className="profileHeaderInfoText" style={{ color: textColor }}>
              <p className="profileHeaderUsername">{username}</p>
              <p className="profileHeaderFriends">{friendsCount}</p>
            </div>
          </div>

          <div className="profileHeaderButtonsCont">
            <button
              id="profileHeaderAddFriendButton"
              className="clickable buttonStyle"
              type="button"
              onClick={handleAddFriend}
              style={{ display: btnAdd }}
            >
              Add Friend
            </button>
            <button
              id="profileHeaderAcceptReqButton"
              className="clickable buttonStyle"
              type="button"
              onClick={handleAcceptReq}
              style={{ display: btnAccept }}
            >
              Accept Request
            </button>
            <button
              id="profileHeaderCancelButton"
              className="clickable buttonStyle"
              type="button"
              onClick={handleCancelReq}
              style={{ display: btnCancel }}
            >
              Cancel Request
            </button>
            <button
              id="profileHeaderUnfriendButton"
              className="clickable buttonStyle"
              type="button"
              onClick={handleUnfriend}
              style={{ display: btnUnfriend }}
            >
              Unfriend
            </button>

            <button
              id="profileHeaderEditButton"
              className="clickable buttonStyle"
              type="button"
              onClick={() => {
                navigate("/settings");
              }}
            >
              Edit
            </button>
          </div>
        </div>

        <div className="profileBody">
          <div className="profileLeftSide">
            <div
              className="profileAboutCont"
              style={{
                backgroundImage: "url(" + themeExtra + ")",
                color: textColor,
              }}
            >
              <p className="profileAboutTitle">About</p>
              <p className="profileAboutBio">{bio}</p>
              {location}
            </div>

            <div
              className="profileFriendsCont"
              style={{
                backgroundImage: "url(" + themeExtra + ")",
              }}
            >
              <p className="profileFriendTitle" style={{ color: textColor }}>
                Friends
              </p>
              <p className="profileFriendsTotal" style={{ color: textColor }}>
                {friendsCount}
              </p>
              <div className="profileFriendsListCont">
                <div className="profileFriendsList">{friendList}</div>
              </div>
            </div>
          </div>

          <div className="profileRightSide">
            <div
              className="profilePostsTitle"
              style={{
                backgroundImage: "url(" + themeMain + ")",
              }}
            >
              <p style={{ color: textColor }}>Posts</p>
            </div>
            <NewPost
              pushPost={(post) => {
                pushPost(post);
              }}
              hide={hideNewPostInput}
              user={props.user}
            />
            {postsList}
          </div>
        </div>
      </div>
    </div>
  );
}
