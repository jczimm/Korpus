import React from 'react';
// import id from 'shortid';
// import { Link } from 'react-router-dom';
// import ReactDOMServer from 'react-dom/server';

export class ResourcesViewMaterials extends React.Component {
    componentDidMount() {
        // this.props.resources
    }

    render() {
        return (
            <div>{JSON.stringify(this.props.resources)}</div>
        );
    }
}