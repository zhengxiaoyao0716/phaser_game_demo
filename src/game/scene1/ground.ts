import * as mock from '../util/mock';
import asset from './asset';

export let groundLayer: Phaser.Tilemaps.DynamicTilemapLayer;

const tileWidth = 64;
const tileHeight = 64;

export let groundGroup: Phaser.Physics.Arcade.StaticGroup;
export let climbingGroup: Phaser.Physics.Arcade.StaticGroup;

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
};

export const create = (scene: Phaser.Scene) => {
    const tilemap = scene.make.tilemap({ key: 'tilemap' });
    const tileset = tilemap.addTilesetImage('tileset0');
    groundLayer = tilemap.createDynamicLayer(0, tileset, 0, 0);
    scene.physics.world.setBounds(0, 0, tilemap.widthInPixels, tilemap.heightInPixels);
    scene.cameras.main.setBounds(0, 0, tilemap.widthInPixels, tilemap.heightInPixels);

    groundGroup = scene.physics.add.staticGroup();
    climbingGroup = scene.physics.add.staticGroup();
    const savepoints: Array<[number, number]> = [];

    scene.add.image(1920 / 2, 1080 / 2, 'bg');

    groundLayer.forEachTile((tile: Phaser.Tilemaps.Tile) => {
        const type: 'ground' | 'savepoint' | 'climbing' = (tile.properties as any).type;
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
        }
    });
    return savepoints;
};

export const update = (scene: Phaser.Scene, time: number, delta: number) => {
    // TODO .
};
