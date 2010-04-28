var FactPane = Class.create( /** @lends FactPane.prototype */ {
    /**
     * This class handles the pre/post inspector
     * @constructs
     */
    initialize: function(/** DOMNode */ parentNode) {
        /**
         * Variable
         * @type Table
         * @private @member
         */
        this._factTable = new Table(parentNode, 'Facts', 'center');

    },


    // **************** PUBLIC METHODS **************** //


    /**
     * This function updates the table with data passed
     * as parameters
     */
    fillTable: function (/** Array */ preList,
                         /** Array */ postList, /** Array */ factList) {

        this._factTable.emptyTable();

        if (preList.size() > 0) {
            this._factTable.insertFieldTitles(['PRE','Description', 'Semantics']);
            this._factTable.insertDataValues(preList);
        }

        if (postList.size() > 0) {
            this._factTable.insertFieldTitles(['POST','Description', 'Semantics']);
            this._factTable.insertDataValues(postList);
        }

        if (factList.size() > 0) {
            this._factTable.insertFieldTitles(['Fact','Description', 'Semantics']);
            this._factTable.insertDataValues(factList);
        }
    }

    // **************** PRIVATE METHODS **************** //

});

// vim:ts=4:sw=4:et:
