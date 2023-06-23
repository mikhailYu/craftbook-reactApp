import "../styles/feed.css";
import Post from "./post/post";
import uniqid from "uniqid";
import NewPost from "./post/createNewPost";
import { serverUrl } from "../configClientDev";
import { useEffect, useState } from "react";

export default function Feed_page(props) {
  const hideNewPostInput = false;
  const [postsData, setPostsData] = useState(null);
  const [postsList, setPostsList] = useState([]);

  const [theme, setTheme] = useState(null);

  useEffect(() => {
    if (!props.user || props.user == null) {
      return;
    }
    loadTheme();
    getPosts(props.user);
  }, [props.user]);

  useEffect(() => {
    if (postsData == null) {
      return;
    }

    loadPosts();
  }, [postsData]);

  async function getPosts(user) {
    fetch(`${serverUrl}/post/generateFeed/${user._id}`, {
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
        throw new Error("error");
      })
      .then((resObject) => {
        if (resObject.length == 0) {
          return;
        } else {
          setPostsData(resObject);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function loadPosts() {
    const posts = postsData.map((post) => {
      const isOwner = checkIfOwner(post);
      return (
        <Post
          user={props.user}
          postInfo={post}
          isOwner={isOwner}
          key={uniqid()}
          isSingle={false}
        />
      );
    });

    setPostsList(posts);
  }

  function loadTheme() {
    const src = require(`../images/themes/theme_${props.user.theme}/sub.png`);
    setTheme(src);
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
    if (postsList.length === 0) {
      setPostsList([newPost]);
    } else {
      setPostsList([newPost, ...postsList]);
    }
  }

  function checkIfOwner(postData) {
    if (!props.user || props.user == null || postData == null || !postData) {
      return false;
    } else if (props.user.id === postData.user.id) {
      return true;
    } else {
      return false;
    }
  }

  return (
    <div
      className="feedCont"
      style={{
        backgroundImage: "url(" + theme + ")",
      }}
    >
      <div className="feedArea">
        <NewPost
          pushPost={(post) => {
            pushPost(post);
          }}
          hide={hideNewPostInput}
          user={props.user}
        />
        <div className="feedPostsList">{postsList}</div>
      </div>
    </div>
  );
}
