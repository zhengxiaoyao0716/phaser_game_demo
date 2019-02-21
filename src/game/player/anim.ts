import { player } from '.';

export const init = (scene: Phaser.Scene) => {
    scene.anims.create({
        key: 'playerTop',
        frames: scene.anims.generateFrameNumbers('player', { start: 0, end: 2 }),
        frameRate: 10,
        repeat: -1,
        yoyo: true,
    });
    scene.anims.create({
        key: 'playerBottom',
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
    player.anims.play('playerHang');
};
