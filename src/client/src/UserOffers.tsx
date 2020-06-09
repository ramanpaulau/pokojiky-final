import React from "react";
import { PropertyProps, Property } from "./Property";
import { Redirect, Link } from "react-router-dom";
import { User } from "./objects/User";
import axios from 'axios';
import { observer } from "mobx-react";

interface IUserOfferState {
	redirect: string;
	offers: Array<PropertyProps>;
	page: number;
	isLoading: boolean;
}

@observer
class UserOffer extends React.Component<{ store: User }, IUserOfferState> {
	constructor(props: Readonly<{ store: User; }>) {
		super(props);
		this.state = { redirect: '', offers: [], page: 1, isLoading: true };
	}

	getOffers = () => {
		if (this.props.store.id === -1)
			return;

		axios.get("http://localhost:8080/offers/" + this.props.store.id)
			.then((res) => {
				this.setState({ offers: res.data, isLoading: false });
			});
	}

	render() {
		if (this.state.redirect) {
			return <Redirect to={this.state.redirect} />
		}

		if (this.props.store.id !== -1 && this.state.isLoading)
			this.getOffers();

		return (
			<main>
				<div className='user-offers'>
					<div className="user-title">
						<h1>Moje nabídky</h1>
						<div className="underline" ></div>
					</div>
					<section className="rooms">
						<div className="add-property" onClick={() => this.setState({ redirect: '/user/add_offer' })}>
							<i className="fas fa-plus"></i>
						</div>
						{this.state.offers.slice(0, this.state.page * 6 - 1).map((property: PropertyProps) => {
							return (
								<Property key={property.p_id} {...property} removeCallback={() => { this.getOffers() }} />
							);
						})}
					</section>
					<div className="margin-wrapper">
					{(this.state.offers.length - (this.state.page * 6 - 1) > 0) 
						? <Link to={window.location.pathname} className="primary-btn" onClick={() => { this.setState({ page: this.state.page + 1 }) }}>Načíst předchozí</Link>
						: ""
					}
					</div>
				</div>
			</main>
		);
	}
}

export default UserOffer;