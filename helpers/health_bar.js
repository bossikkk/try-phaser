health = [];
this.add.image(5, 10, 'health_bar1').setScrollFactor(0);

for (var x = 0; x < 14; x++) {
    health[x] = [];
    var sx = 18 + (x * 18);

    var bar = this.add.image(sx, 10, 'health_bar2').setScrollFactor(0);

    health[x] = bar;

    if (x === 13) {
        this.add.image(sx + 10, 10, 'health_bar3').setScrollFactor(0);
    }
}