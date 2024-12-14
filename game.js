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
let backgroundMusic;
let npc;
let lives = 1;
let score = 0;
let livesText;
let scoreText;

new Phaser.Game(config);

function preload() { 
    this.load.image('cloud1', 'assets/scenery/overworld/cloud1.png');
    this.load.image('cloud2', 'assets/scenery/overworld/cloud2.png');
    this.load.image('floorbricks', 'assets/scenery/overworld/floorbricks.png');
    this.load.image('pipe1.png', 'assets/scenery/pipe1.png');
    this.load.image('castle', 'assets/scenery/castle.png');

    // Cargar personaje
    this.load.image('pj2.2-base', 'assets/entities/pj2.2-base.png');
    this.load.image('pj2.2-walk1', 'assets/entities/pj2.2-walk1.png');
    this.load.image('pj2.2-crouch', 'assets/entities/pj2.2-crouch.png');

    // Cargar enemigos
    this.load.image('enemigo1', 'assets/entities/box1.1-right1.png');
    this.load.image('enemigo1-2', 'assets/entities/box1.1-left1.png');
    this.load.image('box1.1-crushed.png', 'assets/entities/box1.1-crushed.png');

    // Cargar npc
    this.load.image('npc1', 'assets/entities/npc1.1.png');

    // Cargar música
    this.load.audio('theme', 'assets/sound/music/overworld/theme.mp3');

    // Cargar montón de ropa
    this.load.image('ropa', 'assets/scenery/ropa.png');

    // Cargar tienda
    this.load.image('tienda', 'assets/scenery/tienda.png');
    this.load.image('tiendaFondo', 'assets/scenery/tiendaFondo.png');

    // Cargar monedas
    this.load.image('camiseta', 'assets/collectibles/camiseta.png');

    // Cargar bandera
    this.load.image('bandera', 'assets/scenery/flag-mast.png');
}

function create() {
    livesText = this.add.text(16, 16, 'Vidas: ' + lives, {
        fontSize: '42px',
        fill: '#FFF'
    }).setScrollFactor(0);

    scoreText = this.add.text(config.width - 400, 16, 'Puntuación: ' + score, {
        fontSize: '42px',
        fill: '#FFF'
    }).setScrollFactor(0);

    this.physics.world.setBounds(0, 0, config.width * 2, config.height); // Do

    // Nubes (decoración, sin físicas)
    const clouds = [
        { x: 100, y: 150, scale: 0.5 },
        { x: 400, y: 100, scale: 0.7 },
        { x: 900, y: 200, scale: 0.6 },
        { x: 1400, y: 50, scale: 0.8 },
        { x: 1700, y: 180, scale: 0.4 },
        { x: 2200, y: 130, scale: 0.5 },
        { x: 1950, y: 250, scale: 0.6 },
        { x: 2500, y: 80, scale: 0.6 },
        { x: 2900, y: 180, scale: 0.7 },
        { x: 3200, y: 100, scale: 0.4 },
        { x: 3500, y: 180, scale: 0.7 },
        { x: 3800, y: 100, scale: 0.4 },
        { x: 4000, y: 230, scale: 0.7 }
    ];

    clouds.forEach((cloud, index) => {
        const cloudType = index % 2 === 0 ? 'cloud1' : 'cloud2'; // Alternar entre cloud1 y cloud2
        this.add.image(cloud.x, cloud.y, cloudType).setOrigin(0, 0).setScale(cloud.scale); // Añadir nube
    });

    // Colocar el castillo en una posición específica
    this.add.image(config.width * 2.245, config.height - 300, 'tienda') // Multiplicamos config.width por un factor
        .setOrigin(2, 0.68)
        .setScale(0.5);

    // Colocar el castillo en una posición específica
    this.add.image(config.width * 1.975, config.height - 300, 'bandera') // Multiplicamos config.width por un factor
        .setOrigin(2, 0.84)
        .setScale(2.5);

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
        { x: config.width / 1.2, y: config.height / 2.5 },
        { x: config.width / 3.2, y: config.height / 4 },
        { x: config.width / 800, y: config.height / 2 },
        { x: config.width + 800, y: config.height / 2 - 50 },
        { x: config.width + 900, y: config.height / 1.3 - 20 },
        { x: config.width + 1300, y: config.height / 1.75 }
    ];
    floatingPlatforms.forEach(platform => {
        const floatingPlatform = platforms.create(platform.x, platform.y, 'floorbricks').setOrigin(0.5, 0.5);
        floatingPlatform.displayWidth = 350;
        floatingPlatform.displayHeight = 70;
        floatingPlatform.refreshBody();
    });

    const tiendasGroup = this.physics.add.staticGroup();

    const tiendasFondo = [
        { x: config.width / 2.8, y: config.height / 1.548, imagen: 'tiendaFondo' },
        { x: config.width / 0.825, y: config.height / 1.53, imagen: 'tienda' },
    ];

    tiendasFondo.forEach(tienda => {
        // Agregar cada tienda al grupo de físicas
        const tiendaObject = tiendasGroup.create(tienda.x, tienda.y, tienda.imagen)
            .setOrigin(0.5, 0.5)
            .setScale(0.65); // Ajustar escala si es necesario

        tiendaObject.setSize(325, 300);  // Ajusta el tamaño de la hitbox (ancho, alto)
        tiendaObject.setOffset(95, 135);
    });

    // Tuberías
    const pipes = [
        { x: 400, y: config.height - 232, scale: 0.5 },
        { x: config.width - 300, y: config.height - 232, scale: 0.5 },
    ];
    
    const pipeGroup = this.physics.add.staticGroup(); // Grupo estático para las tuberías
    
    pipes.forEach(pipe => {
        const pipeObject = pipeGroup.create(pipe.x, pipe.y, 'ropa').setOrigin(0.5, 0.84).setScale(pipe.scale);
    
        pipeObject.setSize(87, 75);  // Ajusta el tamaño de la hitbox (ancho, alto)
        pipeObject.setOffset(87, 50);  // Ajusta el desplazamiento de la hitbox (puedes modificar esto según sea necesario)
    });
    
    // Crear personaje con físicas
    player = this.physics.add.sprite(300, config.height - 300, 'pj2.2-base')
        .setOrigin(2.5, 0.4)
        .setScale(1.5);

    // Ajustar el tamaño del cuerpo de física
    player.setSize(20, 60); // Ancho y alto del cuadro de colisión (ajústalo según el tamaño de tu personaje)

    // Crear grupo para las monedas
    this.coins = this.physics.add.group({ immovable: true, allowGravity: false });

    // Configuración para generar monedas aleatoriamente
    const numCoins = 12; // Número de monedas a colocar
    const minX = 50; // Límite izquierdo del mapa
    const maxX = config.width * 2; // Límite derecho del mapa
    const minY = 50; // Límite superior del mapa
    const maxY = config.height - 300; // Límite inferior (por encima del suelo)

    for (let i = 0; i < numCoins; i++) {
        const randomX = Phaser.Math.Between(minX, maxX);
        const randomY = Phaser.Math.Between(minY, maxY);

        // Crear y configurar la moneda
        const coin = this.physics.add.sprite(randomX, randomY, 'camiseta')
            .setScale(0.3); // Escalar el sprite visualmente
        this.coins.add(coin); // Añadir al grupo

        // Ajustar la hitbox de la moneda
        coin.body.setSize(245, 276); // Cambiar tamaño de la hitbox
        coin.body.setOffset(136, 115); // Ajustar desplazamiento de la hitbox
    }

    // Configurar la detección de colisión entre el jugador y las monedas
    this.physics.add.overlap(player, this.coins, (player, coin) => {
        coin.disableBody(true, true); // Desactivar el cuerpo al colisionar
        score += 10; // Aumentar la puntuación al recoger una camiseta
        scoreText.setText('Puntuación: ' + score); // Actualizar el texto de puntuación
    });

    this.physics.world.on('worldbounds', (body) => {
        if (body.gameObject === player) {
            lives--; // Reducir vidas
            livesText.setText('Vidas: ' + lives); // Actualizar el texto de vidas
            // Si se quedan sin vidas, reiniciar el juego
            if (lives <= 0) {
                this.scene.restart(); // O algún mecanismo de reinicio
            }
        }
    });

    // Habilitar colisiones entre el personaje y las plataformas
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(player, pipeGroup);
    this.physics.add.collider(player, tiendasGroup);

    // Crear NPC
    this.add.image(config.width - 500, config.height - 226, 'npc1')
        .setOrigin(0.5, 1)
        .setScale(1.5);

    // Crear el primer enemigo
    this.enemigo1 = this.physics.add.sprite(300, config.height - 232, 'enemigo1')
        .setOrigin(-3, 1)
        .setScale(1)
        .setCollideWorldBounds(true)
        .setVelocityX(100)
        .setGravityY(500);

    // Crear el segundo enemigo en la plataforma flotante
    this.enemigo2 = this.physics.add.sprite(config.width / 2, config.height / 2 - 35, 'enemigo1')
        .setOrigin(0.5, 1)
        .setScale(1)
        .setCollideWorldBounds(true) // No necesita límites globales, estará limitado a la plataforma
        .setVelocityX(100); // Velocidad inicial

    this.enemigo5 = this.physics.add.sprite(config.width / 2, config.height / 2 - 35, 'enemigo1')
        .setOrigin(-35, 1.5)
        .setScale(1)
        .setCollideWorldBounds(true) // No necesita límites globales, estará limitado a la plataforma
        .setVelocityX(100); // Velocidad inicial

    this.enemigo6 = this.physics.add.sprite(config.width / 2 , config.height / 2 - 50, 'enemigo1')
        .setOrigin(-25, 1.5)  // Ajusta el origen si es necesario
        .setScale(1)
        .setCollideWorldBounds(true)  // No colisionar con los límites globales
        .setVelocityX(100);  // Velocidad inicial

    // Crear la caja flotante
    this.enemigo3 = this.physics.add.sprite(config.width / 2, config.height / 2 - 35, 'enemigo1')
        .setOrigin(-0.5, -5)
        .setScale(1)
        .setCollideWorldBounds(false)
        .setGravityY(0); // Desactivar la gravedad para que flote sin caerse

    this.enemigo4 = this.physics.add.sprite(config.width / 2, config.height / 2 - 35, 'enemigo1')
        .setOrigin(-15.5, -5)
        .setScale(1)
        .setCollideWorldBounds(false)
        .setGravityY(0); // Desactivar la gravedad para que flote sin caerse

    this.enemigo7 = this.physics.add.sprite(config.width / 2, config.height / 2 - 35, 'enemigo1')
        .setOrigin(-31, 1)
        .setScale(1)
        .setCollideWorldBounds(false)
        .setGravityY(0); // Desactivar la gravedad para que flote sin caerse

    // Ajustar la flotación para que suba y baje
    this.enemigo3.floatingDirection = 1; // 1 para subir, -1 para bajar
    this.enemigo3.floatSpeed = 150; // Velocidad de flotación

    this.enemigo4.floatingDirection = 1; // 1 para subir, -1 para bajar
    this.enemigo4.floatSpeed = 150; // Velocidad de flotación

    this.enemigo7.floatingDirection = 1; // 1 para subir, -1 para bajar
    this.enemigo7.floatSpeed = 150; // Velocidad de flotación

    this.physics.add.collider(this.enemigo2, platforms); // Colisiones del enemigo con la plataforma flotante
    this.physics.add.collider(this.enemigo5, platforms);
    this.physics.add.collider(this.enemigo6, platforms);

    // Colisión entre el enemigo y las tuberías
    this.physics.add.collider(this.enemigo1, pipeGroup, () => {
        if (this.enemigo1.flipX) {
            this.enemigo1.setVelocityX(100); // Mover a la derecha
            this.enemigo1.flipX = false; // Restaurar la imagen
        } else {
            this.enemigo1.setVelocityX(-100); // Mover a la izquierda
            this.enemigo1.flipX = true; // Voltear la imagen
        }
    });

    this.physics.add.overlap(player, this.enemigo1, (player, enemigo) => {
        if (player.body.touching.down && enemigo.body.touching.up) {
            enemigo.disableBody(true, true);
            player.setVelocityY(-300);
        }
    });

    this.physics.add.overlap(player, this.enemigo2, (player, enemigo) => {
        if (player.body.touching.down && enemigo.body.touching.up) {
            enemigo.disableBody(true, true);
            player.setVelocityY(-300);
        }
    });

    this.physics.add.overlap(player, this.enemigo3, (player, enemigo) => {
        if (player.body.touching.down && enemigo.body.touching.up) {
            enemigo.disableBody(true, true);
            player.setVelocityY(-300);
        }
    });

    this.physics.add.overlap(player, this.enemigo4, (player, enemigo) => {
        if (player.body.touching.down && enemigo.body.touching.up) {
            enemigo.disableBody(true, true);
            player.setVelocityY(-300);
        }
    });

    this.physics.add.overlap(player, this.enemigo5, (player, enemigo) => {
        if (player.body.touching.down && enemigo.body.touching.up) {
            enemigo.disableBody(true, true);
            player.setVelocityY(-300);
        }
    });

    this.physics.add.overlap(player, this.enemigo6, (player, enemigo) => {
        if (player.body.touching.down && enemigo.body.touching.up) {
            enemigo.disableBody(true, true);
            player.setVelocityY(-300);
        }
    });

    this.physics.add.overlap(player, this.enemigo7, (player, enemigo) => {
        if (player.body.touching.down && enemigo.body.touching.up) {
            enemigo.disableBody(true, true);
            player.setVelocityY(-300);
        }
    });

    this.physics.add.overlap(player, npc, showNPCModal, null, this);
    
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

    // Configurar animación para enemigos
    this.anims.create({
        key: 'enemigo1-walk',
        frames: [
            { key: 'enemigo1' },
            { key: 'enemigo1-2' },
        ],
        frameRate: 10, // Velocidad de la animación
        repeat: -1 // Repetir indefinidamente
    });

    this.anims.create({
        key: 'death',
        frames: [{ key: 'pj2.2-base' }], // Usa el sprite base o uno específico
        frameRate: 10,
        repeat: 0 // No repetir
    }); 

    // // Cargar música
    // backgroundMusic = this.sound.add('theme', {
    //     volume: 0.5,  // Ajusta el volumen (0.0 a 1.0)
    //     loop: true    // La música se reproducirá en bucle
    // });
    
    // // Reproducir música
    // backgroundMusic.play();
    

    // Asignar la animación a ambos enemigos
    this.enemigo1.play('enemigo1-walk');
    this.enemigo2.play('enemigo1-walk');
    this.enemigo3.play('enemigo1-walk');
    this.enemigo4.play('enemigo1-walk');
    this.enemigo5.play('enemigo1-walk');
    this.enemigo6.play('enemigo1-walk');
    this.enemigo7.play('enemigo1-walk');

    this.physics.add.collider(this.enemigo1, platforms);
    this.physics.add.overlap(player, [this.enemigo1, this.enemigo2, this.enemigo3, this.enemigo4, this.enemigo5, this.enemigo6, this.enemigo7], hitEnemy, null, this); // Colisión entre el jugador y enemigo

    this.physics.world.on('worldbounds', (body) => {
        if (body.gameObject === player) {
            perderVida.call(this);  // Si el jugador cae fuera del mundo, pierde una vida
        }
    });

    this.cameras.main.startFollow(player, true, 0.1, 0.1); // La cámara sigue al jugador con suavizado
    this.cameras.main.setBounds(0, 0, config.width * 2.2, config.height / 2);
}

function hitEnemy(player, enemigo) {
    perderVida.call(this); // Llamar a perderVida cuando se detecta la colisión
}

function perderVida() {
    lives--; // Reducir una vida
    livesText.setText('Vidas: ' + lives); // Actualizar el texto de vidas

    if (lives <= 0) {
        showGameOver.call(this, player);
    } else {
        resetPlayerPosition(player);
    }
}

function showGameOver() {
    const centerX = this.cameras.main.scrollX + this.cameras.main.width / 2;
    const centerY = this.cameras.main.scrollY + this.cameras.main.height / 2;

    const gameOverText = this.add.text(centerX, centerY - 100, 'GAME OVER', {
        fontSize: '128px', // Tamaño de fuente grande
        fill: '#ff0000', // Color del texto
        fontFamily: 'Arial', // Familia de fuente
        align: 'center', // Alinear al centro
        stroke: '#000000', // Color del borde
        strokeThickness: 8, // Grosor del borde
        shadow: {
            offsetX: 3,
            offsetY: 3,
            blur: 4,
            color: '#000000',
            stroke: true,
            fill: true,
        },
    }).setOrigin(0.5);

    this.tweens.add({
        targets: gameOverText,
        alpha: { from: 1, to: 0.5 }, // Cambiar la opacidad
        yoyo: true, // Hacerlo parpadear
        duration: 700, // Duración de cada parpadeo
        repeat: -1, // Repetir indefinidamente
    });

    const restartButton = this.add.text(centerX, centerY + 100, 'Volver a jugar', {
        fontSize: '40px',
        fill: '#FFFFFF',
        fontFamily: 'Arial',
        stroke: '#000000',
        strokeThickness: 6,
        padding: { x: 20, y: 10 },
    }).setOrigin(0.5).setInteractive();

    restartButton.on('pointerdown', () => {
        this.scene.restart();
        lives = 1;
    });

    this.physics.world.isPaused = true;
}

function showVictoryMessage(player) {
    this.physics.pause();
    player.setVelocity(0);

    const centerX = this.cameras.main.scrollX + this.cameras.main.width / 2;
    const centerY = this.cameras.main.scrollY + this.cameras.main.height / 2;

    const victoryText = this.add.text(centerX, centerY - 100, '¡Has ganado!', {
        fontSize: '128px',
        fill: '#00FF00',
        fontFamily: 'Arial',
        stroke: '#000000',
        strokeThickness: 8
    }).setOrigin(0.5);

    const restartButton = this.add.text(centerX, centerY + 100, 'Volver a jugar', {
        fontSize: '40px',
        fill: '#FFFFFF',
        fontFamily: 'Arial',
        stroke: '#000000',
        strokeThickness: 6,
        padding: { x: 20, y: 10 },
    }).setOrigin(0.5).setInteractive();
    
    restartButton.on('pointerdown', () => {
        this.scene.restart();
        lives = 1;
    });

    this.physics.world.isPaused = true;
}

// function showModal(player) {
//     this.physics.pause(); // Pausar el juego
//     player.setVelocity(0); // Detener al jugador

//     const centerX = this.cameras.main.scrollX + this.cameras.main.width / 2;
//     const centerY = this.cameras.main.scrollY + this.cameras.main.height / 2;

//     // Crear el texto del mensaje
//     const modalText = this.add.text(centerX, centerY - 100, 'Cada año se utilizan millones de litros', {
//         fontSize: '48px', // Ajusté el tamaño de la fuente para que sea más legible
//         fill: '#00FF00',
//         fontFamily: 'Arial',
//         stroke: '#000000',
//         strokeThickness: 8
//     }).setOrigin(0.5);

//     // Crear el botón "Seguir jugando"
//     const continueButton = this.add.text(centerX, centerY + 100, 'Seguir jugando', {
//         fontSize: '40px',
//         fill: '#FFFFFF',
//         fontFamily: 'Arial',
//         stroke: '#000000',
//         strokeThickness: 6,
//         padding: { x: 20, y: 10 },
//     }).setOrigin(0.5).setInteractive();

//     // Cambiar estilo del botón cuando el cursor pasa por encima
//     continueButton.on('pointerover', () => {
//         continueButton.setStyle({
//             fill: '#FFFF00', // Cambiar el color a amarillo
//             stroke: '#FFD700', // Cambiar el borde a dorado
//         });
//     });

//     continueButton.on('pointerout', () => {
//         continueButton.setStyle({
//             fill: '#FFFFFF', // Vuelve al color blanco
//             stroke: '#000000', // Vuelve al borde negro
//         });
//     });

//     // Acción al hacer clic en "Seguir jugando"
//     continueButton.on('pointerdown', () => {
//         this.physics.world.resume(); // Reanudar la física
//         player.setVelocity(100, 0); // Reiniciar el movimiento del jugador (puedes ajustar la velocidad)
        
//         // Eliminar el modal (mensaje y botón)
//         modalText.setVisible(false);
//         continueButton.setVisible(false);
//     });
// }

// Función para reiniciar la posición del jugador
function resetPlayerPosition(player) {
    // Coordenadas iniciales del jugador
    const startX = 300;
    const startY = config.height - 300;
    player.setPosition(startX, startY);
}

function showNPCModal(player, npc) {
    const modal = document.getElementById('npc-modal');
    modal.style.display = 'block';

    setTimeout(() => {
        modal.style.display = 'none';
    }, 3000);  // El modal se cierra después de 3 segundos
}

// function playerDie() {
//     // Desactivar controles y detener movimientos
//     this.physics.pause(); // Pausar físicas
//     player.setVelocity(0); // Detener cualquier movimiento

//     // Reproducir animación de muerte
//     player.anims.play('death', true);

//     // Simular salto de muerte
//     player.setVelocityY(-300); // Salto hacia arriba
//     player.setGravityY(800); // Aumentar la gravedad para acelerar la caída

//     this.time.delayedCall(500, () => {
//         showGameOver.call(this, player); // Mostrar Game Over después de la animación
//     });
// }

function update() {
    const speed = 200; // Velocidad horizontal
    const jumpSpeed = -550; // Velocidad de salto

    player.setVelocityX(0);

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

    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(jumpSpeed); // Saltar
    }

    if (player.y > config.height) { // Si el personaje cae fuera de la pantalla
        playerDie.call(this);
    }    

    if (this.enemigo1.x >= 675 && !this.enemigo1.flipX) {
        this.enemigo1.setVelocityX(-100); // Cambiar dirección a la izquierda
        this.enemigo1.flipX = true; // Invertir la imagen
    } else if (this.enemigo1.x <= 100 && this.enemigo1.flipX) {
        this.enemigo1.setVelocityX(100); // Cambiar dirección a la derecha
        this.enemigo1.flipX = false; // Restaurar la imagen
    }

    if (this.enemigo2.x >= 1105 && !this.enemigo2.flipX) {
        this.enemigo2.setVelocityX(-100); // Cambiar dirección a la izquierda
        this.enemigo2.flipX = true; // Invertir la imagen
    } else if (this.enemigo2.x <= 810 && this.enemigo2.flipX) {
        this.enemigo2.setVelocityX(100); // Cambiar dirección a la derecha
        this.enemigo2.flipX = false; // Restaurar la imagen
    }

    if (this.enemigo5.x >= 1100 && !this.enemigo5.flipX) {
        this.enemigo5.setVelocityX(-100); // Cambiar dirección a la izquierda
        this.enemigo5.flipX = true; // Invertir la imagen
    } else if (this.enemigo5.x <= 810 && this.enemigo5.flipX) {
        this.enemigo5.setVelocityX(100); // Cambiar dirección a la derecha
        this.enemigo5.flipX = false; // Restaurar la imagen
    }

    if (this.enemigo6.x >= 1240 && !this.enemigo6.flipX) {
        this.enemigo6.setVelocityX(-100); // Cambiar dirección a la izquierda
        this.enemigo6.flipX = true; // Invertir la imagen
    } else if (this.enemigo6.x <= 935 && this.enemigo6.flipX) {
        this.enemigo6.setVelocityX(100); // Cambiar dirección a la derecha
        this.enemigo6.flipX = false; // Restaurar la imagen
    }

    const minY = config.height / 2 - 285; // Límite superior de la flotación
    const maxY = config.height / 2.1; // Límite inferior de la flotación

    if (this.enemigo3.y <= minY) {
        this.enemigo3.floatingDirection = 1;  // Comienza a subir
    } else if (this.enemigo3.y >= maxY) {
        this.enemigo3.floatingDirection = -1; // Comienza a bajar
    }

    if (this.enemigo3.y > maxY) {
        this.enemigo3.setY(maxY); // Ajustar la posición Y para que no sobrepase el límite inferior
    } else if (this.enemigo3.y < minY) {
        this.enemigo3.setY(minY); // Ajustar la posición Y para que no sobrepase el límite superior
    }

    this.enemigo3.setVelocityY(this.enemigo3.floatSpeed * this.enemigo3.floatingDirection); // Hacer que la caja suba y baje

    if (this.enemigo4.y <= minY) {
        this.enemigo4.floatingDirection = 1;  // Comienza a subir
    } else if (this.enemigo4.y >= maxY) {
        this.enemigo4.floatingDirection = -1; // Comienza a bajar
    }

    if (this.enemigo4.y > maxY) {
        this.enemigo4.setY(maxY); // Ajustar la posición Y para que no sobrepase el límite inferior
    } else if (this.enemigo4.y < minY) {
        this.enemigo4.setY(minY); // Ajustar la posición Y para que no sobrepase el límite superior
    }

    this.enemigo4.setVelocityY(this.enemigo4.floatSpeed * this.enemigo4.floatingDirection); // Hacer que la caja suba y baje

    const minX7 = config.width + 800; // Límite izquierdo
    const maxX7 = config.width + 1300; // Límite derecho

    if (this.enemigo7.x >= maxX7 && !this.enemigo7.flipX) {
        this.enemigo7.setVelocityX(-100); // Cambiar dirección a la izquierda
        this.enemigo7.flipX = true; // Voltear la imagen
    } else if (this.enemigo7.x <= minX7 && this.enemigo7.flipX) {
        this.enemigo7.setVelocityX(100); // Cambiar dirección a la derecha
        this.enemigo7.flipX = false; // Restaurar la imagen
    }

    const minY7 = config.height / 2 - 200; // Límite superior
    const maxY7 = config.height / 2 + 100; // Límite inferior

    if (this.enemigo7.y <= minY7) {
        this.enemigo7.floatingDirection = 1; // Comienza a bajar
    } else if (this.enemigo7.y >= maxY7) {
        this.enemigo7.floatingDirection = -1; // Comienza a subir
    }

    this.enemigo7.setVelocityY(this.enemigo7.floatSpeed * this.enemigo7.floatingDirection);

    if (player.x > 3900) {
        showVictoryMessage.call(this, player, null);
    }

    // // Mostrar mensaje de victoria si el jugador pasa la coordenada X 1900
    // if (player.x > 1880) {
    //     showModal.call(this, player, null);
    // }
}