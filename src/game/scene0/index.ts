import * as mock from '../util/mock';
import { preload as preloadPlatform, create as createPlatform, update as updatePlatform, platforms, borders, deadlineZone } from './platform';
import { preload as preloadPlayer, create as createPlayer, update as updatePlayer, player } from '../player';
import { GameState, GameProps } from '..';
import { gameConfig } from 'src/App';

export const key = 'Scene0';

export function preload(this: Phaser.Scene) {
    const texture = mock.texture(this);

    texture.shape('background', { fill: { color: 0x66CCFF } }).rect(gameConfig.width, gameConfig.height);

    preloadPlatform(this);
    preloadPlayer(this);
}

export async function create(this: Phaser.Scene) {
    this.add.image(gameConfig.width / 2, gameConfig.height / 2, 'background');

    createPlatform(this);
    await createPlayer(this, gameConfig.width / 3, 100);
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(player, borders);
    this.physics.add.collider(player, deadlineZone, onDie);
}

function onDie(player: Phaser.Physics.Arcade.Sprite){
    // todo
}

export function update(this: Phaser.Scene, time: number, delta: number) {
    updatePlayer(this, time, delta);
    updatePlatform(this, time, delta);
}

export function render(this: Phaser.Scene, props: GameProps, state: GameState) {
    // console.log('render', props, state);
}
