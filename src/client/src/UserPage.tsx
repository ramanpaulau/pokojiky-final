import React from "react";
import { User } from "./objects/User";
import { Link, Redirect } from "react-router-dom";
import { Property, PropertyProps } from "./Property";
import Reservation, { IReservationProps } from "./Reservation";
import axios from "axios";
import { observer } from "mobx-react";

interface IUserPageState {
	redirect: string;
	reservations: Array<IReservationProps>;
	offers: Array<PropertyProps>;
	isLoading: boolean;
}

@observer
class UserPage extends React.Component<{ store: User }, IUserPageState> {
	private undeline1: React.RefObject<HTMLDivElement>;
	private undeline2: React.RefObject<HTMLDivElement>;
	private text1: React.RefObject<HTMLHeadingElement>;
	private text2: React.RefObject<HTMLHeadingElement>;

	constructor(props: Readonly<{ store: User }>) {
		super(props);
		this.undeline1 = React.createRef();
		this.undeline2 = React.createRef();
		this.text1 = React.createRef();
		this.text2 = React.createRef();
		this.state = { redirect: "", reservations: [], offers: [], isLoading: true };
	}

	componentDidMount = () => {
		this.text1.current?.addEventListener("mouseenter", () => {
			this.undeline1.current?.classList.add("underline-wide");
		});
		this.text1.current?.addEventListener("mouseout", () => {
			this.undeline1.current?.classList.remove("underline-wide");
		});
		this.text2.current?.addEventListener("mouseenter", () => {
			this.undeline2.current?.classList.add("underline-wide");
		});
		this.text2.current?.addEventListener("mouseout", () => {
			this.undeline2.current?.classList.remove("underline-wide");
		});
	};

	getReservations = () => {
		axios
			.get("http://localhost:8080/reservations/user-" + this.props.store.id)
			.then((res) => {
				this.setState({ reservations: res.data, isLoading: false });
			});
	};

	getOffers = () => {
		axios
			.get("http://localhost:8080/offers/" + this.props.store.id)
			.then((res) => {
				this.setState({ offers: res.data, isLoading: false });
			});
	};

	render() {
		if (this.state.redirect) {
			return <Redirect to={this.state.redirect} />;
		}

		if (this.props.store.id !== -1 && this.state.isLoading) {
			this.getReservations();
			this.getOffers();
		}

		return (
			<main className="user-page">
				<div className="user-info">
					<div className="user-title">
						<h1 ref={this.text1}>Informace</h1>
					</div>
					<ul>
						<li>Jméno: {this.props.store.fullName}</li>
						<li>Email: {this.props.store.email}</li>
					</ul>
				</div>
				<div className="user-offers">
					<div className="user-title">
						<Link to={"/user/offers"}>
							<h1 ref={this.text1}>Moje nabídky</h1>
						</Link>
						<div className="underline" ref={this.undeline1}></div>
					</div>
					<section className="rooms">
						<div
							className="add-property"
							onClick={() => this.setState({ redirect: "/user/add_offer" })}
						>
							<i className="fas fa-plus"></i>
						</div>
						{this.state.offers.slice(0, 2).map((property: PropertyProps) => {
							return <Property key={property.p_id} {...property} removeCallback={() => { this.getOffers() }} />;
						})}
					</section>
				</div>
				<div className="user-reservations">
					<div className="user-title">
						<Link to={"/user/reservations"}>
							<h1 ref={this.text2}>Moje rezervace</h1>
						</Link>
						<div className="underline" ref={this.undeline2}></div>
					</div>
					<section className="rooms-reservation">
						{this.state.reservations.slice(0, 10).map((reservation: IReservationProps) => {
							reservation.type = "owner";
							return (
								<Reservation key={reservation.reservation_id} {...reservation} removeCallback={() => { this.getReservations(); }} />
							);
						})}
					</section>
				</div>
			</main>
		);
	}
}

export default UserPage;
