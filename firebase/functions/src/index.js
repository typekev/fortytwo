import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp(functions.config().firebase);

export const playerCreated = functions.firestore
  .document('players/{playerId}')
  .onCreate((snap, context) => {
    const player = snap.data();
    const playerId = context.params.playerId;
    const db = admin.firestore();
    return db.runTransaction(trs => {
      return Rooms.findFreeRoom(db, trs, player.players).then(roomResult => {
        var roomId;
        if (roomResult.size === 1) {
          // a room was found, add the player to it
          const roomSnapshot = roomResult.docs[0];
          const room = roomSnapshot.data();
          const players = [...room.players, playerId];
          const full = players.length === room.size;
          const newRoomData = { full, size: room.size, players };
          trs.set(roomSnapshot.ref, newRoomData);
          roomId = roomSnapshot.id;
        } else {
          // no room was found, create a new room with the player
          const players = [playerId];
          const roomRef = db.collection('rooms').doc();
          console.log(player.players, playerId, players, roomRef.id);
          trs.set(roomRef, { full: false, size: player.players, players });
          roomId = roomRef.id;
        }
        // then add a reference to the room in the player document
        trs.update(db.collection('players').doc(playerId), { roomId });
        return;
      });
    });
  });

class Rooms {
  /**
   * Search a non full room of a specific size
   *
   * @param db The database connection
   * @param trs The transaction in which to execute the request
   * @param size The number of players in the room
   */
  static findFreeRoom(db, trs, size) {
    const room = db
      .collection('rooms')
      .where('full', '==', false)
      .where('size', '==', size)
      .limit(1);

    return trs.get(room);
  }
}

export const challengeCreated = functions.firestore
  .document('challenges/{challengeId}')
  .onCreate((snap, context) => {
    const challengeId = context.params.challengeId;
    const db = admin.firestore();
    const challengesSettingsRef = db.collection('settings').doc('challengesSettings');
    const challengeRef = db.collection('challenges').doc(challengeId);

    return db.runTransaction(trs => {
      return trs.get(challengesSettingsRef).then(challengesSettings => {
        const newChallengesCount = challengesSettings.data().challengesCount + 1;
        trs.update(challengesSettingsRef, { challengesCount: newChallengesCount });
        trs.update(challengeRef, { challengeNumber: newChallengesCount });
        return;
      });
    });
  });
