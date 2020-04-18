import React from 'react';
import { HashRouter as Router } from 'react-router-dom';
import { App } from './App/App.jsx';
import storiesData from '../data/stories-database.json';
import resourcesIndex from '../data/resources-index.json';

ReactDOM.render(
    <Router>
        <App storiesData={storiesData} resourcesIndex={resourcesIndex} />
    </Router>,
    document.getElementById('main')
);