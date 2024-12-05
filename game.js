/* global Phaser */

const config = {
    type: Phaser.AUTO,
    width: 1920,
    height: 1080,
    backgroundColor: '#049cd8',
    parent: 'game',
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 500 }, // Gravedad global
            debug: true // Cambiar a false para desactivar la depuración
        }
    },
    scene: {
        preload,
        create,
        update
    },
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

let player;
let cursors;
let platforms;

new Phaser.Game(config);

function preload() {
    this.load.image('cloud1', 'assets/scenery/overworld/cloud1.png');
    this.load.image('floorbricks', 'assets/scenery/overworld/floorbricks.png');
    this.load.image('pipe1.png', 'assets/scenery/pipe1.png');
    this.load.image('horizontal-tube.png', 'assets/scenery/horizontal-tube.png');

    // Cargar las imágenes del personaje
    this.load.image('pj2.2-base', 'assets/entities/pj2.2-base.png');
    this.load.image('pj2.2-walk1', 'assets/entities/pj2.2-walk1.png');
    this.load.image('pj2.2-crouch', 'assets/entities/pj2.2-crouch.png');
}

function create() {
    // Nubes (decoración, sin físicas)
    this.add.image(100, 150, 'cloud1').setOrigin(0, 0).setScale(0.5);
    this.add.image(400, 100, 'cloud1').setOrigin(0, 0).setScale(0.7);
    this.add.image(900, 200, 'cloud1').setOrigin(0, 0).setScale(0.6);
    this.add.image(1400, 50, 'cloud1').setOrigin(0, 0).setScale(0.8);
    this.add.image(1700, 180, 'cloud1').setOrigin(0, 0).setScale(0.4);

    // Crear grupo de plataformas con físicas
    platforms = this.physics.add.staticGroup();

    // Suelo (lado izquierdo)
    const leftFloor = platforms.create(config.width / 3, config.height - 162, 'floorbricks')
        .setOrigin(0.7, 1);
    leftFloor.displayWidth = (2 * config.width) / 3 - 300; // Ajustar ancho
    leftFloor.displayHeight = 70; // Ajustar altura
    leftFloor.refreshBody();

    // Suelo (lado derecho)
    const rightFloor = platforms.create((5 * config.width) / 6 + 50, config.height - 162, 'floorbricks')
        .setOrigin(0.6, 1);
    rightFloor.displayWidth = config.width / 2.5; // Ajustar ancho
    rightFloor.displayHeight = 70; // Ajustar altura
    rightFloor.refreshBody();

    // Plataforma flotante
    const floatingPlatform = platforms.create(config.width / 2, config.height / 2, 'floorbricks')
        .setOrigin(0.5, 0.5);
    floatingPlatform.displayWidth = 350; // Ajustar ancho
    floatingPlatform.displayHeight = 70; // Ajustar altura
    floatingPlatform.refreshBody();

    // Tuberías
    const leftPipe = platforms.create(400, config.height - 232, 'pipe1.png')
        .setOrigin(0.5, 1)
        .setScale(2.5)
        .refreshBody();

    const rightPipe = platforms.create(config.width - 300, config.height - 232, 'pipe1.png')
        .setOrigin(2.5, 1)
        .setScale(2.5)
        .refreshBody();

    const horizontalTube = platforms.create(800, config.height - 232, 'horizontal-tube.png')
        .setOrigin(-13, 1)
        .setScale(2.5)
        .refreshBody();

    // Crear personaje con físicas
    player = this.physics.add.sprite(300, config.height - 300, 'pj2.2-base')
        .setOrigin(2.5, 0.5)
        .setScale(1.5);

    // Configuración inicial del personaje
    player.setCollideWorldBounds(true);
    player.setBounce(0.1);

    // Habilitar colisiones entre el personaje y las plataformas
    this.physics.add.collider(player, platforms);

    // Configurar teclas
    cursors = this.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // Crear animaciones
    this.anims.create({
        key: 'walk', // Animación de caminar
        frames: [
            { key: 'pj2.2-base' },  // Frame 1
            { key: 'pj2.2-walk1' }  // Frame 2
        ],
        frameRate: 10, // Velocidad de la animación (fotogramas por segundo)
        repeat: -1 // Repetir indefinidamente
    });

    this.anims.create({
        key: 'idle', // Animación de estar quieto
        frames: [{ key: 'pj2.2-base' }],
        frameRate: 10
    });

    this.anims.create({
        key: 'crouch', // Animación de agacharse
        frames: [{ key: 'pj2.2-crouch' }],
        frameRate: 10
    });

    this.cameras.main.startFollow(player, true, 0.1, 0.1); // La cámara sigue al jugador con suavizado
    this.cameras.main.setBounds(0, 0, config.width * 2, config.height / 1.18); // Limitar la cámara dentro del área visible, hay que dividir o se sube
}

function update() {
    const speed = 200; // Velocidad horizontal
    const jumpSpeed = -550; // Velocidad de salto

    // Reiniciar velocidad horizontal
    player.setVelocityX(0);

    // Movimiento horizontal
    if (cursors.left.isDown) {
        player.setVelocityX(-speed); // Mover a la izquierda
        player.anims.play('walk', true); // Animación de caminar
        player.setFlipX(true); // Voltear hacia la izquierda
    } else if (cursors.right.isDown) {
        player.setVelocityX(speed); // Mover a la derecha
        player.anims.play('walk', true); // Animación de caminar
        player.setFlipX(false); // Sin voltear
    } else if (cursors.down.isDown) {
        // Agacharse al presionar la tecla 'S'
        player.anims.play('crouch', true); // Animación de agacharse
        player.setVelocityX(0); // Detener movimiento horizontal
    } else {
        player.anims.play('idle', true); // Animación de estar quieto
    }

    // Movimiento vertical (salto)
    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(jumpSpeed); // Saltar
    }
}
