import { useEffect, useState } from "react";
import { serverUrl } from "../configClientDev";
import "../styles/settings.css";
import { useNavigate } from "react-router-dom";
import convertBase64 from "./general/convertBase64";
import getImageFromDb from "./general/getImageFromDb";
import ThemeSelectBox from "./profile/themeSelectBox";

import DefaultIcon from "./profile/defaultIcon";
import themeSettings from "./general/themeSettings";

export default function ProfileSettings_page(props) {
  const navigate = useNavigate();

  const [defaultUsername, setDefaultUsername] = useState("");
  const [defaultBio, setDefaultBio] = useState("");
  const [defaultLocation, setDefaultLocation] = useState("");

  const [usernameInput, setUsernameInput] = useState("");
  const [bioInput, setBioInput] = useState("");
  const [locationInput, setLocationInput] = useState("");

  const [usernamePlaceHolder, setUsernamePlaceholder] =
    useState("Enter username");

  const [selectedProfilePic, setSelectedProfilePic] = useState(null);
  const [selectedDefaultPic, setSelectedDefaultPic] = useState(null);
  const [displayProfilePic, setDisplayProfilePic] = useState(null);
  const [profilePicUpdated, setProfilePicUpdate] = useState(false);

  const [selectedTheme, setSelectedTheme] = useState(null);

  const [themeMain, setThemeMain] = useState(null);
  const [themeSub, setThemeSub] = useState(null);
  const [themeExtra, setThemeExtra] = useState(null);

  const [fontColor, setFontColor] = useState(null);

  useEffect(() => {
    loadPage();
  }, [props.user]);

  useState(() => {
    if (selectedDefaultPic == null) {
      return;
    }
  }, [selectedDefaultPic]);

  function loadPage() {
    if (!props.user) {
      return;
    }

    if (props.user.username) {
      setDefaultUsername(props.user.username);
      setUsernameInput(props.user.username);
    }
    if (props.user.bio) {
      setDefaultBio(props.user.bio);
      setBioInput(props.user.bio);
    }
    if (props.user.location) {
      setDefaultLocation(props.user.location);
      setLocationInput(props.user.location);
    }

    // loadProfilePic function won't work here. Custom code used instead.
    const profilePicSettings = props.user.profilePic;

    if (profilePicSettings.defaultSettings.isDefault == true) {
      setSelectedDefaultPic(profilePicSettings.defaultSettings.defaultIndex);
    } else if (
      profilePicSettings.defaultSettings.isDefault == false &&
      profilePicSettings.picId != null
    ) {
      getImageFromDb(profilePicSettings.picId).then((res) => {
        setDisplayProfilePic(res);
      });
    } else {
      setSelectedDefaultPic(0);
    }
    setSelectedTheme(props.user.theme);
    loadTheme();
  }

  async function handleSave() {
    if (!props.user) {
      return;
    }
    if (usernameInput == "" || !usernameInput) {
      setUsernamePlaceholder("Username must be filled out");
      document.getElementById("nameInput").style.borderColor = "red";
      return;
    }

    let picId = null;
    let defaultSettings = {};
    let profilePicData = {};

    if (profilePicUpdated == true) {
      if (selectedProfilePic != null) {
        await uploadProfilePic().then((res) => {
          picId = res.data;
          defaultSettings = { isDefault: false, defaultIndex: null };
        });
      } else {
        if (selectedDefaultPic == null) {
          setSelectedDefaultPic(0);
        }
        picId = null;
        defaultSettings = { isDefault: true, defaultIndex: selectedDefaultPic };
      }
    }

    profilePicData = { defaultSettings, picId };

    saveUserSettings(profilePicData);
  }

  async function uploadProfilePic() {
    let newData = new FormData();

    newData.append("image", selectedProfilePic);

    const imageData = await fetch(`${serverUrl}/image/create`, {
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

    return imageData;
  }

  async function saveUserSettings(profilePicData) {
    await fetch(`${serverUrl}/user/update`, {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        username: usernameInput,
        bio: bioInput,
        location: locationInput,
        id: props.user._id,
        profilePic: profilePicData,
        shouldUpdatePic: profilePicUpdated,
        existingData: props.user,
        theme: selectedTheme,
      }),
    })
      .then((response) => {
        if (response.status === 200) return response.json();
        throw new Error(response.status);
      })
      .then((resObject) => {
        navigate(`/profile/${props.user._id}`);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function switchSelection(index) {
    setProfilePicUpdate(true);
    setSelectedDefaultPic(index);
    setSelectedProfilePic(null);
  }

  function switchTheme(index) {
    setSelectedTheme(index);
  }

  function loadTheme() {
    const mainSrc = require(`../images/themes/theme_${props.user.theme}/main.png`);
    const subSrc = require(`../images/themes/theme_${props.user.theme}/sub.png`);
    const extraSrc = require(`../images/themes/theme_${props.user.theme}/extra.png`);

    setThemeMain(mainSrc);
    setThemeSub(subSrc);
    setThemeExtra(extraSrc);
    setFontColor(themeSettings[props.user.theme].textColors);
  }

  return (
    <div
      className="settingsCont"
      style={{
        backgroundImage: "url(" + themeSub + ")",
      }}
    >
      <div
        className="settingsArea"
        style={{
          backgroundImage: "url(" + themeExtra + ")",
        }}
      >
        <p className="settingsTitle" style={{ color: fontColor }}>
          Profile Settings
        </p>

        <form name="nameForm" id="nameForm">
          <label className="settingsLabel" style={{ color: fontColor }}>
            Name
          </label>
          <input
            id="nameInput"
            placeholder={usernamePlaceHolder}
            defaultValue={defaultUsername}
            onInput={(e) => {
              setUsernameInput(e.target.value);
            }}
            maxLength={50}
          ></input>
        </form>

        <form name="bioForm" id="bioForm">
          <label className="settingsLabel" style={{ color: fontColor }}>
            Bio
          </label>
          <textarea
            id="bioInput"
            placeholder="Share something about yourself"
            defaultValue={defaultBio}
            onInput={(e) => {
              setBioInput(e.target.value);
            }}
            maxLength={1000}
          ></textarea>
        </form>

        <form name="locationForm" id="locationForm">
          <label className="settingsLabel" style={{ color: fontColor }}>
            Location
          </label>
          <input
            id="locationInput"
            placeholder="Your location"
            defaultValue={defaultLocation}
            onInput={(e) => {
              setLocationInput(e.target.value);
            }}
            maxLength={40}
          ></input>
        </form>

        <div className="settingsProfilePicCont">
          <p className="settingsLabel" style={{ color: fontColor }}>
            Profile picture
          </p>
          <div className="settingsProfilePicList">
            <DefaultIcon
              index={"0"}
              switchSelection={switchSelection}
              selectedDefaultPic={selectedDefaultPic}
            />
            <DefaultIcon
              index={"1"}
              switchSelection={switchSelection}
              selectedDefaultPic={selectedDefaultPic}
            />
            <DefaultIcon
              index={"2"}
              switchSelection={switchSelection}
              selectedDefaultPic={selectedDefaultPic}
            />
            <DefaultIcon
              index={"3"}
              switchSelection={switchSelection}
              selectedDefaultPic={selectedDefaultPic}
            />
            <DefaultIcon
              index={"4"}
              switchSelection={switchSelection}
              selectedDefaultPic={selectedDefaultPic}
            />

            <div
              className="settingsProfilePicIcon clickable"
              style={{
                backgroundImage: "url(" + displayProfilePic + ")",
              }}
              onClick={() => {
                document.getElementById("settingsImageInput").click();
              }}
            >
              +
            </div>
            <input
              type={"file"}
              id={"settingsImageInput"}
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
                  setSelectedProfilePic(e.target.files[0]);
                  setProfilePicUpdate(true);
                  setDisplayProfilePic(URL.createObjectURL(e.target.files[0]));
                }
              }}
            ></input>
          </div>
        </div>

        <div className="settingsThemeCont">
          <p className="settingsLabel" style={{ color: fontColor }}>
            Theme
          </p>
          <div className="settingsThemeList">
            <ThemeSelectBox
              index={0}
              switchTheme={switchTheme}
              selectedTheme={selectedTheme}
              themeName={"Paper"}
            />

            <ThemeSelectBox
              index={3}
              switchTheme={switchTheme}
              selectedTheme={selectedTheme}
              themeName={"Fabric"}
            />

            <ThemeSelectBox
              index={1}
              switchTheme={switchTheme}
              selectedTheme={selectedTheme}
              themeName={"Cardboard"}
            />
            <ThemeSelectBox
              index={4}
              switchTheme={switchTheme}
              selectedTheme={selectedTheme}
              themeName={"Tile"}
            />
            <ThemeSelectBox
              index={2}
              switchTheme={switchTheme}
              selectedTheme={selectedTheme}
              themeName={"Wood"}
            />

            <ThemeSelectBox
              index={5}
              switchTheme={switchTheme}
              selectedTheme={selectedTheme}
              themeName={"Marble"}
            />
          </div>
        </div>

        <div className="settingsButtonsCont">
          <button
            id="settingsSaveButton"
            className="clickable buttonStyle"
            type="button"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
