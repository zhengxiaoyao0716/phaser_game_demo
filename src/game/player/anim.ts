import { player } from '.';

export const create = (scene: Phaser.Scene) => {
    scene.anims.create({
        key: 'playerUp',
        frames: scene.anims.generateFrameNumbers('player', { start: 0, end: 2 }),
        frameRate: 10,
        repeat: -1,
        yoyo: true,
    });
    scene.anims.create({
        key: 'playerDown',
        frames: scene.anims.generateFrameNumbers('player', { start: 3, end: 5 }),
        frameRate: 10,
        repeat: -1,
        yoyo: true,
    });
    scene.anims.create({
        key: 'playerLeft',
        frames: scene.anims.generateFrameNumbers('player', { start: 6, end: 8 }),
        frameRate: 10,
        repeat: -1,
        yoyo: true,
    });
    scene.anims.create({
        key: 'playerRight',
        frames: scene.anims.generateFrameNumbers('player', { start: 9, end: 11 }),
        frameRate: 10,
        repeat: -1,
        yoyo: true,
    });
    scene.anims.create({
        key: 'playerHang',
        frames: [{ key: 'player', frame: 12 }, { key: 'player', frame: 13 }],
        frameRate: 5,
        repeat: -1,
    });
    scene.anims.create({
        key: 'playerBoom',
        frames: [{ key: 'player', frame: 14 }, { key: 'player', frame: 15 }],
        frameRate: 5,
        repeat: -1,
    });
    player.anims.play('playerHang');
};

export const playerUp = () => player.anims.play('playerUp', true);
export const playerDown = () => player.anims.play('playerDown', true);
export const playerLeft = () => player.anims.play('playerLeft', true);
export const playerRight = () => player.anims.play('playerRight', true);
export const playerHang = () => player.anims.play('playerHang', true);
export const playerBoom = () => player.anims.play('playerBoom', true);
