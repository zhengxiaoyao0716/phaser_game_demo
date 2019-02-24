import asset from './asset';

function preload ()
{
    this.load.tilemapTiledJSON('tilemap', require('./asset/tilemap.json.tile'));
    Object.entries(asset).forEach(([key, url]) => {
        url.startsWith('data:') ? this.textures.addBase64(key, url) : this.load.image(key, url);
    });
}

function create ()
{
    const map = this.make.tilemap({ key: 'tilemap' });
    const tileset = map.addTilesetImage('tileset0');
    const layer = map.createStaticLayer(0, tileset);

    layer.setCollisionByProperty({ collides: true });
    // this.impact.world.setCollisionMapFromTilemapLayer(layer, { slopeProperty: 'slope' });
    this.physics.add.existing(layer, true);
    var player = this.physics.add.sprite(64, 900, 'player');
    this.physics.add.collider(player, layer);

    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
}

export default {
    create, key: 'testScene', preload,
};
