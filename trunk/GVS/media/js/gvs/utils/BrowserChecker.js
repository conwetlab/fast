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
        this._browserList = {'MSIE': {
                                'name': "Microsoft Internet Explorer",
                                'isThis': false            
                            },
                            'Opera': {
                                'name': 'Opera',
                                'isThis': false
                            },
                            'Chrome': {
                                'name': 'Chrome',
                                'isThis': false
                            },
                            'Safari': {
                                'name': 'Safari',
                                'isThis': false
                            },
                            'Firefox': {
                                'name': 'Firefox',
                                'isThis': false
                            }
        
        };
            
        var pattern;
        var match;
                    
        var ok = false;
        
        $H(this._browserList).each(function(pair) {
            pattern = ".*" + pair.key + "[/|\\s]+((\\w+)(\\.\\w+)*).*";
            if (!ok && (match = navigator.userAgent.match(pattern)) != null) {
                this._browserName =  pair.value.name;
                this._fullVersion =  match[1];
                this._shortVersion = match[2];
                this._browserList[pair.key].isThis = true;
                ok = true;
            }    
        }.bind(this));
        
        pattern = ".*\\s+(\\w+)[/|\\s]+((\\w+)(\\.\\w+)*)";
        
        if (!ok && ((match = navigator.userAgent.match(pattern)) != null)) {
            this._fullVersion  = match[2];
            this._shortVersion = match[3];
            if (this._browserList[match[1]]) {
                this._browserName  = this._browserList[match[1]].name;
                this._browserList[match[1]].isThis = true;
            }
            else {
                this._browserName = match[1];
            }
            ok = true;
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
        return this._browserList['MSIE'].isThis;
    },
    
    isOpera: function() {
        return this._browserList['Opera'].isThis;
    },
        
    isChrome: function() {
        return this._browserList['Chrome'].isThis;
    },
        
    isSafari: function() {
        return this._browserList['Safari'].isThis;
    },
    
    isFirefox: function() {
        return this._browserList['Firefox'].isThis;
    }
    
});
// vim:ts=4:sw=4:et:
