define( [ 'libs/extender' ], function( extend ) {
    /* see node.js EventEmitter */

    var EventEmitter = {};

    EventEmitter.on = function( name, action ) {
        if ( !this._events ) {
            this._events = [];
        }
        if ( !( name in this._events ) ) {
            this._events[ name ] = [];
        }

        this._events[ name ].push( action );
    };

    EventEmitter.emit = function( name ) {
        if ( !this._events ) {
            return;
        }

        var params = Array.prototype.slice.call( arguments, 1 );
        var events = this._events[ name ];
        if ( !events ) {
            return;
        }
        // do not change to loop based on length
        // because some indexes of the array are undefined
        // due to the splice on removeListener
        for ( var i in events ) {
            var action = events[ i ];
            action.apply( this, params );
            if ( action.once ) {
                events.splice( i, 1 );
                if ( !events.length ) {
                    break;
                }
                --i;
            }
        }
    };

    EventEmitter.once = function( name, action ) {
        action.once = true;
        this.on( name, action );
    };

    EventEmitter.clearListeners = function( name ) {
        this._events[ name ] = [];
    };

    EventEmitter.removeListener = function( name, callback ) {
        if ( !this._events[ name ] ) {
            return false;
        }
        var actionlist = this._events[ name ];
        for ( var i = 0, l = actionlist.length; i < l; i++ ) {
            if ( actionlist[ i ] === callback ) {
                actionlist.splice( i, 1 );
                return true;
            }
        }
        return false;
    };

    var EventWaiter = Object.create( EventEmitter );

    EventWaiter.wait = function( obj, name, title ) {
        this.waitMore( title );
        var that = this;
        obj.once( name, function() {
            that.waitLess( title );
        } );
    };

    EventWaiter.waitTimed = function( obj, name, time, title ) {
        this.waitMore( title );
        var that = this;
        var timeout = setTimeout( function() {
            that.waitLess( title );
        }, time );
        obj.once( name, function() {
            setTimeout( function() {
                that.waitLess( title );
                clearTimeout( timeout );
            }, 0 ); // be sure other callbacks are called first
        } );
    };

    EventWaiter.callback = function( title ) {
        this.waitMore( title );
        var that = this;
        return function() {
            that.waitLess( title );
        };
    };

    EventWaiter.waitMore = function( title ) {
        title = title || "";
        if ( !this._waitingList ) {
            this._waitingList = [];
        }
        this._waitingList.push( title );
    };

    EventWaiter.waitLess = function( title ) {
        var i = this._waitingList.indexOf( title );
        this._waitingList.splice( i, 1 );
        this.emit( 'one', title );
        if ( !this._waitingList.length ) {
            this.emit( 'complete' );
        }
    };

    EventWaiter.isComplete = function() {
        return this._waitingList && !!this._waitingList.length;
    };

    EventWaiter.getWaitingList = function() {
        return this._waitingList;
    };

    var EventChain = Object.create( EventEmitter );

    EventChain.push = function( f ) {
        if ( !this._chain ) {
            this._chain = [];
        }
        if ( f instanceof EventChain ) {
            this._chain.push( function( callback ) {
                f.once( 'complete', callback );
                f.start();
            } );
        }
        else {
            this._chain.push( f );
        }
    };

    EventChain.next = function() {
        var that = this;
        if ( !this._chain || !this._chain.length ) {
            setTimeout( function() {
                that.emit( 'complete' );
            }, 0 );
            return false;
        }
        running = true;
        ( chain.shift( arguments ) )( function() {
            that.emit( 'one' );
            that.next.apply( that, arguments )
        } );
    };

    EventChain.start = EventChain.next;

    return {
        EventEmitter: EventEmitter,
        EventWaiter: EventWaiter,
        EventChain: EventChain,
        all: function( objects, name, action ) {
            var waiter = Object.create( EventWaiter );
            for ( var i in objects ) {
                waiter.wait( objects[ i ], name );
            }
            waiter.on( 'complete', action );
            if ( !objects.length ) {
                waiter.emit( 'complete' );
            }
        }
    };
} );
