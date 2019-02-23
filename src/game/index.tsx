import * as React from 'react';
import * as Phaser from 'phaser';
import * as scene0 from './scene0';
import * as scene1 from './scene1';
import './index.css';

interface GameProps {
    config: GameConfig;
}

const defaultState = {
    toast: {
        center: '',
    },
};

export let toast: {
    center: (message: string) => void,
};

export class Game extends React.Component<GameProps> {
    public state = defaultState;

    public readonly game = new Phaser.Game({
        parent: 'container',
        ...this.props.config,
        scene: [
            scene1,
            scene0,
        ],
    });

    public componentWillUnmount() {
        this.game.destroy(true);
    }

    public render() {
        toast = {
            center: message => this.setState(message),
        };
        return (<div id="Game">
            <div id="container" />
            {this.state.toast.center && <div id="centerTip">{this.state.toast.center}</div>}
        </div>);
    }
}
