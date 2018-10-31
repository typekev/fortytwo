import { Firebase } from 'lib/firebase';

export default function createPlayer(name = 'Casey', players = 2, then) {
  const db = Firebase.firestore();
  db.settings({
    timestampsInSnapshots: true,
  });
  const playerRef = db.collection('players').add({
    name,
    players,
  });
  playerRef.then(snap => {
    then({ playerId: snap.id, playerName: name });
  });
}
