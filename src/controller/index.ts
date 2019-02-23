//#region 按键映射

const gamepadKeyMapper = {
    LB: false, RB: false, // 肩键
    LT: false, RT: false, // 肩背键
    L: false, R: false, // 摇杆按下
    up: false, down: false, left: false, right: false, // 左十字键
    A: false, B: false, X: false, Y: false, // 右四键
    select: false, start: false, // 中间两键
};
const gamepadAxesMapper = {
    LA: [0, 0], RA: [0, 0],
};
const gamepadMapper = {
    ...gamepadAxesMapper,
    ...gamepadKeyMapper,
};
type GamepadMapper = typeof gamepadMapper;

const keymouseMapper = {
    mainUp: false, mainDown: false, mainLeft: false, mainRight: false,
    ...gamepadMapper,
};
type KeymouseMapper = typeof keymouseMapper;
//#endregion

//#region 绑定键位

const bindKeys = (self: { mapper: any }) =>
    (...binds: Array<[
        keyof (GamepadMapper | KeymouseMapper) | 'mainUp' | 'mainDown' | 'mainLeft' | 'mainRight',
        (number | 'leftAxes' | 'rightAxes' | 'mainAxes' | 'mouseAxes' | 'clickLeft' | 'clickRight')?,
        string?,
    ]>) => binds.forEach(([key, code, name]) => self.mapper[key] = { code, name: name || key });
const gamepadBinder = [
    ['LA', 'leftAxes'], ['RA', 'rightAxes'],
    ['LB', 4], ['RB', 5],
    ['LT', 6], ['RT', 7],
    ['L', 10], ['R', 11],
    ['up', 12], ['down', 13], ['left', 14], ['right', 15],
    ['A', 0], ['B', 1], ['X', 2], ['Y', 3],
    ['select', 8], ['start', 9],
];
const keymouseBinder = [
    ['mainUp', 87, 'KeyW'], ['mainDown', 83, 'KeyS'], ['mainLeft', 65, 'KeyA'], ['mainRight', 68, 'KeyD'],
    ['LA', 'mainAxes'], ['RA', 'mouseAxes'],
    ['LB', 'clickLeft', 'ClickLeft'], ['RB', 'clickRight', 'ClickRight'],
    ['LT', 17, 'ControlLeft'], ['RT'/*,  unused */],
    ['L', 16, 'ShiftLeft'], ['R', 20, 'CapsLock'],
    ['up', 38, 'ArrowUp'], ['down', 40, 'ArrowDown'], ['left', 37, 'ArrowLeft'], ['right', 39, 'ArrowRight'],
    ['A', 32, 'Space'], ['B'/*,  unused */], ['X', 81, 'KeyQ'], ['Y', 69, 'KeyE'],
    ['select', 27, 'Escape'], ['start', 13, 'Enter'],
];
//#endregion

export interface ControllerConfig {
    domElement?: HTMLElement;
    onFocus?: (locked: boolean) => void;
}

export default abstract class Controller {
    public readonly domElement = document.body;
    private readonly onFocus = (locked: boolean) => {
        locked ? this.domElement.requestFullscreen() : document.exitFullscreen();
    }

    constructor(config?: ControllerConfig) {
        if (config) {
            config.domElement && (this.domElement = config.domElement);
            config.onFocus && (this.onFocus = config.onFocus);
        }

        this.bindGamepad(...gamepadBinder as any);
        this.bindKeymouse(...keymouseBinder as any);
        this.mount();
    }

    /**
     * 控制器每帧更新.
     * @param time 当前游戏经过时长.
     * @param delta 上一帧到当前帧时长.
     */
    public abstract update(time: number, delta: number): void;

    //#region private.手柄键盘辅助

    private readonly gamepad = {
        mapper: { ...gamepadMapper as any },
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

    private readonly keymouse = {
        mapper: { ...keymouseMapper as any },
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

    private readonly keys = Object.keys({ ...this.gamepad.mapper }).map(key => [
        key, () => this.keymouse.of(key as any) || this.gamepad.of(key as any),
    ]).reduce((props, [key, get]) => ({ ...props, [key as string]: { get } }), {});
    //#endregion

    public readonly bindGamepad = bindKeys(this.gamepad);
    public readonly bindKeymouse = bindKeys(this.keymouse);

    public key(key: keyof typeof gamepadKeyMapper): boolean { return this.keys[key].get(); }
    public axes(key: keyof typeof gamepadAxesMapper): [number, number] { return this.keys[key].get(); }

    //#region private.控制事件辅助

    //#region 鼠标事件

    private readonly onMouseDown = (event: MouseEvent) => {
        this.domElement.focus();
        if (!this.keymouse.pointerLocked) {
            (this.domElement as any).requestPointerLock();
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        const button = ['clickLeft', null, 'clickRight'][event.button];
        button && (this.keymouse.buttons[button] = true);
    }
    private readonly onMouseUp = (event: MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        const button = ['clickLeft', null, 'clickRight'][event.button];
        button && (this.keymouse.buttons[button] = false);
    }
    private readonly onMouseMove = (event: MouseEvent) => this.keymouse.mouseAxes = [event.movementX, event.movementY];
    private readonly onPointerLockChange = () => {
        if ((document as any).pointerLockElement === this.domElement) {
            this.keymouse.pointerLocked = true;
            this.onFocus(true);
            this.domElement.parentElement!.classList.add('pointer-locked');
            this.domElement.addEventListener('mousemove', this.onMouseMove, false);
            return;
        }
        this.onFocus(false);
        this.keymouse.pointerLocked = false;
        this.domElement.parentElement!.classList.remove('pointer-locked');
        this.domElement.removeEventListener('mousemove', this.onMouseMove, false);
    }
    //#endregion

    //#region 键盘事件

    private readonly onKeyDown = (event: KeyboardEvent) => {
        if (!this.keymouse.pointerLocked) {
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        this.keymouse.buttons[event.keyCode] = true;
    }
    private readonly onKeyUp = (event: KeyboardEvent) => {
        if (!this.keymouse.pointerLocked) {
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        this.keymouse.buttons[event.keyCode] = false;
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

    /**
     * 挂载控制器，初始化完成时会默认挂载一次.
     */
    public readonly mount = this.mountHelp(true);

    /**
     * 卸载控制器.
     */
    public readonly unmount = this.mountHelp(false);

    /**
     * 释放光标.
     */
    public readonly freePointerLock = () => (document as any).exitPointerLock();
}
