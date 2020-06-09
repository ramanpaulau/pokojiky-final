import React, { FormEvent } from "react";
import Banner from "./Banner";

interface IContactState {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  submitted: boolean;
}

class Contact extends React.Component<{}, IContactState> {
  constructor(props: Readonly<{}>) {
    super(props);
    this.state = {
      firstName: '',
      lastName: '',
      email: '',
      message: '',
      submitted: false,
    }
  }

  handleChange = (event: {target: { name: any; value: any; };}) => {
    const newState = { [event.target.name]: event.target.value } as Pick<IContactState, keyof IContactState>;
    this.setState(newState);
  }

  handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    this.setState({ submitted: true });
    setTimeout(() => {
      this.setState({ 
        firstName: '',
        lastName: '',
        email: '',
        message: '',
        submitted: false,
      });
      window.location.reload();
    }, 2000);
  }

  render () {
    return (
      <main data-barba="container">
        <div className="swipe swipe1"></div>
        <div className="swipe swipe2"></div>
        <div className="swipe swipe3"></div>

        <Banner />

        <h1>Kontaktní formulář</h1>
        <div className="underline"></div>

        <section className="form-container">
          <form className="contact-form" onSubmit={this.handleSubmit}>
            <div className="form-group name-group">
              <label htmlFor="firstName">Jméno</label>
              <input
                type="text"
                name="firstName"
                id="firstName"
                onChange={this.handleChange}
                value={this.state.firstName}
                placeholder="John"
                className="form-input"
                required
              />
            </div>
            <div className="form-group surname-group">
              <label htmlFor="lastName">Příjmení</label>
              <input
                type="text"
                name="lastName"
                id="lastName"
                onChange={this.handleChange}
                value={this.state.lastName}
                placeholder="Doe"
                className="form-input"
                required
              />
            </div>
            <div className="form-group mail-group">
              <label htmlFor="email">E-mail</label>
              <input
                type="email"
                name="email"
                id="email"
                onChange={this.handleChange}
                value={this.state.email}
                placeholder="johndoe@example.com"
                className="form-input"
                required
              />
            </div>
            <div className="form-group message-group">
              <label htmlFor="message">Zpráva</label>
              <textarea
                data-type="text"
                name="message"
                id="message"
                onChange={this.handleChange}
                value={this.state.message}
                placeholder="Dobrý den, ..."
                className="form-input"
                required
                rows={10}
              ></textarea>
              {(!this.state.submitted)
              ? <input type="submit" className="primary-btn" value="Odeslat"/>
              : <input type="submit" className="primary-btn disabled-btn" value="Odeslano"/>}
            </div>
          </form>
        </section>
      </main>
    );
  }
};

export default Contact;
