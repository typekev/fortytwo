import { Firebase } from 'lib/firebase';
import getChallengeCount from 'api/firebase/getSettings/getChallengeCount';

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export default function getChallenge(then = challenge => {}) {
  console.log('getChallenge');
  const db = Firebase.firestore();
  db.settings({
    timestampsInSnapshots: true,
  });
  getChallengeCount(count => {
    const challengeRef = db
      .collection('challenges')
      .where('challengeNumber', '==', getRandomInt(1, count));
    challengeRef
      .get()
      .then(querySnapshot => {
        querySnapshot.forEach(challenge => {
          then({ id: challenge.id, ...challenge.data() });
        });
      })
      .catch(error => {
        console.log('Error getting challenge: ', error);
      });
  });
}
