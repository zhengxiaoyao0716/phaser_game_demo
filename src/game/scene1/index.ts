import { preload as preloadPlayer, create as createPlayer, update as updatePlayer, player, status } from '../player';
import { preload as preloadGround, create as createGround, groundGroup, climbingGroup, collideGroup, overlapGroup } from './map';
import { frameStatus } from '../player/controller';
import { toast } from '..';

export const key = 'Scene1';
export let isScene1 = false;

export function preload(this: Phaser.Scene) {
    preloadPlayer(this);
    preloadGround(this);
}

export async function create(this: Phaser.Scene) {
    isScene1 = true;
    const [birth, ...savepoints] = createGround(this);
    await createPlayer(this, birth[0], birth[1], savepoints);
    this.cameras.main.startFollow(player);
    this.physics.add.collider(player, groundGroup);
    this.physics.add.overlap(player, climbingGroup, () => null, () => {
        frameStatus.climbing = true;
        return false;
    });
    this.physics.add.collider(player, collideGroup);
    this.physics.add.overlap(player, overlapGroup, (_player: Phaser.Physics.Arcade.Sprite, object: Phaser.Physics.Arcade.Sprite) => {
        if (frameStatus.overlap !== object && object.active) {
            frameStatus.overlap = object;
            const tip = object.getData('tip');
            tip && toast.center(tip, 1000);
        }
    });
    status.canChangeView = true;
}

export function update(this: Phaser.Scene, time: number, delta: number) {
    updatePlayer(this, time, delta);
}
