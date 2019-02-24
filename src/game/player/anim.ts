import { player } from '.';
import { isInsideView } from '../scene1/map';

export const create = (scene: Phaser.Scene) => {
    scene.anims.create({
        key: 'playerLeft_I',
        frames: scene.anims.generateFrameNumbers('playerInside', { start: 0, end: 1 }),
        frameRate: 10,
        repeat: -1,
        yoyo: false,
    });
    scene.anims.create({
        key: 'playerRight_I',
        frames: scene.anims.generateFrameNumbers('playerInside', { start: 2, end: 3 }),
        frameRate: 10,
        repeat: -1,
        yoyo: false,
    });
    scene.anims.create({
        key: 'playerIdle_I',
        frames: scene.anims.generateFrameNumbers('playerInside', { start: 4, end: 5 }),
        frameRate: 5,
        repeat: -1,
    });
    scene.anims.create({
        key: 'playerUpRight_I',
        frames: scene.anims.generateFrameNumbers('playerInside', { start: 8, end: 9 }),
        frameRate: 10,
        repeat: -1,
        yoyo: false,
    });
    scene.anims.create({
        key: 'playerDownRight_I',
        frames: scene.anims.generateFrameNumbers('playerInside', { start: 10, end: 13 }),
        frameRate: 10,
        repeat: -1,
        yoyo: false,
    });
    scene.anims.create({
        key: 'playerUpLeft_I',
        frames: scene.anims.generateFrameNumbers('playerInside', { start: 14, end: 15 }),
        frameRate: 10,
        repeat: -1,
        yoyo: false,
    });
    scene.anims.create({
        key: 'playerDownLeft_I',
        frames: scene.anims.generateFrameNumbers('playerInside', { start: 16, end: 19 }),
        frameRate: 10,
        repeat: -1,
        yoyo: false,
    });
    scene.anims.create({
        key: 'playerBoom_I',
        frames: scene.anims.generateFrameNumbers('playerInside', { start: 20, end: 26 }),
        frameRate: 10,
        repeat: 0,
    });

    scene.anims.create({
        key: 'playerLeft_O',
        frames: scene.anims.generateFrameNumbers('playerOutside', { start: 0, end: 1 }),
        frameRate: 10,
        repeat: -1,
        yoyo: false,
    });
    scene.anims.create({
        key: 'playerRight_O',
        frames: scene.anims.generateFrameNumbers('playerOutside', { start: 2, end: 3 }),
        frameRate: 10,
        repeat: -1,
        yoyo: false,
    });
    scene.anims.create({
        key: 'playerIdle_O',
        frames: scene.anims.generateFrameNumbers('playerOutside', { start: 4, end: 5 }),
        frameRate: 5,
        repeat: -1,
    });
    scene.anims.create({
        key: 'playerUpRight_O',
        frames: scene.anims.generateFrameNumbers('playerOutside', { start: 6, end: 7 }),
        frameRate: 10,
        repeat: -1,
        yoyo: false,
    });
    scene.anims.create({
        key: 'playerDownRight_O',
        frames: scene.anims.generateFrameNumbers('playerOutside', { start: 10, end: 13 }),
        frameRate: 10,
        repeat: -1,
        yoyo: false,
    });
    scene.anims.create({
        key: 'playerUpLeft_O',
        frames: scene.anims.generateFrameNumbers('playerOutside', { start: 14, end: 15 }),
        frameRate: 10,
        repeat: -1,
        yoyo: false,
    });
    scene.anims.create({
        key: 'playerDownLeft_O',
        frames: scene.anims.generateFrameNumbers('playerOutside', { start: 16, end: 19 }),
        frameRate: 10,
        repeat: -1,
        yoyo: false,
    });
    scene.anims.create({
        key: 'playerBoom_O',
        frames: scene.anims.generateFrameNumbers('playerOutside', { start: 20, end: 26 }),
        frameRate: 10,
        repeat: 0,
    });
};

const lOrR = () => player.body.velocity.x < 0 ? 'Left' : 'Right';
export const playerUp = () => player.anims.play(`playerUp${lOrR()}_${isInsideView ? 'I' : 'O'}`, true);
export const playerDown = () => player.anims.play(`playerDown${lOrR()}_${isInsideView ? 'I' : 'O'}`, true);
export const playerLeft = () => player.anims.play(`playerLeft_${isInsideView ? 'I' : 'O'}`, true);
export const playerRight = () => player.anims.play(`playerRight_${isInsideView ? 'I' : 'O'}`, true);
export const playerIdle = () => player.anims.play(`playerIdle_${isInsideView ? 'I' : 'O'}`, true);
export const playerBoom = () => player.anims.play(`playerBoom_${isInsideView ? 'I' : 'O'}`, true);
