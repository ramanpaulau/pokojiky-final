import React from "react";
import Reservation, { IReservationProps } from './Reservation';
import { Redirect } from "react-router-dom";
import { User } from "./objects/User";
import axios from 'axios';
import { observer } from "mobx-react";

interface IUserReservationsState {
	redirect: string;
	reservations: Array<IReservationProps>;
	isLoading: boolean;
}

@observer
class UserOffer extends React.Component<{ store: User }, IUserReservationsState> {
	constructor(props: Readonly<{ store: User; }>) {
		super(props);
		this.state = { redirect: '', reservations: [], isLoading: true };
	}

	getReservations = () => {
		axios.get("http://localhost:8080/reservations/user-" + this.props.store.id)
			.then((res) => {
				this.setState({ reservations: res.data, isLoading: false });
			});
	}

	render() {
		if (this.state.redirect) {
			return <Redirect to={this.state.redirect} />
		}

		if (this.props.store.id !== -1 && this.state.isLoading)
			this.getReservations();

		return (
			<main>
				<div className='user-reservations'>
					<div className="user-title">
						<h1>Moje rezervace</h1>
						<div className="underline" ></div>
					</div>
					<section className="rooms-reservation">
						{this.state.reservations.map((reservation: IReservationProps) => {
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

export default UserOffer;