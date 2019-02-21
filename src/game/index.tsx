import * as Phaser from 'phaser';
import * as React from 'react';
import { create, preload, update } from './game';

export class Game extends React.Component<{ config: GameConfig }> {
    public readonly game = new Phaser.Game({
        ...this.props.config,
        scene: { preload, create, update },
    });

    public componentWillUnmount() {
        this.game.destroy(true);
    }

    public render() {
        return (<div id="gameContainer" />);
    }
}
