var ScreenDescription = Class.create(BuildingBlockDescription,
    /** @lends ScreenDescription.prototype */ {

    /**
     * Screen building block description.
     * @constructs
     * @extends BuildingBlockDescription
     */
    initialize: function($super, /** Hash */ properties) {
        $super(properties);
    },
    
    /**
     * @override
     */
    getInfo: function() {
        var info = new Hash();
        info.set('Title', this.label['en-gb']);
        info.set('Description', this.description['en-gb']);
        info.set('Concepts', this.domainContext.tags);
        return info;

    }
});

// vim:ts=4:sw=4:et: 
