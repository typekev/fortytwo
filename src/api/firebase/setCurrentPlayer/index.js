import { Firebase } from 'lib/firebase';

export default function setCurrentPlayer(playerId = '', roomId = '', then = playerId => {}) {
  const db = Firebase.firestore();
  db.settings({
    timestampsInSnapshots: true,
  });
  const roomRef = db.collection('rooms').doc(roomId);
  roomRef
    .update({ currentPlayer: playerId })
    .then(() => {
      console.log('success updating room with current player');
      then(playerId);
    })
    .catch(error => {
      console.log('Error getting documents: ', error);
    });
}
