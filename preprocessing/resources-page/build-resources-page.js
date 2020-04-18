const { fetchResourceMetadata, fetchResourceFiles } = require('./lib/fetch-resources');
const { promises: { writeFile } } = require('fs');
const { resolve } = require('path');
const newDatabaseDest = resolve(__dirname, '../../data/resources-index.json');

fetchResourceMetadata()
  .then(resourcesMetadata => fetchResourceFiles(resourcesMetadata))
  .then(resourceRecords => writeFile(newDatabaseDest, JSON.stringify(resourceRecords), 'utf8').then(() => resourceRecords))
  .then(resourceRecords => console.log('Done.', resourceRecords.length, 'resources loaded,', resourceRecords.filter(r => r.savedPath).length, 'with a file/folder.'))
  .catch(console.error.bind(console));

// Steps of the build process (will document more formally):
// 1. fetch resource metadata
// 2. fetch resource files
// 3. save the output to a resources-index.json, which will be read locally (in the browser) and its contents passed
//       via a property value ("data"?) to a React component called "Resources" (like is done right now for the "Texts"
//       page, using database.json)

// TODO: implement the Resources component per my design
// TODO: configure this build script to run in the build cycle for the rest of LingView