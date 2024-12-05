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
    this.load.image('cloud2', 'assets/scenery/overworld/cloud2.png');
    this.load.image('floorbricks', 'assets/scenery/overworld/floorbricks.png');
    this.load.image('pipe1.png', 'assets/scenery/pipe1.png');
    this.load.image('horizontal-tube.png', 'assets/scenery/horizontal-tube.png');

    // Cargar las imágenes del personaje
    this.load.image('pj2.2-base', 'assets/entities/pj2.2-base.png');
    this.load.image('pj2.2-walk1', 'assets/entities/pj2.2-walk1.png');
    this.load.image('pj2.2-crouch', 'assets/entities/pj2.2-crouch.png');

    // Cargar la foto del castillo
    this.load.image('castle', 'assets/scenery/castle.png');

    // Cargar enemigos
    this.load.image('enemigo1', 'assets/entities/box1.1-right1.png');
    this.load.image('enemigo1-2', 'assets/entities/box1.1-left1.png');
    this.load.image('box1.1-crushed.png', 'assets/entities/box1.1-crushed.png');
}

function create() {
    // Ampliar los límites del mundo
    this.physics.world.setBounds(0, 0, config.width * 10, config.height);

    // Nubes (decoración, sin físicas)
    const clouds = [
        { x: 100, y: 150, scale: 0.5 },
        { x: 400, y: 100, scale: 0.7 },
        { x: 900, y: 200, scale: 0.6 },
        { x: 1400, y: 50, scale: 0.8 },
        { x: 1700, y: 180, scale: 0.4 },
        { x: 2200, y: 130, scale: 0.5 },
        { x: 2500, y: 80, scale: 0.6 },
        { x: 2900, y: 180, scale: 0.7 },
        { x: 3200, y: 100, scale: 0.4 }
    ];

    clouds.forEach((cloud, index) => {
        const cloudType = index % 2 === 0 ? 'cloud1' : 'cloud2'; // Alternar entre cloud1 y cloud2
        this.add.image(cloud.x, cloud.y, cloudType).setOrigin(0, 0).setScale(cloud.scale); // Añadir nube
    });

    // Crear grupo de plataformas con físicas
    platforms = this.physics.add.staticGroup();

    // Suelo (lado izquierdo y extendido hacia la derecha)
    const floors = [
        { x: config.width / 3, width: (2 * config.width) / 3 - 300 },
        { x: (5 * config.width) / 6 + 50, width: config.width / 2.5 },
        { x: config.width + 500, width: config.width / 4 },
        { x: config.width * 2, width: config.width / 2.5 }
    ];
    floors.forEach(floor => {
        const floorPlatform = platforms.create(floor.x, config.height - 162, 'floorbricks').setOrigin(0.7, 1);
        floorPlatform.displayWidth = floor.width;
        floorPlatform.displayHeight = 70;
        floorPlatform.refreshBody();
    });

    // Plataforma flotante
    const floatingPlatforms = [
        { x: config.width / 2, y: config.height / 2 },
        { x: config.width + 800, y: config.height / 2 - 50 },
        { x: config.width + 1300, y: config.height / 1.75 }
    ];
    floatingPlatforms.forEach(platform => {
        const floatingPlatform = platforms.create(platform.x, platform.y, 'floorbricks').setOrigin(0.5, 0.5);
        floatingPlatform.displayWidth = 350;
        floatingPlatform.displayHeight = 70;
        floatingPlatform.refreshBody();
    });

    // Tuberías
    const pipes = [
        { x: 400, y: config.height - 232, scale: 2.5 },
        { x: config.width - 300, y: config.height - 232, scale: 2.5 },
        { x: config.width + 400, y: config.height - 232, scale: 2.5 }
    ];
    const pipeGroup = this.physics.add.staticGroup(); // Grupo estático para las tuberías
    pipes.forEach(pipe => {
        const pipeObject = pipeGroup.create(pipe.x, pipe.y, 'pipe1.png').setOrigin(0.5, 1).setScale(pipe.scale);
        pipeObject.refreshBody();
    });

    // Crear el enemigo
    this.enemigo1 = this.physics.add.sprite(300, config.height - 232, 'enemigo1')
        .setOrigin(-3, 1)
        .setScale(1)
        .setCollideWorldBounds(true)
        .setVelocityX(100)
        .setGravityY(500);

    // Colisión entre el enemigo y las tuberías
    this.physics.add.collider(this.enemigo1, pipeGroup, () => {
        // Invertir dirección del enemigo cuando choque con una tubería
        if (this.enemigo1.flipX) {
            this.enemigo1.setVelocityX(100); // Mover a la derecha
            this.enemigo1.flipX = false; // Restaurar la imagen
        } else {
            this.enemigo1.setVelocityX(-100); // Mover a la izquierda
            this.enemigo1.flipX = true; // Voltear la imagen
        }
    });

    // Crear personaje con físicas
    player = this.physics.add.sprite(300, config.height - 300, 'pj2.2-base')
        .setOrigin(2.5, 0.5)
        .setScale(1.5);

    // Ajustar el tamaño del cuerpo de física
    player.setSize(20, 60); // Ancho y alto del cuadro de colisión (ajústalo según el tamaño de tu personaje)

    // Habilitar colisiones entre el personaje y las plataformas
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(this.enemigo1, platforms);
    this.physics.add.collider(player, pipeGroup); // Colisiones con las tuberías

    this.enemigo1.setCollideWorldBounds(true);

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

    this.anims.create({
        key:'enemigo1-walk',
        frames:[
            {key:'enemigo1'},
            {key:'enemigo1-2'},
        ],
        frameRate:5,
        repeat: -1
    })

    this.enemigo1.play('enemigo1-walk')

    this.physics.add.collider(this.enemigo1, platforms);

    this.cameras.main.startFollow(player, true, 0.1, 0.1); // La cámara sigue al jugador con suavizado
    this.cameras.main.setBounds(0, 0, config.width * 10, config.height / 1.18); // Limitar la cámara al área ampliada
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
        player.setSize(20, 30); // Reducir el tamaño de la caja de colisión (alto reducido)
        player.setOffset(25, 30); // Ajustar la posición de la hitbox para evitar que pase por el suelo
    } else {
        player.anims.play('idle', true); // Animación de estar quieto
        player.setSize(20, 60); // Volver al tamaño original de la caja de colisión
        player.setOffset(25, 0); // Restaurar la posición de colisión original
    }

    // Movimiento vertical (salto)
    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(jumpSpeed); // Saltar
    }

    if (this.enemigo1.x >= 675 && !this.enemigo1.flipX) {
        this.enemigo1.setVelocityX(-100); // Cambiar dirección a la izquierda
        this.enemigo1.flipX = true; // Invertir la imagen para que se mueva en dirección contraria
    } else if (this.enemigo1.x <= 100 && this.enemigo1.flipX) {
        this.enemigo1.setVelocityX(100); // Cambiar dirección a la derecha
        this.enemigo1.flipX = false; // Restaurar la imagen
    } else {
        // Si el enemigo está entre los dos límites, mantiene la dirección correcta
        // No es necesario invertir flipX ni cambiar la dirección constantemente
        if (!this.enemigo1.flipX) {
            this.enemigo1.setVelocityX(100); // Mover a la derecha
        } else {
            this.enemigo1.setVelocityX(-100); // Mover a la izquierda
        }
    }
}