import { Firebase } from 'lib/firebase';

export default function updateTextEditorContent(roomId = '', textEditorContent = '') {
  const db = Firebase.firestore();
  db.settings({
    timestampsInSnapshots: true,
  });
  const roomRef = db.collection('rooms').doc(roomId);
  roomRef
    .set(
      {
        textEditorContent,
      },
      { merge: true },
    )
    .then(() => {
      console.log('Success!');
    })
    .catch(error => {
      console.log('Error getting documents: ', error);
    });
}
