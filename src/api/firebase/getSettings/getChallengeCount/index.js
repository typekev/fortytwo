import { Firebase } from 'lib/firebase';

export default function getChallengeCount(then = count => {}) {
  const db = Firebase.firestore();
  db.settings({
    timestampsInSnapshots: true,
  });
  const challengesSettingsRef = db.collection('settings').doc('challengesSettings');
  challengesSettingsRef
    .get()
    .then(challengesSettings => {
      then(challengesSettings.data().challengesCount);
    })
    .catch(error => {
      console.error('Error getting challengesCount: ', error);
    });
}
