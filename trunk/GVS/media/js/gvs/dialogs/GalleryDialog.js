var GalleryDialog = Class.create(FormDialog, /** @lends GalleryDialog.prototype */ {
    /**
     * This class handles dialogs with a gallery (a table) of elements
     * Any descendant must use this class as follows:
     *      It must call to _setFields, _setButtons and _addRows, before calling
     *      _render, which will be the method that builds the interface, using
     *      the information that has been stated in the previous methods.
     * TODO: Add pagination
     * @abstract
     * @extends FormDialog
     * @constructs
     */ 
    initialize: function($super, /** String */ title,
                        /** Object (Optional) */ _properties) {
        $super({
            'title': title,
            'style': 'display:none;'
        }, FormDialog.POSITION_TOP);
        
        var properties = Utils.variableOrDefault(_properties, {});

        /**
         * Hash of properties of the gallery
         * @type Hash
         * @private
         */
        this._properties = new Hash();

        
        // Assigning the passed parameters, or defaults
        this._properties.set('showTitleRow', (properties.showTitleRow || false));
        this._properties.set('elementsPerPage', (properties.elementsPerPage || 10));

        /**
         * Table fields
         * @type Array
         * @private
         */
        this._fields = null;

        /**
         * Buttons that will be shown when an element is clicked
         * @type Array
         * @private
         */
        this._buttons = null;
        
        /**
         * List of rows
         * @type Array
         * @private
         */
        this._rows = new Array();

        /**
         * Currently selected row
         * @type Object
         * @private
         */
        this._selectedRow = null;
    },
    

    // **************** PUBLIC METHODS **************** //

    /**
     * @override
     */
    show: function() {
        // Do nothing. To be overriden
    },
    
    // **************** PRIVATE METHODS **************** //
    /**
     * Set the field list
     * Each of the fields is an object with the following structure:
     *  * String title. Field human readable title
     *  * Boolean hidden. The field won't be shown in the interface
     *  * String className. CSS class that will be applied to the whole
     *                  column
     * @private
     */
    _setFields: function (/** Array */ fields) {
        this._fields = fields;
    },

    /**
     * Set the button list.
     * Each element is an object with the following structure:
     *  * String value: Text of the button
     *  * Function handler: function which will be called when the button
     *              is clicked. The function will receive the key value of
     *              the selected element
     * @private
     */
    _setButtons: function(/** Array */ buttons) {
        this._buttons = buttons;
    },

    /**
     * Adds a new row to the gallery.
     * It has to be an Object with this structure:
     *    * String key: key of the row
     *    * Array values: List with all the fields. Each of them must be
     *                    a String or a DOM node
     * @private
     */
    _addRow: function(/** Object */ row) {
        this._rows.push(row);
    },

    /**
     * Builds the user interface, using the gathered information
     * @private
     */
    _render: function(/** Boolean(Optional) */ _loadAll) {
        var loadAll = Utils.variableOrDefault(_loadAll, true);
        
        var content = new Element('div', {
            'class': 'gallery'
        });

        if (this._properties.get("showTitleRow")) {
            // TODO
        }

        this._rows.each(function(row) {
            var rowNode = new Element('div', {
                'class': 'row'
            });
            var rowValues = row.values;

            for (var i=0; i < rowValues.size(); i++) {
                if (!this._fields[i].hidden) {
                    var field = new Element('div',{
                        'class': "field " + this._fields[i].className
                    }).update(rowValues[i]);
                    rowNode.appendChild(field);
                }
            }
            rowNode.observe('click', function(event) {
                $$(".gallery .row").each(function(node) {
                    node.removeClassName("selected");
                });

                var element = event.findElement(".row");
                element.addClassName("selected");
                
                this._selectedRow = row;
                // TODO
                // this._showButtons();
            }.bind(this));
            content.appendChild(rowNode);
        }.bind(this));
        if (loadAll && this._rows.size() > 0) {
            this._removeButtons();
            this._buttons.each(function(button){
                this._addButton(button.value, function() {
                    button.handler(this._selectedRow.key);
                }.bind(this));
            }.bind(this));
        }      
        if (!this._properties.get("showTitleRow") && content.firstChild) {
            content.firstChild.addClassName("selected");
        }
        if (this._rows.size() == 0) {
            var info = new Element("div", {
                'class': 'info'
            }).update("Uppss....Nothing here");
            content.appendChild(info);
            this._removeButtons();
            this._addButton("Close", this._dialog.hide.bind(this._dialog));
        }
        this._selectedRow = this._rows[0];
        this._setContent(content);
    },

    /**
     * Empty the list of rows
     * @private
     */
    _emptyRows: function() {
        this._rows = new Array();
    },

    /**
     * Function called when the content is loaded
     * @private
     */
    _show: function() {
        this._initDialogInterface();
        GVSSingleton.getInstance().setEnabled(false);
        this._dialog.show();
    }
});

// vim:ts=4:sw=4:et:
