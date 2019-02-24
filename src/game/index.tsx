import * as React from 'react';
import * as Phaser from 'phaser';
import * as scene0 from './scene0';
import * as scene1 from './scene1';
import asset from './scene0/asset';
import './index.css';

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
        ...this.props.config,
        scene: [
            scene0,
            scene1,
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
            <video id="vv" src={asset.start_mov} autoPlay={true}/>
            {this.state.toast.center && <div id="centerTip">{this.state.toast.center}</div>}
        </div>);
    }
}
