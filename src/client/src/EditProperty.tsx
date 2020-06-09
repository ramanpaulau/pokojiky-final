import React from "react";
import { User } from "./objects/User";
import { observer } from "mobx-react";
import axios from "axios";
import { ButtonStatus } from './Details';
import { Redirect } from "react-router-dom";
import { PropertyProps } from "./Property";

interface IEditPropertyState {
  id: number;
  locality: Array<{ name: string; id: number }>;
  propertyTypes: Array<{ name: string; id: number }>;
  title: string;
  type: number;
  price: number;
  capacity: number;
  location: number;
  description: string;
  message: string;
  buttonStatus: ButtonStatus;
  redirect: string;
}


interface IEditPropertyProps {
    match: any;
    store: User;
}

@observer
class EditProperty extends React.Component<IEditPropertyProps, IEditPropertyState> {
  private addLocation: React.RefObject<HTMLDivElement>;
  private addLocationInput: React.RefObject<HTMLDivElement>;
  private addLocationSelect: React.RefObject<HTMLSelectElement>;
  private newLocation: React.RefObject<HTMLInputElement>;

  constructor(props: Readonly<IEditPropertyProps>) {
    super(props);
    const { match: { params } } = this.props;
    
    this.addLocation = React.createRef();
    this.addLocationInput = React.createRef();
    this.addLocationSelect = React.createRef();
    this.newLocation = React.createRef();
    this.state = {
      id: params.id,
      locality: [],
      propertyTypes: [],
      title: "",
      type: 1,
      price: 0,
      capacity: 0,
      location: 1,
      description: "",
      message: "",
      buttonStatus: ButtonStatus.DEFAULT,
      redirect: "",
    };
  }

  componentDidMount() {
    this.loadLocalities();
    this.loadPropertyTypes();
    this.getData();
  }

  loadLocalities = () => {
    axios.get("http://localhost:8080/localities").then((res) => {
      this.setState({ locality: res.data });
    });
  };

  loadPropertyTypes = () => {
    axios.get("http://localhost:8080/propertyTypes").then((res) => {
      this.setState({ propertyTypes: res.data });
    });
  };

  addLocalityToggle = (event: React.MouseEvent) => {
    event.preventDefault();
    this.addLocationInput.current?.classList.toggle("hidden");
    this.addLocationSelect.current?.classList.toggle("hidden");
  };

  addLocality = (event: React.MouseEvent) => {
    this.addLocalityToggle(event);
    if (!this.newLocation.current || !this.newLocation.current.value) return;

    let newLocation = this.newLocation.current.value.toLowerCase();
    newLocation = newLocation.charAt(0).toUpperCase() + newLocation.slice(1);

    this.newLocation.current.value = "";

    if (this.state.locality.map((l) => l.name).includes(newLocation)) return;

    axios
      .put("http://localhost:8080/localities", { name: newLocation })
      .then(() => {
        this.loadLocalities();
      });
  };

  handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    this.setState({ message: "", buttonStatus: ButtonStatus.INPROGRESS });

    axios
      .put("http://localhost:8080/property/update/" + this.state.id, {
        id: this.state.id,
        locality: this.state.location,
        price: this.state.price,
        capacity: this.state.capacity,
        type: this.state.type,
        title: this.state.title,
        description: this.state.description,
      })
      .then(() => {
        this.setState({ buttonStatus: ButtonStatus.SUCCESS });
        setTimeout(() => this.setState({ buttonStatus: ButtonStatus.DEFAULT }), 1500);
      });
  };

  handleChange = (event: { target: { name: any; value: any } }) => {
    const newState = { [event.target.name]: event.target.value } as Pick<
      IEditPropertyState,
      keyof IEditPropertyState
    >;
    this.setState(newState);
  };

  handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (event.target.name === "type") {
      this.setState({ type: +event.target.selectedOptions[0].value });
    }
    if (event.target.name === "location") {
      this.setState({ location: +event.target.selectedOptions[0].value });
    }
    if (event.target.name === "capacity") {
      this.setState({ capacity: +event.target.selectedOptions[0].value });
    }
  };

	getData = () => {
		axios.get("http://localhost:8080/property/" + this.state.id).then((res) => {
			if (res.data.length === 0) {
        this.setState({ redirect: '/404' });
        return;
			} else {
        const property: PropertyProps = res.data[0];
        if (+property.p_ownerID !== +this.props.store.id) {
          this.setState({ redirect: '/' });
          return;
        }
				this.setState({
					title: property.p_name,
					location: property.l_id,
					price: property.p_price,
					capacity: property.p_capacity,
					type: property.t_id,
          description: property.p_description,
        });
			}
		});
	};

  render() {
    if (this.state.redirect) {
			return (<Redirect to={this.state.redirect} />);
    }
    
    return (
      <main>
        <div className="add-property-main">
          <div className="add-property-left">
            <form className="form-template" onSubmit={this.handleSubmit}>
              <div className="form-group">
                <label htmlFor="firstName">Název</label>
                <input
                  id="title"
                  type="text"
                  name="title"
                  placeholder='Villa "Monte Grande"'
                  className="form-input"
                  onChange={this.handleChange}
                  value={this.state.title}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="type">Typ</label>
                <select
                  name="type"
                  id="type"
                  onChange={this.handleSelectChange}
                  className="form-input"
                  value={this.state.type}
                  required
                >
                  {this.state.propertyTypes.map((propertyType) => (
                    <option key={propertyType.id} value={propertyType.id}>
                      {propertyType.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="firstName">Cena za noc v Kč</label>
                <input
                  id="title"
                  type="number"
                  name="price"
                  placeholder="700"
                  className="form-input"
                  min="0"
                  onChange={this.handleChange}
                  value={this.state.price ? this.state.price : ""}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="capacity">Počet hostů</label>
                <input
                  id="capacity"
                  name="capacity"
                  type="number"
                  placeholder="4"
                  className="form-input"
                  onChange={this.handleChange}
                  value={this.state.capacity ? this.state.capacity : ""}
                  min="1"
                  max="20"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="location">Lokalita</label>
                <div className="add-offer-input">
                  <select
                    name="location"
                    id="location"
                    onChange={this.handleSelectChange}
                    ref={this.addLocationSelect}
                    value={this.state.location}
                    className="form-input"
                    required
                  >
                    {this.state.locality.map((locality) => (
                      <option key={locality.id} value={locality.id}>
                        {locality.name}
                      </option>
                    ))}
                  </select>
                  <span ref={this.addLocation} onClick={this.addLocalityToggle} className="add-location-toggle">
                    <i className="fas fa-plus"></i>
                  </span>
                  <div ref={this.addLocationInput} className="hidden add-location-wrapepr">
                    <div className="add-location">
                      <input
                        ref={this.newLocation}
                        name="new-locality"
                        type="text"
                        className="form-input"
                      />
                      <input
                        type="button"
                        value="Přidat"
                        className="primary-btn"
                        onClick={this.addLocality}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="firstName">Popis</label>
                <textarea
                  id="title"
                  name="description"
                  placeholder='Villa "Monte Grande"'
                  className="form-input"
                  onChange={this.handleChange}
                  value={this.state.description}
                  required
                />
              </div>
									{
										(this.state.buttonStatus === ButtonStatus.DEFAULT)
											? <input type="submit" className="primary-btn" value="Uložit" />
                      :  (this.state.buttonStatus === ButtonStatus.INPROGRESS)
                          ? <input type="submit" className="primary-btn disabled-btn" onClick={(e: any) => { e.preventDefault() }} value="Ukladani" />
                          : <input type="submit" className="primary-btn disabled-btn" onClick={(e: any) => { e.preventDefault() }} value="Uloženo" />
									}
              <div className="signMessage">
                {this.state.message ? this.state.message : ""}
              </div>
            </form>
          </div>
        </div>
      </main>
    );
  }
}

export default EditProperty;
