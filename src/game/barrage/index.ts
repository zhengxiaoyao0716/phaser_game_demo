import * as mock from '../util/mock';

export let barrage: Phaser.Physics.Arcade.Group;

const colors = [0xEE0000, 0x00EE00, 0x0000EE, 0xEEEE00, 0x00EEEE, 0xEE00EE];
const shapes: Array<(size: number) => (
    ['circle', [number]] |
    ['rect', [number, number]] |
    ['trian', [number, number, number]]
)> = [
        (size: any) => ['circle', [size]],
        (size: any) => ['rect', [size, size]],
        (size: number) => ['trian', [size, size, size / 2]],
    ];
const random = new Phaser.Math.RandomDataGenerator();
const bullets: Phaser.Physics.Arcade.Sprite[] = [];

const bulletSpriteType = 'bulletSprite';
export const isBullet = (object: Phaser.GameObjects.GameObject): object is Phaser.Physics.Arcade.Sprite => {
    if (!(object instanceof Phaser.Physics.Arcade.Sprite)) return false;
    if (object.type !== bulletSpriteType) return false;
    return true;
};

export const preload = (scene: Phaser.Scene) => {
    // nothind.
};

export const create = (scene: Phaser.Scene) => {
    barrage = scene.physics.add.group();
    const texture = mock.texture(scene);

    bullets.push(...new Array(30).fill(null).map((_, index) => {
        const key = `bulletShape${index}`;

        const color = random.pick(colors);
        const shape = texture.shape(key, { fill: { color }, line: { width: 1, color } });

        const size = random.integerInRange(2, 6);
        const builder = random.pick(shapes)(size);
        (shape[builder[0]] as any)(...builder[1]);

        const bullet = barrage.create(-1, -1, key, undefined, false) as Phaser.Physics.Arcade.Sprite;
        bullet.type = bulletSpriteType;
        bullet.name = `bulletSpriteType${index}`;

        (bullet.body as Phaser.Physics.Arcade.Body).onWorldBounds = true;
        bullet.setCollideWorldBounds(true);
        bullet.setActive(false);
        bullet.setVisible(false);

        return bullet;
    }));

    scene.physics.world.on('worldbounds', (body: Phaser.Physics.Arcade.Body) => {
        if (!isBullet(body.gameObject)) return;
        const bullet = body.gameObject;
        bullet.setActive(false);
        bullet.setVisible(false);
    });
};

export const update = (scene: Phaser.Scene, time: number, delta: number) => {
    if (random.frac() < 0.9) return;
    const inactived = bullets.filter(bullet => !bullet.active);
    const bullet = random.pick(inactived);
    const v = random.realInRange(150, 500);
    bullet.setRandomPosition(0, 0, scene.game.renderer.width, 30);
    bullet.setVelocityY(v);
    bullet.setVisible(true);
    bullet.setActive(true);
};
