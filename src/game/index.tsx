import * as Phaser from 'phaser';
import * as React from 'react';
import * as mock from './mock';

let player: Phaser.Physics.Arcade.Sprite;
const _promises: Map<string, Promise<any>> = new Map();

function preload(this: Phaser.Scene) {
    const texture = mock.texture(this);
    texture.shape('background', { fill: { color: 0x66CCFF } }).rect(800, 600);
    texture.shape('redCircle', { fill: { color: 0xEE0000 } }).circle(12);
    texture.text('player0', ' ■ \n■■■\n■■■', { color: 0x99FFFF });
    const playerSheet = texture.sheet('player', 256, 256, new Array(30).fill('player0'), 32, 64);
    _promises.set('preload', Promise.all([playerSheet]));
}

async function create(this: Phaser.Scene) {
    this.add.image(400, 300, 'background');

    const particles = this.add.particles('redCircle');
    const emitter = particles.createEmitter({
        speed: 100,
        scale: { start: 1, end: 0 },
        blendMode: 'ADD',
    });

    await _promises.get('preload');

    player = this.physics.add.sprite(400, 100, 'player');
    player.setBounce(1);
    player.setCollideWorldBounds(true);
    player.setVelocity(100, 200);
    emitter.startFollow(player);

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('player', { start: 0, end: 10 }),
        frameRate: 10,
        repeat: -1,
    });
    this.anims.create({
        key: 'turn',
        frames: [{ key: 'player', frame: 15 }],
        frameRate: 20,
    });
    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('player', { start: 20, end: 30 }),
        frameRate: 10,
        repeat: -1,
    });
}

function update(this: Phaser.Scene, time: number, delta: number) {
    player && player.anims.play('turn');
}

export class Game extends React.Component {
    private game = new Phaser.Game({
        parent: '#gameContainer',
        width: 800,
        height: 600,
        physics: {
            default: 'arcade',
            arcade: {
                'gravity.y': 100,
            },
        },
        scene: { preload, create, update },
    });

    public componentWillUnmount() {
        this.game.destroy(true);
    }

    public render() {
        return (<div id="gameContainer" />);
    }
}
