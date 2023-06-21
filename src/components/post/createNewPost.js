import { useEffect, useState } from "react";
import { useFetcher } from "react-router-dom";
import { serverUrl } from "../../configClientDev";

export default function NewPost(props) {
  const [postInput, setPostInput] = useState("");

  const [inputHeight, setInputHeight] = useState("40px");
  const [borderColor, setBorderColor] = useState("black");
  const [inputPlaceholder, setInputPlaceholder] = useState("");

  const [imagePreview, setImagePreview] = useState(null);
  const [imageData, setImageData] = useState(null);

  const [inputErrorFlag, setInputErrorFlag] = useState(null);

  const [hideStyle, setHideStyle] = useState("none");
  const [imgDisp, setImgDisp] = useState("none");
  const [addDisp, setAddDisp] = useState("flex");
  const [removeDisp, setRemoveDisp] = useState("none");

  const [theme, setTheme] = useState(null);

  useEffect(() => {
    if (!props.user) {
      return;
    }
    loadTheme();
    setInputErrorFlag(false);
  }, [props.user]);

  useEffect(() => {
    if (postInput.length == 0) {
      setInputHeight("40px");
    } else {
      setInputHeight("150px");
    }
  }, [postInput]);

  useEffect(() => {
    if (!props.hide || props.hide == false) {
      setHideStyle("flex");
    } else {
      setHideStyle("none");
    }
  }, [props.hide]);

  useEffect(() => {
    if (!props.user) {
      return;
    }
    if (inputErrorFlag) {
      setInputPlaceholder("Please fill this in.");
      setBorderColor("red");
    } else {
      setInputPlaceholder(`What's on your mind, ${props.user.username}?`);
      setBorderColor("black");
    }
  }, [inputErrorFlag]);

  function loadTheme() {
    const src = require(`../../images/themes/theme_${props.user.theme}/main.png`);
    setTheme(src);
  }

  async function handlePost() {
    if (props.user == null || !props.user) {
      return;
    }
    if (postInput.length === 0) {
      setInputErrorFlag(true);
      return;
    }

    let image = await uploadImage();

    uploadPost(image);
  }

  async function uploadImage() {
    if (imageData == null) {
      return null;
    }

    let newData = new FormData();

    newData.append("image", imageData);

    const result = await fetch(`${serverUrl}/image/create`, {
      method: "POST",
      body: newData,
    })
      .then((response) => {
        if (response.status === 200) return response.json();
        throw new Error(response.status);
      })
      .catch((err) => {
        console.log(err);
        return;
      });

    return result.data;
  }

  async function uploadPost(image) {
    await fetch(`${serverUrl}/post/create`, {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        userId: props.user._id,
        text: postInput,
        image: image,
      }),
    })
      .then((response) => {
        if (response.status === 200) return response.json();
        throw new Error(response.status);
      })
      .then((resObject) => {
        postSuccessful(resObject.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function postSuccessful(post) {
    document.getElementById("feedNewPostInput").value = "";
    setPostInput("");

    if (imageData != null || imagePreview != null) {
      setImageData(null);
      setImagePreview(null);
      toggleButtons();
    }

    props.pushPost(post);
  }

  function handleImg(file) {
    setImageData(file);
    setImagePreview(URL.createObjectURL(file));
    toggleButtons();
    setImgDisp("flex");
  }

  function handleRemoveImg() {
    setImageData(null);
    setImagePreview(null);
    toggleButtons();
    setImgDisp("none");
  }

  function toggleButtons() {
    if (addDisp == "none") {
      setAddDisp("flex");
    } else {
      setAddDisp("none");
    }

    if (removeDisp == "none") {
      setRemoveDisp("flex");
    } else {
      setRemoveDisp("none");
    }
  }

  return (
    <div
      className="feedNewPostCont"
      style={{ display: hideStyle, backgroundImage: "url(" + theme + ")" }}
    >
      <textarea
        id="feedNewPostInput"
        placeholder={inputPlaceholder}
        onInput={(e) => {
          setPostInput(e.target.value);
        }}
        maxLength={5000}
        style={{ height: inputHeight, borderColor: borderColor }}
      ></textarea>
      <div className="feedNewPostImagePreviewCont" style={{ display: imgDisp }}>
        <img src={imagePreview} />
      </div>
      <div className="feedNewPostLowerCont">
        <button
          type="button"
          id="feedNewPostAddImgButton"
          className="clickable buttonStyle"
          onClick={() => {
            document.getElementById("feedNewPostAddImgInput").click();
          }}
          style={{ display: addDisp }}
        >
          + Add image
        </button>
        <button
          type="button"
          id="feedNewPostRemoveImgButton"
          className="clickable buttonStyle"
          style={{ display: removeDisp }}
          onClick={handleRemoveImg}
        >
          - Remove image
        </button>
        <input
          type={"file"}
          id={"feedNewPostAddImgInput"}
          style={{ display: "none" }}
          accept={"image/png, image/jpg, image/jpeg"}
          onChange={(e) => {
            if (!e.target.files[0]) {
              return;
            }
            if (e.target.files[0].size > 2097152) {
              alert("Please keep the file size under 2mb.");
              return;
            } else {
              handleImg(e.target.files[0]);
            }
          }}
        ></input>
        <button
          type="button"
          id="feedNewPostSubmitBtn"
          className="clickable buttonStyle"
          onClick={handlePost}
        >
          Post
        </button>
      </div>
    </div>
  );
}
