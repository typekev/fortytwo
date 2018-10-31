import React, { PureComponent, Fragment } from 'react';
import Button from '@material-ui/core/Button';
import Prism from 'prismjs';

import Counter from 'components/Counter';
import TextArea from 'components/TextArea';
import Terminal from 'modules/Terminal';

import getRoom from 'api/firebase/getRoom';
import getChallenge from 'api/firebase/getChallenge';
import updateTextEditorContent from 'api/firebase/updateTextEditorContent';
import observeRoom from 'api/firebase/observeRoom';
import setCurrentPlayer from 'api/firebase/setCurrentPlayer';
import setWinner from 'api/firebase/setWinner';

import './TextEditor.scss';

const initialState = {
  textEditorContent: `
// RULES:
//
// Read the OBJECTIVE and write function to solve the given problem.
// Each time you press a key (or each second after 30 seconds) your remaining alterations will 
// be reduced by one.
// Once you exhaust your alterations you will no longer be able to type.
// You will see your remaining alterations in the top right corner of the screen, you start with 42.
//
// When you finish writing your solution (or run out of alterations) you can end your turn
// by running the following sequence of commands in the TERMINAL
// git add .
// git commit -m '[message]'
// git push
//
// After you push, you will see the results of your code under OUTPUT
//
// If your solution is correct you win!

var solveChallenge = function(x) {
    // Type your solution here!
}
`,
  room: {
    id: 0,
    full: false,
    players: [],
    currentPlayer: '',
    winner: '',
  },
  remainingDelay: 30,
  remainingAlterations: 42,
  isAnswerValid: false,
  challengeNumber: 0,
  objective: '',
  testCases: [],
  timer: () => {},
};

class TextEditor extends PureComponent {
  state = initialState;

  componentDidMount() {
    const { playerId } = this.props;
    if (!playerId) {
      this.exitRoom();
    }
    getRoom(playerId, this.enterRoom);
    getChallenge(this.handleSetChallenge);
    Prism.highlightAll();
  }

  componentDidUpdate(prevProps, prevState = initialState) {
    const {
      playerId,
      location: { hash },
    } = this.props;
    const {
      room: { id, full, players, currentPlayer, winner },
    } = this.state;
    Prism.highlightAll();
    if (hash === '#quitGame') {
      const newWinner = players.filter(otherPlayerId => otherPlayerId !== playerId);
      setWinner(newWinner[0], id);
      this.exitRoom();
    }
    if (!playerId) {
      this.exitRoom();
    }
    if (full && !winner && playerId === currentPlayer) {
      if (prevState.room.currentPlayer !== currentPlayer) {
        const timer = setInterval(this.handleTrackTime, 1000);
        this.setState({ timer });
      }
    } else {
      this.clearTimer();
    }
  }

  componentWillUnmount() {
    // const { playerId } = this.props;
    // const {
    //   room: { id, players, winner },
    // } = this.state;
    // if (!winner) {
    //   const newWinner = players.filter(otherPlayerId => otherPlayerId !== playerId);
    //   setWinner(newWinner[0], id);
    // }
  }

  clearState = () => {
    this.setState(initialState);
  };

  clearTimer = () => {
    const { timer } = this.state;
    clearInterval(timer);
    this.setState({
      timer: initialState.timer,
      remainingDelay: initialState.remainingDelay,
      remainingAlterations: initialState.remainingAlterations,
    });
  };

  exitRoom = () => {
    const { clearAppGlobalState, history } = this.props;
    clearAppGlobalState();
    history.push('/');
  };

  enterRoom = room => {
    const { textEditorContent } = this.state;
    this.setState(
      {
        room,
      },
      () =>
        observeRoom(
          this.state.room.id,
          textEditorContent,
          ({
            textEditorContent: textEditorContentFromDb = textEditorContent,
            full = initialState.room.full,
            players = initialState.room.players,
            currentPlayer = initialState.room.currentPlayer,
            winner = initialState.room.winner,
          }) => {
            this.setState(state => ({
              room: { ...state.room, full, players, currentPlayer, winner },
            }));
            this.handleUpdateTextEditorContent(textEditorContentFromDb, true);
          },
        ),
    );
  };

  handleTrackTime = () => {
    const { remainingDelay, remainingAlterations } = this.state;
    if (remainingDelay > 0) {
      this.setState({ remainingDelay: remainingDelay - 1 });
    } else if (remainingAlterations > 0) {
      this.setState({ remainingAlterations: remainingAlterations - 1 });
    }
  };

  handleSetChallenge = challenge => {
    this.setState({ ...challenge });
  };

  handleUpdateTextEditorContent = (textEditorContent, updateFromDb = false) => {
    const {
      room: { id },
      remainingAlterations,
    } = this.state;
    if (remainingAlterations > 0) {
      this.setState(
        state => ({
          textEditorContent,
          remainingAlterations: state.remainingAlterations - (updateFromDb ? 0 : 1),
        }),
        () => !updateFromDb && updateTextEditorContent(id, textEditorContent),
      );
    }
  };

  handleKeyDown = event => {
    if (event.keyCode === 9) {
      event.preventDefault();

      const { textEditorContent } = this.state;

      const content = textEditorContent;
      const start = event.target.selectionStart;
      const end = event.target.selectionEnd;

      const textEditorContentWithTab = content.substring(0, start) + '\t' + content.substring(end);
      this.handleUpdateTextEditorContent(textEditorContentWithTab);
    }
  };

  handlePlayerVictory = () => {
    const { playerId } = this.props;
    const {
      room: { id },
    } = this.state;
    setWinner(playerId, id);
  };

  handleTurnRotation = () => {
    const { playerId } = this.props;
    const {
      room: { id, players },
    } = this.state;
    const playerIndex = players.indexOf(playerId);
    const nextPlayerId = players[playerIndex + 1] || players[0];
    this.setState({
      remainingAlterations: initialState.remainingAlterations,
      remainingDelay: initialState.remainingDelay,
    });
    setCurrentPlayer(nextPlayerId, id);
  };

  handleRunCode = () => {
    const { textEditorContent, testCases } = this.state;
    const iFrameTestEnv = document.getElementById('iFrameTestEnv').contentWindow;
    const iFrameTestEnvHead = iFrameTestEnv.document.getElementsByTagName('head')[0];
    const iFrameTestEnvScriptTag = iFrameTestEnv.document.createElement('script');
    iFrameTestEnvScriptTag.innerText = `${textEditorContent}`;
    iFrameTestEnvScriptTag.type = 'text/javascript';
    iFrameTestEnvHead.appendChild(iFrameTestEnvScriptTag);

    const testCaseResultsList = testCases.map(testCase => {
      const { solveChallenge } = iFrameTestEnv;
      const testFunc = () => {
        try {
          return eval('JSON.stringify(solveChallenge(...testCase.parameterList))');
        } catch (error) {
          return error;
        }
      };
      return testFunc();
    });
    const testCaseSolutionsList = testCases.map(testCase =>
      JSON.stringify(testCase.acceptanceCriteria),
    );

    const isAnswerValid = testCaseResultsList.toString() === testCaseSolutionsList.toString();

    this.setState({ isAnswerValid }, () => {
      if (isAnswerValid) {
        this.handlePlayerVictory();
      }
      this.clearTimer();
      this.handleTurnRotation();
    });

    return testCaseResultsList.join(', ');
  };

  render() {
    const { playerName, playerId, handleEnterGame } = this.props;
    const {
      textEditorContent,
      room: { id, full, players, currentPlayer, winner },
      remainingAlterations,
      challengeNumber,
      objective,
      isAnswerValid,
    } = this.state;
    const awaitingGame = !id || !full || !challengeNumber;
    const awaitingTurn = currentPlayer !== playerId;
    const gameOver = winner;
    const rows = textEditorContent.split(/\r|\r\n|\n/).length;

    return (
      <Fragment>
        <iframe title="iframe test env" className="iframe-test-env" id="iFrameTestEnv" />
        <pre className="text-editor">
          {!awaitingGame ? (
            <Fragment>
              <div className="textarea-wrapper">
                <TextArea
                  rows={rows + 80}
                  value={textEditorContent}
                  onKeyDown={this.handleKeyDown}
                  onChange={event => this.handleUpdateTextEditorContent(event.target.value)}
                  disabled={awaitingGame || awaitingTurn || gameOver}
                />
              </div>
              <code className="language-javascript">{textEditorContent}</code>
              {awaitingTurn && <h1 className="game-warning-display">It's not your turn yet...</h1>}
              {winner && (
                <h1 className="game-warning-display">
                  {winner === playerId ? 'You win!' : 'You lose :('}

                  <br />
                  <Button
                    onClick={() => (
                      handleEnterGame(playerName, players.length, true), this.clearState()
                    )}
                    color="inherit"
                  >
                    Play Again
                  </Button>
                  <Button onClick={this.exitRoom} color="inherit">
                    Go back
                  </Button>
                </h1>
              )}
              <Counter remainingAlterations={remainingAlterations} />
            </Fragment>
          ) : (
            <h1 className="game-warning-display">Waiting for players...</h1>
          )}
        </pre>
        <Terminal
          playerName={playerName}
          onRunCode={awaitingGame || awaitingTurn || gameOver ? () => {} : this.handleRunCode}
          objectiveContent={objective}
          isAnswerValid={isAnswerValid}
          disabled={awaitingGame || awaitingTurn || gameOver}
        />
      </Fragment>
    );
  }
}

export default TextEditor;
