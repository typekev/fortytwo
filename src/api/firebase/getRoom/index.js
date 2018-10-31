import { Firebase } from 'lib/firebase';
import setCurrentPlayer from 'api/firebase/setCurrentPlayer';

export default function getRoom(playerId = '', then = () => {}) {
  const db = Firebase.firestore();
  db.settings({
    timestampsInSnapshots: true,
  });
  if (playerId) {
    setTimeout(() => {
      const roomRef = db.collection('rooms').where('players', 'array-contains', playerId);
      roomRef
        .get()
        .then(querySnapshot => {
          querySnapshot.forEach(roomDoc => {
            const room = roomDoc.data();
            if (!room.currentPlayer) {
              const currentPlayer = playerId;
              setCurrentPlayer(playerId, roomDoc.id, () =>
                then({ id: roomDoc.id, ...{ currentPlayer, ...room } }),
              );
            } else {
              then({ id: roomDoc.id, ...room });
            }
          });
        })
        .catch(error => {
          console.error('Error getting documents: ', error);
        });
    }, 1000);
  }
}
