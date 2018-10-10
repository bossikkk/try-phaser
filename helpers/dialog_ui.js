gameStart = false;

var Plate = this.add.image(200, -100, 'plate').setScrollFactor(0);
Plate.scaleX = 0.4;
Plate.scaleY = 0.4;

var Text1 = this.add.text(115, -165,
    `You own sword, a piece of 
string and fire coins. Or buttons, 
probably buttons.`, {
        fontSize: 17,
        color: "#000"
    }).setScrollFactor(0).setFontFamily('font1').setStroke('#000', 0.1);

var buttonLong_blue = this.add.image(200, -40, 'buttonLong_blue').setScrollFactor(0).setScale(0.4, 0.4).setInteractive();
//var buttonLong_blue_pressed = this.add.image(200, -50, 'buttonLong_blue_pressed').setScrollFactor(0).setScale(0.4, 0.4);
var Text_ok = this.add.text(192, -50, 'OK', {
    fontSize: 16,
    fill: '#000'
}).setScrollFactor(0).setFontFamily('font1').setStroke('#000', 0.1);

buttonLong_blue.once('pointerdown', function (pointer, gameObject) {
    this.tweens.add({
        targets: [Text1, Plate, buttonLong_blue, Text_ok],
        y: '-=240',
        ease: 'Power1',
        duration: 1000,
        onComplete: function () {
            gameStart = true;
        }
    });

}, this);

this.tweens.add({
    targets: [Text1, Plate, buttonLong_blue, Text_ok],
    y: '+=240',
    ease: 'Power1',
    duration: 1000
});