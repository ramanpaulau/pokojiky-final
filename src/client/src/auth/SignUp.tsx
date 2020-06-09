import React from 'react';
import axios from 'axios';

interface ISignUpState {
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    message: string
}

class SignUp extends React.Component<{}, ISignUpState> {
    constructor(props: {}) {
        super(props);

        this.state = {
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            message: ""
        };
    }

    handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        axios.post("http://localhost:8080/auth/sign_up", {
                email: this.state.email,
                firstName: this.state.firstName,
                lastName: this.state.lastName,
                password: this.state.password
            })
            .then(res => this.setState({message: res.data}));
    }

    handleChange = (event: {target: { name: any; value: any; };}) => {
        const newState = { [event.target.name]: event.target.value } as Pick<ISignUpState, keyof ISignUpState>;
        this.setState(newState);
    }

    render() {
        return (<main>
            <h1>Registrace</h1>
            <div className="underline"></div>
            <section>
            <form onSubmit={this.handleSubmit} className="form-template">
                <div className="form-group surname-group">
                    <label htmlFor="firstName">Jméno</label>
                    <input 
                        id="firstName"
                        type="text" 
                        name="firstName" 
                        placeholder="John" 
                        className="form-input"
                        onChange={this.handleChange} 
                        required 
                    />
                </div>

                <div className="form-group surname-group">
                    <label htmlFor="lastName">Příjmení</label>
                    <input 
                        id="lastName"
                        type="text" 
                        name="lastName" 
                        placeholder="Doe" 
                        className="form-input"
                        onChange={this.handleChange} 
                        required 
                    />
                </div>
                <div className="form-group surname-group">
                    <label htmlFor="email">Email</label>
                    <input 
                        id="email"
                        type="email" 
                        name="email" 
                        placeholder="johndoe@example.com"
                        className="form-input"
                        onChange={this.handleChange} 
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
                        minLength={5}
                        onChange={this.handleChange} 
                        required 
                    />
                </div>

                <input type="submit" className="primary-btn" value="Registrace"/>
                <div className="signMessage">{(this.state.message)?this.state.message:""}</div>
            </form>
        </section>
        </main>);
    }
}

export default SignUp;