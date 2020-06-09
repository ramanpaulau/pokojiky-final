import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { BrowserRouter } from 'react-router-dom';

const footer = (
  <footer>
  <div className="sleep">
    <i className="fas fa-bed"></i>
  </div>
  <div className="footer-info">
    &copy; Raman Paulau, Pavel Bušina, Jonáš Novotný, Patrick Ondika
  </div>
</footer>
);

ReactDOM.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  document.getElementById('body')
);
ReactDOM.render(footer, document.getElementById('footer'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
