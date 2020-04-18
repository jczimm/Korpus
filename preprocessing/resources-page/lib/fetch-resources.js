require('dotenv').config(); // alternatively, run this file like: $ node -r dotenv/config your_script.js

const { resolve } = require('path');

const Airtable = require('airtable');
const base = new Airtable({apiKey: process.env.AIRTABLE_API_KEY}).base(process.env.AIRTABLE_BASE_ID);

const saveLabServerFile = require('./save-from-smb')({
  address: process.env.LAB_SERVER_ADDRESS,
  username: process.env.LAB_SERVER_USERNAME,
  password: process.env.LAB_SERVER_PASSWORD,
});
const serverFileUrlMarker = `${process.env.LAB_SERVER_ADDRESS}/${process.env.LAB_SERVER_FOLDER}/`;

const md = require('markdown-it')({
  html: false, // for security; if need to enable HTML, use a sanitizer module
  linkify: true,
  typographer: true,
});

module.exports.fetchResourceMetadata = function fetchResourceMetadata() {
  return new Promise((res, rej) => {
    const resourceRecords = [];
    base('Works').select({
      // view: 'Resources Page View',
      filterByFormula: 'AND(NOT({Private?} = "true"), NOT({LV Item} = BLANK()))',
      sort: [{field: 'Year', direction: 'desc'}],
      // maxRecords: 20, // TEMP
    }).eachPage(function page(records, fetchNextPage) {
      records.forEach((record) => {
        // const targetFields = Object.keys(record.fields).filter(f => !f.startsWith('DEPREC'));
        // const recordFiltered = {};
        // for (const targetField of targetFields) {
        //   recordFiltered[targetField] = record.fields[targetField];
        // }
        // console.log(recordFiltered);

        if (!record.fields['Item'].includes(record.fields['LV Item'][0])) {
          console.warn('Mistake made when choosing LV Item; not a member of Item - ', record.fields['Title']);
        }
        console.log(record.fields) // TEMP
        const {
          ['Title']: title,
          ['Credit First Last Names']: [creditString],
          ['Year']: [year] = [undefined], // fixme: apparently resulting in "u" for when year is undefined...?
          ['Description']: descriptionMarkdown,
          ['Category']: categories,
          ['Type']: type,
          ['LV Curated?']: curatedFlag,
          ['LV Item Server']: [itemServerUrl] = [''],
        } = record.fields;
        const credits = (creditString || '').split(',').map(s => s.trim());
        const descriptionHTML = descriptionMarkdown ? md.render(descriptionMarkdown) : '';
        const isCurated = curatedFlag === true;
        const extractedRecord = { title, credits, year, descriptionHTML, categories, type, isCurated, itemServerUrl };

        // if (extractedRecord.itemServerUrl.toLowerCase().endsWith('.pdf')) {
        //   // console.warn('Only testing downloading folders right now; ignoring this work\'s item');
        //   // extractedRecord.itemServerUrl = '';
        // } else {
        //   // console.warn('Downloading folders not yet implemented; ignoring this work\'s item');
        //   // extractedRecord.itemServerUrl = '';
        // }

        resourceRecords.push(extractedRecord);
      });

      // To fetch the next page of records, call `fetchNextPage`.
      // If there are more records, `page` will get called again.
      // If there are no more records, `done` will get called.
      fetchNextPage();
    }, function done(err) {
      if (err) rej(err);
      else res(resourceRecords);
    });
  });
}

module.exports.fetchResourceFiles = function fetchResourceFiles(resourceRecords) {
  let recordsLeft = resourceRecords.length;
  return Promise.all(resourceRecords.map((record) => {
    const { itemServerUrl, ...restRecord } = record;
    if (itemServerUrl) {
      return download(itemServerUrl)
        .then(({ destPath }) => ({ savedPath: destPath, ...restRecord }))
        .catch((err) => {
          console.warn(`Error downloading resource file: ${itemServerUrl}`, /* record, */ err);
          return Promise.resolve({ savedPath: '', ...restRecord })
        })
        .finally(() => {
          console.info('Records left to download:', --recordsLeft);
        });
    } else {
      console.info('Records left to download:', --recordsLeft);
      return Promise.resolve({ savedPath: '', ...restRecord });
    }
  }));
}

function download(serverFileUrl) {
  const serverFileUrlParts = decodeURI(serverFileUrl).split(serverFileUrlMarker);
  if (serverFileUrlParts.length !== 2) {
    return new Error('Invalid server file url; only lab server urls are currently supported.');
  }
  const serverFilePath = serverFileUrlParts[1];

  const srcPath = `${process.env.LAB_SERVER_FOLDER}/${serverFilePath}`; // `${process.env.LAB_SERVER_FOLDER}\\${serverFilePath}`;
  const destPath = resolve(__dirname, `../../../saved-resources/${serverFilePath.replace(/\\/g, '/')}`);
  return saveLabServerFile(srcPath, destPath);
}

// Old scraps:

// function fetchResourceFiles(resourceRecords) {
//   return new Promise((res, rej) => {
//     const resourceRecordsItems = resourceRecords.map(r => r.Item).flat();
//     const filterString = `AND(RIGHT({Server}, 4) = '.pdf', OR(${
//       resourceRecordsItems
//         .map(itemRecId => `RECORD_ID()='${itemRecId}'`)
//         .join(',')
//       }))`;
//       console.log(filterString);
//     base('Items').select({
//       filterByFormula: filterString,
//     }).eachPage(function page(records, fetchNextPage) {
//       for (const itemRecord of records) {
//         const workIds = itemRecord.fields['Works'];
//         if (workIds.length === 1) { // each of Items must be linked to only one of Works
//           const workId = workIds[0];
//           const resourceRecord = resourceRecords.get(workId);
//           resourceRecords.set(workId, { ...resourceRecord, file: { metadata: itemRecord.fields }}); // TODO: use a whitelist to choose specific fields from the Items record
//         }
//       }
//     }, function done(err) {
//       if (err) rej(err);
//       else res(resourceRecords);
//     })
//   });
// }