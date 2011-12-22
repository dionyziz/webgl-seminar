var settings = {
    modules: {
        root: "http://vl.kamibu.com/demo/"
    },
    player: {
        model: "skeleton",
        id: 1
    },
    network: {
        host: "aika.vl.kamibu.com",
        port: 80,
        enabled: true
    },
    arealoader: {
        staticItems: false,
        enable: true
    },
    graphics: {
        root: "js/views/graphics/"
    },
    resources: {
        root: "resources/"
    }
};

( function() {
    var i, module, moduleName;
    if ( typeof localsettings != 'object' ) {
        return;
    }
    for ( moduleName in localsettings ) {
        if ( !localsettings.hasOwnProperty( moduleName ) ) {
            continue;
        }
        module = localsettings[ moduleName ];
        if ( !( moduleName in settings ) ) {
            settings[ moduleName ] = module;
            continue;
        }
        for ( i in module ) {
            if ( !module.hasOwnProperty( i ) ) {
                continue;
            }
            settings[ moduleName ][ i ] = module[ i ];
        }
    }
} )();
