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
        const ground = groundGroup.create(index * groundWidth, gameConfig.height - groundHeight, 'ground') as Phaser.Physics.Arcade.Sprite;
        ground.setImmovable(true);
        return ground;
    }));

    // grounds.push(...new Array(3).fill(null).map((_, index) => {
    //     const wall = groundGroup.create(index * 300, 1080 - 300 -50, 'wall') as Phaser.Physics.Arcade.Sprite;
    //     wall.setImmovable(true);
    //     grounds.push(wall);
    //     return wall;
    // }));

    const wall = groundGroup.create(300, 1080 - 300 - 50, 'wall') as Phaser.Physics.Arcade.Sprite;
    wall.setImmovable(true);
    grounds.push(wall);
};

export const update = (scene: Phaser.Scene, time: number, delta: number) => {
    // TODO .
};
