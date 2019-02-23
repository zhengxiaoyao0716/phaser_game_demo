import BaseController from 'src/controller';
import { player, status } from '../player';

export let controller: Controller;

export const create = (scene: Phaser.Scene) => controller = new Controller();

// const EPSILON = 0.01;

class Controller extends BaseController {
    public update(time: number, delta: number): void {
        const moveSpeed = controller.key('L') ? 100 : 300;
        const jumpSpeed = 500;
        const la = controller.axes('LA');
        player.setVelocityX(la[0] * moveSpeed);
        if (controller.key('A') && !status.jumping) {
            status.jumping = true;
            player.setVelocityY(-1 * jumpSpeed);
        }
    }
}
