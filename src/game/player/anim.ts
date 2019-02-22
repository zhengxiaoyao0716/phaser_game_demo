import { player } from '.';

export const create = (scene: Phaser.Scene) => {
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
    scene.anims.create({
        key: 'playerBoom',
        frames: [{ key: 'player', frame: 14 }, { key: 'player', frame: 15 }],
        frameRate: 5,
        repeat: -1,
    });
    player.anims.play('playerHang');
};

export const update = (scene: Phaser.Scene) => {
    if (player.body.velocity.y < 0) player.anims.play('playerTop', true);
    else if (player.body.velocity.y > 0) player.anims.play('playerBottom', true);
    else if (player.body.velocity.x < 0) player.anims.play('playerLeft', true);
    else if (player.body.velocity.x > 0) player.anims.play('playerRight', true);
    else player.anims.play('playerHang', true);
};
