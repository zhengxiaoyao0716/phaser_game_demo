import * as mock from '../util/mock';
import { GameState, GameProps } from '..';
import { gameConfig } from 'src/App';
import { preload as preloadPlayer, create as createPlayer, update as updatePlayer, player, onPlayerCollider } from '../player';
import { preload as preloadGround, create as createGround, groundGroup} from './ground';

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
    await createPlayer(this, 30, gameConfig.height - 300);
    this.physics.add.collider(player, groundGroup, onPlayerCollider);
}

export function update(this: Phaser.Scene, time: number, delta: number) {
    updatePlayer(this, time, delta);
}

export function render(this: Phaser.Scene, props: GameProps, state: GameState) {
    // console.log('render', props, state);
}