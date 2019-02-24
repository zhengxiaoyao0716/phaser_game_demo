import * as mock from '../util/mock';
import { gameConfig } from 'src/App';
import asset from './asset';
import { controller, frameStatus } from '../player/controller';
import { initPlayer } from '.';
import { player } from '../player';
import {canStart} from '../index';

export let platforms: Phaser.Physics.Arcade.Group;
const platformsSprite = new Array<Phaser.Physics.Arcade.Sprite>();
export let borders: Phaser.Physics.Arcade.StaticGroup;
export let deadlineZone: Phaser.Physics.Arcade.StaticGroup;
let powerDeadlineZone: Phaser.Physics.Arcade.StaticGroup;
export let power: Phaser.Physics.Arcade.Group;
const powerSprite = new Array<Phaser.Physics.Arcade.Sprite>();

let mainImg : Phaser.GameObjects.Image;
let wechat : Phaser.GameObjects.Image;
let wechatBorder : Phaser.GameObjects.Image;
export let start = false;
let end = false;

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
    ['l', false, false, asset[4]],
    ['r', false, true, asset[5]],
    ['l', false, false, asset[6]],
    ['r', false, false, asset[7]],
    ['l', false, false, asset[8]],
    ['r', false, false, asset[9]],
    ['l', false, false, asset[10]],
    ['r', false, false, asset[11]],
    ['l', false, false, asset[12]],
    ['r', false, false, asset[13]],
    ['l', false, false, asset[14]],
    ['r', false, false, asset[15]],
    ['l', false, false, asset[16]],
    ['r', false, false, asset[17]],
    ['l', false, false, asset[18]],
];
let msgIndex = 0;
export let powerIndex = 0;

export const preload = (scene: Phaser.Scene) => {
    msg.forEach((arr, index) => {
        const key = arr[3] as string;
        scene.load.image(key, key);
    });
    scene.load.image('wechat', asset.wechat);
    scene.load.image('main', asset.main);
    scene.load.image('power', asset.power);
    scene.load.image('wechat_border', asset.wechat_border);
};

export const create = (scene: Phaser.Scene) => {
    wechat = scene.add.image(gameConfig.width / 2, gameConfig.height / 2, 'wechat');
    wechat.setVisible(false);
    mainImg = scene.add.image(gameConfig.width / 2, gameConfig.height / 2, 'main');

    platforms = scene.physics.add.group();

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
    const pDeadline = 'powerDeadline';

    texture.shape(lBorder).rect(1, gameConfig.height);
    texture.shape(rBorder).rect(1, gameConfig.height);
    texture.shape(deadline).rect(gameConfig.width, 1);
    texture.shape(pDeadline).rect(gameConfig.width, 1);

    borders.create(centerX - phoneWidth / 2, gameConfig.height / 2, lBorder, undefined, false, true);
    borders.create(centerX + phoneWidth / 2, gameConfig.height / 2, rBorder, undefined, false, true);

    deadlineZone = scene.physics.add.staticGroup();
    deadlineZone.create(gameConfig.width / 2, deadlineY, deadline, undefined, false, true);
    deadlineZone.create(gameConfig.width / 2, gameConfig.height, deadline, undefined, false, true);
    
    powerDeadlineZone = scene.physics.add.staticGroup();
    powerDeadlineZone.create(gameConfig.width / 2, 0, pDeadline, undefined, false, true);
};

export const update = (scene: Phaser.Scene, time: number, delta: number) => {
    // 开场任意按键，开始游戏
    if(canStart && !start && controller && controller.key('any')) {
        start = true;
        mainImg.setVisible(false);
        mainImg.destroy();
        startGame(scene);
    }

    if(timeStart === undefined && start){
        timeStart = time;
        frameStatus.createMsgPlatform = true;
    }
    
    // 过场动画后，才开始创建场景
    if(elapse(time) > 0){
        createMsg(scene);
    }

    if(powerIndex >= 18){
        endGame(scene);
    }

    iter();
};

function startGame(scene: Phaser.Scene){
    wechat.setVisible(true);
    initPlayer(scene);
    scene.physics.add.collider(platforms, power);
    scene.physics.add.collider(platforms, borders, reverseVelocity);

    scene.physics.add.overlap(player, power, collectPower);
    scene.physics.add.overlap(power, powerDeadlineZone, destroyPower);

    wechat.setScale(0.8);
}

let wechatIter = -1;
function iter() {
    if(wechatIter >= 0){
        wechatIter += 0.01;
        wechat.setScale(0.8);
    }
}

function endGame(scene: Phaser.Scene){
    end = true;
    player.setVelocity(0, 0);
    player.setGravity(0);
}

function reverseVelocity(platform: Phaser.Physics.Arcade.Sprite, border: Phaser.Physics.Arcade.Sprite){
    const v = platform.body.velocity.x;
    if(v !== 0){
        platform.setVelocityX(-v);
    }
}

function collectPower (player: Phaser.Physics.Arcade.Sprite, p: Phaser.Physics.Arcade.Sprite){
    p.disableBody(true, true);
    p.destroy();
    frameStatus.createMsgPlatform = true;
    powerIndex+=1;
}

function destroyPower (p: Phaser.Physics.Arcade.Sprite, d: Phaser.Physics.Arcade.Sprite){
    p.disableBody(true, true);
    p.destroy();
    frameStatus.createMsgPlatform = true;
}

export function revive(){
    clearAll();
    msgIndex = 0;
    frameStatus.createMsgPlatform = true;
}

function clearAll(){
        // 清空平台
        platformsSprite.forEach( s => {
            s.setVisible(false);
            s.destroy();
        });
        platforms.clear();
    
        // 清空电池
        powerSprite.forEach( s => {
            s.setVisible(false);
            s.destroy();
        });
        power.clear();
}

// sec from start
const elapse = (now: number) => {
    if(timeStart === undefined){
        return 0;
    }
    return (now - timeStart) / 1000;
};

function createMsg(scene: Phaser.Scene) {
    if(end === true)   return;
    if(frameStatus === undefined)   return;
    if(frameStatus.createMsgPlatform !== true)  return;
    if(msgIndex >= msg.length)    return; // no msg left

    let msgInfo = msg[msgIndex];

    if(msgIndex >= 2){
        createPlatform(scene, msgInfo, 0);
    } else {
        createPlatform(scene, msgInfo, 700);
        msgInfo = msg[msgIndex];
        createPlatform(scene, msgInfo, 1000);
    }
}

function createPlatform(scene: Phaser.Scene, msgInfo: Array<string | boolean>, y: number) {
    const type = msgInfo[0];
    const key = msgInfo[3] as string;
    const move = msgInfo[2] as boolean;
    
    const halfScreen = 340;

    const platform = platforms.create(0, 0, key, undefined, false, false) as Phaser.Physics.Arcade.Sprite;
    platformsSprite.push(platform);
    const w = platform.getTopRight().x - platform.getTopLeft().x;
    const h = platform.getBottomLeft().y - platform.getTopLeft().y;
    let x: number;
    if(y <= 0){
        y = gameConfig.height + h / 2 + 100;
    }
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
    
    if(move){
        platform.setFriction(1, 0);
        platform.setVelocityX(-100);
    }

    if(type !== 'm') {
        const p = power.create(0, 0, 'power', undefined, true, true) as Phaser.Physics.Arcade.Sprite;
        powerSprite.push(p);
        const bound = w / 5;
    
        const px = x + bound - w / 2 + Math.random() * (w - bound * 2);
        p.setX(px).setY(y - h / 2 - 58)
        .setGravityY(100);
    }

    if(wechatBorder !== undefined){
        wechatBorder.setVisible(false);
        wechatBorder.destroy();
    }
    wechatBorder = scene.add.image(gameConfig.width / 2, gameConfig.height / 2, 'wechat_border');

    frameStatus.createMsgPlatform = false;
    msgIndex += 1;
}
