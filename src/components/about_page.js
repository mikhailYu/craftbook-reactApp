import { useEffect, useState } from "react";
import "../styles/about.css";
import themeSettings from "./general/themeSettings";

export default function About_page(props) {
  const [themeMain, setThemeMain] = useState(null);
  const [themeSub, setThemeSub] = useState(null);
  const [fontColor, setFontColor] = useState(null);

  useEffect(() => {
    if (!props.user || props.user == null) {
      return;
    }
    loadTheme();
  }, [props.user]);

  function loadTheme() {
    const subSrc = require(`../images/themes/theme_${props.user.theme}/sub.png`);
    setThemeSub(subSrc);

    const mainSrc = require(`../images/themes/theme_${props.user.theme}/main.png`);
    setThemeMain(mainSrc);

    setFontColor(themeSettings[props.user.theme].textColors);
  }

  return (
    <div
      className="aboutCont"
      style={{ backgroundImage: "url(" + themeSub + ")" }}
    >
      <div
        className="aboutBox"
        style={{ backgroundImage: "url(" + themeMain + ")" }}
      >
        <div className="aboutText">
          <p className="aboutTitle">About </p>
          <p>
            Craftbook is a social media site created by Mikhail Y. It is
            intented to be used as a way for users to share works that they are
            proud of, as well as work-in-progress updates of their creations.
            Artists, programmers and basically anyone who loves to create can
            come together and interact with like minded people.
          </p>

          <p>
            Users are able to add friends, share pictures, like/ comment on
            posts and customize their experience through hand-picked themes.
          </p>
          <p>
            The website was created using Reactjs for the interface and Nodejs
            for the backend. All of the data is stored in a Mongodb database.
          </p>
        </div>
        <a
          className="aboutLink clickable"
          href="https://github.com/mikhailYu"
          target={"blank"}
        >
          <img
            className="aboutImg"
            src={require("../images/assets/github.png")}
          />
        </a>
      </div>
    </div>
  );
}
