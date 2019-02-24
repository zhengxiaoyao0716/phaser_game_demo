import BaseController, { ControllerConfig } from 'src/controller';
import { player, status } from '../player';
import { playerIdle, playerDown, playerUp, playerLeft, playerRight } from './anim';
import { toast } from '..';
import { onChangeView } from '../scene1/map';
import { isScene1 } from '../scene1';

export let controller: Controller;

/**
 * 这个缓存状态会0.1s去抖动重置
 */
export let frameStatus: {
    savepoint?: number, // 附近的保存点，-1代表不在附近
    climbing?: boolean, // 在可攀爬处？
    overlap?: Phaser.Physics.Arcade.Sprite, // （scene1里）重叠的物体
} = new Proxy({}, {
    get: (target, name, _receiver) => {
        return target[name] && target[name].value;
    },
    set: (target, name, value, _receiver) => {
        target[name] && target[name].timeout && clearTimeout(target[name].timeout);
        const timeout = setTimeout(() => target[name] = null, 100);
        target[name] = { value, timeout };
        return true;
    },
});

export const create = (game: Phaser.Game) => controller = new Controller(game, {
    domElement: game.domContainer,
    onFocus: (locked: boolean) => locked ? game.scale.startFullscreen() : game.scale.stopFullscreen(),
});

const EPSILON = 0.01;
const jumpSpeed = 1000;

class Controller extends BaseController {
    public game: Phaser.Game;
    private enable = true;
    constructor(game: Phaser.Game, config?: ControllerConfig) {
        super(config);
        this.game = game;
    }
    public update(time: number, delta: number): void {
        const la = controller.axes('LA');
        const moveSpeed = 100;
        const jumpSpeed = isScene1 ? 1500 : 600;
        // const wallingJumpSpeed = 2000;
        const dump = 0.8;
        let speedX = player.body.velocity.x;

        if (la[0] > -EPSILON && la[0] < EPSILON) {
            player.setVelocityX(0);
            status.jumping || playerIdle(); // 非跳跃中播放休息动画
        } else {
            if (player.body.velocity.y >= 0 || !status.walling) {
                speedX = speedX + la[0] * moveSpeed;
                player.setVelocityX(speedX);
            }
            if (status.jumping) {
                player.body.velocity.y < 0 ? playerUp() : playerDown();
            } else { // 非跳跃中播放行走动画
                la[0] < 0 ? playerLeft() : playerRight();
            }
        }
        speedX = speedX * dump;
        player.setVelocityX(speedX);

        const cooldown = this.updateAction(time, delta);
        if (cooldown > 0) { // 如果有交互那么拦截跳跃
            this.enable = false;
            setTimeout(() => this.enable = true, cooldown); // 关键动作降频操作
            return;
        }
        if (!this.enable) return;
        const buttonA = controller.key('A');
        const { down/*, left, right*/ } = player.body.touching;
        if (down) {
            status.jumping = false;
            status.walling = false;
            player.setVelocityY(0);
            if (buttonA && !status.jumping) {
                status.jumping = true;
                player.setVelocityY(-jumpSpeed);
            }
        }
        // if (left && buttonA && la[0] < -EPSILON) {
        //     status.walling = true;
        //     player.setVelocity(1 * wallingJumpSpeed, -jumpSpeed * 3 / 4);
        // }
        // if (right && buttonA && la[0] > EPSILON) {
        //     status.walling = true;
        //     player.setVelocity(-1 * wallingJumpSpeed, -jumpSpeed * 3 / 4);
        // }
    }

    public updateAction(time: number, delta: number): number {
        if (status.canChangeView) {
            const pressedB = this.key('B');
            if (pressedB) {
                status.canChangeView = false;
                setTimeout(() => status.canChangeView = true, 1500);
                onChangeView();
            }
        }
        const pressedA = this.key('A');
        if (frameStatus.climbing) {
            const la = controller.axes('LA');
            if (la[1] < -EPSILON || la[1] > EPSILON) {
                const x = player.x;
                const y = player.y;
                player.setVelocityX(0);
                player.setPosition(x, y + 0.2 * la[1] * delta);
            }
            if (pressedA) {
                player.setVelocityY(-jumpSpeed / 3);
            } else {
                player.setVelocityY(0);
            }
            return 500;
        }
        if (!this.enable) return 0;
        if (frameStatus.savepoint && frameStatus.savepoint !== status.savedpoint && pressedA) {
            status.savedpoint = frameStatus.savepoint;
            toast.center('游戏进度已保存', 1000);
            return 500;
        }
        if (frameStatus.overlap && pressedA) {
            const object = frameStatus.overlap;
            if (object.type === 'pianoAction') {
                const play = object.getData('play');
                object.setVisible(true);
                play && play();
                setTimeout(() => object.setVisible(false), 500);
                return 1000;
            }
            const pressedTip = object.getData('pressedTip');
            pressedTip && toast.center(pressedTip, 1000);
            object.setActive(false);
            return 500;
        }
        return 0;
    }
}
