import React, { PureComponent } from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';

import Layout from 'templates/Layout';

import Welcome from 'pages/Welcome';
import TextEditor from 'pages/TextEditor';

import createPlayer from 'api/firebase/createPlayer';

const initialState = { playerId: 0, playerName: 'Casey', didPlayAgain: false };

class App extends PureComponent {
  state = initialState;

  clearState = () => {
    this.setState(initialState);
  };

  setPlayer = player => {
    this.setState({ ...player });
  };

  handleEnterGame = (name, players, didPlayAgain) => {
    this.setState({ ...initialState, didPlayAgain });
    createPlayer(name.replace(/\s/g, ''), players, this.setPlayer);
  };

  render() {
    const { playerId, didPlayAgain } = this.state;
    return (
      <Router>
        <Layout>
          <Switch>
            <Route
              exact
              path="/code"
              render={props => (
                <TextEditor
                  {...props}
                  {...this.state}
                  handleEnterGame={this.handleEnterGame}
                  clearAppGlobalState={this.clearState}
                />
              )}
            />
            {playerId && window.location.pathname !== '/code' && <Redirect to="/code" />}
            <Route
              exact
              path="/"
              render={props => (
                <Welcome
                  {...props}
                  {...this.state}
                  handleEnterGame={this.handleEnterGame}
                  didPlayAgain={didPlayAgain}
                />
              )}
            />
            <Redirect from="*" to="/" />
          </Switch>
        </Layout>
      </Router>
    );
  }
}

export default App;
