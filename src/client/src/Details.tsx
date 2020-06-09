import React from "react";
import axios from "axios";
import { Redirect, Link } from "react-router-dom";
import { filterDate } from "./objects/FilterDate";
import { observer } from "mobx-react";
import { user } from "./objects/User";
import Reservation, { IReservationProps } from "./Reservation";

const secondsInDay = (1000 * 3600 * 24);

export enum ButtonStatus {
	SUCCESS, FAILURE, DEFAULT, INPROGRESS
}

interface IDetailsState {
	locality: string;
	price: number;
	ownerID: number;
	capacity: number;
	type: string;
	title: string;
	description: string;
	disabled: boolean;
	redirect: string;
	id: number;
	firstName: string;
	lastName: string;
	images: Array<string>;
	displayImage: number;
	nightsCount: number;
	buttonStatus: ButtonStatus;
	reservations: Array<IReservationProps>;
	page: number;
	score: {
		avg: number;
		len: number;
	};
}

interface IDetailsProps {
	match: any;
}

@observer
class Details extends React.Component<IDetailsProps, IDetailsState> {
	private sendReservation: React.RefObject<HTMLAnchorElement>;

	constructor(props: Readonly<IDetailsProps>) {
		super(props);
		const { match: { params } } = this.props;
		this.sendReservation = React.createRef();

		this.state = {
			locality: '',
			price: 0,
			ownerID: 0,
			capacity: 0,
			type: '',
			title: '',
			description: '',
			disabled: false,
			id: params.id,
			redirect: '',
			firstName: '',
			lastName: '',
			images: [],
			displayImage: 0,
			buttonStatus: ButtonStatus.DEFAULT,
			nightsCount: (new Date(filterDate.to).getTime() - new Date(filterDate.from).getTime()) / secondsInDay,
			reservations: [],
			page: 1,
			score: {
				avg: 0,
				len: 0
			}
		}
	}

	getData = () => {
		axios.get("http://localhost:8080/property/" + this.state.id).then((res) => {
			if (res.data.length === 0) {
				Object.assign(this.state, { redirect: "/404" });
				return;
			} else {
				const property = res.data[0];
				this.setState({
					locality: property.l_name,
					price: property.p_price,
					ownerID: property.p_ownerID,
					capacity: property.p_capacity,
					type: property.t_name,
					title: property.p_name,
					description: property.p_description,
					disabled: property.p_disabled,
					score: property.score
				});
				this.getUserInfo();
				this.checkAvailability();
			}
		});
	};

	getUserInfo = () => {
		axios.get('http://localhost:8080/users/' + this.state.ownerID).then((res) => {
			this.setState(res.data);
		}).catch((e) => { });
	}

	componentDidMount() {
		this.getData();
		this.getImages();
		this.getReservations();
	}

	countNights = () => {
		this.setState({
			nightsCount: (new Date(filterDate.to).getTime() - new Date(filterDate.from).getTime()) / secondsInDay
		});
	}

	checkAvailability = () => {
		axios.post('http://localhost:8080/checkAvailability/' + this.state.id, {
			date: filterDate
		}).then((res) => {
			this.setState({ buttonStatus: (res.data) ? ButtonStatus.DEFAULT : ButtonStatus.FAILURE });
		});
	}

	handleSendReservation = () => {
		axios.put('http://localhost:8080/reservation', {
			from: filterDate.from,
			to: filterDate.to,
			propertyID: this.state.id,
			customerID: user.id,
			totalPrice: this.state.nightsCount * this.state.price,
		});
		this.setState({ buttonStatus: ButtonStatus.SUCCESS });
	}

	getImages = () => {
		let images = new Array<string>();
		axios
			.get("http://localhost:8080/images/property-" + this.state.id)
			.then((res) => {
				res.data.map((image: { path: string; productID: number }) =>
					images.push(image.path)
				);
				this.setState({ images: images });
			});
	};

	getReservations = () => {
		axios
			.get("http://localhost:8080/reservations/property-" + this.state.id)
			.then((res) => {
				this.setState({ reservations: res.data });
			});
	};

	handleToggleDisable = (e: any) => {
		e.preventDefault();
		if (this.state.disabled)
			axios.put("http://localhost:8080/property/enable/" + this.state.id);
		else
			axios.put("http://localhost:8080/property/disable/" + this.state.id);
		this.setState({ disabled: !this.state.disabled });
	}

	handleRemove = (e: any) => {
		e.preventDefault();
		let activeReservations = 0;
		let today = new Date();
		let days;

		axios.get("http://localhost:8080/reservations/property-" + this.state.id)
			.then((res) => {
				res.data.forEach((r: any) => {
					days = Math.round((new Date(r.reservation_dtEnd).getTime() - today.getTime()) / secondsInDay);
					if (!r.reservation_canceled && days > 0) {
						activeReservations++;
					}
				});
				if (activeReservations > 0) {
					alert('Nelze, máte aktivní rezervce - ' + activeReservations);
					return;
				}
				axios.delete("http://localhost:8080/remove/images-" + this.state.id, {
					data: { files: this.state.images }
				});

				axios.delete("http://localhost:8080/property/" + this.state.id).then(() => {
					this.setState({ redirect: '/search' });
				});
			});
	}


	render() {
		if (this.state.redirect) {
			return (<Redirect to={this.state.redirect} />);
		}

		return (
			<main data-barba="container">
				<div className="swipe swipe1"></div>
				<div className="swipe swipe2"></div>
				<div className="swipe swipe3"></div>

				<section className="detail">
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
									<img
										src={
											"http://localhost:8080/images/" +
											this.state.images[this.state.displayImage]
										}
										alt="room"
									/>
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
					<div className="detail-info">
						<article className="description">
							<h1>{this.state.title}</h1>
							<h2>Detaily</h2>
							<p>
								{this.state.description}
							</p>
						</article>
						<article className="information">
							<h2>Info</h2>
							<h6>Typ: {this.state.type}</h6>
							<h6>Lokalita: {this.state.locality}</h6>
							<h6>Cena: {this.state.price} CZK / noc</h6>
							<h6>
								Maximální počet hostů: {this.state.capacity}
							</h6>
							<h6>
								Majitel: {this.state.firstName + ' ' + this.state.lastName}
							</h6>
							<h6>
								Hodnocení: {this.state.score.avg < 0 ? "-" : this.state.score.avg}/5 (uživatelů: {this.state.score.len})
							</h6>
						</article>
					</div>
					{(user.id !== -1 && (!this.state.disabled || user.id === +this.state.ownerID)) ?
						(+this.state.ownerID !== 0 && user.id !== +this.state.ownerID) ?
							<article className="property-reservation">
								<form onChange={() => { this.countNights(); this.checkAvailability() }}>
									<div className="form-group">
										<div className="date-inputs">
											<input
												type="date"
												name="date-arrival"
												id="date"
												value={filterDate.from}
												data-class="form-input"
												onChange={(e: React.FormEvent<HTMLInputElement>) => {
													let selectedDate: string = new Date(e.currentTarget.value).toISOString().split('T')[0];

													// older than current date
													if (Date.parse(new Date().toISOString().split('T')[0]) > Date.parse(selectedDate)) {
														return;
													}
													// bigger than 'to' date
													if (Date.parse(selectedDate) >= Date.parse(filterDate.to)) {
														return;
													}

													filterDate.from = selectedDate;
												}}
											/>
											<input
												type="date"
												name="date-departure"
												id="date"
												value={filterDate.to}
												data-class="form-input"
												onChange={(e: React.FormEvent<HTMLInputElement>) => {
													let selectedDate: string = new Date(e.currentTarget.value).toISOString().split('T')[0];

													// older than from date
													if (Date.parse(filterDate.from) >= Date.parse(selectedDate)) {
														return;
													}

													filterDate.to = selectedDate;
												}}
											/>
										</div>
										<p>Počet noci: {this.state.nightsCount}</p>
										<p>Cena: {this.state.nightsCount * this.state.price} CZK,-</p>
										{
											(this.state.buttonStatus === ButtonStatus.DEFAULT)
												? <Link to={window.location.pathname} ref={this.sendReservation} className="primary-btn" onClick={this.handleSendReservation} >Rezervovat</Link>
												:
												(this.state.buttonStatus === ButtonStatus.FAILURE)
													? <Link to={window.location.pathname} className="primary-btn disabled-btn">Obsazeno</Link>
													: <Link to={window.location.pathname} className="primary-btn disabled-btn">Rezervovano</Link>
										}
									</div>
								</form>
							</article>
							:
							<section className="rooms-reservation">
								<div className="property-control">
									<Link
										to={"/user/edit_offer/" + this.state.id}
										className="primary-btn"
									>
										Upravit
								</Link>
									<Link
										to={""}
										className="primary-btn"
										onClick={this.handleToggleDisable}
									>
										{(this.state.disabled) ? "Povolit rezervace" : "Zakázat rezervace"}
									</Link>
									<Link
										to={"/user/edit_offer/images/" + this.state.id}
										className="primary-btn"
									>
										Obrázky
								</Link>
									<Link
										to={""}
										className="primary-btn"
										onClick={this.handleRemove}
									>
										Odebrat
								</Link>
								</div>
								<h2>Rezervace</h2>
								{this.state.reservations.slice(0, this.state.page * 5).map((reservation: IReservationProps) => {
									reservation.type = "customer";
									return (
										<Reservation key={reservation.reservation_id} {...reservation} removeCallback={() => { return; }} />
									);
								})}
								{(this.state.reservations.length - (this.state.page * 5) > 0)
									? <Link to={window.location.pathname} className="primary-btn" onClick={() => { this.setState({ page: this.state.page + 1 }) }}>Načíst předchozí</Link>
									: ""
								}
							</section>
						: ""
					}
				</section>
			</main>
		)
	}
}

export default Details;
