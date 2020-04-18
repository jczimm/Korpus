import React from 'react';
import { HashRouter as Router } from 'react-router-dom';
import { App } from './App/App.jsx';
import data from '../data/database.json';

ReactDOM.render(
    <Router>
        <App data={data} />
    </Router>,
    document.getElementById('main')
);