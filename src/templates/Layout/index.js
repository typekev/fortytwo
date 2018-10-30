import React, { Component } from 'react';
import { Button } from '@material-ui/core';
import { withRouter } from 'react-router';

import withRoot from 'withRoot';

import reactLogo from 'images/react-logo.svg';
import './Layout.scss';

class Layout extends Component {
  render() {
    const {
      children,
      history: { push },
    } = this.props;
    return (
      <div className="App">
        <div className="app-bar">
          <Button onClick={() => push('#quitGame')}>{'<'} Quit Game</Button>
        </div>
        <header className="app-header">
          <img src={reactLogo} className="react-logo" alt="React logo" />
        </header>
        {children}
      </div>
    );
  }
}

export default withRouter(withRoot(Layout));
