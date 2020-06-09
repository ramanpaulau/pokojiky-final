import React from "react";
import { Property, PropertyProps } from "./Property";
import { Link } from "react-router-dom";
import Banner from "./Banner";
import axios from "axios";

class Home extends React.Component<{}, { properties: Array<PropertyProps> }> {
  constructor(props: Readonly<{}>) {
    super(props);

    this.state = {
      properties: [],
    };

    this.getProperties();
  }

  getProperties = () => {
    axios.get("http://localhost:8080/properties").then((res) => {
      this.setState({ properties: res.data.slice(0, 6) });
    });
  };

  render() {
    return (
      <div>
        <main data-barba="container">
          <div className="swipe swipe1"></div>
          <div className="swipe swipe2"></div>
          <div className="swipe swipe3"></div>

          <Banner />

          <h1>Nejnovější</h1>
          <div className="underline"></div>
          <section className="rooms">
            {this.state.properties.map((property) => (
              <Property key={property.p_id} {...property} />
            ))}
          </section>

          <div className="more">
            <Link to="/search" className="primary-btn">
              Další pokoje
            </Link>
          </div>
        </main>
      </div>
    );
  }
}

export default Home;
