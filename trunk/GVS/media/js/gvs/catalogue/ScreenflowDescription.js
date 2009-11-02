var ScreenflowDescription = Class.create(BuildingBlockDescription,
    /** @lends ScreenflowDescription.prototype */ {

    /**
     * Screenflow building block description.
     * @constructs
     * @extends BuildingBlockDescription
     */
    initialize: function($super, /** Hash */ properties) {
        this.definition = new Object();
        this.definition.screens = new Array();
        this.definition.preconditions = new Array();
        this.definition.postconditions = new Array();
        this.description = new Object();
        this.label = new Object();
        this.domainContext = new Array();
        
        $super(properties);
    },
    
    /**
     * Adds a new screen.
     * @param ScreenDescription
     *      Screen to be added to the
     *      Screenflow document.
     */
    addScreen: function (/** String */ uri, /** Object */ position) {
        this.definition.screens.push({
            "uri":   uri,
            "position": position
        });
    },

    /**
     * Delete a screen.
     * @param ScreenDescription
     *      Screen to be deleted from the
     *      Screenflow document.
     */
    removeScreen: function(/** String */ id) { 
        for (var i=0; i < this.definition.screens.length; i++) {
            if (this.definition.screens[i].uri == id) {
                this.definition.screens.splice(i,1);
                break;
            }
        }
    },
    /**
     * Adds a new *-condition to the screenflow description
     */
    addPrePost: function(/** PrePostInstance */ instance) {
        switch(instance.getType()) {
            case 'pre':
                this.definition.preconditions.push(instance.getProperties());
                break;
            case 'post':
                this.definition.postconditions.push(instance.getProperties());
                break;
            default:
                //Do nothing
        }  
    },
    /**
     * Removing a *-condition
     */
    removePrePost: function(/** String */ id) {
        var found = false;
        for (var i=0; i < this.definition.preconditions.length; i++) {
            if (this.definition.preconditions[i].uri == id) {
                this.definition.preconditions.splice(i,1);
                found = true;
                break;
            }
        }
        if (!found) {
            for (var i=0; i < this.definition.postconditions.length; i++) {
                if (this.definition.postconditions[i].uri == id) {
                    this.definition.postconditions.splice(i,1);
                    found = true;
                    break;
                }
            }            
        }       
    },
    
    /**
     * Implementing the TableModel interface
     * @type String
     */
    getTitle: function() {
        return this.label['en-gb'];    
    },
    
    /**
     * Implementing the TableModel interface
     * @type Array
     */
    getInfo: function() {
        var info = new Hash();
        info.set('Title', this.getTitle());
        info.set('Tags', this.domainContext.tags.join(", "));
        info.set('Version', this.version);
        return info;
    },
    
    
    
    //************************ PRIVATE METHODS *******************//
    /**
     * @type Array
     */
    _getScreenUris: function() {
        var uris = [];
        this.screens.each(function (pair) {
            uris.push(pair.key);
        });
        return uris;
    }
});

// vim:ts=4:sw=4:et: 