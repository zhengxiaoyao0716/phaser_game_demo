import * as React from 'react';
import * as Phaser from 'phaser';
import * as scene0 from './scene0';
import * as scene1 from './scene1';
import './index.css';
// import test from './scene1/test';

interface GameProps {
    config: GameConfig;
}

const defaultState = {
    toast: {
        center: '',
    },
};
type GameState = typeof defaultState;

export let toast: {
    center: (message: string, timeout?: number) => () => void,
};

export class Game extends React.Component<GameProps, GameState> {
    public state = defaultState;

    public readonly game = new Phaser.Game({
        parent: 'container',
        scale: {
            fullscreenTarget: 'game',
        },
        physics: {
          default: 'arcade',
          arcade: {
            'gravity.y': 0,
          },
        },
        ...this.props.config,
        scene: [
            // test,
            scene1,
            scene0,
        ],
    });

    private toast(key: keyof typeof toast) {
        let timer: any;
        return (message: string, timeout?: number) => {
            if (message === this.state.toast[key]) return () => null;
            timer && clearTimeout(timeout);
            this.setState({ toast: { [key]: message } });
            const clear = () => message === this.state.toast[key] && this.setState({ toast: { [key]: '' } });
            timeout && (timer = setTimeout(clear, timeout));
            return clear;
        };
    }

    public componentWillUnmount() {
        this.game.destroy(true);
    }

    public render() {
        toast = {
            center: this.toast('center'),
        };
        return (<div id="Game" className="Game">
            <div id="container" />
            {this.state.toast.center && <div id="centerTip">{this.state.toast.center}</div>}
        </div>);
    }
}
