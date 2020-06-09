import React from "react";
import Banner from "./Banner";

class Error extends React.Component {
  render() {
    return (
      <main data-barba="container">
        <div className="swipe swipe1"></div>
        <div className="swipe swipe2"></div>
        <div className="swipe swipe3"></div>
        <Banner />
      </main>
    );
  }
}

export default Error;
