/**
Copyright (C) 2011 by Tzortzidis Alexandros <chorvus@kamibu.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
**/

SimpleGraph = function( width, height, max, caption, color ) {
    var d = this.context = document.createElement( 'div' );
    var c = this.canvas = document.createElement( 'canvas' );
    var s = this.surface = c.getContext( '2d' );
    var t = this.text = document.createElement( 'span' );
    
    t.setAttribute( 'style', [
        'position: absolute',
        'bottom: 0', 
        'left: 4px',
        'color: white',
        'font-size: 8pt',
        'font-weight: bold' ].join( ';' ) );
    
    d.appendChild( c );
    d.appendChild( t );
    d.style.position = 'relative';
    d.style.borderTop = '1px solid #111';
    
    c.height = width || 40;
    c.width = height || 60;
    d.style.height = c.style.height = c.height + 'px';
    d.style.width = c.style.width = c.width + 'px';
    
    this.dynMax = false;
    if ( !max ) {
        this.dynMax = true;
        this.max = 0;
    }
    else {
        this.max = max || height || c.height;
    }
    this.caption = caption || '';
    t.innerHTML = caption + 0;
    s.strokeStyle = color || 'blue';
    s.fillStyle = 'black';
    s.lineWidth = 1;
    
    this.clearFrame();
};
SimpleGraph.prototype.appendTo = function( element ) {
    element.appendChild( this.context );
};
SimpleGraph.prototype.clearFrame = function() {
    var c = this.canvas;
    var s = this.surface;
    s.moveTo( 0, 0 );
    s.fillRect( 0, 0, c.width, c.height );
};
SimpleGraph.prototype.updateData = function( value ) {
    if ( value !== 0 && !value ) {
        return;
    }
    var s = this.surface;
    var c = this.canvas;
    if ( this.dynMax ) {
        if ( value > this.max ) {
            this.max = value;
        }
        //TODO: autoscale
    }
    this.moveOneStep();
    s.beginPath();
    s.moveTo( c.width - 1, c.height );
    s.lineTo( c.width - 1, c.height - ( value / this.max ) * c.height );
    s.closePath();
    s.stroke();
    this.text.innerHTML = this.caption + value;
};
SimpleGraph.prototype.moveOneStep = function() {
    var s = this.surface;
    var c = this.canvas;
    var backBuffer = s.getImageData( 1, 0, c.width - 1, c.height );
    this.clearFrame();
    s.putImageData( backBuffer, 0, 0 );
};