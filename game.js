var smallScreen =  parseInt(getComputedStyle(document.body).width) < 400;
var scale = smallScreen ? 0.8 : 1;

var game = new Phaser.Game(400 * scale, 490 * scale, Phaser.AUTO, 'game');

var mainState = {

    preload: function() { 
        game.stage.backgroundColor = '#FF6A5E';
        bird = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyAQMAAAAk8RryAAAABlBMVEXSvicAAABogyUZAAAAGUlEQVR4AWP4DwYHMOgHDEDASCN6lMYV7gChf3AJ/eB/pQAAAABJRU5ErkJggg==";
        pipe = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyAQMAAAAk8RryAAAABlBMVEV0vy4AAADnrrHQAAAAGUlEQVR4AWP4DwYHMOgHDEDASCN6lMYV7gChf3AJ/eB/pQAAAABJRU5ErkJggg==";
        game.load.image('bird', bird);  
        game.load.image('pipe', pipe); 
    },

    create: function() { 
        game.physics.startSystem(Phaser.Physics.ARCADE);

        this.pipes = game.add.group();
        this.pipes.enableBody = true;
        this.pipes.createMultiple(20, 'pipe');  
        this.timer = this.game.time.events.loop(1500, this.addRowOfPipes, this);           

        this.bird = this.game.add.sprite(100 * scale, 245 * scale, 'bird');
        game.physics.arcade.enable(this.bird);
        this.bird.body.gravity.y = 1000; 

        // New anchor position
        this.bird.anchor.setTo(-0.2, 0.5); 
 
        var spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        spaceKey.onDown.add(this.jump, this); 

        this.score = 0;
        this.labelScore = this.game.add.text(20, 20, "0", { font: "30px Arial", fill: "#ffffff" });  
        this.pauseState = this.game.add.text(smallScreen ? 72 : 110, 230 * scale, "", { font: "bold 45px Arial", fill: "#ffffff", stroke: "#000000", strokeThickness: 5 });

        var clickCallback = (e) => {
            if (this.game.paused) {
                this.pauseOrResumeGame();
            } else {
                this.jump();
            }
        };

        var escKey = this.game.input.keyboard.addKey(Phaser.Keyboard.ESC);
        escKey.onDown.add(this.pauseOrResumeGame, this);
        spaceKey.onDown.add(clickCallback, this);

        this.game.input.mouse.mouseDownCallback = (e) => {
            if (e.button === Phaser.Mouse.LEFT_BUTTON) {
                clickCallback(e);
            };
        }

        this.game.input.touch.touchStartCallback = clickCallback;

        // Add the jump sound
        this.jumpSound = this.game.add.audio('jump');
    },

    update: function() {
        if (this.bird.inWorld == false)
            this.restartGame(); 

        game.physics.arcade.overlap(this.bird, this.pipes, this.hitPipe, null, this); 

        // Rotate the bird    
        if (this.bird.angle < 20)
            this.bird.angle += 1;
    },

    jump: function() {
        // If the bird is dead, he can't jump
        if (this.bird.alive == false)
            return; 

        this.bird.body.velocity.y = -350;

        // Jump animation
        game.add.tween(this.bird).to({angle: -20}, 100).start();
    },

    hitPipe: function() {
        // If the bird has already hit a pipe, we have nothing to do
        if (this.bird.alive == false)
            return;
            
        // Set the alive property of the bird to false
        this.bird.alive = false;

        // Prevent new pipes from appearing
        this.game.time.events.remove(this.timer);
    
        // Go through all the pipes, and stop their movement
        this.pipes.forEachAlive(function(p){
            p.body.velocity.x = 0;
        }, this);
    },

    restartGame: function() {
        game.state.start('main');
    },

    pauseOrResumeGame: function() {
        var paused = this.game.paused;

        if (!paused) {
            this.game.paused = true;
            this.pauseState.text = "PAUSED";
        } else {
            this.game.paused = false;
            this.pauseState.text = "";
        }
    },

    addOnePipe: function(x, y) {
        var pipe = this.pipes.getFirstDead();

        pipe.reset(x, y);
        pipe.body.velocity.x = -200;  
        pipe.checkWorldBounds = true;
        pipe.outOfBoundsKill = true;
    },

    addRowOfPipes: function() {
        var hole = Math.floor(Math.random()*(3+!smallScreen*2))+1;
        
        for (var i = 0; i < 8; i++)
            if (i != hole && i != hole +1 && (i != hole +2 || !smallScreen))
                this.addOnePipe(400 * scale, (i*60) * scale +10);   
    
        this.score += 1;
        this.labelScore.text = this.score;  
    },
};

game.state.add('main', mainState);  
game.state.start('main'); 