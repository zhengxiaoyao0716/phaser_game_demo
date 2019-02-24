import { create as createAmin } from './anim';
import { create as createController, controller, frameStatus } from './controller';
import savepoint, { savepointGroup, savedPosition } from './savepoint';
import { toast } from '..';
import asset from '../scene1/asset';

export let player: Phaser.Physics.Arcade.Sprite;

export const status: {
    life: 'alive' | 'boom',
    jumping: boolean,
    walling: boolean,
    savedpoint: number, // 最后一次保存的位置
    canChangeView: boolean, // 能否切换表里世界视点
} = {
    life: 'alive',
    jumping: true,
    walling: false,
    savedpoint: 0,
    canChangeView: false,
};

export const preload = (scene: Phaser.Scene) => {
    scene.load.spritesheet('playerInside', asset.playersheetInside, { frameWidth: 170, frameHeight: 284 });
    scene.load.spritesheet('playerOutside', asset.playersheetOutside, { frameWidth: 170, frameHeight: 284 });

    savepoint.preload(scene);
};

export const create = async (scene: Phaser.Scene, scale: number, x: number, y: number, savepoints: Array<[number, number, boolean?]> = []) => {
    savepoint.create(scene, [[x, y, false], ...savepoints]);

    player = scene.physics.add.sprite(x, y, 'playerOutside');
    player.setCollideWorldBounds(true);
    player.setGravityY(3000);
    player.setScale(scale);
    (player.body as Phaser.Physics.Arcade.Body).onWorldBounds = true;
    player.body.world.on('worldbounds', onPlayerWorldBounds);

    createAmin(scene);
    createController(scene.game);
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
        player.setVelocity(0, 0);
        const [x, y] = savedPosition();
        player.setPosition(x, y - 10);
        setTimeout(() => status.life = 'alive', 500);
    }
};

const onSavepoint = (_player: Phaser.Physics.Arcade.Sprite, point: Phaser.GameObjects.GameObject) => {
    if (point.active) {
        frameStatus.savepoint = point.getData('index');
        if (frameStatus.savepoint !== status.savedpoint) {
            toast.center('按【空格】/【A】键保存', 3000);
        }
    }
    return false;
};
