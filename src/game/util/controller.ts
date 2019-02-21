import Controller, { Logic } from 'src/controller';

export let controller: Controller;

export const create = (scene: Phaser.Scene) => controller = new Controller(new STGLogic(scene));

class STGLogic extends Logic {
    public update(time: number, delta: number): void {
        console.log(this.scene, time, delta, (controller.keys as any).up.get());
    }
}
