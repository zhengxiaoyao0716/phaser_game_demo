import * as React from 'react';
import './App.css';
import { Game } from './game';

const gameConfig = {
  parent: '#gameContainer',
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      'gravity.y': 0,
    },
  },
};

class App extends React.Component {
  public render() {
    return (<Game config={gameConfig} />);
  }
}

export default App;
