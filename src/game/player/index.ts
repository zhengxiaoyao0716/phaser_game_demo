import * as mock from '../util/mock';
import { create as createAmin } from './anim';
import { create as createController, controller } from './controller';
import savepoint, { savepointGroup, savedPosition } from './savepoint';
import { toast } from '..';

export let player: Phaser.Physics.Arcade.Sprite;

let sheetPromsie: Promise<HTMLImageElement>; // 雪碧图加载锁

export const status: {
    life: 'alive' | 'boom',
    jumping: boolean,
    walling: boolean,
    save: {
        nearPoint: number, // 附近的保存点，-1代表不在附近
        savedAt: number, // 最后一次保存的位置
    },
} = {
    life: 'alive',
    jumping: true,
    walling: false,
    save: {
        nearPoint: -1,
        savedAt: 0,
    },
};

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

    savepoint.preload(scene);
};

export const create = async (scene: Phaser.Scene, x: number, y: number, savepoints: Array<[number, number, boolean?]> = []) => {
    await sheetPromsie;
    player = scene.physics.add.sprite(x, y, 'player');
    player.setCollideWorldBounds(true);
    player.setGravityY(3000);
    (player.body as Phaser.Physics.Arcade.Body).onWorldBounds = true;
    player.body.world.on('worldbounds', onPlayerWorldBounds);
    player.setZ(-1);

    createAmin(scene);
    createController(scene.game);
    savepoint.create(scene, [[x, y, false], ...savepoints]);
    scene.physics.add.overlap(player, savepointGroup, () => null, onSavepoint);
};

export const update = (scene: Phaser.Scene, time: number, delta: number) => {
    if (!player) return;
    switch (status.life) {
        case 'alive':
            controller.update(time, delta);
            break;
        case 'boom':
            break;
    }
};

const onPlayerWorldBounds = (body: Phaser.Physics.Arcade.Body, up: boolean, down: boolean, left: boolean, ight: boolean) => {
    if (down) {
        status.life = 'boom';
        player.setVelocityX(0);
        player.setPosition(...savedPosition());
        setTimeout(() => status.life = 'alive', 500);
    }
};

const onSavepoint = (_player: Phaser.Physics.Arcade.Sprite, point: Phaser.GameObjects.GameObject) => {
    if (point.active) {
        status.save.nearPoint = point.getData('index');
        if (status.save.nearPoint !== status.save.savedAt) {
            toast.center('按【空格】/【A】键保存', 3000);
        }
    }
    return false;
};
