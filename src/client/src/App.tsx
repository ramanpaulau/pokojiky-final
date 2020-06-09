import React from 'react';
import Header from './Header';
import Home from './Home'
import Contact from './Contact'
import Search from './Search'
import Details from './Details';
import SignIn from './auth/SignIn';
import SignUp from './auth/SignUp';
import UserPage from './UserPage';
import { Component } from "react";
import { Route, Switch } from "react-router-dom";
import Error from './404'
import { user } from './objects/User';
import { observer } from 'mobx-react';
import RequireNotAuth from './auth/RequireNotAuth';
import RequireAuth from './auth/RequireAuth';
import AddProperty from './AddProperty';
import EditProperty from './EditProperty';
import UserOffers from './UserOffers';
import UserReservations from './UserReservations';
import EditPropertyImages from './EditPropertyImages';

export interface IUser {
	id: number,
	firstName: string,
	lastName: string,
	email: string
}

interface AppState {
	isLoading: boolean
}

@observer
class App extends Component<{}, AppState> {
	constructor(props: Readonly<{}>) {
		super(props);
		this.state = {
			isLoading: true
		}
		user.loadUser();
	}

	componentDidMount() {
		this.setState({ isLoading: false });
	}

	render() {
		if (this.state.isLoading) {
			return (<div className="loading">
				<div className="loading-img"></div>
			</div>)
		}

		return (
			<div className="App">
				<Header store={user} />
				<Switch>
					<Route exact path="/" component={Home} />
					<Route exact path="/search" component={Search} />
					<Route exact path="/contact" component={Contact} />
					<Route exact path="/property/:id" component={Details} />
					<Route exact path="/users/sign_in" component={RequireNotAuth(() => <SignIn store={user} />)} />
					<Route exact path="/users/sign_up" component={RequireNotAuth(SignUp)} />
					<Route exact path="/user/" component={RequireAuth(() => <UserPage store={user} />)} />
					<Route exact path="/user/add_offer" component={RequireAuth(() => <AddProperty store={user} />)} />
					<Route exact path="/user/edit_offer/:id" component={RequireAuth((props: any) => <EditProperty {...props} store={user} />)}/>
					<Route exact path="/user/edit_offer/images/:id" component={RequireAuth((props: any) => <EditPropertyImages {...props} store={user} />)}/>
					<Route exact path="/user/offers" component={RequireAuth(() => <UserOffers store={user} />)} />
					<Route exact path="/user/reservations" component={RequireAuth(() => <UserReservations store={user} />)} />
					<Route path="*" component={Error} />
				</Switch>
			</div>);
	};
}

export default App;
