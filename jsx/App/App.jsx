import React from 'react';
// import id from 'shortid';
import { Route } from 'react-router-dom';
import { StoryIndex } from './StoryIndex.jsx';
import { Stories } from './Stories/Stories.jsx';
import { AboutLanding } from './AboutLanding.jsx';
// import { ResourcesLanding } from './ResourcesLanding.jsx';
// import { ResourcesViewMaterials } from './ResourcesViewMaterials.jsx';

export function App({ storiesData, resourcesIndex }) {
    return (
        <div>
            <Route exact path="/index" render={props => <StoryIndex index={storiesData.index} />} />
            <Route path="/story" render={props => <Stories stories={storiesData.stories} />} />
            <Route path="/about" render={props => <AboutLanding />} />
            {/* <Route path="/resources" render={props => <ResourcesLanding curatedResources={resourcesIndex.filter(r => r.isCurated)} />} />
            <Route path="/resources-view" render={props => <ResourcesViewMaterials resources={resourcesIndex} />} /> */}
        </div>
    );
}