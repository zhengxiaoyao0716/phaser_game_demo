import { gameConfig } from 'src/App';
import { preload as preloadPlayer, create as createPlayer, update as updatePlayer, player } from '../player';
import { preload as preloadGround, create as createGround, groundGroup, rope1 } from './ground';
import { frameStatus } from '../player/controller';

export const key = 'Scene1';

export function preload(this: Phaser.Scene) {
    preloadPlayer(this);
    preloadGround(this);
}

export async function create(this: Phaser.Scene) {
    createGround(this);
    await createPlayer(this, 30, gameConfig.height - 200, [[700, gameConfig.height - 130]]);
    this.cameras.main.startFollow(player);
    // this.physics.add.collider(player, groundLayer, (o1, o2) => console.log(o1, o2), () => true);
    this.physics.add.collider(player, groundGroup);
    this.physics.add.overlap(player, rope1, () => null, () => {
        frameStatus.climbing = true;
        return false;
    });
}

export function update(this: Phaser.Scene, time: number, delta: number) {
    updatePlayer(this, time, delta);
}
