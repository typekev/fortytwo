import { Firebase } from 'lib/firebase';

export default function setWinner(playerId = '', roomId = '', then = winner => {}) {
  const db = Firebase.firestore();
  db.settings({
    timestampsInSnapshots: true,
  });
  const roomRef = db.collection('rooms').doc(roomId);
  roomRef
    .update({ winner: playerId })
    .then(() => {
      then(playerId);
    })
    .catch(error => {
      console.log('Error getting documents: ', error);
    });
}
