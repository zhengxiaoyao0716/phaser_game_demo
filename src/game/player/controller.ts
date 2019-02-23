import BaseController from 'src/controller';
import { player, status } from '../player';
import { playerHang, playerDown, playerUp } from './anim';

export let controller: Controller;

export const create = (scene: Phaser.Scene) => controller = new Controller();

const EPSILON = 0.01;

class Controller extends BaseController {
    public update(time: number, delta: number): void {
        const moveSpeed = controller.key('L') ? 100 : 300;
        const jumpSpeed = 500;
        const la = controller.axes('LA');
        if (la[0] > -EPSILON && la[0] < EPSILON) {
            player.setVelocityX(0);
            status.jumping || playerHang(); // 非跳跃中播放休息动画
        } else {
            player.setVelocityX(la[0] * moveSpeed);
            if (status.jumping) {
                player.body.velocity.y < 0 ? playerUp() : playerDown();
            } else { // 非跳跃中播放行走动画
                player.anims.play(la[0] < 0 ? 'playerLeft' : 'playerRight', true);
            }
        }
        if (player.body.touching.down) {
            status.jumping = false;
            if (controller.key('A') && !status.jumping) {
                status.jumping = true;
                player.setVelocityY(-1 * jumpSpeed);
            }
        }
    }
}
