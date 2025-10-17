import React from "react";
import "../App.css";
import { Link, useNavigate } from "react-router-dom";
export default function Landing() {
  const router = useNavigate();
  return (
    <>
      <div className="landingPageContainer">
        <nav>
          <div className="navHeader">
            <h2>Zoommmyyy</h2>
          </div>
          <div className="navList">
            <p
              onClick={() => {
                router.push("/sid123");
              }}
            >
              Join as guest
            </p>
            <p
              onClick={() => {
                router.push("/auth");
              }}
            >
              Register
            </p>
            <div role="button">
              <p
                onClick={() => {
                  router.push("/auth");
                }}
              >
                Login
              </p>
            </div>
          </div>
        </nav>
        <div className="landingMainContainer">
          <div>
            <h1>
              <span style={{ color: "#ff9839" }}>Connect</span> with your Loved
              ones
            </h1>
            <p>Cover a Distance by Zoommmyyy</p>
            <div role="button">
              <Link to={"/home"}>Get Started</Link>
            </div>
          </div>
          <div>
            <img src="mobile.png" alt="" />
          </div>
        </div>
      </div>
    </>
  );
}
