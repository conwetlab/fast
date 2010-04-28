var ExternalDocument = Class.create(AbstractDocument, /** @lends ExternalDocument.prototype */ {
    /**
     * Represents an external content
     * inner content.
     * @abstract
     * @extends AbstractDocument
     * @constructs
     */
    initialize: function ($super,
            /** String */ title,
            /** String */ url) {

        /**
         * Url of the external content
         * @type String
         * @private
         */
        this._url = url;

        $super(title, true);
    },

    // **************** PRIVATE METHODS **************** //

    _getWidget: function() {
        var iframe = new Element('iframe', {
            'id': this._tabId,
            'dojoType': 'dijit.layout.ContentPane',
            'src': this._url,
            'title': this._title,
            'style': 'display: none; border: 0px; width: 100%; height: 100%'
        });

        $("documentContainer").appendChild(iframe);
        dojo.parser.parse($("documentContainer"));
        var result = dijit.byId(this._tabId);
        result.attr("closable", true);
        result.connect('onClose', this._closeDocument.bind(this));

        return result;
    }
});

// vim:ts=4:sw=4:et:
