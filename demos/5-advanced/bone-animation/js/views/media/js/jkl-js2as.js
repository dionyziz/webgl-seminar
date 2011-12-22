/* 
 * jkl-js2as.js - JavaScript Kantan Library for Audio
 * Copyright (c) 2009 Yusuke Kawasaki http://www.kawa.net/
 * 
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 * 
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 * 
 */

//  global

if ( ! window.JKL ) JKL = {};

// Console class

if ( ! JKL.Console ) {
    JKL.Console = window.console;
    if ( ! JKL.Console ) JKL.Console = {};
    if ( ! JKL.Console.log )  JKL.Console.log   = function () {};
    if ( ! JKL.Console.info ) JKL.Console.info  = function () {};
    if ( ! JKL.Console.warn ) JKL.Console.warn  = function () {};
    if ( ! JKL.Console.error ) {
        JKL.Console.error = function (mess) {
            alert( 'Error: '+mess );
        };
    }
}

// Util class

if ( ! JKL.Util ) {
    JKL.Util = function () {};
    JKL.Util.prefix = '_jkl_util_';
    JKL.Util._callbackId = 1;
    JKL.Util.prototype.getCallback = function ( func ) {
        if ( ! func ) return;
        if ( typeof(func) == 'string' ) return func;
        var id = JKL.Util._callbackId ++;
        var name = JKL.Util.prefix + id;
        var that = this;
        window[name] = function () {
            func.apply( null, arguments );
        };
        return name;
    };
}

// Job class

if ( ! JKL.Job ) {
    JKL.Job = function ( func, onfinish, onerror ) {
        if ( ! func ) return window.undefined;
        JKL.Job.Instances ++;
        this.id       = JKL.Job.Instances;
        this.func     = func;
        this.onfinish = onfinish;
        this.onerror  = onerror;
        this.done     = false;
        this.tried    = 0;
    };
    JKL.Job.Instances = 0;
    JKL.Job.prototype = new JKL.Util();
    JKL.Job.prototype.maxRetry  = 10;
    JKL.Job.prototype.interval  =  1;
    JKL.Job.prototype.run = function () {
        var ret = this.func();
        this.tried ++;
        if ( ret ) {
            this.done = true;
            if ( this.onfinish ) {
                this.onfinish( ret );
            }
        } else if ( this.tried < this.maxRetry ) {
            var that = this;
            var next = function () {
                that.run();
            };
            this.interval *= 2;
            window.setTimeout( next, this.interval );
        } else {
            if ( this.onerror ) {
                this.onerror( "too many retries: "+this.tried );
            }
        }
    }
}

// Proxy class

if ( ! JKL.JS2AS ) {
    JKL.JS2AS = function () {
        JKL.JS2AS.Instances ++;
        this.id = JKL.JS2AS.Instances;
        this._swfName = this.prefix + this.id;
        this.flashVars = {};
        this.flashParams = new JKL.JS2AS.FlashParams();
        this.flashAttributes = {};
        return this;
    };
    JKL.JS2AS.Instances = 0;
    JKL.JS2AS.prototype = new JKL.Util();

    JKL.JS2AS.prototype.prefix  = '_jkl_js2as_';
    JKL.JS2AS.prototype.id;
    JKL.JS2AS.prototype._swfName;
    JKL.JS2AS.prototype.swfPath     = null;
    JKL.JS2AS.prototype.installPath = null;
    JKL.JS2AS.prototype.noCache     = false;
    JKL.JS2AS.prototype.displayX    = 1;
    JKL.JS2AS.prototype.displayY    = 1;
    JKL.JS2AS.prototype.flashVersion = '9.0.0';
    JKL.JS2AS.prototype.flashVars;
    JKL.JS2AS.prototype.flashParams;
    JKL.JS2AS.prototype.flashAttributes;

    JKL.JS2AS.prototype.init = function (param) {
        if ( param ) {
            for( var key in param ) {
                this[key] = param[key];
            }
        }
        var that = this;
        var func = function () {
            return that.doInit();
        };
        var job = new JKL.Job( func );
        job.run();

    }
    JKL.JS2AS.prototype.doInit = function () {
        if ( ! document.body ) return false;
        if ( ! window.swfobject ) return false;

        // .swf file URL
        var swfPath   = this.swfPath;
        var instPath  = this.installPath;
        if ( this.noCache ) {
            swfPath  += '?'+Math.floor(Math.random()*900000+100000);
            instPath += '?'+Math.floor(Math.random()*900000+100000);
        }

        // create object element for flash
        var dummyElem = document.createElement( 'span' );   // dummy
        dummyElem.id = this._swfName;
        document.body.appendChild( dummyElem );

        // load flash
        swfobject.embedSWF(swfPath, this._swfName, this.displayX, this.displayY,
            this.flashVersion, instPath, this.flashVars,
            this.flashParams, this.flashAttributes);  

        // wait until flash is loaded
        var that = this;
        var func = function () {
            return that.waitReady();
        };
        var job = new JKL.Job( func );
        job.run();

        return true;
    }

    JKL.JS2AS.prototype.waitReady = function () {
        var swf = this.getSwfObject();
        if ( ! swf ) return false;
        if ( ! swf.create ) return false;

        // onready callback
        if ( this.onready ) {
            this.onready( this );
        }

        return true;
    }

    JKL.JS2AS.prototype._swfObject;
    JKL.JS2AS.prototype.getSwfObject = function () {
        if ( this._swfObject ) return this._swfObject;
        if (navigator.appName.indexOf("Microsoft") != -1) {
            this._swfObject = window[this._swfName]
        } else {
            this._swfObject = document[this._swfName]
        }
        return this._swfObject;
    }
}

//  flash parameters

if ( ! JKL.JS2AS.FlashParams ) {
    JKL.JS2AS.FlashParams = function () {};
    JKL.JS2AS.FlashParams.prototype.wmode           = 'transparent';
    JKL.JS2AS.FlashParams.prototype.quality         = 'low';
    JKL.JS2AS.FlashParams.prototype.scale           = 'noScale';
    JKL.JS2AS.FlashParams.prototype.salign          = 'lt';
    JKL.JS2AS.FlashParams.prototype.menu            = 'false';
    JKL.JS2AS.FlashParams.prototype.allowfullscreen = 'false';
}

//  item container

if ( ! JKL.JS2AS.Item ) {
    JKL.JS2AS.Item = function () {}
    JKL.JS2AS.Item.prototype = new JKL.Util();
    JKL.JS2AS.Item.prototype.className = null;
    JKL.JS2AS.Item.prototype.create = function () {
        var args = [];
        args.push.apply( args, arguments );

        var cls = this.proxy.className;
        args.unshift( cls );                // 1st argument

        var swf = this.proxy.getSwfObject();

        if ( ! swf ) return JKL.Console.error( 'swf not ready: '+this.swfPath );
        if ( ! swf.create ) return JKL.Console.error( 'create interface not found: '+this.swfPath );
        if ( ! cls ) return JKL.Console.error( 'invalid calss name: '+cls );

        this.id = swf.create.apply( swf, args );
    }

    JKL.JS2AS.Item.prototype.call = function () {
        var args = [];
        args.push.apply( args, arguments );
        args.unshift( this.id );            // 1st argument

        var swf = this.proxy.getSwfObject();
        var cls = this.proxy.className;
        if ( ! swf ) return JKL.Console.error( 'swf not ready: '+this.swfPath );
        if ( ! swf.call ) return JKL.Console.error( 'call interface not found: '+this.swfPath );
        if ( ! cls ) return JKL.Console.error( 'invalid calss name: '+cls );

        return swf.call.apply( swf, args );
    }

    JKL.JS2AS.Item.prototype.set = function ( key, val ) {
        var swf = this.proxy.getSwfObject();
        var cls = this.proxy.className;
        if ( ! swf ) return JKL.Console.error( 'swf not ready: '+this.swfPath );
        if ( ! swf.setter ) return JKL.Console.error( 'setter interface not found: '+this.swfPath );
        if ( ! cls ) return JKL.Console.error( 'invalid calss name: '+cls );

        if ( typeof(val) == 'function' ) {
            val = this.getCallback( val );
        }

        return swf.setter( this.id, key, val );
    }

    JKL.JS2AS.Item.prototype.get = function ( key ) {
        var swf = this.proxy.getSwfObject();
        var cls = this.proxy.className;
        if ( ! swf ) return JKL.Console.error( 'swf not ready: '+this.swfPath );
        if ( ! swf.getter ) return JKL.Console.error( 'getter interface not found: '+this.swfPath );
        if ( ! cls ) return JKL.Console.error( 'invalid calss name: '+cls );

        return swf.getter( this.id, key );
    }

    JKL.JS2AS.Item.prototype.drop = function () {
        var swf = this.proxy.getSwfObject();
        var cls = this.proxy.className;
        if ( ! swf ) return JKL.Console.error( 'swf not ready: '+this.swfPath );
        if ( ! swf.drop ) return JKL.Console.error( 'drop interface not found: '+this.swfPath );
        if ( ! cls ) return JKL.Console.error( 'invalid calss name: '+cls );

        return swf.drop( this.id );
    }
}
