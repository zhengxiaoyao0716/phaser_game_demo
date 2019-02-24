import * as mock from '../util/mock';
import asset from './asset';
import { player } from '../player';

const tileWidth = 64;
const tileHeight = 64;
let worldBg: Phaser.Physics.Arcade.Image;

type onViewActive = () => void;
export let isInsideView = false;
const onInsideView: { [key: string]: onViewActive } = {};
const onOutsideView: { [key: string]: onViewActive } = {};
export const onChangeView = () => {
    isInsideView = !isInsideView;
    const prefix = player.anims.currentAnim.key.slice(0, -1);
    player.anims.play(`${prefix}_${isInsideView ? 'I' : 'O'}`, true);
    Object.values(isInsideView ? onInsideView : onOutsideView).forEach(fn => fn());
    worldBg.setTexture(isInsideView ? 'inside' : 'outside');
};
const hide = (object: Phaser.Physics.Arcade.Sprite) => () => {
    object.setData('frozen', {
        checkNone: object.body.checkCollision.none,
        active: object.active,
        visible: object.visible,
    });
    object.body.checkCollision.none = true;
    object.setActive(false);
    object.setVisible(false);
};
const show = (object: Phaser.Physics.Arcade.Sprite) => () => {
    const { checkNone, active, visible } = object.getData('frozen');
    object.body.checkCollision.none = checkNone;
    object.setActive(active);
    object.setVisible(visible);
};

const pianos = [
    asset.piano1, asset.piano2, asset.piano3, asset.piano4, asset.piano5,
];
const pianoAudios: Phaser.Sound.BaseSound[] = [];
const pianoKeySeq = '1,3,5,3';
let pianoPlay: Array<1 | 2 | 3 | 4 | 5> | null = [];

export let groundGroup: Phaser.Physics.Arcade.StaticGroup;
export let climbingGroup: Phaser.Physics.Arcade.StaticGroup;
export let collideGroup: Phaser.Physics.Arcade.Group;
export let overlapGroup: Phaser.Physics.Arcade.Group;

export const preload = (scene: Phaser.Scene) => {
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
    worldBg = scene.physics.add.image(5319 / 2, 3618 / 2, 'outside');

    scene.physics.world.setBounds(0, 0, 5319, 3618);
    scene.cameras.main.setBounds(0, 0, 5319, 3618);
    const savepoints: Array<[number, number]> = [[980, 2800]];

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
        [800, 2550, 160, 1010, 'ground'],
        [1105, 3046, 607, 60, 'ground'],
        [1518, 3046, 217, 60, 'outsideGround'],
        [1921, 3046, 590, 60, 'ground'],
        [1921, 2604, 590, 800, 'ground'],
        // 钢琴平台
        [2137, 3537, 2673, 102, 'ground'],
        [3980, 3476, 1000, 60, 'outsideGround'],
        [3776, 3280, 272, 301, 'moshuiping'],
        [4452, 3196, 99, 500, 'outsideGround'],
        [4620, 2872, 234, 161, 'outsideGround'],
        [5023, 1500, 582, 3000, 'ground'],
        // 钢琴按键
        [1592, 3522, , , 'piano', { id: 1 }],
        [1736, 3522, , , 'piano', { id: 2 }],
        [1893, 3522, , , 'piano', { id: 3 }],
        [2043, 3522, , , 'piano', { id: 4 }],
        [2192, 3522, , , 'piano', { id: 5 }],
        // 爬绳子
        [4577, 2118, 50, 1340, 'climbing'],
        // 二层平台
        [2836, 1981, 3799, 117, 'insideGround'],
    ];
    positions.forEach(([x, y, width, height, type, extras], index) => {
        const key = `ground${index}`;
        width != null && height != null && texture.shape(key, { fill: { color: 0x00FF00 } }).rect(width, height);
        switch (type) {
            case 'ground': {
                const ground = groundGroup.create(x, y, key) as Phaser.Physics.Arcade.Sprite;
                ground.setImmovable(true);
                ground.setVisible(false);
                break;
            }
            case 'outsideGround': {
                const ground = collideGroup.create(x, y, key) as Phaser.Physics.Arcade.Sprite;
                ground.setImmovable(true);
                ground.setVisible(false);
                onInsideView[key] = hide(ground);
                onOutsideView[key] = show(ground);
                break;
            }
            case 'insideGround': {
                const ground = collideGroup.create(x, y, key) as Phaser.Physics.Arcade.Sprite;
                ground.setImmovable(true);
                ground.setVisible(false);
                onInsideView[key] = show(ground);
                onOutsideView[key] = hide(ground);
                hide(ground)();
                break;
            }
            case 'moshuiping': {
                const box = collideGroup.create(x, y, 'moshuiping') as Phaser.Physics.Arcade.Sprite;
                box.setDrag(1000, 10000);
                box.setGravityY(1000);
                box.type = 'box';
                onInsideView[key] = hide(box);
                onOutsideView[key] = show(box);
                break;
            }
            case 'piano': {
                const id = (extras as any).id;
                const button = overlapGroup.create(x, y, `button${id}`) as Phaser.Physics.Arcade.Sprite;
                button.setVisible(false);
                button.type = 'pianoAction';
                button.name = `piano${id}`;
                button.setData('play', () => {
                    pianoAudios[id - 1].play();
                    if (pianoPlay == null) return; // 已解锁
                    pianoPlay.push(id);
                    if (pianoPlay.length > 4) pianoPlay.shift();
                    if (pianoPlay.toString() !== pianoKeySeq) return;
                    const pianoPass = overlapGroup.create(2400, 3100, 'pianoPass') as Phaser.Physics.Arcade.Sprite;
                    pianoPass.setGravityY(500);
                    scene.physics.add.overlap(pianoPass, player, () => {
                        pianoPass.setVisible(false);
                        pianoPass.setActive(false);
                        pianoPass.body.checkCollision.none = true;
                        pianoPlay = null;
                    });
                });
                break;
            }
            case 'climbing': {
                const climbing = climbingGroup.create(x, y, key) as Phaser.Physics.Arcade.Sprite;
                climbing.setImmovable(true);
                climbing.setVisible(false);
                onInsideView[key] = hide(climbing);
                onOutsideView[key] = show(climbing);
            }
        }
    });
    return savepoints;
};

export const update = (scene: Phaser.Scene, time: number, delta: number) => {
    // .
};
