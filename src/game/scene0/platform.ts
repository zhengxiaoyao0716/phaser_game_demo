import * as mock from '../util/mock';
import { gameConfig } from 'src/App';
import asset from './asset';
import { controller } from '../player/controller';
import { initPlayer } from '.';
import { player } from '../player';

export let platforms: Phaser.Physics.Arcade.Group;
export let borders: Phaser.Physics.Arcade.StaticGroup;
export let deadlineZone: Phaser.Physics.Arcade.StaticGroup;
export let power: Phaser.Physics.Arcade.Group;

let mainImg : Phaser.GameObjects.Image;
let wechat : Phaser.GameObjects.Image;
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
    scene.load.image('power', asset.power);
};

export const create = (scene: Phaser.Scene) => {
    platforms = scene.physics.add.group();
    wechat = scene.add.image(gameConfig.width / 2, gameConfig.height / 2, 'wechat');
    wechat.setVisible(false);
    mainImg = scene.add.image(gameConfig.width / 2, gameConfig.height / 2, 'main');

    power = scene.physics.add.group();
    
    // create left border and right border
    createBorder(scene);
};

const createBorder = (scene: Phaser.Scene) => {
    const phoneWidth = 700;
    const deadlineY = 80;

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
    // 开场任意按键，开始游戏
    if(!start && controller && controller.key('any')) {
        console.log(controller, player);
        start = true;
        mainImg.setVisible(false);
        startGame(scene);
    }

    if(timeStart === undefined && start){
        timeStart = time;
    }
    
    // 过场动画后，才开始创建场景
    if(elapse(time) > 0){
        createMsg(scene, time);
    }
};

function startGame(scene: Phaser.Scene){
    wechat.setVisible(true);
    initPlayer(scene);
    scene.physics.add.collider(platforms, power);
    scene.physics.add.overlap(player, power, collectPower);
}

function collectPower (player: Phaser.Physics.Arcade.Sprite, p: Phaser.Physics.Arcade.Sprite)
{
    p.disableBody(true, true);
    powerLeft -= 1;
}

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
}

function createPlatform(scene: Phaser.Scene, msgInfo: Array<string | boolean>) {
    const type = msgInfo[0];
    const key = msgInfo[3] as string;
    
    const halfScreen = 345;

    const platform = platforms.create(0, 0, key, undefined, false, false) as Phaser.Physics.Arcade.Sprite;
    const w = platform.getTopRight().x - platform.getTopLeft().x;
    const h = platform.getBottomLeft().y - platform.getTopLeft().y;
    let x: number;
    const y = gameConfig.height + h / 2 + 100;
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

    if(type !== 'm') {
        const p = power.create(0, 0, 'power', undefined, true, true) as Phaser.Physics.Arcade.Sprite;
        const bound = w / 5;
    
        const px = x + bound - w / 2 + Math.random() * (w - bound * 2);
        p.setX(px).setY(gameConfig.height + 42);

        powerLeft =+ 1;
    }
}
