var FormSnapshotView = Class.create(BuildingBlockView,
    /** @lends FormSnapshotView.prototype */ {

    /**
     * Forms graphical representation for the palette
     * @constructs
     * @extends BuildingBlockView
     */
    initialize: function($super, /** FormDescription */ description) {

        $super();


        this._node = new Element("div", {
            "class": "view form snapshot",
            "title": description.name
        });

        var image = new Element ('img',{
                'class': 'image',
                'src': description.icon
        });
        this._node.appendChild(image);

    },

    // **************** PUBLIC METHODS **************** //

    /**
     * Colorize the component depending on the reachability
     * @public @override
     */
    setReachability: function( /** Hash */ reachabilityData) {

        // TODO
    }

    // **************** PRIVATE METHODS **************** //
});

// vim:ts=4:sw=4:et:
