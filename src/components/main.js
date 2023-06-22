import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Profile_page from "./profile_page";
import ProfileSettings_page from "./profileSettings_page";
import SignUp_Page from "./signUp_page";
import About_page from "./about_page";
import Feed_page from "./feed_page";
import Auth_page from "./auth_page";
import Invalid_page from "./invalid_page";
import Post_page from "./post_page";

import "../styles/App.css";

export default function Main(props) {
  return (
    <Routes>
      <Route path="*" element={<Navigate to="/invalid" replace />} />
      <Route
        exact
        path="/feed"
        element={<Feed_page user={props.user} />}
      ></Route>
      <Route
        exact
        path="/about"
        element={<About_page user={props.user} />}
      ></Route>
      <Route
        exact
        path="/profile/:id"
        element={
          <Profile_page
            user={props.user}
            getUser={props.getUser}
            sendNotification={props.sendNotification}
          />
        }
      ></Route>
      <Route
        exact
        path="/settings"
        element={<ProfileSettings_page user={props.user} />}
      ></Route>
      <Route
        exact
        path="/"
        element={<SignUp_Page getUser={props.getUser} />}
      ></Route>

      <Route
        exact
        path="/authenticate"
        element={<Auth_page user={props.user} getUser={props.getUser} />}
      ></Route>
      <Route
        exact
        path="/post/:id"
        element={<Post_page user={props.user} />}
      ></Route>

      <Route exact path="/invalid" element={<Invalid_page />}></Route>
    </Routes>
  );
}
