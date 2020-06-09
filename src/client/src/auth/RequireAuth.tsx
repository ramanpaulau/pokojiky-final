import React from 'react';
import { Redirect } from 'react-router-dom';
import axios from 'axios';
import { user } from '../objects/User';

const RequireAuth = (Component: any) => {
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

            if(!token) {
                this.state = {
                    redirect: '/'
                };
                return;
            }

            axios.post("http://localhost:8080/auth/check_token", {
                token: token
            })
            .then((res) => {
                if (!res.data.user || res.data.user.id !== user.id) {
                    this.state = {
                        redirect: '/'
                    };
                }
            });
        }
        
        render() {
            if (this.state.redirect) {
                return <Redirect to={this.state.redirect} />;
            }
            return <Component {...this.props} />;
        }
    } 

} 

export default RequireAuth;