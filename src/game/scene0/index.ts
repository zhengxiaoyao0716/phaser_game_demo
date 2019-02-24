import * as mock from '../util/mock';
import { preload as preloadPlatform, create as createPlatform, update as updatePlatform, platforms, borders, deadlineZone, revive } from './platform';
import { preload as preloadPlayer, create as createPlayer, update as updatePlayer, player } from '../player';
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
    await createPlayer(this, 0, 0);
    player.setGravityY(0);
    player.setActive(false);
    player.setVisible(false);
}

let playerX : number;
let playerY : number;

export function initPlayer(scene:Phaser.Scene) {
    // 出生点
    playerX = gameConfig.width / 2;
    playerY = 150;

    player.setX(playerX).setY(playerY);
    player.setActive(true);
    player.setVisible(true);
    player.setGravityY(1000);
    scene.physics.add.collider(player, platforms);
    scene.physics.add.collider(player, borders);
    scene.physics.add.collider(player, deadlineZone, onDie);
}

function onDie(player: Phaser.Physics.Arcade.Sprite){
    player.setX(playerX).setY(playerY);
    player.setVelocityY(0);
    revive();
}

export function update(this: Phaser.Scene, time: number, delta: number) {
    updatePlayer(this, time, delta);
    updatePlatform(this, time, delta);
}
