import { useEffect, useState } from "react";

export default function ThemeSelectBox(props) {
  const [imgSrc, setImgSrc] = useState(null);
  const [borderStyle, setBorderStyle] = useState("2px solid white");
  const [themeName, setThemeName] = useState(null);

  const [imgScale, setImgScale] = useState(null);
  useEffect(() => {
    if (!props) {
      return;
    }
    setThemeName(props.themeName);
    loadImage();
  }, [props]);

  useEffect(() => {
    if (!props) {
      return;
    }
    if (props.selectedTheme === props.index) {
      setBorderStyle("5px solid gold");
    } else {
      setBorderStyle("2px solid white");
    }

    loadimgScale();
  }, [props.selectedTheme]);

  function loadImage() {
    const src = require(`../../images/themes/theme_${props.index}/main.png`);
    setImgSrc(src);
  }

  function loadimgScale() {
    if (props.themeName == "Paper") {
      setImgScale("70%");
    } else if (props.themeName == "Fabric") {
      setImgScale("250%");
    } else if (props.themeName == "Cardboard") {
      setImgScale("80%");
    } else if (props.themeName == "Tile") {
      setImgScale("25%");
    } else if (props.themeName == "Wood") {
      setImgScale("150%");
    } else if (props.themeName == "Marble") {
      setImgScale("200%");
    }
  }

  return (
    <div
      className="settingsThemeBox"
      style={{
        backgroundImage: "url(" + imgSrc + ")",
        border: borderStyle,
        backgroundSize: imgScale,
      }}
      onClick={() => {
        props.switchTheme(props.index);
      }}
    >
      <p className="settingsBoxText"> {themeName}</p>
    </div>
  );
}
