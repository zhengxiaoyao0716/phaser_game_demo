import { preload as preloadPlatform, create as createPlatform, update as updatePlatform, platforms, borders, deadlineZone, revive, clearAll } from './platform';
import { preload as preloadPlayer, create as createPlayer, update as updatePlayer, player, playerDie } from '../player';
import { gameConfig } from 'src/App';

export const key = 'Scene0';

export function preload(this: Phaser.Scene) {
    preloadPlatform(this);
    preloadPlayer(this);
}

export async function create(this: Phaser.Scene) {
    createPlatform(this);
    await createPlayer(this, 0.2, gameConfig.width / 2, 120);
    player.setGravityY(0);
    player.setActive(false);
    player.setVisible(false);
}

export function initPlayer(scene: Phaser.Scene) {
    player.setActive(true);
    player.setVisible(true);
    player.setGravityY(1000);
    scene.physics.add.collider(player, platforms);
    scene.physics.add.collider(player, borders);
    scene.physics.add.collider(player, deadlineZone, onDie);
}

const onDie = async (player: Phaser.Physics.Arcade.Sprite) => {
    clearAll();
    await playerDie();
    revive();
};

export function update(this: Phaser.Scene, time: number, delta: number) {
    updatePlayer(this, time, delta);
    updatePlatform(this, time, delta);
}
