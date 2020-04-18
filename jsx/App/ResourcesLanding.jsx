import React from 'react';
// import id from 'shortid';
// import { Link } from 'react-router-dom';
// import ReactDOMServer from 'react-dom/server';

export class ResourcesLanding extends React.Component {
    componentDidMount() {
        // this.props.curatedResources
    }

    render() {
        return (
            <main className="content-wrapper">
               <header>
                   <h1>Resources</h1>
                </header>
               <article>
                   <pre>{JSON.stringify(this.props.curatedResources, null, '  ')}</pre>
                </article>
           </main>
        );
    }
}