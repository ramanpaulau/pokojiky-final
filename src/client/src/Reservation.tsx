import React from "react";
import { Link, Switch, Route } from "react-router-dom";
import axios from "axios";

const secondsInDay = (1000 * 3600 * 24);

enum State {
  ACTIVE, ENDED, CANCELED, HIDDEN
}

export interface IReservationProps {
  property_id: string;
  property_name: string;
  property_ownerID: number;
  property_price: number;
  reservation_id: number;
  reservation_dtStart: Date;
  reservation_dtEnd: Date;
  reservation_customerID: number;
  reservation_created: Date;
  reservation_totalPrice: number;
  reservation_canceled: boolean;
  reservation_score: number;
  type: string; // "customer"/"owner"
  removeCallback: Function;
}

interface IReservationState {
  firstName: string;
  lastName: string;
  email: string;
  nightsCount: number;
  state: State;
  score: number;
}

class Reservation extends React.Component<IReservationProps, IReservationState> {
  constructor(props: Readonly<IReservationProps>) {
    super(props);

    this.state = {
      firstName: '',
      lastName: '',
      email: '',
      nightsCount: 0,
      state: State.ACTIVE,
      score: -1
    }
  }

  componentDidMount() {
    this.getUserInfo();

    const days = Math.round((new Date(this.props.reservation_dtStart).getTime() - new Date().getTime()) / secondsInDay);
    let state = State.HIDDEN;
    if (days >= 3) {
      state = State.ACTIVE;
    } else if (days <= 0) {
      state = State.ENDED;
    }
    if (this.props.reservation_canceled) {
      state = State.CANCELED;
    }
    
    this.setState({ state: state, score: this.props.reservation_score });
  }

  handleRemove = (event: React.MouseEvent) => {
    event.preventDefault();
    axios.delete("http://localhost:8080/reservations/" + this.props.reservation_id)
      .then(() => {
        this.props.removeCallback()
        this.setState({ state: State.CANCELED });
      });
  }

  getUserInfo = () => {
    let id;
    if (this.props.type === "owner") {
      id = this.props.property_ownerID;
    } else {
      id = this.props.reservation_customerID;
    }

    axios.get('http://localhost:8080/users/' + id).then((res) => {
      this.setState(res.data);
    });
  }

  changeScore = (amount: number) => {
    axios.put('http://localhost:8080/reservation/setScore', {
      score: amount,
      id: this.props.reservation_id
    })
      .then(() => {
        this.setState({ score: amount });
      });
  }

  render() {
    return (
      <div className="reservation">
        <div>
          <Link to={"/property/" + this.props.property_id} className="links" >
            {this.props.property_name}</Link>
        </div>
        <div>
          {new Date(this.props.reservation_dtStart).toDateString()} -{" "}
          {new Date(this.props.reservation_dtEnd).toDateString()}</div>
        <div>{this.props.reservation_totalPrice},- Kč</div>
        <div>{this.state.email}</div>
        <div>
          {
            (this.state.state === State.ACTIVE)
              ?
              <Link to="" onClick={this.handleRemove} className="links" >
                Zrušit
              </Link>
              :
              (this.state.state === State.CANCELED)
                ?
                <Link to="" onClick={(e) => e.preventDefault()} className="links" >
                  Zrušena
                </Link>
                :
                (this.state.state === State.ENDED)
                  ?
                  <Switch>
                    <Route exact path="/property/*">
                    </Route>
                    <Route path="*">
                      <div>
                        <label>
                          Hodnocení: {this.state.score < 0 ? "-" : this.state.score}
                        </label>
                        <input
                          type="range"
                          name="score"
                          id="price"
                          min="0"
                          max="5"
                          step="1"
                          value={this.state.score}
                          onChange={(e: React.FormEvent<HTMLInputElement>) => {
                            this.changeScore(Number(e.currentTarget.value));
                          }}
                        />
                      </div>
                    </Route>
                  </Switch>
                  :
                  ""
          }
        </div>
      </div>
    )
  }
}

export default Reservation;
