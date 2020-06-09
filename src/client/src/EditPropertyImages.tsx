import React from "react";
import MyDropzone from "./Dropzone";
import { User } from "./objects/User";
import { observer } from "mobx-react";
import axios from "axios";
import { ButtonStatus } from './Details';
import { Redirect } from "react-router-dom";

interface IEditPropertyImagesState {
  id: Number;
  files: any;
  buttonStatus1: ButtonStatus;
  buttonStatus2: ButtonStatus;
  images: Array<{ name: string, selected: boolean }>;
  displayImage: number;
  redirect: string;
  messageAdd: string;
  messageRemove: string;
  title: string;
}

@observer
class EditPropertyImages extends React.Component<{ store: User, match: any }, IEditPropertyImagesState> {

  constructor(props: Readonly<{ store: User, match: any }>) {
    super(props);
    const { match: { params } } = this.props;

    this.state = {
      id: params.id,
      files: [],
      buttonStatus1: ButtonStatus.DEFAULT,
      buttonStatus2: ButtonStatus.DEFAULT,
      images: [],
      displayImage: 0,
      redirect: "",
      messageAdd: "",
      messageRemove: "",
      title: "",
    };
    this.getData();
  }

  getImages = () => {
    let images = new Array<string>();
    axios
      .get("http://localhost:8080/images/property-" + this.state.id)
      .then((res) => {
        res.data.map((image: { path: string; productID: number }) =>
          images.push(image.path)
        );
        this.setState({ images: images.map((i) => { return { name: i, selected: false }; }) });
      });
  };

  handleSelect = (event: React.MouseEvent) => {
    event.preventDefault();
    let name = this.state.images[this.state.displayImage].name;
    let cpyState = this.state.images;

    this.setState({
      images: cpyState.map((i) => {
        return (i.name === name)
          ? { name: i.name, selected: !i.selected }
          : { name: i.name, selected: i.selected }
      })
    });
  };

  handleRemove = (event: React.MouseEvent) => {
    event.preventDefault();
    this.setState({ messageRemove: "" });

    let cpyState = this.state.images;
    let tmp = cpyState.filter((val) => val.selected).map((val) => val.name);
    if (tmp.length === 0) {
      this.setState({ messageRemove: "Zvolte aspon jeden obrazek." });
      return;
    }

    if (cpyState.length <= 1) {
      this.setState({ messageRemove: "Nelze odstranit poslední obrazek." });
      return;
    }

    if (tmp.length === this.state.images.length) {
      this.setState({ messageRemove: "Nelze odstranit všechný obrazky." });
      return;
    }

    axios.delete("http://localhost:8080/remove/images-" + this.state.id, {
      data: { files: tmp }
    }).then(() => { setTimeout(this.getImages, 1000) });

    this.setState({ buttonStatus1: ButtonStatus.SUCCESS, displayImage: 0 });
    setTimeout(() => this.setState({ buttonStatus1: ButtonStatus.DEFAULT }), 1000);
  }

  handleAdd = (event: React.MouseEvent) => {
    event.preventDefault();
    this.setState({ messageAdd: "" });

    let data = new FormData();
    if (this.state.files.length === 0) {
      this.setState({ messageAdd: "Zvolte aspon jeden obrazek." });
      return;
    }

    this.state.files.map((file: any) => {
      return data.append("photos", file);
    });
    axios
      .put("http://localhost:8080/upload/images-" + this.state.id, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }).then(() => { setTimeout(this.getImages, 1000) });

    this.setState({ buttonStatus2: ButtonStatus.SUCCESS, displayImage: 0 });
    setTimeout(() => this.setState({ buttonStatus2: ButtonStatus.DEFAULT }), 1000);
  }

  getData = () => {
    axios.get("http://localhost:8080/property/" + this.state.id).then((res) => {
      if (res.data.length === 0) {
        this.setState({ redirect: '/404' });
        return;
      } else {
        const property = res.data[0];
        if (+property.p_ownerID !== +this.props.store.id) {
          this.setState({ redirect: '/' });
          return;
        }
        this.setState({
          title: property.p_name,
        });
        this.getImages();
      }
    });
  };

  render() {
    if (this.state.redirect) {
      return (<Redirect to={this.state.redirect} />);
    }

    return (
      <main>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h2>{this.state.title}</h2>
          <div className="slider">
            {(this.state.images.length > 1) ?
              <button
                className="arrow"
                onClick={() => {
                  if (this.state.displayImage > 0)
                    this.setState({ displayImage: this.state.displayImage - 1 });
                  else
                    this.setState({ displayImage: this.state.images.length - 1 });
                }}
              >
                <i className="fas fa-arrow-circle-left"></i>
              </button>
              : ""}
            <div className="detail-images">
              {
                (this.state.images[0])
                  ?
                  <div
                    className="remove-image-wrapper"
                    onClick={this.handleSelect}>
                    <img
                      src={
                        "http://localhost:8080/images/" +
                        this.state.images[this.state.displayImage].name
                      }
                      alt="room"
                    />
                    <i className={(this.state.images[this.state.displayImage].selected) ? "far fa-trash-alt remove-image-selected" : "far fa-trash-alt"}></i>
                  </div>
                  :
                  ""
              }
            </div>
            {(this.state.images.length > 1) ?
              <button
                className="arrow"
                onClick={() => {
                  if (this.state.displayImage < this.state.images.length - 1)
                    this.setState({ displayImage: this.state.displayImage + 1 });
                  else this.setState({ displayImage: 0 });
                }}
              >
                <i className="fas fa-arrow-circle-right"></i>
              </button>
              : ""}
          </div>
          {
            (this.state.buttonStatus1 === ButtonStatus.DEFAULT)
              ? <input type="submit" className="primary-btn" style={{ marginTop: "10px" }} onClick={this.handleRemove} value="Odstranit" />
              : <input type="submit" className="primary-btn disabled-btn" style={{ marginTop: "10px" }} onClick={(e: any) => { e.preventDefault() }} value="Hotovo" />
          }
          <div className="signMessage">{(this.state.messageRemove) ? this.state.messageRemove : ""}</div>
          <MyDropzone files={this.state.files} />
          {
            (this.state.buttonStatus2 === ButtonStatus.DEFAULT)
              ? <input type="submit" className="primary-btn" style={{ marginTop: "10px" }} onClick={this.handleAdd} value="Přidat" />
              : <input type="submit" className="primary-btn disabled-btn" style={{ marginTop: "10px" }} onClick={(e: any) => { e.preventDefault() }} value="Hotovo" />
          }
          <div className="signMessage">{(this.state.messageAdd) ? this.state.messageAdd : ""}</div>
        </div>
      </main>
    );
  }
}

export default EditPropertyImages;
