var canvas = document.getElementById( 'canvas' );
var ctx = canvas.getContext( '2d' );

var W = canvas.width, H = canvas.height;

function drawImage( x, y, img, angle, opacity ) {
    if ( typeof opacity == 'undefined' ) {
        opacity = 1;
    }
    ctx.save();
    ctx.translate( x, y );
    ctx.rotate( angle );
    ctx.globalAlpha = opacity;
    ctx.drawImage( img, 0, 0, img.width, img.height, -img.width / 2, -img.height / 2, img.width, img.height );
    ctx.restore();
}

function drawPoint( x, y ) {
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc( x, y, 3, 0, 2 * Math.PI, true );
    ctx.fill();
}

function clearCanvas() {
    ctx.clearRect( 0, 0, W, H );
}
