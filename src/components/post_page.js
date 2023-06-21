import "../styles/postPage.css";
import Post from "./post/post";
import uniqid from "uniqid";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { serverUrl } from "../configClientDev";

export default function Post_page(props) {
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();

  const [post, setPost] = useState(null);
  const [postData, setPostData] = useState(null);

  const [isOwner, setIsOwner] = useState(false);

  const [theme, setTheme] = useState(null);

  useEffect(() => {
    getPostData();
  }, [location]);

  useEffect(() => {
    if (!props.user || props.user == null || postData == null || !postData) {
      setIsOwner(false);
      return;
    } else if (props.user.id === postData.user.id) {
      setIsOwner(true);
    } else {
      setIsOwner(false);
    }
  }, [props.user, postData]);

  useEffect(() => {
    if (postData == null || !postData) {
      return;
    }

    loadPost();
  }, [postData]);

  async function getPostData() {
    fetch(`${serverUrl}/post/getPost/${params.id}`, {
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
          setPostData(resObject.post);
          return;
        } else {
          navigate("/invalid");
        }

        return;
      })
      .catch((err) => {
        navigate("/invalid");
        console.log(err);
      });
  }

  function loadPost() {
    const thisPost = (
      <Post
        user={props.user}
        postInfo={postData}
        isOwner={isOwner}
        key={uniqid()}
        isSingle={true}
      />
    );
    setPost(thisPost);
    loadTheme();
  }

  function loadTheme() {
    const src = require(`../images/themes/theme_${postData.user.theme}/sub.png`);
    setTheme(src);
  }

  return (
    <div
      className="postPageCont"
      style={{
        backgroundImage: "url(" + theme + ")",
      }}
    >
      <div className="postPageBox">{post}</div>
    </div>
  );
}
