/*
    Developers:
        Dionysis "dionyziz" Zindros <dionyziz@gmail.com>

    Copyright (c) 2011, Dionysis Zindros
    All rights reserved.

    Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

    Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
    Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
    Neither the name of the Kamibu Limited nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
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