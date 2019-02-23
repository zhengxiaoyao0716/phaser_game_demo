import * as mock from '../util/mock';
import { gameConfig } from 'src/App';
import { preload as preloadPlayer, create as createPlayer, update as updatePlayer, player } from '../player';
import { preload as preloadGround, create as createGround, groundGroup } from './ground';

export const key = 'Scene1';

export function preload(this: Phaser.Scene) {
    const texture = mock.texture(this);

    texture.shape('background', { fill: { color: 0x66CCFF } }).rect(gameConfig.width, gameConfig.height);

    preloadPlayer(this);
    preloadGround(this);
}

export async function create(this: Phaser.Scene) {
    this.add.image(gameConfig.width / 2, gameConfig.height / 2, 'background');

    createGround(this);
    await createPlayer(this, 30, gameConfig.height - 200, [[700, gameConfig.height - 130]]);
    this.physics.add.collider(player, groundGroup);
}

export function update(this: Phaser.Scene, time: number, delta: number) {
    updatePlayer(this, time, delta);
}
