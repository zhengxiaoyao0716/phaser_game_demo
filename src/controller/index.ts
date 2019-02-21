const defaultConfig = {
    domElement: document.body,
    enabled: true, moveSpeed: 5.0, jumpSpeed: 5.0, lookSpeed: 1.0, pitchSpeed: 0.5,
};
type DefaultConfig = typeof defaultConfig;

//#region gamepad

const gamepadMapper = {
    LA: [0, 0], RA: [0, 0],
    LB: false, RB: false, // 肩键
    LT: false, RT: false, // 肩背键
    L: false, R: false, // 摇杆按下
    up: false, down: false, left: false, right: false, // 左十字键
    A: false, B: false, X: false, Y: false, // 右四键
    select: false, start: false, // 中间两键
};
type GamepadMapper = typeof gamepadMapper;
// 手柄标识
const gamepad = {
    mapper: gamepadMapper as any,
    get leftAxes() {
        const gamepad = this._gamepad;
        return gamepad ? gamepad.axes.slice(0, 2) : [0, 0];
    },
    get rightAxes() {
        const gamepad = this._gamepad;
        return gamepad ? gamepad.axes.slice(2, 4) : [0, 0];
    },
    of(key: keyof GamepadMapper) {
        const code = this.mapper[key].code;
        if (this.hasOwnProperty(code)) {
            return this[code];
        }
        const gamepad = this._gamepad;
        return gamepad && gamepad.buttons[code].pressed;
    },

    get _gamepad() { return navigator.getGamepads()[0]; },
};
//#endregion

//#region keymouse

const keymouseMapper = {
    mainUp: false, mainDown: false, mainLeft: false, mainRight: false,
    ...gamepadMapper,
};
type KeymouseMapper = typeof keymouseMapper;
// 键鼠标识
const keymouse = {
    mapper: keymouseMapper as any,
    get mainAxes() {
        const x = (this.of('mainLeft') ? -1 : 0) + (this.of('mainRight') ? 1 : 0);
        const y = (this.of('mainUp') ? -1 : 0) + (this.of('mainDown') ? 1 : 0);
        const d = Math.sqrt(x ** 2 + y ** 2);
        return d === 0 ? null : [x / d, y / d];
    },
    _mouseAxes: [0, 0],
    get mouseAxes() { return this._mouseAxes; }, set mouseAxes([x, y]: number[]) {
        if (x === 0 && y === 0) {
            this._mouseAxes = [0, 0];
            return;
        }
        this._mouseAxes = [x / 100, y / 100];
    },
    of(key: keyof KeymouseMapper | 'clickLeft' | 'clickRight') {
        const code = this.mapper[key].code;
        return this[code] || this.buttons[code];
    },

    buttons: { clickLeft: false, clickRight: false/*, keyCode: pressed */ },
    pointerLocked: false,
};
//#endregion

//#region key status

// 绑定键位
const bindKeys = (self: { mapper: any }) =>
    (...binds: Array<[
        keyof (GamepadMapper | KeymouseMapper) | 'mainUp' | 'mainDown' | 'mainLeft' | 'mainRight',
        (number | 'leftAxes' | 'rightAxes' | 'mainAxes' | 'mouseAxes' | 'clickLeft' | 'clickRight')?,
        string?,
    ]>) => binds.forEach(([key, code, name]) => self.mapper[key] = { code, name: name || key });
const bindGamepad = bindKeys(gamepad);
const bindKeymouse = bindKeys(keymouse);
bindGamepad(
    ['LA', 'leftAxes'], ['RA', 'rightAxes'],
    ['LB', 4], ['RB', 5],
    ['LT', 6], ['RT', 7],
    ['L', 10], ['R', 11],
    ['up', 12], ['down', 13], ['left', 14], ['right', 15],
    ['A', 0], ['B', 1], ['X', 2], ['Y', 3],
    ['select', 8], ['start', 9],
);
bindKeymouse(
    ['mainUp', 87, 'KeyW'], ['mainDown', 83, 'KeyS'], ['mainLeft', 65, 'KeyA'], ['mainRight', 68, 'KeyD'],
    ['LA', 'mainAxes'], ['RA', 'mouseAxes'],
    ['LB', 'clickLeft', 'ClickLeft'], ['RB', 'clickRight', 'ClickRight'],
    ['LT', 17, 'ControlLeft'], ['RT', 32, 'Space'],
    ['L', 16, 'ShiftLeft'], ['R', 20, 'CapsLock'],
    ['up', 38, 'ArrowUp'], ['down', 40, 'ArrowDown'], ['left', 37, 'ArrowLeft'], ['right', 39, 'ArrowRight'],
    ['A'/*,  unused */], ['B'/*,  unused */], ['X', 81, 'KeyQ'], ['Y', 69, 'KeyE'],
    ['select', 27, 'Escape'], ['start', 13, 'Enter'],
);

// 键位状态
const keys = Object.keys({ ...gamepad.mapper }).map(key => [
    key, () => keymouse.of(key as any) || gamepad.of(key as any),
]).reduce((props, [key, get]) => ({ ...props, [key as string]: { get } }), {});
//#endregion

export default class Controller {
    protected readonly logic: Logic;
    public readonly domElement = defaultConfig.domElement;

    public moveSpeed = defaultConfig.moveSpeed;
    public jumpSpeed = defaultConfig.jumpSpeed;
    public lookSpeed = defaultConfig.lookSpeed;
    public pitchSpeed = defaultConfig.pitchSpeed;

    public readonly keys = keys; // TODO type it.

    constructor(logic: Logic, config?: DefaultConfig) {
        this.logic = logic;

        const self = {
            // readonly
            keys, gamepad, keymouse, bindGamepad, bindKeymouse,
            freePointerLock: () => (document as any).exitPointerLock(),
        };
        this.mount();
        config && Object.keys(config).forEach(name => {
            if (!self.hasOwnProperty(name)) {
                // tslint:disable-next-line: no-console
                console.warn(`ignored unsupport prop: ${name}.`);
                return;
            }
            this[name] = config[name];
        });
    }

    public readonly update = (time: number, delta: number) => this.logic.update(time, delta);

    //#region private.控制事件辅助

    //#region 鼠标事件

    private readonly onMouseDown = (event: MouseEvent) => {
        this.domElement.focus();
        if (!keymouse.pointerLocked) {
            (this.domElement as any).requestPointerLock();
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        const button = ['clickLeft', null, 'clickRight'][event.button];
        button && (keymouse.buttons[button] = true);
    }
    private readonly onMouseUp = (event: MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        const button = ['clickLeft', null, 'clickRight'][event.button];
        button && (keymouse.buttons[button] = false);
    }
    private readonly onMouseMove = (event: MouseEvent) => keymouse.mouseAxes = [event.movementX, event.movementY];
    private readonly onPointerLockChange = () => {
        if ((document as any).pointerLockElement === this.domElement) {
            keymouse.pointerLocked = true;
            this.domElement.parentElement!.classList.add('pointer-locked');
            this.domElement.addEventListener('mousemove', this.onMouseMove, false);
            return;
        }
        keymouse.pointerLocked = false;
        this.domElement.parentElement!.classList.remove('pointer-locked');
        this.domElement.removeEventListener('mousemove', this.onMouseMove, false);
    }
    //#endregion

    //#region 键盘事件

    private readonly onKeyDown = (event: KeyboardEvent) => {
        if (!keymouse.pointerLocked) {
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        keymouse.buttons[event.keyCode] = true;
    }
    private readonly onKeyUp = (event: KeyboardEvent) => {
        if (!keymouse.pointerLocked) {
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        keymouse.buttons[event.keyCode] = false;
    }
    //#endregion

    //#region 手柄事件

    private readonly onGamepadConnect = (event: GamepadEvent) => {
        // tslint:disable-next-line: no-console
        console.info('Gamepad connected at index %d: %s. %d buttons, %d axes.',
            event.gamepad.index, event.gamepad.id,
            event.gamepad.buttons.length, event.gamepad.axes.length,
        );
    }
    private readonly onGamepadDisconnect = (event: GamepadEvent) => {
        // if (gamepad == e.gamepad) {
        //     gamepad = null;
        // }
        // tslint:disable-next-line: no-console
        console.info('Gamepad disconnected from index %d: %s', event.gamepad.index, event.gamepad.id);
    }
    //#endregion

    private readonly contextmenu = (event: MouseEvent) => event.preventDefault();
    private readonly mountHelp = (mount: boolean) => () => {
        const action = `${mount ? 'add' : 'remove'}EventListener`;

        this.domElement[action]('contextmenu', this.contextmenu, false);
        this.domElement[action]('mousedown', this.onMouseDown, false);
        this.domElement[action]('mouseup', this.onMouseUp, false);

        document[action]('pointerlockchange', this.onPointerLockChange, false);

        window[action]('keydown', this.onKeyDown, false);
        window[action]('keyup', this.onKeyUp, false);
        window[action]('gamepadconnected', this.onGamepadConnect, false);
        window[action]('gamepaddisconnected', this.onGamepadDisconnect, false);
    }
    //#endregion

    public readonly mount = this.mountHelp(true);
    public readonly unmount = this.mountHelp(false);
    public readonly freePointerLock = () => (document as any).exitPointerLock();
}

export abstract class Logic {
    protected scene: Phaser.Scene;
    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    public abstract update(time: number, delta: number): void;
}
