import * as mock from '../util/mock';
import { status } from '.';

export let savepointGroup: Phaser.Physics.Arcade.Group;
let savepoints: Phaser.GameObjects.Image[];
export const savedPosition = (): [number, number] => savepoints[status.savedpoint].getData('position');

const savepointType = 'savepoint';

export default {
    preload: (scene: Phaser.Scene) => {
        const texture = mock.texture(scene);
        texture.shape('savepoint', { fill: { color: 0x0000FF } }).trian(60, 60, 30);
    },
    create: (scene: Phaser.Scene, positions: Array<[number, number, boolean?]>) => {
        savepointGroup = scene.physics.add.group();
        savepoints = positions.map(([x, y, active], index) => {
            const point = savepointGroup.create(x, y, 'savepoint') as Phaser.Physics.Arcade.Sprite;
            point.type = savepointType;
            point.name = `${savepointType}${index}`;
            point.setData('index', index);
            point.setData('position', [x, y]);
            if (active != null) {
                point.visible = active;
                point.active = active;
            }
            return point;
        });
    },
};
