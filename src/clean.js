function clean(db, crimeType) {
  let query = db.collection('crimes').where('primary_type', '==', crimeType);
  query.get().then((snapshot) => {
    snapshot.forEach((doc) => {
      doc.ref.delete();
    });
  });
}

module.exports = clean;
