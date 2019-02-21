export const texture = (scene: Phaser.Scene) => ({
    shape: (
        key: string,
        { fill, line }: {
            fill?: {
                color?: number,
                alpha?: number,
            },
            line?: { lineWidth: number, color: number, alpha?: number },
        } = {},
    ) => {
        const newGraphics = () => {
            const graphics = new Phaser.GameObjects.Graphics(scene);
            fill && fill.color && graphics.fillStyle(fill.color, fill.alpha);
            line && graphics.lineStyle(line.lineWidth, line.color, line.alpha);
            return graphics;
        };
        return {
            ellipseShape: (shape: Phaser.Geom.Ellipse, smoothness?: integer) => newGraphics()
                .fillEllipseShape(shape, smoothness)
                .strokeEllipseShape(shape, smoothness)
                .generateTexture(key, 2 * shape.width, 2 * shape.height),
            ellipse(width: number, height: number, smoothness?: integer) {
                return this.ellipseShape(new Phaser.Geom.Ellipse(width, height, width, height), smoothness);
            },
            circleShape: (shape: Phaser.Geom.Circle) => newGraphics()
                .fillCircleShape(shape)
                .strokeCircleShape(shape)
                .generateTexture(key, 2 * shape.radius, 2 * shape.radius),
            circle(radius: number) {
                return this.circleShape(new Phaser.Geom.Circle(radius, radius, radius));
            },
            rectShape: (shape: Phaser.Geom.Rectangle) => newGraphics()
                .fillRectShape(shape)
                .strokeRectShape(shape)
                .generateTexture(key, shape.width, shape.height),
            rect(width: number, height: number) {
                return this.rectShape(new Phaser.Geom.Rectangle(0, 0, width, height));
            },
            trianShape: (shape: Phaser.Geom.Triangle) => newGraphics()
                .fillTriangleShape(shape)
                .strokeTriangleShape(shape)
                .generateTexture(key, shape.right, shape.bottom),
            trian(width: number, height: number, sharp: number) {
                return this.trianShape(new Phaser.Geom.Triangle(sharp, 0, 0, height, width, height));
            },
        };
    },
    text: (key: string, value: string, style?: { color: string | number | InputColorObject }) => {
        const textStyle = style && { ...style, color: style.color && Phaser.Display.Color.ValueToColor(style.color).rgba };
        const text = new Phaser.GameObjects.Text(scene, 0, 0, value, textStyle);
        scene.textures.addCanvas(key, text.canvas);
    },
    sheet: async (key: string, width: number, height: number, frameKeys: string[], frameWidth: number, frameHeight: number) => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');
        if (context == null) throw new Error('failed to create sprite sheet, canvas2d not avalible.');

        const columns = Math.floor(width / frameWidth);
        frameKeys.forEach((frameKey, index) => {
            const frame = scene.textures.get(frameKey);
            const image = frame.getSourceImage();
            if (image instanceof Phaser.GameObjects.RenderTexture) {
                // tslint:disable-next-line: no-console
                console.error(new Error(`failed to draw image '${frameKey}' into sprite sheet: '${key}'.`));
                return;
            }
            context.drawImage(image, (index % columns) * frameWidth, (index / columns | 0) * frameHeight);
        });

        const sheet = new Image();
        sheet.src = canvas.toDataURL('image/png');
        // document.body.append(sheet);

        return await new Promise<HTMLImageElement>((resolve) => {
            const addSpriteSheet = () => {
                scene.textures.addSpriteSheet(key, sheet, { frameWidth, frameHeight });
                resolve(sheet);
            };
            if (sheet.complete) addSpriteSheet();
            else sheet.addEventListener('load', addSpriteSheet);
        });
    },
});
