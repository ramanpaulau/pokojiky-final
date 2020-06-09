import React from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export interface PropertyProps {
  p_id: number;
  p_localityID: number;
  p_price: number;
  p_ownerID: number;
  p_capacity: number;
  p_typeID: number;
  p_name: string;
  p_description: string;
  p_created: string;
  l_id: number;
  l_name: string;
  t_id: number;
  t_name: string;
  removeCallback: Function;
}

export class Property extends React.Component<
  PropertyProps,
  { image: string }
  > {
  constructor(props: any) {
    super(props);
    this.state = {
      image: "",
    };
    this.getTitleImage();
  }

  getTitleImage = () => {
    axios
      .get("http://localhost:8080/images/main/property-" + this.props.p_id)
      .then((res) => {
        this.setState({
          image: res.data.path,
        });
      });
  }

  render() {
    return (
      <article key={this.props.p_id} className="room">
        <div className="img-container">
          <img
            src={"http://localhost:8080/images/" + this.state.image}
            alt="room-img"
          />
          <div className="property-wrapper">
            <div className="price-top">
              <h6>{this.props.p_price} CZK,-</h6>
              <p>za noc</p>
            </div>
            <div className="location-top">
              {<h6>{this.props.l_name}</h6>}
              <p>{this.props.t_name}</p>
            </div>
            <Link
              to={`/property/${this.props.p_id}`}
              className="primary-btn room-link"
            >
              Detail
            </Link>
          </div>
        </div>
        <div className="room-info">{this.props.p_name}</div>
      </article>
    );
  }
}
