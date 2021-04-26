const assert = require('assert');
const firebase = require('@firebase/rules-unit-testing');

const MY_PROJECT_ID = 'crime-spot-305622';
const PROJECT = { projectId: MY_PROJECT_ID };

describe('CrimeSpot app', () => {
  it('understand basic math', async () => {
    assert.equal(2 + 2, 4);
  });

  it('allow reads', async () => {
    const db = firebase.initializeTestApp(PROJECT).firestore();
    const testDoc = db.collection('readonly').doc('testDoc');
    await firebase.assertSucceeds(testDoc.get());
  });
});
