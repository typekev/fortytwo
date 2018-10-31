import { Firebase } from 'lib/firebase';

export default function setCurrentPlayer(playerId = '', roomId = '', then = playerId => {}) {
  const db = Firebase.firestore();
  db.settings({
    timestampsInSnapshots: true,
  });
  if (playerId && roomId) {
    const roomRef = db.collection('rooms').doc(roomId);
    roomRef
      .update({ currentPlayer: playerId })
      .then(() => {
        then(playerId);
      })
      .catch(error => {
        console.error('Error getting documents: ', error);
      });
  }
}
