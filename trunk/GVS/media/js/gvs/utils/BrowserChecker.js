/**
* This checks the browser name and version
*/ 
var BrowserChecker = Class.create({ /** @lends BrowserChecker.prototype */
    /**
     * Constructs
     */
    initialize: function() {
        
        /**
         * Browser name
         * @private
         * @type String
         */
        this._browserName  = navigator.appName;

        /**
         * Full version of the browser
         * @private
         * @type Number
         */
        this._fullVersion  = ''+parseFloat(navigator.appVersion); 

        /**
         * Short version of the browser
         * @private 
         * @type Number
         */
        this._shortVersion = parseInt(navigator.appVersion,10);
        
        /**
         * List of checked browsers
         * @private
         * @type Array
         */
        this._browserList = [
            ["MSIE",    "Microsoft Internet Explorer"],
            ["Opera",   "Opera"],
            ["Chrome",  "Chrome"],
            ["Safari",  "Safari"],
            ["Firefox", "Firefox"]
        ];
            
        var nameOffset, verOffset;            
        var ok = false;
        
        for (var i = 0; i < this._browserList.length; i++) {
            if ((verOffset = navigator.userAgent.indexOf(this._browserList[i][0]))!=-1) {
                this._browserName = this._browserList[i][1];
                this._fullVersion = navigator.userAgent.substring(verOffset + this._browserList[i][0].length + 1);
                ok = true;
                break;
            }
        }
        
        if (!ok && ((nameOffset = navigator.userAgent.lastIndexOf(' ')+1) < (verOffset = navigator.userAgent.lastIndexOf('/')))) {
            this._browserName = navigator.userAgent.substring(nameOffset,verOffset);
            this._fullVersion = navigator.userAgent.substring(verOffset+1);
            if (this._browserName.toLowerCase() == this._browserName.toUpperCase()) {
                this._browserName = navigator.appName;
            }
        }
        
        var ix;
        
        if ((ix = this._fullVersion.indexOf(";"))!=-1)
            this._fullVersion = this._fullVersion.substring(0,ix);
        if ((ix = this._fullVersion.indexOf(" "))!=-1)
            this._fullVersion = this._fullVersion.substring(0,ix);
        
        this._shortVersion = parseInt(''+this._fullVersion,10);
        if (isNaN(this._shortVersion)) {
            this._fullVersion  = ''+parseFloat(navigator.appVersion); 
            this._shortVersion = parseInt(navigator.appVersion,10);
        }
    },
    
    getName: function() {
        return this._browserName;
    },
       
    getVersion: function() {
        return this._fullVersion;
    },
        
    getShortVersion: function() {
        return this._shortVersion;
    },

    isIE: function() {
        return this._browserName == this._browserList[0][1];
    },
    
    isOpera: function() {
        return this._browserName == this._browserList[1][1];
    },
        
    isChrome: function() {
        return this._browserName == this._browserList[2][1];
    },
        
    isSafari: function() {
        return this._browserName == this._browserList[3][1];
    },
    
    isFirefox: function() {
        return this._browserName == this._browserList[4][1];
    }
    
});
// vim:ts=4:sw=4:et:
