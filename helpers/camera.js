var getCamera = this.cameras.cameras[1]; // get camera in array of cameras

newCamera.setScroll(player.x - 75, player.y - 75); // scroll in center of object

var mainCamera = this.cameras.main; // get main camera

var newCamera = this.cameras.add(0, 401, 150, 150); // add new

newCamera.zoom = 0.7; // zoom

newCamera.flash(); newCamera.shake(); // some effects