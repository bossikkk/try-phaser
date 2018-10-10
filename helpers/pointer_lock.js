// Pointer lock will only work after mousedown
game.canvas.addEventListener('mousedown', function () {
    game.input.mouse.requestPointerLock();
});

//example: http://labs.phaser.io/edit.html?src=src\games\topdownShooter\topdown_combatMechanics.js