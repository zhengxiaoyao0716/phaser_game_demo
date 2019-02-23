import BaseController, { ControllerConfig } from 'src/controller';
import { player, status } from '../player';
import { playerHang, playerDown, playerUp } from './anim';
import { toast } from '..';

export let controller: Controller;

export const create = (game: Phaser.Game) => controller = new Controller(game, {
    domElement: game.domContainer,
    onFocus: (locked: boolean) => locked ? game.scale.startFullscreen() : game.scale.stopFullscreen(),
});

const EPSILON = 0.01;

class Controller extends BaseController {
    public game: Phaser.Game;
    constructor(game: Phaser.Game, config?: ControllerConfig) {
        super(config);
        this.game = game;
    }
    public update(time: number, delta: number): void {
        const la = controller.axes('LA');
        const moveSpeed = controller.key('L') ? 40 : 60;
        const jumpSpeed = 1000;
        const wallingJumpSpeed = 1000;
        const dump = 0.8;
        let speedX = player.body.velocity.x;
        const ropeing = status.ropeing;
        status.ropeing = false;
        if (ropeing) {
            if (la[1] < -EPSILON || la[1] > EPSILON) {
                player.setVelocityX(0);
                player.setGravityY(0);
                const x = player.body.position.x;
                const y = player.body.position.y;
                console.log(x, y, player.body.velocity.x);
                player.setVelocityY(la[1] * 200);
            }
            else {
                player.setVelocityY(0);
            }

            if (player.body.touching.down) {
                player.setGravityY(5000);
                status.ropeing = false;
            }

            return;
        }
        // else
        // {
        //     player.setGravityY(5000);
        // }

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

        if (this.updateAction(time, delta)) { // 如果有交互那么拦截跳跃
            return;
        }
        const buttonA = controller.key('A');
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

    public updateAction(time: number, delta: number): any {
        console.log(this.key('any'));
        const pressedA = this.key('A');
        const { nearPoint, savedAt } = status.save;
        status.save.nearPoint = -1;
        if (nearPoint !== -1 && nearPoint !== savedAt && pressedA) {
            status.save.savedAt = nearPoint;
            toast.center('游戏进度已保存', 1000);
            return true;
        }
    }
}
