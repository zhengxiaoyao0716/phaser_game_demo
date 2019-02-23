import BaseController, { ControllerConfig } from 'src/controller';
import { player, status } from '../player';
import { playerHang, playerDown, playerUp } from './anim';

export let controller: Controller;

export const create = (game: Phaser.Game) => controller = new Controller(game);

const EPSILON = 0.01;

class Controller extends BaseController {
    public game: Phaser.Game;
    constructor(game: Phaser.Game, config?: ControllerConfig) {
        super(config);
        this.game = game;
    }
    public update(time: number, delta: number): void {
        this.updateAction(time, delta);
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

    public updateAction(time: number, delta: number): any {
        const { nearPoint, savedAt } = status.save;
        status.save.nearPoint = -1;
        if (nearPoint !== -1 && nearPoint !== savedAt) {
            this.key('A') && console.log('saved');
            status.save.savedAt = nearPoint;
            return true;
        }
    }
}
