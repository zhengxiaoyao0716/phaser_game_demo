import * as mock from '../util/mock';
import asset from './asset';
import { player } from '../player';
// import { gameConfig } from 'src/App';

const tileWidth = 64;
const tileHeight = 64;

type onViewActive = () => void;
export let isInsideView = false;
const onInsideView: { [key: string]: onViewActive } = {
};
const onOutsideView: { [key: string]: onViewActive } = {
};
export const onChangeView = () => {
    isInsideView = !isInsideView;
    const prefix = player.anims.currentAnim.key.slice(0, -1);
    player.anims.play(`${prefix}_${isInsideView ? 'I' : 'O'}`, true);
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

const pianos = [
    asset.piano1, asset.piano2, asset.piano3, asset.piano4, asset.piano5,
];
const pianoAudios: Phaser.Sound.BaseSound[] = [];

export let groundGroup: Phaser.Physics.Arcade.StaticGroup;
export let climbingGroup: Phaser.Physics.Arcade.StaticGroup;
export let collideGroup: Phaser.Physics.Arcade.Group;
export let overlapGroup: Phaser.Physics.Arcade.Group;

export const preload = (scene: Phaser.Scene) => {
    scene.load.tilemapTiledJSON('tilemap', require('./asset/tilemap.json.tile'));
    Object.entries(asset).forEach(([key, url]) => {
        (url as string).startsWith('data:') ? scene.textures.addBase64(key, url) : scene.load.image(key, url);
    });

    pianos.forEach((url, index) => scene.load.audio(`piano${1 + index}`, url));

    const texture = mock.texture(scene);
    texture.shape('ground', { fill: { color: 0x00FF00 } }).rect(tileWidth, tileHeight);
    texture.shape('wall', { fill: { color: 0x00FF00 } }).rect(tileWidth, tileHeight);
    texture.shape('rope', { fill: { color: 0xFFFF00 } }).rect(tileWidth, tileHeight);
    texture.shape('box', { fill: { color: 0xFF00FF } }).rect(tileWidth, tileHeight);
    texture.shape('action', { fill: { color: 0xFF00FF } }).trian(tileWidth, tileHeight, tileWidth / 2);
};

export const create = (scene: Phaser.Scene) => {
    scene.physics.add.image(5319 / 2, 3618 / 2, 'web');
    scene.physics.world.setBounds(0, 0, 5319, 3618);
    scene.cameras.main.setBounds(0, 0, 5319, 3618);
    const savepoints: Array<[number, number]> = [[950, 2800]];

    pianoAudios.push(...pianos.map((url, index) => scene.sound.add(`piano${1 + index}`)));


    groundGroup = scene.physics.add.staticGroup();
    climbingGroup = scene.physics.add.staticGroup();
    collideGroup = scene.physics.add.group();
    scene.physics.add.collider(collideGroup, groundGroup);
    overlapGroup = scene.physics.add.group();
    scene.physics.add.collider(overlapGroup, groundGroup);

    const texture = mock.texture(scene);
    const positions: Array<[number, number, number?, number?, string?, any?]> = [
        // 出生点附近
        [800, 3100, 160, 1400, 'ground'],
        [1105, 3046, 607, 60, 'ground'],
        [1518, 3046, 217, 60, 'insideGround'],
        [1921, 3046, 590, 60, 'ground'],
        [1921, 2604, 590, 800, 'ground'],
        // 钢琴平台
        [2137, 3537, 2673, 102, 'ground'],
        [3980, 3476, 1000, 60, 'ground'],
        [3776, 3280, 272, 301, 'moshuiping'],
        [4452, 3196, 99, 500, 'ground'],
        [4620, 2872, 234, 161, 'ground'],
        [5023, 2420, 582, 1066, 'ground'],
        // 钢琴按键
        [1592, 3522, , , 'piano', '1'],
        [1736, 3522, , , 'piano', '2'],
        [1893, 3527, , , 'piano', '3'],
        [2043, 3528, , , 'piano', '4'],
        [2192, 3531, , , 'piano', '5'],
    ];
    positions.forEach(([x, y, width, height, type, extras], index) => {
        const key = `road${index}`;
        width != null && height != null && texture.shape(key, { fill: { color: 0x00FF00 } }).rect(width, height);
        switch (type) {
            case 'ground': {
                const ground = groundGroup.create(x, y, key) as Phaser.Physics.Arcade.Sprite;
                ground.setImmovable(true);
                // ground.setVisible(false);
                break;
            }
            case 'insideGround': {
                const ground = collideGroup.create(x, y, key) as Phaser.Physics.Arcade.Sprite;
                ground.setImmovable(true);
                // ground.setVisible(false);
                onInsideView.box = hide(ground);
                onOutsideView.box = show(ground);
                break;
            }
            case 'moshuiping': {
                const box = collideGroup.create(x, y, 'moshuiping') as Phaser.Physics.Arcade.Sprite;
                box.setDragX(1000);
                box.setGravityY(1000);
                box.type = 'box';
                break;
            }
            case 'piano': {
                const index = (extras as any).index;
                const piano = overlapGroup.create(x, y, `button${1 + index}`) as Phaser.Physics.Arcade.Sprite;
                piano.type = 'pianoAction';
                piano.name = `piano${1 + index}`;
                piano.setData('play', () => pianoAudios[index].play());
                break;
            }
        }
    });
    console.log(scene);

    // const tilemap = scene.make.tilemap({ key: 'tilemap' });
    // const tileset = tilemap.addTilesetImage('tileset0');
    // const groundLayer = tilemap.createDynamicLayer(0, tileset, 0, 0);
    // scene.cameras.main.setBounds(0, 0, tilemap.widthInPixels, tilemap.heightInPixels);

    // groundGroup = scene.physics.add.staticGroup();
    // climbingGroup = scene.physics.add.staticGroup();
    // collideGroup = scene.physics.add.group();
    // scene.physics.add.collider(collideGroup, groundGroup);
    // overlapGroup = scene.physics.add.group();
    // scene.physics.add.collider(overlapGroup, groundGroup);

    // const box = groundGroup.create(300, 700, 'box');
    // onInsideView.box = show(box);
    // onOutsideView.box = hide(box);

    // groundLayer.forEachTile((tile: Phaser.Tilemaps.Tile) => {
    //     const properties = tile.properties as any;
    //     const type = properties.type;
    //     if (!type) return;
    //     const x = tile.getCenterX();
    //     const y = tile.getCenterY();
    //     groundLayer.removeTileAt(tile.x, tile.y);
    //     switch (type) {
    //         case 'ground':
    //             const ground = groundGroup.create(x, y, 'ground');
    //             ground.setImmovable(true);
    //             break;
    //         case 'savepoint':
    //             savepoints.push([x, y]);
    //             break;
    //         case 'climbing':
    //             climbingGroup.create(x, y, 'rope');
    //             break;
    //         case 'box':
    //             const box = collideGroup.create(x, y, 'box') as Phaser.Physics.Arcade.Sprite;
    //             box.setDragX(1000);
    //             box.setGravityY(1000);
    //             box.type = 'box';
    //             break;
    //         case 'action':
    //             const action = overlapGroup.create(x, y, 'action');
    //             action.setGravityY(1000);
    //             action.type = properties.type;
    //             action.name = properties.name;
    //             action.setData('tip', 'properties.tip');
    //             action.setData('pressedTip', 'properties.pressedTip');
    //             break;
    //     }
    // });
    return savepoints;
};

export const update = (scene: Phaser.Scene, time: number, delta: number) => {
    // TODO .
};
