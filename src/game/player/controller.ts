import BaseController from 'src/controller';
import { player, status } from '../player';
import { playerHang, playerDown, playerUp } from './anim';

export let controller: Controller;

export const create = (scene: Phaser.Scene) => controller = new Controller();

const EPSILON = 0.01;

class Controller extends BaseController {
    public update(time: number, delta: number): void {
        const la = controller.axes('LA');
        const buttonA = controller.key('A');
        const moveSpeed = controller.key('L') ? 40 : 60;
        const jumpSpeed = 1000;
        const wallingJumpSpeed = 1000;
        const dump = 0.8;
        let speedX = player.body.velocity.x;
        if (la[0] > -EPSILON && la[0] < EPSILON) {
            player.setVelocityX(0);
            status.jumping || playerHang(); // 非跳跃中播放休息动画
        } else {
            if (player.body.velocity.y >= 0 || !status.walling) {
                speedX = speedX + la[0] * moveSpeed;
                player.setVelocityX(speedX);
            }
            if (status.jumping) {
                player.body.velocity.y < 0 ? playerUp() : playerDown();
            } else { // 非跳跃中播放行走动画
                player.anims.play(la[0] < 0 ? 'playerLeft' : 'playerRight', true);
            }
        }
        speedX = speedX * dump;
        player.setVelocityX(speedX);

        const { down, left, right } = player.body.touching;
        if (down) {
            status.jumping = false;
            status.walling = false;
            player.setVelocityY(0);
            if (buttonA && !status.jumping) {
                status.jumping = true;
                player.setVelocityY(-jumpSpeed);
            }
        }
        if (left && buttonA && la[0] < -EPSILON) {
            status.walling = true;
            player.setVelocity(1 * wallingJumpSpeed, -jumpSpeed);
        }
        if (right && buttonA && la[0] > EPSILON) {
            status.walling = true;
            player.setVelocity(-1 * wallingJumpSpeed, -jumpSpeed);
        }
    }
}
