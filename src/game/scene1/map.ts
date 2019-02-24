import * as mock from '../util/mock';
import asset from './asset';

const tileWidth = 64;
const tileHeight = 64;

type onViewActive = () => void;
let isInsideView = true;
const onInsideView: { [key: string]: onViewActive } = {
};
const onOutsideView: { [key: string]: onViewActive } = {
};
export const onChangeView = () => {
    isInsideView = !isInsideView;
    Object.values(isInsideView ? onInsideView : onOutsideView).forEach(fn => fn());
};
const hide = (object: Phaser.Physics.Arcade.Sprite) => () => {
    if (!object.active) {
        object.setData('frozen', true);
        return;
    }
    object.body.checkCollision.none = true;
    object.setActive(false);
    object.setVisible(false);
};
const show = (object: Phaser.Physics.Arcade.Sprite) => () => {
    if (object.getData('frozen')) {
        return;
    }
    object.body.checkCollision.none = false;
    object.setActive(true);
    object.setVisible(true);
};

export let groundGroup: Phaser.Physics.Arcade.StaticGroup;
export let climbingGroup: Phaser.Physics.Arcade.StaticGroup;
export let collideGroup: Phaser.Physics.Arcade.Group;
export let overlapGroup: Phaser.Physics.Arcade.Group;

export const preload = (scene: Phaser.Scene) => {
    scene.load.tilemapTiledJSON('tilemap', require('./asset/tilemap.json.tile'));
    Object.entries(asset).forEach(([key, url]) => {
        (url as string).startsWith('data:') ? scene.textures.addBase64(key, url) : scene.load.image(key, url);
    });

    const texture = mock.texture(scene);
    texture.shape('bg', { fill: { color: 0xCCCCCC } }).rect(1920, 1080);
    texture.shape('ground', { fill: { color: 0x00FF00 } }).rect(tileWidth, tileHeight);
    texture.shape('wall', { fill: { color: 0x00FF00 } }).rect(tileWidth, tileHeight);
    texture.shape('rope', { fill: { color: 0xFFFF00 } }).rect(tileWidth, tileHeight);
    texture.shape('box', { fill: { color: 0xFF00FF } }).rect(tileWidth, tileHeight);
    texture.shape('action', { fill: { color: 0xFF00FF } }).trian(tileWidth, tileHeight, tileWidth / 2);
};

export const create = (scene: Phaser.Scene) => {
    scene.add.image(1920 / 2, 1080 / 2, 'bg');

    const tilemap = scene.make.tilemap({ key: 'tilemap' });
    const tileset = tilemap.addTilesetImage('tileset0');
    const groundLayer = tilemap.createDynamicLayer(0, tileset, 0, 0);
    scene.physics.world.setBounds(0, 0, tilemap.widthInPixels, tilemap.heightInPixels);
    scene.cameras.main.setBounds(0, 0, tilemap.widthInPixels, tilemap.heightInPixels);

    groundGroup = scene.physics.add.staticGroup();
    climbingGroup = scene.physics.add.staticGroup();
    collideGroup = scene.physics.add.group();
    scene.physics.add.collider(collideGroup, groundGroup);
    overlapGroup = scene.physics.add.group();
    scene.physics.add.collider(overlapGroup, groundGroup);
    const savepoints: Array<[number, number]> = [];

    const box = groundGroup.create(300, 700, 'box');
    onInsideView.box = show(box);
    onOutsideView.box = hide(box);

    groundLayer.forEachTile((tile: Phaser.Tilemaps.Tile) => {
        const properties = tile.properties as any;
        const type = properties.type;
        if (!type) return;
        const x = tile.getCenterX();
        const y = tile.getCenterY();
        groundLayer.removeTileAt(tile.x, tile.y);
        switch (type) {
            case 'ground':
                const ground = groundGroup.create(x, y, 'ground');
                ground.setImmovable(true);
                break;
            case 'savepoint':
                savepoints.push([x, y]);
                break;
            case 'climbing':
                climbingGroup.create(x, y, 'rope');
                break;
            case 'box':
                const box = collideGroup.create(x, y, 'box') as Phaser.Physics.Arcade.Sprite;
                box.setDragX(1000);
                box.setGravityY(1000);
                box.type = 'box';
                break;
            case 'action':
                const action = overlapGroup.create(x, y, 'action');
                action.setGravityY(1000);
                action.type = properties.type;
                action.name = properties.name;
                action.setData('tip', 'properties.tip');
                action.setData('pressedTip', 'properties.pressedTip');
                break;
        }
    });
    return savepoints;
};

export const update = (scene: Phaser.Scene, time: number, delta: number) => {
    // TODO .
};
