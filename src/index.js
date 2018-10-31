import 'core-js';
import React from 'react';
import ReactDOM from 'react-dom';

import 'typeface-roboto';
import 'styles/global.scss';
import 'styles/prism.scss';

import App from 'templates/App';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(<App />, document.getElementById('root'));
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
