import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
import { Route, BrowserRouter as Router } from 'react-router-dom';
import LoginComponent from './login/login';
import SignUpComponent from './signup/signup';
import DashboardComponent from './dashboard/dashboard';


const firebase = require("firebase");
require("firebase/firestore");


firebase.initializeApp({
    apiKey: "AIzaSyC7AhBB2SkimOC8tkTN3z30GflZLRgUaiU",
    authDomain: "chatapp-3a68c.firebaseapp.com",
    databaseURL: "https://chatapp-3a68c.firebaseio.com",
    projectId: "chatapp-3a68c",
    storageBucket: "chatapp-3a68c.appspot.com",
    messagingSenderId: "761560036137",
    appId: "1:761560036137:web:5d3aedce1ef2a44d69bd38"
});

const routing = (
    <Router>
        <div id='routing-container'>
            <Route path='/login' component={LoginComponent}></Route>
            <Route path='/signup' component={SignUpComponent}></Route>
            <Route path='/dashboard' component={DashboardComponent}></Route>
        </div>
    </Router>
)




ReactDOM.render(routing, document.getElementById('root'));

serviceWorker.unregister();
