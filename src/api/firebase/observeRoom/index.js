import { Firebase } from 'lib/firebase';

export default function observeRoom(roomId = '', currentContent, then = room => {}) {
  const db = Firebase.firestore();
  db.settings({
    timestampsInSnapshots: true,
  });
  if (roomId) {
    const room = db.collection('rooms').doc(roomId);
    room.onSnapshot(
      roomSnapshot => {
        const { textEditorContent, ...rest } = roomSnapshot.data();
        then(currentContent !== textEditorContent ? { textEditorContent, ...rest } : { ...rest });
      },
      err => {
        console.error(`Encountered error: ${err}`);
      },
    );
  }
}
