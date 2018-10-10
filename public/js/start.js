var config = {
    type: Phaser.AUTO,
    width: 400,
    height: 300,
    parent: 'phaser-example',
    physics: {
        default: 'matter',
        matter: {

        },

    },
    scene: [{
            key: 'Menu',
            preload: preloadC,
            create: createC
        }, {
            key: 'Gameplay',
            preload: preloadA,
            create: createA,
            update: updateA
        },
        {
            key: 'GameOver',
            preload: preloadB,
            create: createB
        },
    ],
    pixelArt: true,
    zoom: 2,
};

var game = new Phaser.Game(config);
var isDJump;
var jumpCount;
var score;
var scoreText;
var GameOver;
var gameStart;
var canJump;
var canFall;
var canAttack;
var touchedTiles;
var restoreCollision;
var climbPoints;
var isHited;
var inBattle;

var stars = 0;
var dimonds = 0;
var coins = 0;

var SmoothedHorionztalControl = new Phaser.Class({

    initialize:

        function SmoothedHorionztalControl(speed) {
            this.msSpeed = speed;
            this.value = 0;
        },

    moveLeft: function (delta) {
        if (this.value > 0) {
            this.reset();
        }
        this.value -= this.msSpeed * delta;
        if (this.value < -1) {
            this.value = -1;
        }
        playerController.time.rightDown += delta;
    },

    moveRight: function (delta) {
        if (this.value < 0) {
            this.reset();
        }
        this.value += this.msSpeed * delta;
        if (this.value > 1) {
            this.value = 1;
        }
    },

    reset: function () {
        this.value = 0;
    }
});


/** Menu */

function preloadC() {

    this.load.image('menuBack', 'assets/Background.jpg');
    this.load.image('menuLogo', 'assets/Logo.png');
}

function createC() {

    var backgr = this.add.image(200, 150, 'menuBack');
    var logo = this.add.image(200, 41, 'menuLogo');

    logo.scaleX = 0.1;
    logo.scaleY = 0.1;
    backgr.scaleX = 0.4;
    backgr.scaleY = 0.4;

    var text = this.add.text(150, 222, 'START', {
        fontSize: '30px',
        fill: '#F4F4F4'
    });

    text.setInteractive();

    text.on('pointerdown', function (pointer) {
        this.scene.start('Gameplay');
    }, this);

    this.input.on('gameobjectover', function (pointer, text) {
        text.setTint(0xff0000, 0xff0000, 0xffff00, 0x76D04E);
    });

    this.input.on('gameobjectout', function (pointer, text) {
        text.clearTint();
    });

}

/** Gameplay */

function preloadA() {
    GameOver = false;
    isDJump = false;
    jumpCount = 0;
    score = 0;
    gameStart = false;
    onFloor = false;
    touchedTiles = [];
    restoreCollision = false;
    climbPoints = [];
    isHited = false;
    inBattle = false;


    this.load.tilemapTiledJSON('map', 'assets/map.json');

    this.load.image('sky', 'assets/background/sky.png');
    this.load.image('bg_cloud2', 'assets/background/bg_cloud2.png');
    this.load.image('tile_jungle_ground_brown', 'assets/world/tile_jungle_ground_brown.png');
    this.load.image('tile_jungle_bridge', 'assets/world/tile_jungle_bridge.png');
    this.load.image('tile_jungle_water', 'assets/world/tile_jungle_water.png');
    this.load.image('tile_jungle_wall_brown', 'assets/world/tile_jungle_wall_brown.png');

    this.load.image('plate', 'assets/UI/plate.png');
    this.load.image('buttonLong_blue', 'assets/UI/buttonLong_blue.png');
    this.load.image('health_bar1', 'assets/UI/health_bar1.png');
    this.load.image('health_bar2', 'assets/UI/health_bar2.png');
    this.load.image('health_bar3', 'assets/UI/health_bar3.png');

    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');

    this.load.spritesheet('angry_flower',
        'assets/enemies/angry_flower.png', {
            frameWidth: 64,
            frameHeight: 48
        }
    );

    this.load.spritesheet('hero',
        'assets/hero.png', {
            frameWidth: 50,
            frameHeight: 37
        }
    );
}

function createA() {

    /** Debug */

    this.matter.world.createDebugGraphic();
    this.matter.world.drawDebug = false;
    this.matter.add.mouseSpring();

    this.input.keyboard.on('keyup', function (e) {
        if (e.key === '1') {
            this.matter.world.drawDebug = !this.matter.world.drawDebug;
            this.matter.world.debugGraphic.visible = this.matter.world.drawDebug;
        }

        if (e.key === '2') {
            angryFlower.setTint(0xAF111C);
        }

        if (e.key === '3') {
            angryFlower.clearTint();
        }

        if (e.key === '4') {
            console.log(Math.round(this.input.activePointer.worldX) + ', ' + Math.round(this.input.activePointer.worldY));
        }

    }, this);


    /** Backgrounds */
    this.add.image(400, 300, 'sky').setScrollFactor(0);

    /** World */
    map = this.make.tilemap({
        key: 'map'
    });

    var cloudTiles = map.addTilesetImage('bg_cloud2');
    var groundTiles = map.addTilesetImage('tile_jungle_ground_brown');
    var bridgeTiles = map.addTilesetImage('tile_jungle_bridge');
    var wallsTiles = map.addTilesetImage('tile_jungle_wall_brown');
    var waterTiles = map.addTilesetImage('tile_jungle_water');
    var decorTiles1 = map.addTilesetImage('tile_jungle_water');
    var decorTiles2 = map.addTilesetImage('tile_jungle_bridge');

    behindGroundLayer = map.createDynamicLayer('behindGround', wallsTiles, 0, 0);
    behindGroundLayer2 = map.createDynamicLayer('behindGround2', groundTiles, 0, 0);
    groundLayer = map.createDynamicLayer('ground', groundTiles, 0, 0);
    groundLayer2 = map.createDynamicLayer('ground2', wallsTiles, 0, 0);
    bridgeLayer = map.createDynamicLayer('bridges', bridgeTiles, 0, 0);
    cloudLayer = map.createDynamicLayer('clouds', cloudTiles, 0, 0);


    groundLayer.setCollisionFromCollisionGroup();
    groundLayer2.setCollisionFromCollisionGroup();
    bridgeLayer.setCollisionFromCollisionGroup();
    behindGroundLayer2.setCollisionByProperty({
        collides: true
    });
    map.findObject('collisonObjects', function (obj) {
        if (obj.name === 'wall') {
            this.matter.add.rectangle(
                obj.x + (obj.width / 2), obj.y + (obj.height / 2),
                obj.width, obj.height, {
                    isStatic: true
                }
            );
        }
    }, this);

    this.matter.world.convertTilemapLayer(groundLayer);
    this.matter.world.convertTilemapLayer(bridgeLayer);
    this.matter.world.convertTilemapLayer(groundLayer2);
    this.matter.world.convertTilemapLayer(behindGroundLayer2);


    behindGroundLayer2.forEachTile(function (tile) {
        if (tile.properties.type === 'ground') {
            tile.physics.matterBody.body.label = 'behindGround';
        }
    });

    this.matter.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);


    // Points
    map.findObject('climbPoints', function (obj) {
        if (obj.type === 'flipX') {
            climbPoints.push({
                name: obj.name,
                x: obj.x + 5,
                y: obj.y - 6,
                type: obj.type
            });
        } else {
            climbPoints.push({
                name: obj.name,
                x: obj.x - 5,
                y: obj.y - 6,
                type: obj.type
            });
        }

    });

    map.findObject('drownedPoints', function (obj) {
        this.matter.add.rectangle(
            obj.x + (obj.width / 2), obj.y + (obj.height / 2),
            obj.width, obj.height, {
                isStatic: true,
                label: 'drowned'
            }
        );
    }, this);


    /** Player */
    smoothedControls = new SmoothedHorionztalControl(0.004);

    playerController = {
        matterSprite: this.matter.add.sprite(0, 0, 'hero'),
        blocked: {
            left: false,
            right: false,
            bottom: false,
            up: false
        },
        numTouching: {
            left: 0,
            right: 0,
            bottom: 0,
            up: 0
        },
        sensors: {
            bottom: null,
            left: null,
            right: null,
            up: null
        },
        time: {
            leftDown: 0,
            rightDown: 0
        },
        getTime: 0,
        hitCounter: 0,
        hp: 5
    };

    var M = Phaser.Physics.Matter.Matter;
    var w = playerController.matterSprite.width - 21;
    var h = playerController.matterSprite.height - 4;


    playerBody = M.Bodies.rectangle(0, 0, w * 0.7, h, {
        chamfer: {
            radius: 10
        },
        label: 'playerBody'
    });

    visionZone = M.Bodies.rectangle(0, 0, w * 11, h * 1.5, {
        label: 'visionZone',
        isSensor: true
    });

    playerController.sensors.bottom = M.Bodies.rectangle(0, h * 0.5, w * 0.35, 5, {
        isSensor: true,
        label: 'bottomSensor'
    });
    playerController.sensors.left = M.Bodies.rectangle(-w * 0.45, 0, 5, h * 0.25, {
        isSensor: true,
        label: 'leftSensor'
    });
    playerController.sensors.right = M.Bodies.rectangle(w * 0.45, 0, 5, h * 0.25, {
        isSensor: true,
        label: 'rightSensor'
    });

    playerController.sensors.up = M.Bodies.rectangle(0, -w * 0.70, w * 0.7, h * 0.15, {
        isSensor: true,
        label: 'upSensor'
    });

    var compoundBody = M.Body.create({
        parts: [
            playerBody, playerController.sensors.bottom, playerController.sensors.left,
            playerController.sensors.right, playerController.sensors.up, visionZone
        ],
        friction: 0,
        restitution: 0 // Prevent body from sticking against a wall
    });

    playerAtkZone = null;

    matterSprite = playerController.matterSprite;
    matterSprite.setExistingBody(compoundBody);
    matterSprite.setFixedRotation(); // Sets max inertia to prevent rotation
    matterSprite.setPosition(51, 798);

    this.anims.create({
        key: 'run',
        frames: this.anims.generateFrameNumbers('hero', {
            start: 8,
            end: 13
        }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: this.anims.generateFrameNumbers('hero', {
            start: 0,
            end: 3
        }),
        frameRate: 6,
        repeat: -1
    });

    this.anims.create({
        key: 'jump',
        frames: this.anims.generateFrameNumbers('hero', {
            start: 13,
            end: 23
        }),
        frameRate: 12
    });

    this.anims.create({
        key: 'fall',
        frames: [{
            key: 'hero',
            frame: 23
        }],
        frameRate: 10
    });

    this.anims.create({
        key: 'land',
        frames: [{
            key: 'hero',
            frame: 15
        }, {
            key: 'hero',
            frame: 14
        }, {
            key: 'hero',
            frame: 1
        }],
        frameRate: 10
    });

    this.anims.create({
        key: 'sit-down',
        frames: this.anims.generateFrameNumbers('hero', {
            start: 5,
            end: 7
        }),
        frameRate: 5,
        repeat: -1
    });

    this.anims.create({
        key: 'hang',
        frames: this.anims.generateFrameNumbers('hero', {
            start: 29,
            end: 32
        }),
        frameRate: 5,
        repeat: -1
    });

    this.anims.create({
        key: 'climb',
        frames: [{
            key: 'hero',
            frame: 33,
            duration: 100
        }, {
            key: 'hero',
            frame: 34,
            duration: 40
        }, {
            key: 'hero',
            frame: 77,
            duration: 200
        }, {
            key: 'hero',
            frame: 23,
            duration: 100
        }, {
            key: 'hero',
            frame: 5
        }, {
            key: 'hero',
            frame: 15
        }, {
            key: 'hero',
            frame: 14
        }, {
            key: 'hero',
            frame: 1
        }],
        frameRate: 10
    });

    this.anims.create({
        key: 'isHited',
        frames: [{
            key: 'hero',
            frame: 65,
            duration: 100
        }, {
            key: 'hero',
            frame: 66,
            duration: 100
        }, {
            key: 'hero',
            frame: 67,
            duration: 100
        }, {
            key: 'hero',
            frame: 68,
            duration: 100
        }, {
            key: 'hero',
            frame: 43,
            duration: 100
        }, {
            key: 'hero',
            frame: 42
        }, {
            key: 'hero',
            frame: 41
        }],
        frameRate: 10
    });

    this.anims.create({
        key: 'playerAttack',
        frames: this.anims.generateFrameNumbers('hero', {
            start: 42,
            end: 58
        }),
        frameRate: 10
    });

    this.anims.create({
        key: 'turnInBattle',
        frames: this.anims.generateFrameNumbers('hero', {
            start: 38,
            end: 41
        }),
        frameRate: 6,
        repeat: -1
    });

    this.anims.create({
        key: 'getSword',
        frames: this.anims.generateFrameNumbers('hero', {
            start: 69,
            end: 72
        }),
        frameRate: 7
    });

    this.anims.create({
        key: 'hideSword',
        frames: this.anims.generateFrameNumbers('hero', {
            start: 73,
            end: 76
        }),
        frameRate: 7
    });



    /** Enemies */
    var angryFlowerController = {
        matterSprite: this.matter.add.sprite(0, 0, 'angry_flower'),
        flowerAtkZone: null,
        inPause: false,
        hp: 5,
        underAttack: false
    };

    angryFlower = angryFlowerController.matterSprite;

    var flowerBody = M.Bodies.rectangle(-10, 5, angryFlower.width - 30, angryFlower.height - 10, {
        chamfer: {
            radius: 10
        },
        isStatic: true
    });

    var flowerAggroZone = M.Bodies.rectangle(-50, 0, angryFlower.width + 60, angryFlower.height, {
        isSensor: true,
        label: 'isAggroZone'
    });

    var compoundFlowerBody = M.Body.create({
        parts: [
            flowerBody, flowerAggroZone
        ],
        isStatic: true
    });

    flowerAtkZone = angryFlowerController.flowerAtkZone;

    angryFlower.setExistingBody(compoundFlowerBody).setFixedRotation().setPosition(550, 808);

    this.anims.create({
        key: 'flowerAttack',
        frames: [{
            key: 'angry_flower',
            frame: 0,
            duration: 2000
        }, {
            key: 'angry_flower',
            frame: 1
        }, {
            key: 'angry_flower',
            frame: 2
        }, {
            key: 'angry_flower',
            frame: 3
        }, {
            key: 'angry_flower',
            frame: 4
        }, {
            key: 'angry_flower',
            frame: 5
        }, {
            key: 'angry_flower',
            frame: 6,
            duration: 100
        }],
        frameRate: 8,
        repeat: -1,
        skipMissedFrames: false
    });


    /** Animation events */
    matterSprite.on('animationstart', function (animation, frame) {

        /** Player */
        if (matterSprite.anims.currentAnim.key === 'climb') {
            if (matterSprite.anims.currentFrame.textureFrame === 33) {
                matterSprite.y -= 10;
            }
        }

    });


    matterSprite.on('animationupdate', function (animation, frame) {

        /** Player */
        if (matterSprite.anims.currentAnim.key === 'hang') {
            if (W.isDown || SPACE.isDown) {
                matterSprite.anims.play('climb');
            }
        }

        if (matterSprite.anims.currentAnim.key === 'climb') {
            if (matterSprite.anims.currentFrame.textureFrame === 34) {
                matterSprite.y -= 10;
            }

            if (matterSprite.anims.currentFrame.textureFrame === 77) {
                matterSprite.setIgnoreGravity(false);
                matterSprite.setVelocityY(-5);
                if (matterSprite.flipX) {
                    matterSprite.setVelocityX(-1);
                } else {
                    matterSprite.setVelocityX(1);
                }
            }

            if (matterSprite.anims.currentFrame.textureFrame === 23) {
                matterSprite.setCollisionCategory(1);
            }

            if (matterSprite.anims.currentFrame.textureFrame === 5) {
                matterSprite.setVelocityX(0, 0);
            }
        }

        if (matterSprite.anims.currentAnim.key === 'playerAttack') {

            if (matterSprite.anims.currentFrame.textureFrame === 44 || matterSprite.anims.currentFrame.textureFrame === 50 || matterSprite.anims.currentFrame.textureFrame === 55) {
                if (!playerAtkZone) {
                    if (!matterSprite.flipX) {
                        playerAtkZone = this.matter.add.circle(matterSprite.x + 10, matterSprite.y, 14, {
                            label: 'sword',
                            ignoreGravity: true,
                            isSensor: true
                        });
                    } else {
                        playerAtkZone = this.matter.add.circle(matterSprite.x - 10, matterSprite.y, 14, {
                            label: 'sword',
                            ignoreGravity: true,
                            isSensor: true
                        });
                    }
                }

            }

            if (matterSprite.anims.currentFrame.textureFrame === 46 || matterSprite.anims.currentFrame.textureFrame === 52 || matterSprite.anims.currentFrame.textureFrame === 57) {
                if (playerAtkZone) {
                    this.matter.world.remove(playerAtkZone);
                    playerAtkZone = null;
                }
            }


        } else if (playerAtkZone) {
            this.matter.world.remove(playerAtkZone);
            playerAtkZone = null;
        }


        /** Angry Flowers */
        if (angryFlower.anims.currentFrame) {
            if (angryFlower.anims.currentAnim.key === 'flowerAttack') {
                if (angryFlower.anims.currentFrame.textureFrame === 5 || angryFlower.anims.currentFrame.textureFrame === 6) {
                    if (!flowerAtkZone) {
                        flowerAtkZone = this.matter.add.circle(angryFlower.x - 35, angryFlower.y + 5, 14, {
                            label: 'smash',
                            isStatic: true
                        });
                    }
                } else if (flowerAtkZone) {
                    this.matter.world.remove(flowerAtkZone);
                    flowerAtkZone = null;
                }

                if (angryFlower.anims.currentFrame.textureFrame === 0 && angryFlowerController.inPause) {
                    angryFlower.anims.pause();
                }
            }
        }

    }, this);

    matterSprite.on('animationcomplete', animComplete, this);

    function animComplete(animation, frame) {


        if (matterSprite.anims.currentFrame.index === 3) {
            matterSprite.anims.play('turn');
            matterSprite.setVelocityX(0);
        }

        if (matterSprite.anims.currentAnim.key === 'jump') {
            if (matterSprite.anims.currentFrame.index) {
                matterSprite.anims.play('fall');
            }
        }


        switch (matterSprite.anims.currentAnim.key) {
            case 'climb':
                gameStart = true;
                break;
            case 'getSword':
                gameStart = true;
                break;
            case 'hideSword':
                gameStart = true;
                break;
            case 'isHited':
                gameStart = true;
                matterSprite.anims.play('turnInBattle', true);
                break;
            case 'playerAttack':
                matterSprite.anims.play('turnInBattle', true);
                break;

        }

    }

    /* Binding keys */
    A = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    D = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    SPACE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    W = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    S = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    K = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K);

    /** Collision events */
    this.matter.world.on('beforeupdate', function (event) {
        playerController.numTouching.left = 0;
        playerController.numTouching.right = 0;
        playerController.numTouching.bottom = 0;
        playerController.numTouching.up = 0;

    });

    this.matter.world.on('collisionactive', function (event) {
        var left = playerController.sensors.left;
        var right = playerController.sensors.right;
        var bottom = playerController.sensors.bottom;
        var up = playerController.sensors.up;

        for (var i = 0; i < event.pairs.length; i++) {
            var bodyA = event.pairs[i].bodyA;
            var bodyB = event.pairs[i].bodyB;


            if (bodyB === bottom) {
                playerController.numTouching.bottom += 1;

                /** Jump DOWN through the Ground */
                if (S.isDown && SPACE.isDown) {
                    if (bodyA.label === 'behindGround') {
                        bodyA.collisionFilter.category = 0;
                        matterSprite.anims.play('fall');
                        touchedTiles.push(bodyA);
                        setTimeout(() => {
                            restoreCollision = true;
                        }, 300);
                    }
                }

            } else if ((bodyB === left && bodyA.isStatic)) {
                playerController.numTouching.left += 1;
            } else if ((bodyB === right && bodyA.isStatic)) {
                playerController.numTouching.right += 1;
            } else if (bodyB === up) {
                playerController.numTouching.up += 1;
            }

        }
    });

    this.matter.world.on('collisionstart', function (event) {
        var left = playerController.sensors.left;
        var right = playerController.sensors.right;
        var up = playerController.sensors.up;
        var bottom = playerController.sensors.bottom;

        for (var i = 0; i < event.pairs.length; i++) {
            var bodyA = event.pairs[i].bodyA;
            var bodyB = event.pairs[i].bodyB;

            /** Player Jump UP through the Ground */
            if (bodyB === up || bodyB === right || bodyB === left) {
                if (bodyA.label === 'behindGround' && matterSprite.anims.currentAnim.key !== 'climb') {
                    bodyA.collisionFilter.category = 0;
                    touchedTiles.push(bodyA);
                    setTimeout(() => {
                        restoreCollision = true;
                    }, 500);
                }
            }

            /** PLayer drowned */
            if (bodyB === bottom) {
                if (bodyA.label === 'drowned') {
                    cam.flash();
                    var climbPoint = searchNearClimbPoint(matterSprite.x, matterSprite.y);
                    if (climbPoint.y) {
                        gameStart = false;
                        if (climbPoint.type === 'flipX') {
                            matterSprite.flipX = true;
                        }
                        matterSprite.setVelocity(0, 0);
                        matterSprite.setPosition(climbPoint.x, climbPoint.y);
                        smoothMoveCameraTowards(matterSprite);
                        matterSprite.setIgnoreGravity(true);
                        matterSprite.setCollisionCategory(0);
                        matterSprite.anims.play('hang', true);
                    }
                }
            }

            /** Player hit */
            if (bodyB.label === 'sword' && bodyA === flowerBody) {
                angryFlower.setTint(0xAF111C);
                angryFlowerController.hp--;
                setTimeout(() => {
                    angryFlowerController.underAttack = true;
                }, 150);
                if (angryFlowerController.hp === 0) {
                    this.matter.world.remove(angryFlower);
                    angryFlower.visible = false;
                }
            }

            /** Player Battle on */
            if (bodyA.label === 'visionZone' && bodyB === flowerBody) {
                if (playerController.blocked.bottom) {
                    gameStart = false;
                    matterSprite.setVelocityX(0);
                    inBattle = true;
                    matterSprite.anims.play('getSword');
                } else {
                    setTimeout(() => {
                        gameStart = false;
                        matterSprite.setVelocityX(0);
                        inBattle = true;
                        matterSprite.anims.play('getSword');
                    }, 200)
                }
            }

            /** Angry flowers smash */
            if (bodyB.label === 'smash' && bodyA === playerBody) {
                gameStart = false;
                matterSprite.setVelocity(-1, -2);
                matterSprite.anims.play('isHited');
                playerController.hp--;
                if (playerController.hp === 0) {
                    GameOver = true;
                    this.scene.start('GameOver');
                }
            }

            /** Angry flowers aggro on */
            if (bodyB.label === 'isAggroZone' && bodyA === playerBody) {

                angryFlowerController.inPause = false;
                if (angryFlower.anims.isPaused) {
                    angryFlower.anims.resume();
                } else {
                    angryFlower.anims.play('flowerAttack');
                }

            }
        }
    }, this);

    this.matter.world.on('collisionend', function (event) {
        for (var i = 0; i < event.pairs.length; i++) {
            var bodyA = event.pairs[i].bodyA;
            var bodyB = event.pairs[i].bodyB;

            /** Player after hit */
            if (bodyB.label === 'sword' && bodyA === flowerBody && angryFlowerController.underAttack) {
                angryFlowerController.underAttack = false;
                angryFlower.clearTint();
            }

            /** Player Battle off */
            if (bodyA.label === 'visionZone' && bodyB.label === 'isAggroZone' && playerController.blocked.bottom && inBattle) {
                gameStart = false;
                matterSprite.setVelocityX(0);
                inBattle = false;
                matterSprite.anims.play('hideSword');
            }

            /** Angry flowers aggro off */
            if (bodyB.label === 'isAggroZone' && bodyA === playerBody) {
                angryFlowerController.inPause = true;
            }

        }
    });

    this.matter.world.on('afterupdate', function (event) {
        playerController.blocked.right = playerController.numTouching.right > 0 ? true : false;
        playerController.blocked.left = playerController.numTouching.left > 0 ? true : false;
        playerController.blocked.bottom = playerController.numTouching.bottom > 0 ? true : false;
        playerController.blocked.up = playerController.numTouching.up > 0 ? true : false;
    });


    /** Stars 
    stars = this.matter.add.imageStack({
        key: 'star',
        repeat: 11,
        setXY: {
            x: 12,
            y: 0,
            stepX: 70
        }
    });

    stars.children.iterate(function (child) {

        child.setBounceY(Phaser.Math.FloatBetween(0.2, 0.5));

    });*/

    /** Bombs 
    bombs = this.matter.add.group();*/

    /** Colliders
    this.matter.add.collider(groundLayer, player);
    this.matter.add.collider(groundLayer, stars);
    this.matter.add.collider(groundLayer, bombs);
    this.matter.add.collider(player, bombs, hitBomb, null, this);

    function hitBomb(player, bomb) {
        this.matter.pause();
        GameOver = true;
        this.scene.start('GameOver');
    }*/
    //player.setCollidesWith(groundLayer);


    /** Overlaps 
    this.matter.add.overlap(player, stars, collectStar, null, this);

    function collectStar(player, star) {
        star.disableBody(true, true);
        score += 10;
        scoreText.setText('Score: ' + score);

        if (stars.countActive(true) === 0) {
            stars.children.iterate(function (child) {

                child.enableBody(true, child.x, 0, true, true);

            });

            var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

            var bomb = bombs.create(x, 16, 'bomb');
            bomb.setBounce(1);
            bomb.setCollideWorldBounds(true);
            bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
            bomb.allowGravity = false;

        }
    }

    

    /** Camera */
    cam = this.cameras.main;
    cam.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    cam.setRoundPixels(true);
    setTimeout(() => {
        matterSprite.anims.play('fall');
        gameStart = true;
    }, 1);


    /** Foreground */
    decorLayer2 = map.createDynamicLayer('decoration2', decorTiles2, 0, 0);
    waterLayer = map.createDynamicLayer('water', waterTiles, 0, 0);
    decorLayer1 = map.createDynamicLayer('decoration1', decorTiles1, 0, 0);
}

function updateA(time, delta) {
    if (!GameOver) {
        if (gameStart) {
            /** Smooth movement */
            var oldVelocityX;
            var targetVelocityX;
            var newVelocityX;

            /* Movements */
            if (A.isDown && playerController.blocked.bottom && !S.isDown) {
                smoothedControls.moveLeft(delta);
                oldVelocityX = matterSprite.body.velocity.x;
                targetVelocityX = -3;
                newVelocityX = Phaser.Math.Linear(oldVelocityX, targetVelocityX, -smoothedControls.value);
                matterSprite.anims.play('run', true);
                matterSprite.flipX = true;
                matterSprite.setVelocityX(newVelocityX);
            } else if (D.isDown && playerController.blocked.bottom && !S.isDown) {
                smoothedControls.moveRight(delta);
                oldVelocityX = matterSprite.body.velocity.x;
                targetVelocityX = 3;
                newVelocityX = Phaser.Math.Linear(oldVelocityX, targetVelocityX, smoothedControls.value);
                matterSprite.anims.play('run', true);
                matterSprite.flipX = false;
                matterSprite.setVelocityX(newVelocityX);
            } else if (playerController.blocked.bottom) {
                smoothedControls.reset();
                matterSprite.setVelocityX(0);
                if (matterSprite.anims.currentAnim.key !== 'fall' && matterSprite.anims.currentAnim.key !== 'land' && !S.isDown && matterSprite.anims.currentAnim.key !== 'isHited' && matterSprite.anims.currentAnim.key !== 'playerAttack') {
                    if (!inBattle) {
                        matterSprite.anims.play('turn', true);
                    } else {
                        matterSprite.anims.play('turnInBattle', true);
                    }
                }
            }


            /* Air movements */
            if (A.isDown && !playerController.blocked.bottom) {
                matterSprite.setVelocityX(-3);
                matterSprite.flipX = true;
            } else if (D.isDown && !playerController.blocked.bottom) {
                matterSprite.setVelocityX(3);
                matterSprite.flipX = false;
            }

            /** Falling */
            if (playerController.blocked.bottom) {
                playerController.getTime = 0;
            }
            if (playerController.getTime === 0 && !playerController.blocked.bottom && !playerController.blocked.up && !playerController.blocked.right && !playerController.blocked.left && matterSprite.anims.currentAnim.key !== 'jump' && matterSprite.anims.currentAnim.key !== 'fall') {
                playerController.getTime = time;
            }
            if (playerController.getTime !== 0 && time >= playerController.getTime + 100) {
                matterSprite.anims.play('fall');
            }


            /** Jumping */
            if (!inBattle) {
                if (SPACE.isDown || W.isDown) {
                    if (playerController.blocked.bottom && canJump && !S.isDown) {
                        matterSprite.setVelocityY(-9);
                        matterSprite.anims.play('jump');
                        canJump = false;
                    }
                }
                if (W.isUp || SPACE.isUp) {
                    if (playerController.blocked.bottom) {
                        canJump = true;
                    }
                }
            }

            /** Landing */
            if (playerController.blocked.bottom && matterSprite.anims.currentAnim.key === 'fall') {
                matterSprite.anims.play('land');
            }

            /** Siting */
            if (S.isDown && playerController.blocked.bottom) {
                matterSprite.anims.play('sit-down', true);
                smoothedControls.reset();
                matterSprite.setVelocityX(0);
            }

            /** Restore collide */
            if (touchedTiles.length > 0 && restoreCollision) {
                touchedTiles.forEach((el, index, arr) => {
                    el.collisionFilter.category = 1;
                    if (index === arr.length - 1) {
                        touchedTiles = [];
                    }
                });
            }
            if (touchedTiles.length === 0) {
                restoreCollision = false;
            }

            /** Attack */
            if (inBattle) {
                if (K.isDown && playerController.blocked.bottom && canAttack) {
                    canAttack = false;
                    matterSprite.anims.play('playerAttack');
                }

                if (K.isUp) {
                    canAttack = true;
                }
            }




            /** Debug */
            if (playerController.blocked.right) {
                //console.log('right');
            }

            if (playerController.blocked.left) {
                //console.log('left');
            }

            if (playerController.blocked.bottom) {
                //console.log('bottom');
            }

            if (playerController.blocked.up) {
                //console.log('up');
            }

            if (matterSprite.anims.currentAnim.key === 'fall') {
                //console.log('fall')
            }
        }
        smoothMoveCameraTowards(matterSprite, 0.9);
    }
}

function searchNearClimbPoint(player_x, player_y) {
    var result = [];
    var obj;

    climbPoints.forEach((el, index, arr) => {
        var y = player_y - el.y;
        result.push(y);

        if (index === arr.length - 1) {
            var rr = Math.min.apply(null, result);
            climbPoints.forEach(el => {
                var tryIt = player_y - el.y;
                if (tryIt === rr) {
                    obj = el;
                }
            })
        }
    });

    return obj;
}

function smoothMoveCameraTowards(target, smoothFactor) {
    if (smoothFactor === undefined) {
        smoothFactor = 0;
    }
    cam.scrollX = smoothFactor * cam.scrollX + (1 - smoothFactor) * (target.x - cam.width * 0.5);
    cam.scrollY = smoothFactor * cam.scrollY + (1 - smoothFactor) * (target.y - cam.height * 0.5);
}

/** GameOver */

function preloadB() {

    this.load.image('hand', 'assets/hand.png');
}

function createB() {

    var hand = this.add.image(204, 170, 'hand');
    hand.scaleX = 0.2;
    hand.scaleY = 0.2;

    var text = this.add.text(25, 251, 'RETRY?', {
        fontSize: '30px',
        fill: '#F4F4F4'
    });

    this.add.text(120, 10, 'GAME OVER', {
        fontSize: '38px',
        fill: '#FF0101'
    });

    text.setInteractive();

    text.on('pointerdown', function (pointer) {
        this.scene.start('Menu');
    }, this);

    this.input.on('gameobjectover', function (pointer, text) {
        text.setTint(0xff0000, 0xFF0101, 0xFF0101, 0x76D04E);
    });

    this.input.on('gameobjectout', function (pointer, text) {
        text.clearTint();
    });

}