export let barrage: Phaser.Physics.Arcade.Group;

export const create = (scene: Phaser.Scene) => {
    barrage = scene.physics.add.group();
    barrage.create(Math.random() * scene.game.renderer.width, Math.random() * 30, 'redCircle');
};
