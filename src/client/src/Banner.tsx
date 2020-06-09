import React from "react";
import { Link, Switch, Route } from "react-router-dom";

class Banner extends React.Component {
  render() {
    return (
      <div className="banner">
        <div className="banner-container">
          <img src="/img/banner.jpg" alt="key" />
          <div className="banner-info">
            <Switch>
              <Route exact path="/">
                <p className="banner-text">Potřebuješ se ubytovat?</p>
                <div className="underline"></div>
                <h2 className="banner-header">Hledej u nás!</h2>
                <Link to="/search" className="primary-btn">
                  Hledat
                </Link>
              </Route>
              <Route exact path="/contact">
                <p className="banner-text">Otázka? Problém? Stížnost?</p>
                <div className="underline"></div>
                <h2 className="banner-header">Kontaktujte nás</h2>
              </Route>
              <Route exact path="/search">
                <h2 className="banner-header">Najdi pokoj</h2>
                <div className="underline"></div>
              </Route>
              <Route exact path="/search">
                <h2 className="banner-header">Najdi pokoj</h2>
                <div className="underline"></div>
              </Route>
              <Route path="*">
                <p className="banner-text">Stránka nenalezena!</p>
                <div className="underline"></div>
                <h2 className="banner-header">404</h2>
                <Link to="/" className="primary-btn">
                  Domů
                </Link>
              </Route>
            </Switch>
          </div>
        </div>
      </div>
    );
  }
}

export default Banner;
