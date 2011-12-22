var media = {
    init: function () {
        HTML5.Audio.Proxy.getProxy( {
            swfPath: './js/media/swf/html5-audio.swf'
        } );
    },
    next: function () {
        //media.play( 'http://static.vl.kamibu.com/music/efface.mp3' );
    },
    play: function ( url ) {
        var snd = new Audio( url );
        
        snd.loop = true;
        setTimeout( function () {
            hud.showSong( 'Silence', 'Efface' );
        }, 3000 );
        snd.play();
        // document.getElementsByTagName( 'object' )[ 0 ].style.position = 'absolute';
    }
};
