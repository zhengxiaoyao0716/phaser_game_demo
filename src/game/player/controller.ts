import BaseController from 'src/controller';
import { player } from '../player';

export let controller: Controller;

export const create = (scene: Phaser.Scene) => controller = new Controller();

class Controller extends BaseController {
    public update(time: number, delta: number): void {
        const la = controller.axes('LA');
        const moveSpeed = controller.key('L') ? 100 : 300;
        player.setVelocityX(la[0] * moveSpeed);
        la[1] < 0 && player.setVelocityY(la[1] * 500);
    }
}
