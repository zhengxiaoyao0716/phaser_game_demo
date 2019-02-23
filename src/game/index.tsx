import * as Phaser from 'phaser';
import * as React from 'react';
import * as scene0 from './scene0';
import * as scene1 from './scene1';

export interface GameProps {
    config: GameConfig;
}

const defaultState = {};
export type GameState = typeof defaultState;

export class Game extends React.Component<GameProps> {
    public state = defaultState;

    public readonly game = new Phaser.Game({
        ...this.props.config,
        scene: [
            // scene0,
            scene1,
        ],
    });

    public componentWillUnmount() {
        this.game.destroy(true);
    }

    public render() {
        scene0.render.call(this.game.scene, this.props, this.state);
        return (<div id="gameContainer" />);
    }
}
