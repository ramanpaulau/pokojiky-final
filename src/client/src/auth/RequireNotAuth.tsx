import React from 'react';
import { Redirect } from 'react-router-dom';

const RequireNotAuth = (Component: any) => {
    interface IAppState {
        redirect: string
    }

    return class App extends React.Component<{}, IAppState> { 

        constructor(props: Readonly<{}>) {
            super(props);
            this.state = {
                redirect: ''
            };

            const token = localStorage.getItem('token'); 

            if(token) {
                this.state = { redirect: "/" };
            }
        }

        render() {
            if (this.state.redirect) {
                return <Redirect to={this.state.redirect} />;
            }
            return <Component {...this.props} />;
        }
    } 

} 

export default RequireNotAuth;