import * as React from 'react';
import './App.css';
import { Game } from './game';

export const gameConfig = {
  parent: '#gameContainer',
  width: 1920,
  height: 1080,
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
