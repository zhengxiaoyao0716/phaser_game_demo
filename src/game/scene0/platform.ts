import * as mock from '../util/mock';
import { gameConfig } from 'src/App';
import asset from './asset';

export let platforms: Phaser.Physics.Arcade.Group;
export let borders: Phaser.Physics.Arcade.StaticGroup;
export let deadlineZone: Phaser.Physics.Arcade.StaticGroup;
export let power: Phaser.Physics.Arcade.Group;
export let mainImg : Phaser.GameObjects.Image;
export let start = false;

const platformSpriteType = 'platformSprite';
export const isPlatform = (object: Phaser.GameObjects.GameObject): object is Phaser.Physics.Arcade.Sprite => {
    if (!(object instanceof Phaser.Physics.Arcade.Sprite)) return false;
    if (object.type !== platformSpriteType) return false;
    return true;
};

let timeStart: number;
const msg = [
    // 左边/右边/    没有碰撞体     会左右移动
    ['r', false, false, asset[1]],
    ['l', false, false, asset[2]],
    ['r', false, false, asset[3]],
    ['l', true, false, asset[4]],
];

let powerLeft = 0;

export const preload = (scene: Phaser.Scene) => {
    msg.forEach((arr, index) => {
        const key = arr[3] as string;
        scene.load.image(key, key);
    });
    scene.load.image('wechat', asset.wechat);
    scene.load.image('main', asset.main);
};

export const create = (scene: Phaser.Scene) => {
    platforms = scene.physics.add.group();
    mainImg = scene.add.image(gameConfig.width / 2, gameConfig.height / 2, 'main');
    
    // create left border and right border
    createBorder(scene);
};

const createBorder = (scene: Phaser.Scene) => {
    const phoneWidth = 401;
    const deadlineY = 100;

    const centerX = gameConfig.width / 2;

    const texture = mock.texture(scene);

    borders = scene.physics.add.staticGroup();

    const lBorder = 'lBorder';
    const rBorder = 'rBorder';
    const deadline = 'deadline';

    texture.shape(lBorder).rect(1, gameConfig.height);
    texture.shape(rBorder).rect(1, gameConfig.height);
    texture.shape(deadline).rect(gameConfig.width, 1);

    borders.create(centerX - phoneWidth / 2, gameConfig.height / 2, lBorder, undefined, false, true);
    borders.create(centerX + phoneWidth / 2, gameConfig.height / 2, rBorder, undefined, false, true);

    deadlineZone = scene.physics.add.staticGroup();
    deadlineZone.create(gameConfig.width / 2, deadlineY, deadline, undefined, false, true);
};

export const update = (scene: Phaser.Scene, time: number, delta: number) => {
    if(timeStart === undefined && start){
        timeStart = time;
    }
    
    // 过场动画后，才开始创建场景
    if(elapse(time) > 3){
        createMsg(scene, time);
    }
};

// sec from start
const elapse = (now: number) => {
    if(timeStart === undefined){
        return 0;
    }
    return (now - timeStart) / 1000;
};

function createMsg(scene: Phaser.Scene, time: number) {
    if(msg.length === 0)    return; // no msg left
    if(powerLeft > 0)   return;     // power to collect left

    const msgInfo = msg[0];

    createPlatform(scene, msgInfo);
    msg.shift();
    const type = msgInfo[0];
    if(type !== 'm') {
        powerLeft =+ 1;
    }
}

function createPlatform(scene: Phaser.Scene, msgInfo: Array<string | boolean>) {
    const type = msgInfo[0];
    const key = msgInfo[3] as string;
    
    const halfScreen = 200;

    const platform = platforms.create(0, 0, key, undefined, false, false) as Phaser.Physics.Arcade.Sprite;
    const w = platform.getTopRight().x - platform.getTopLeft().x;
    const h = platform.getBottomLeft().y - platform.getTopLeft().y;
    let x: number;
    const y = gameConfig.height + h / 2;
    switch (type) {
        case 'l':
            x = gameConfig.width / 2 - halfScreen + w / 2;
            break;
        case 'r':
            x = gameConfig.width / 2 + halfScreen - w / 2;
            break;
        case 'm':
            x = gameConfig.width / 2;
            break;
        default:
            x = 0;
    }
    platform.setX(x).setY(y);
    platform.setVelocityY(-100);
    platform.setImmovable();
    platform.setVisible(true);
    platform.setActive(true);
}
