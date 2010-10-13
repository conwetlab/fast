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

        this._tabContent.appendChild(new Element('iframe', {
            'src': this._url,
            'style':'border: 0px; width: 100%; height: 100%; margin: 0px; padding:0px;'
        }));
    }

    // **************** PRIVATE METHODS **************** //

});

// vim:ts=4:sw=4:et:
