var PaletteSearchBox = Class.create(
    /** @lends PaletteSearchBox.prototype */ {

     /**
     * Represents a search box.
     *
     * @constructs
     */
    initialize: function(/* String */ defaultValue) {

        /**
         * @public @member
         * @type String
         */
        this.defaultValue = defaultValue || "Search...";

        /**
         * @private @member
         * @type Array
         */
        this._listeners = [];

        /**
         * @private @member
         * @type String
         */
        this._textSearch = "";

        /**
         * @private @member
         * @type Input Html Element of prototypejs.org
         */
        this._inputElement = new Element('input', {
            'type':'text',
            'class':'defaultValue',
            'value':this.defaultValue
        });
        this._inputElement.observe('blur', this._lostFocus.bind(this));
        this._inputElement.observe('focus', this._getFocus.bind(this));
        new Form.Element.Observer(this._inputElement, 1, this._valueChange.bind(this));

        /**
         * @private @member
         * @type Div Html Element of prototypejs.org
         */
        this._rootNode = new Element('div', {'class':'searchBox'}).insert(this._inputElement);
    },

     /**
     * Gets the value of the textbox
     * @type String
     * @public
     */
    getValue: function() {
        if (this._inputElement.hasClassName('defaultValue')) {
            return "";
        }
        return String.interpret(this._inputElement.value);
    },

    /**
     * Sets the value of the textbox
     * @public
     */
    setValue: function(/* String */ value) {
        this._inputElement.value = value
    },

    /**
     * Gets the node of the accordion pane
     * @type DOMNode
     * @public
     */
    getDOMNode: function() {
        return this._rootNode;
    },

    /**
     * Add a new listener
     * @public
     */
    addEventListener: function(/* Object (Listener)*/ listener) {
        this._listeners.push(listener);
    },

    /**
     * Text box set focus. event handler
     * @private
     */
    _getFocus: function() {
        if (this._inputElement.hasClassName('defaultValue')) {
            this._inputElement.value = "";
            this._inputElement.removeClassName('defaultValue');
        } else {
            this._inputElement.select();
        }
    },

    /**
     * Text box lost focus. event handler
     * @private
     */
    _lostFocus: function() {
        if (!this.getValue()) {
            this._inputElement.value = this.defaultValue;
            this._inputElement.addClassName('defaultValue');
        }
    },

    /**
     * Value change. event handler
     * @private
     */
    _valueChange: function() {
        this._textSearch = this.getValue();

        for (var i = 0; i < this._listeners.length; i++) {
            this._listeners[i](this, this._textSearch);
        }
    }
});
