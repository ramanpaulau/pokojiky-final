import React from 'react';
import axios from 'axios';
import { User } from '../objects/User'; 
import { Redirect } from 'react-router-dom';

interface ISingInState {
    email: string,
    password: string,
    message: string
}

interface ISignInProps {
    store: User
}

class SignIn extends React.Component<ISignInProps, ISingInState> {
    constructor (props: Readonly<ISignInProps>) {
        super(props);
        this.state = {
            email: '',
            password: '',
            message: ''
        }
    }

    handleChange = (event: {target: { name: any; value: any; };}) => {
        const newState = { [event.target.name]: event.target.value } as Pick<ISingInState, keyof ISingInState>;
        this.setState(newState);
    }

    handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        await axios.post("http://localhost:8080/auth/sign_in", {
                email: this.state.email,
                password: this.state.password,
            })
            .then((res) =>  {
                this.setState({message: res.data.message});
                if (res.data.token) {
                    localStorage.setItem('token', res.data.token);
                }
                this.props.store.loadUser();
            });
    }

    render() {
        return (<main>
            <h1>Přihlášení</h1>
            <div className="underline"></div>

            <form onSubmit={this.handleSubmit} className="form-template">
                <div className="form-group surname-group">
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email" 
                        name="email" 
                        placeholder="johndoe@example.com" 
                        className="form-input"
                        onChange={this.handleChange}
                        value={this.state.email}
                        required 
                    />
                </div>

                <div className="form-group surname-group">
                <label htmlFor="password">Heslo</label>
                <input 
                    id="password"
                    type="password" 
                    name="password" 
                    placeholder="********" 
                    className="form-input"
                    onChange={this.handleChange}
                    value={this.state.password}
                    required 
                />
                </div>

                <input type="submit" className="primary-btn" value="Přihlásit"/>
                <div className="signMessage">{(this.state.message)?this.state.message:""}</div>
                {(this.state.message === 'Úspěšné přihlášení.')?<Redirect to="/" />:""}
            </form>
        </main>);
    }
}

export default SignIn;