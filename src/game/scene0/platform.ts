import * as mock from '../util/mock';
import { gameConfig } from 'src/App';

export let platform: Phaser.Physics.Arcade.Group;

const messages: Phaser.Physics.Arcade.Sprite[] = [];
const platformSpriteType = 'platformSprite';
export const isPlatform = (object: Phaser.GameObjects.GameObject): object is Phaser.Physics.Arcade.Sprite => {
    if (!(object instanceof Phaser.Physics.Arcade.Sprite)) return false;
    if (object.type !== platformSpriteType) return false;
    return true;
};

export const preload = (scene: Phaser.Scene) => {
    // nothind.
};

export const create = (scene: Phaser.Scene) => {
    const platformWidth = 600;
    const platformHeight = 50;
    const platformLeft = 300;
    const platfromRight = gameConfig.width - platformLeft - platformWidth / 2;

    const platformDefine = [
        [platformLeft, 400],
        [platfromRight, 600],
        [platformLeft, 800],
        [platfromRight, 1000],
        [platformLeft, 1200],
        [platfromRight, 1400],
        [platformLeft, 1600],
    ];

    platform = scene.physics.add.group();
    const texture = mock.texture(scene);

    messages.push(...platformDefine.map(([x, y], index) => {
        const key = `bulletShape${index}`;

        texture.shape(key, { fill: { color: 0x0000FF } }).rect(platformWidth, platformHeight);

        const message = platform.create(-1, -1, key, undefined, false) as Phaser.Physics.Arcade.Sprite;
        message.type = platformSpriteType;
        message.name = `${platformSpriteType}${index}`;
        message.setImmovable(true);

        message.setActive(false);
        message.setVisible(false);

        message.setPosition(200 + x, y);
        message.setVelocityY(-100);
        message.setVisible(true);
        message.setActive(true);

        return message;
    }));
};

export const update = (scene: Phaser.Scene, time: number, delta: number) => {
    // TODO .
};
