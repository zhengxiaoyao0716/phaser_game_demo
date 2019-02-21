import * as mock from './util/mock';
import { create as createController, controller } from './util/controller';
import { create as createBarrage, barrage } from './barrage';
import { create as createPlayer, preload as preloadPlayer, player } from './player';

export function preload(this: Phaser.Scene) {
    const texture = mock.texture(this);

    texture.shape('background', { fill: { color: 0x66CCFF } }).rect(800, 600);
    texture.shape('redCircle', { fill: { color: 0xEE0000 } }).circle(12);

    preloadPlayer(this);
}

export async function create(this: Phaser.Scene) {
    this.add.image(400, 300, 'background');

    createBarrage(this);
    await createPlayer(this);
    this.physics.add.overlap(player, barrage);

    createController(this);
}

export function update(this: Phaser.Scene, time: number, delta: number) {
    controller && controller.update(time, delta);
}
