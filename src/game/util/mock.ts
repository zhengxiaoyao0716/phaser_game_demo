export const texture = (scene: Phaser.Scene) => ({
    shape: (
        key: string,
        { fill, line }: {
            fill?: {
                color?: number,
                alpha?: number,
            },
            line?: { width?: number, color?: number, alpha?: number },
        } = {},
    ) => {
        const border = (line && line.width) ? 2 * line.width : 0;
        const border2 = border * 2;
        const newGraphics = () => {
            const graphics = new Phaser.GameObjects.Graphics(scene);
            fill && fill.color && graphics.fillStyle(fill.color, fill.alpha);
            line && graphics.lineStyle(line.width, line.color, line.alpha);
            return graphics;
        };
        return {
            ellipseShape: (shape: Phaser.Geom.Ellipse, smoothness?: integer) => newGraphics()
                .fillEllipseShape(shape, smoothness)
                .strokeEllipseShape(shape, smoothness)
                .generateTexture(key, 2 * shape.width + border2, 2 * shape.height + border2),
            ellipse(width: number, height: number, smoothness?: integer) {
                return this.ellipseShape(new Phaser.Geom.Ellipse(border + width, border + height, width, height), smoothness);
            },
            circleShape: (shape: Phaser.Geom.Circle) => newGraphics()
                .fillCircleShape(shape)
                .strokeCircleShape(shape)
                .generateTexture(key, 2 * shape.radius + border2, 2 * shape.radius + border2),
            circle(radius: number) {
                return this.circleShape(new Phaser.Geom.Circle(border + radius, border + radius, radius));
            },
            rectShape: (shape: Phaser.Geom.Rectangle) => newGraphics()
                .fillRectShape(shape)
                .strokeRectShape(shape)
                .generateTexture(key, shape.width + border2, shape.height + border2),
            rect(width: number, height: number) {
                return this.rectShape(new Phaser.Geom.Rectangle(border, border, width, height));
            },
            trianShape: (shape: Phaser.Geom.Triangle) => newGraphics()
                .fillTriangleShape(shape)
                .strokeTriangleShape(shape)
                .generateTexture(key, shape.right + border2, shape.bottom + border2),
            trian(width: number, height: number, sharp: number) {
                return this.trianShape(new Phaser.Geom.Triangle(border + sharp, border, border, border + height, border + width, border + height));
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
