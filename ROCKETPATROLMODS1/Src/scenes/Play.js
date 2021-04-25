class Play extends Phaser.Scene {
    constructor() {
        super("playScene");
    }

    preload() {
        // load images/tile sprites
        this.load.image('bobber', './assets/bobber.png');
        this.load.image('fish', './assets/fish.png');
        this.load.image('stream', './assets/stream.png');
        // load spritesheet
        this.load.spritesheet('reel', './assets/Reel.png', {frameWidth: 64, frameHeight: 32, startFrame: 0, endFrame: 9});
        this.load.audio('forest', './assets/Forest.wav');
        this.load.audio('water', './assets/Wilderness, Flowing Water Sound Effects, Stream, River, Waterfall Ambiences and Soundscapes.wav');
    }

    create() {
        // place tile sprite
        this.stream = this.add.tileSprite(0, 0, 640, 480, 'stream').setOrigin(0, 0);

        // green UI background
        this.add.rectangle(0, borderUISize + borderPadding, game.config.width, borderUISize * 2, 0x00FF00).setOrigin(0, 0);
        
        
        // add Rocket (p1)
        this.p1Bobber = new Bobber(this, game.config.width/2, game.config.height - borderUISize - borderPadding, 'bobber').setOrigin(0.5, 0);

        // add Fishs (x3)
        this.fish1 = new Fish(this, game.config.width + borderUISize*6, borderUISize*4, 'fish', 0, 30).setOrigin(0, 0);
        this.fish2 = new Fish(this, game.config.width + borderUISize*3, borderUISize*5 + borderPadding*2, 'fish', 0, 20).setOrigin(0,0);
        this.fish3 = new Fish(this, game.config.width, borderUISize*6 + borderPadding*4, 'fish', 0, 10).setOrigin(0,0);

        // define keys
        keyF = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
        keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        keyLEFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        keyRIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);

        // animation config
        this.anims.create({
            key: 'reelin',
            frames: this.anims.generateFrameNumbers('reel', { start: 0, end: 9, first: 0}),
            frameRate: 30
        });

        // initialize score
        this.p1Score = 0;
        

        // display score
        let scoreConfig = {
            fontFamily: 'Courier',
            fontSize: '28px',
            backgroundColor: '#F3B141',
            color: '#843605',
            align: 'right',
            padding: {
                top: 5,
                bottom: 5,
            },
            fixedWidth: 100
        }
        this.scoreLeft = this.add.text(borderUISize + borderPadding, borderUISize + borderPadding*2, this.p1Score, scoreConfig);

        // GAME OVER flag
        this.gameOver = false;

        // 60-second play clock
        scoreConfig.fixedWidth = 0;
        this.clock = this.time.delayedCall(game.settings.gameTimer, () => {
            this.add.text(game.config.width/2, game.config.height/2, 'GAME OVER', scoreConfig).setOrigin(0.5);
            this.add.text(game.config.width/2, game.config.height/2 + 64, 'Press (R) to Restart or ← to Menu', scoreConfig).setOrigin(0.5);
            this.gameOver = true;
        }, null, this);
        this.timerRight = this.add.text(game.config.width - borderUISize - borderPadding - 120, borderUISize + borderPadding*2, + this.clock.getElapsedSeconds(), scoreConfig);
        
        let musicConfig = {
            mute: false,
            volume: 0.25,
            rate:1,
            detune:0,
            seek:0,
            loop: true,
            delay: 0
        }

        this.music = this.sound.add('forest');
        this.music.play(musicConfig);

    }

    update() {
        
        // check key input for restart / menu
        if(this.gameOver && Phaser.Input.Keyboard.JustDown(keyR)) {
            this.scene.restart();
        }

        if(this.gameOver && Phaser.Input.Keyboard.JustDown(keyLEFT)) {
            this.scene.start("menuScene");
        }

        this.stream.tilePositionX -= 4;  // update tile sprite

        if(!this.gameOver) {
            this.p1Bobber.update();             // update p1
             this.fish1.update();               // update fish (x3)
            this.fish2.update();
            this.fish3.update();
        }

        // check collisions
        if(this.checkCollision(this.p1Bobber, this.fish3)) {
            this.p1Bobber.reset();
            this.fishReel(this.fish3);
            
            
        }
        if (this.checkCollision(this.p1Bobber, this.fish2)) {
            this.p1Bobber.reset();
            this.fishReel(this.fish2);
            
            
        }
        if (this.checkCollision(this.p1Bobber, this.fish1)) {
            this.p1Bobber.reset();
            this.fishReel(this.fish1);
            
        }

        this.timeLeft = Math.trunc(45 - this.clock.getElapsedSeconds());
        this.timerRight.text =  this.timeLeft;
    }

    checkCollision(bobber, fish) {
        // simple AABB checking
        if (bobber.x < fish.x + fish.width && 
            bobber.x + bobber.width > fish.x && 
            bobber.y < fish.y + fish.height &&
            bobber.height + bobber.y > fish. y) {
                return true;
        } else {
            return false;
        }
    }

    fishReel(fish) {
        // temporarily hide fish
        fish.alpha = 0;                         
        // create reel sprite at fish's position
        let boom = this.add.sprite(fish.x, fish.y, 'reel').setOrigin(0, 0);
        boom.anims.play('reelin');             // play reelin animation
        boom.on('animationcomplete', () => {    // callback after anim completes
            fish.reset();                         // reset fish position
            fish.alpha = 1;                       // make fish visible again
            boom.destroy(); 
                                  // remove reel sprite
        });
        // score add and repaint
        this.p1Score += fish.points;
        this.scoreLeft.text = this.p1Score; 
        
        this.sound.play('splash');
      }
}