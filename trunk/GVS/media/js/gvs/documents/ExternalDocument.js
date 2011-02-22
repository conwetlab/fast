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

        $super(title);

        var iframe = new Element('iframe', {
            src: url,
            style:'border: 0px; width: 100%; height: 100%; margin: 0px; padding:0px;'
        });
        this._tabContent.appendChild(iframe);
        this._addToolbarElement('reload', new ToolbarButton(
            'Reload current tab',
            'refresh',
            function() { iframe.contentWindow.location.reload(); },
            true
        ));
    },

    // **************** PRIVATE METHODS **************** //
    /**
     * @override
     */
    _closeDocument: function($super) {
        this._tabContent.update("");
        $super();
    }
});

// vim:ts=4:sw=4:et:
