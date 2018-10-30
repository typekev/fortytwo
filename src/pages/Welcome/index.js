import React, { PureComponent } from 'react';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import { playersOptionsList } from 'constants/options';

import './Welcome.scss';

class Welcome extends PureComponent {
  state = {
    isOpen: true,
    name: 'Casey',
    players: 2,
  };

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value,
    });
  };

  toggleDrawer = (isOpen = this.state.isOpen) => () => {
    this.setState({
      isOpen,
    });
  };

  render() {
    const { handleEnterGame, didPlayAgain } = this.props;
    const { isOpen, name, players } = this.state;

    const validPlayer = players > 1 && name.trim();

    return (
      <SwipeableDrawer
        open={isOpen && !didPlayAgain}
        onClose={validPlayer ? () => handleEnterGame(name, players) : this.toggleDrawer(true)}
        onOpen={this.toggleDrawer(true)}
        ModalProps={{ disableBackdropClick: true }}
        className="welcome-drawer"
      >
        <Typography variant="h2" color="primary" align="center">
          FORTY TWO
        </Typography>
        <TextField
          id="name"
          label="Nickname"
          value={name}
          onChange={this.handleChange('name')}
          InputLabelProps={{
            shrink: true,
          }}
          margin="normal"
        />
        <TextField
          id="players"
          select
          label="Number of Players"
          value={players}
          onChange={this.handleChange('players')}
          SelectProps={{
            native: true,
          }}
          helperText="This is the number of players you want to play with"
          margin="normal"
        >
          {playersOptionsList.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </TextField>
        <br />
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleEnterGame(name, players)}
          disabled={!validPlayer}
          fullWidth
        >
          Start
        </Button>
      </SwipeableDrawer>
    );
  }
}

export default Welcome;
