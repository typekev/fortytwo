import { Firebase } from 'lib/firebase';

export default function observeRoom(roomId = '', currentContent, then = room => {}) {
  console.log(roomId);
  const db = Firebase.firestore();
  db.settings({
    timestampsInSnapshots: true,
  });

  const room = db.collection('rooms').doc(roomId);
  room.onSnapshot(
    roomSnapshot => {
      const { textEditorContent, ...rest } = roomSnapshot.data();
      console.log(`Received new content not matching current content`, textEditorContent);
      then(currentContent !== textEditorContent ? { textEditorContent, ...rest } : { ...rest });
    },
    err => {
      console.log(`Encountered error: ${err}`);
    },
  );
}
