import * as React from 'react';
import './App.css';
import { Game } from './game';

export const gameConfig = {
  width: 1920,
  height: 1080,
};

class App extends React.Component {
  public render() {
    return (<Game config={gameConfig} />);
  }
}

export default App;
