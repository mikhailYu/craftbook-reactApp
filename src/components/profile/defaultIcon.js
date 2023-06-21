import { useEffect, useState } from "react";

export default function DefaultIcon(props) {
  const [icon, setIcon] = useState(null);
  const [borderStyle, setBorderStyle] = useState("none");
  useEffect(() => {
    if (!props) {
      return;
    }

    loadIcon();
  }, [props]);

  useEffect(() => {
    if (props.selectedDefaultPic == props.index) {
      setBorderStyle("5px solid gold");
    } else {
      setBorderStyle("1px solid white");
    }
  }, [props.selectedDefaultPic]);

  function loadIcon() {
    const iconSrc = require(`../../images/defaultIcons/default_icon_${props.index}.png`);
    setIcon(iconSrc);
  }
  return (
    <div
      className="settingsProfilePicIcon clickable"
      style={{
        backgroundImage: "url(" + icon + ")",
        border: borderStyle,
      }}
      onClick={() => {
        props.switchSelection(props.index);
      }}
    ></div>
  );
}
