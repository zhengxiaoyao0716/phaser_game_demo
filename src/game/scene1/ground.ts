import * as mock from '../util/mock';
import { gameConfig } from 'src/App';

const groundWidth = 500;
const groundHeight = 50;

const groundSpriteType = 'groundSprite';

export let groundGroup: Phaser.Physics.Arcade.Group;
const grounds: Phaser.Physics.Arcade.Sprite[] = [];
export const isGround = (object: Phaser.GameObjects.GameObject): object is Phaser.Physics.Arcade.Sprite => {
    if (!(object instanceof Phaser.Physics.Arcade.Sprite)) return false;
    if (object.type !== groundSpriteType) return false;
    return true;
};

export const preload = (scene: Phaser.Scene) => {
    const texture = mock.texture(scene);
    texture.shape('ground', { fill: { color: 0x00FF00 } }).rect(groundWidth, groundHeight);
    texture.shape('wall', { fill: { color: 0x00FF00 } }).rect(groundHeight, groundWidth);
};

export const create = (scene: Phaser.Scene) => {
    groundGroup = scene.physics.add.group();
    grounds.push(...new Array(10).fill(null).map((_, index) => {
        const ground = groundGroup.create(index * (groundWidth + 100), gameConfig.height - groundHeight, 'ground') as Phaser.Physics.Arcade.Sprite;
        ground.setImmovable(true);
        (ground.body as Phaser.Physics.Arcade.Body).setFrictionX(1);
        return ground;
    }));

    const wall1 = groundGroup.create(480, 1080 - 350 - 50, 'wall') as Phaser.Physics.Arcade.Sprite;
    wall1.setImmovable(true);
    grounds.push(wall1);
    const wall2 = groundGroup.create(620, 1080 - 200 - 50, 'wall') as Phaser.Physics.Arcade.Sprite;
    wall2.setImmovable(true);
    grounds.push(wall2);
};

export const update = (scene: Phaser.Scene, time: number, delta: number) => {
    // TODO .
};
