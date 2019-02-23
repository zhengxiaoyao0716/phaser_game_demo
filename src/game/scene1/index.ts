import { preload as preloadPlayer, create as createPlayer, update as updatePlayer, player } from '../player';
import { preload as preloadGround, create as createGround, groundGroup, climbingGroup } from './ground';
import { frameStatus } from '../player/controller';

export const key = 'Scene1';

export function preload(this: Phaser.Scene) {
    preloadPlayer(this);
    preloadGround(this);
}

export async function create(this: Phaser.Scene) {
    const [birth, ...savepoints] = createGround(this);
    await createPlayer(this, birth[0], birth[1] - 200, savepoints);
    this.cameras.main.startFollow(player);
    this.physics.add.collider(player, groundGroup);
    this.physics.add.overlap(player, climbingGroup, () => null, () => {
        frameStatus.climbing = true;
        return false;
    });
}

export function update(this: Phaser.Scene, time: number, delta: number) {
    updatePlayer(this, time, delta);
}
