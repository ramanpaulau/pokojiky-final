import React from "react";
import { NavLink } from "react-router-dom";
import { User } from "./objects/User";
import { observer } from "mobx-react";

interface IHeaderState {
  opened: false;
}

interface IHeadetProps {
  store: User;
}

@observer
class Header extends React.Component<IHeadetProps, IHeaderState> {
  private line1: React.RefObject<HTMLDivElement>;
  private line2: React.RefObject<HTMLDivElement>;
  private menu: React.RefObject<HTMLElement>;

  constructor(props: Readonly<IHeadetProps>) {
    super(props);
    this.menu = React.createRef();
    this.line1 = React.createRef();
    this.line2 = React.createRef();
  }

  onBurgerClick = () => {
    const menu = this.menu.current;

    if (!menu) return;

    menu.classList.toggle("opened");
    this.burgerToggleAnim();
  };

  burgerToggleAnim = () => {
    const menu = this.menu.current;
    const line1 = this.line1.current;
    const line2 = this.line2.current;

    if (!menu || !line1 || !line2) return;

    if (menu.classList.contains("opened")) {
      line1.style.transform = "translateY(5px) rotate(45deg)";
      line2.style.transform = "translateY(-5px) rotate(-45deg)";
    } else {
      line1.style.transform = "translateY(0px) rotate(0deg)";
      line2.style.transform = "translateY(0px) rotate(0deg)";
    }
  };

  navigate = () => {
    const menu = this.menu.current;
    if (!menu) return;
    menu.classList.remove("opened");
    this.burgerToggleAnim();
    window.scrollTo(0, 0);
  };

  signOut = () => {
    this.props.store.clear();
  };

  render() {
    return (
      <div>
        <header className="nav-header">
          <a href="/" className="logo">
            Pokojiky
          </a>
          <nav className="menu-nav" ref={this.menu}>
            <ul className="menu-ul">
              <li className="menu-li">
                <NavLink
                  exact
                  to="/"
                  className="menu-a"
                  activeClassName="active-menu-a"
                  onClick={this.navigate}
                >
                  Domů
                </NavLink>
              </li>
              <li className="menu-li">
                <NavLink
                  exact
                  to="/search"
                  className="menu-a"
                  activeClassName="active-menu-a"
                  onClick={this.navigate}
                >
                  Hledat
                </NavLink>
              </li>
              <li className="menu-li">
                <NavLink
                  exact
                  to="/contact"
                  className="menu-a"
                  activeClassName="active-menu-a"
                  onClick={this.navigate}
                >
                  Kontakt
                </NavLink>
              </li>
              <hr className="menu-hr" />
              <li className="menu-li">
                {this.props.store.id !== -1 ? (
                  <NavLink
                    exact
                    to={"/user"}
                    className="menu-a"
                    activeClassName="active-menu-a"
                    onClick={this.navigate}
                  >
                    {this.props.store.fullName}
                  </NavLink>
                ) : (
                    <NavLink
                      exact
                      to="/users/sign_in"
                      className="menu-a"
                      activeClassName="active-menu-a"
                      onClick={this.navigate}
                    >
                      Přihlášení
                    </NavLink>
                  )}
              </li>
              <li className="menu-li">
                {this.props.store.id !== -1 ? (
                  <NavLink
                    exact
                    to="/"
                    className="menu-a never-active"
                    activeClassName="active-menu-a"
                    onClick={() => {
                      this.signOut();
                      this.navigate();
                    }}
                  >
                    <>
                      <i className="fas fa-times"></i>
                    </>
                  </NavLink>
                ) : (
                    <NavLink
                      exact
                      to="/users/sign_up"
                      className="menu-a"
                      activeClassName="active-menu-a"
                      onClick={this.navigate}
                    >
                      Registrace
                    </NavLink>
                  )}
              </li>
            </ul>
          </nav>
          <div className="burger" onClick={this.onBurgerClick}>
            <div className="line" ref={this.line1}></div>
            <div className="line" ref={this.line2}></div>
          </div>
        </header>
      </div>
    );
  }
}

export default Header;
