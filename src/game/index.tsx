import * as Phaser from 'phaser';
import * as React from 'react';
import { create, preload, update, render } from './scene0';

export interface GameProps {
    config: GameConfig;
}

const defaultState = {};
export type GameState = typeof defaultState;

export class Game extends React.Component<GameProps> {
    public state = defaultState;

    public readonly game = new Phaser.Game({
        ...this.props.config,
        scene: [{ preload, create, update }],
    });

    public componentWillUnmount() {
        this.game.destroy(true);
    }

    public render() {
        render.call(this.game.scene, this.props, this.state);
        return (<div id="gameContainer" />);
    }
}
