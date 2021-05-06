const assert = require('assert');
const firebase = require('@firebase/rules-unit-testing');

const MY_PROJECT_ID = 'crime-spot-305622';
const PROJECT = { projectId: MY_PROJECT_ID };

function getFireStore() {
  return firebase.initializeTestApp(PROJECT).firestore();
}

describe('CrimeSpot app', () => {
  it('allow reads', async () => {
    const db = getFireStore();
    const testDoc = db.collection('readonly').doc('testDoc');
    await firebase.assertSucceeds(testDoc.get());
  });

  it('prevent writes from anyone except admin', async () => {
    const db = getFireStore();
    const testDoc = db.collection('readonly').doc('testdoc');
    await firebase.assertFails(testDoc.set({ test: 'test' }));
  });

  it('allow writes from admin', async () => {
    const db = firebase.initializeAdminApp(PROJECT).firestore();
    const testDoc = db.collection('readonly').doc('testdoc');
    await firebase.assertSucceeds(testDoc.set({ test: 'test' }));
  });
});
