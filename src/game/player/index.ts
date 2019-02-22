import * as mock from '../util/mock';
import { create as createAmin, update as updateAnim } from './anim';
import { create as createController, controller } from './controller';
import { barrage, isBullet } from '../barrage';

export let player: Phaser.Physics.Arcade.Sprite;

let sheetPromsie: Promise<HTMLImageElement>; // 雪碧图加载锁

export let status: 'alive' | 'boom' = 'alive';

export const preload = (scene: Phaser.Scene) => {
    const texture = mock.texture(scene);

    const images = [
        ...['   \n■■■\n■ ■', ' ■ \n■■■\n■ ■', ' ■ \n■■■\n   '], // TOP
        ...['■ ■\n■■■\n   ', '■ ■\n■■■\n ■ ', '   \n■■■\n ■ '], // Bottom
        ...[' ■■\n ■ \n ■■', ' ■■\n■■ \n ■■', ' ■ \n■■ \n ■ '], // Left
        ...['■■ \n ■ \n■■ ', '■■ \n ■■\n■■ ', ' ■ \n ■■\n ■ '], // right
        ' ■ \n■■■\n ■ ', ' ■ \n■ ■\n ■ ', // Hang
        ' ■ \n■■■\n ■ ', '■ ■\n ■ \n■ ■', // Boom
    ];
    images.forEach((value, index) => {
        texture.text(`player${index}`, value, { color: 0x99FFFF });
    });
    sheetPromsie = texture.sheet('player', 256, 256, images.map((_, index) => `player${index}`), 32, 64);
};

export const create = async (scene: Phaser.Scene) => {
    await sheetPromsie;
    player = scene.physics.add.sprite(400, 580, 'player');
    player.setCollideWorldBounds(true);

    scene.physics.add.overlap(player, barrage, boom);

    createAmin(scene);
    createController(scene);
};

export const update = (scene: Phaser.Scene, time: number, delta: number) => {
    if (!player) return;
    switch (status) {
        case 'alive':
            controller.update(time, delta);
            updateAnim(scene);
            break;
        case 'boom':
            break;
    }
};

const boom = (_player: Phaser.Physics.Arcade.Sprite, object: Phaser.GameObjects.GameObject) => {
    if (isBullet(object) && object.active) {
        status = 'boom';
        player.setVelocity(0, 100);
        player.anims.play('playerBoom', true);
    }
};
