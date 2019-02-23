import * as mock from '../util/mock';
import { gameConfig } from 'src/App';
// import asset from './asset';

export let groundLayer: Phaser.Tilemaps.StaticTilemapLayer;

const groundWidth = 500;
const groundHeight = 50;

const groundSpriteType = 'groundSprite';
export let groundGroup: Phaser.Physics.Arcade.StaticGroup;
const grounds: Phaser.Physics.Arcade.Sprite[] = [];
export const isGround = (object: Phaser.GameObjects.GameObject): object is Phaser.Physics.Arcade.Sprite => {
    if (!(object instanceof Phaser.Physics.Arcade.Sprite)) return false;
    if (object.type !== groundSpriteType) return false;
    return true;
};

export let pendantGroup: Phaser.Physics.Arcade.StaticGroup;

export let rope1: Phaser.Physics.Arcade.Sprite;

export const preload = (scene: Phaser.Scene) => {
    // scene.load.tilemapTiledJSON('tilemap', require('./asset/tilemap.json.tile'));
    // Object.entries(asset).forEach(([key, url]) => {
    //     (url as string).startsWith('data:') ? scene.textures.addBase64(key, url) : scene.load.image(key, url);
    // });

    const texture = mock.texture(scene);
    texture.shape('ground', { fill: { color: 0x00FF00 } }).rect(groundWidth, groundHeight);
    texture.shape('wall', { fill: { color: 0x00FF00 } }).rect(groundHeight, groundWidth);
    texture.shape('mesh', { fill: { color: 0x00FF00 } }).rect(30, 30);
    texture.shape('rope', { fill: { color: 0x00FF00 } }).rect(10, 300);
};

export const create = (scene: Phaser.Scene) => {
    groundGroup = scene.physics.add.staticGroup();
    pendantGroup = scene.physics.add.staticGroup();
    grounds.push(...new Array(10).fill(null).map((_, index) => {
        const ground = groundGroup.create(index * (groundWidth + 100), gameConfig.height - groundHeight, 'ground') as Phaser.Physics.Arcade.Sprite;
        ground.setImmovable(true);
        return ground;
    }));

    const wall1 = groundGroup.create(480, 1080 - 350 - 50, 'wall') as Phaser.Physics.Arcade.Sprite;
    wall1.setImmovable(true);
    grounds.push(wall1);
    const wall2 = groundGroup.create(620, 1080 - 200 - 50, 'wall') as Phaser.Physics.Arcade.Sprite;
    wall2.setImmovable(true);

    rope1 = pendantGroup.create(150, 1080 - 200 - 50, 'rope') as Phaser.Physics.Arcade.Sprite;
    rope1.name = 'rope';
    const ropeTop = groundGroup.create(100, 1080 - 350, 'ground') as Phaser.Physics.Arcade.Sprite;
    ropeTop.setImmovable(true);

    const mesh = groundGroup.create(30, gameConfig.height - 200, 'mesh') as Phaser.Physics.Arcade.Sprite;
    grounds.push(mesh);

    // const tilemap = scene.make.tilemap({ key: 'tilemap' });
    // const tileset = tilemap.addTilesetImage('tileset0');
    // groundLayer = tilemap.createStaticLayer(0, tileset);
    // // groundLayer.forEachTile((...args: any) => console.log(...args));
    // scene.physics.add.existing(groundLayer, true);
    // // scene.physics.world.collideSpriteVsTilemapLayer(player, groundLayer);
    // (groundLayer.body as Phaser.Physics.Arcade.Body).onCollide = true;
    // groundLayer.setCollisionByProperty({ collides: true }, true);
    // groundLayer.setCollisionFromCollisionGroup(true);
    // console.log(scene, tilemap, groundLayer);
    // scene.physics.world.setBounds(0, 0, tilemap.widthInPixels, tilemap.heightInPixels);
    // scene.cameras.main.setBounds(0, 0, tilemap.widthInPixels, tilemap.heightInPixels);
};

export const update = (scene: Phaser.Scene, time: number, delta: number) => {
    // TODO .
};
