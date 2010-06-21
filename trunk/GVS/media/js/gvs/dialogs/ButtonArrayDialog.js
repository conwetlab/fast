var ButtonArrayDialog = Class.create(FormDialog, /** @lends ButtonArrayDialog.prototype */ {
    /**
     * This class handles dialogs with sets of buttons
     * @extends FormDialog
     * @constructs
     */
    initialize: function($super, /** Array */ handlers, /** Object  */ _options) {
        $super({
            'title': "Choose Building Block",
            'style': 'display:none;'
        }, _options);

        /**
         * Object that stores the handler (i.e. functions that will be called
         * when the associated button is clicked)
         * @private
         * @type Array
         */
        this._handlers = handlers;

    },


    // **************** PUBLIC METHODS **************** //



    // **************** PRIVATE METHODS **************** //

    /**
     * Inits the user interface
     * @private
     * @override
     */
    _initDialogInterface: function() {
        var content = new Element('div', {
            'class': 'buttonArray'
        });
        this._handlers.each(function(pair) {
            var button = new dijit.form.Button({
                'label': pair.label,
                'onClick': function(){
                    this._dialog.hide();
                    pair.handler();
                }.bind(this)
            });
            content.appendChild(button.domNode);
            content.appendChild(new Element('br'));
        }.bind(this));
        this._setContent(content);
    }
});


// vim:ts=4:sw=4:et:
