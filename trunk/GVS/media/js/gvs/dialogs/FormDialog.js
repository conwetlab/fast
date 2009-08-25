var FormDialog = Class.create( /** @lends FormDialog.prototype */ {

    /**
     * Dialog class
     * This creates a modal dialog with three zones:
     *     * headerNode: containing the title
     *     * contentNode: containing all the fields of the form
     *     * buttonsNode: containing the different buttons: handled by this class
     * @constructs
     * @param Hash params
     */
    initialize: function(properties) {
        this._dialog = new dijit.Dialog(properties);
        
        this._headerNode = new Element ('div',{
            'class': 'dialogHeader'
        });
        
        this._contentNode = new Element ('div',{
            'class': 'dialogContent'
        });
        this._buttonNode = new Element ('div',{
            'class': 'dialogButtonZone' 
        });
        var containerDiv = new Element ('div');
        
        containerDiv.insert (this._headerNode);
        containerDiv.insert (this._contentNode);
        containerDiv.insert (this._buttonNode);
        this._dialog.setContent (containerDiv);
    },

    
    // **************** PUBLIC METHODS **************** //

    getDialog: function() {
        return this._dialog;
    },
    
    /**
     * Gets the root node.
     * @type DOMNode
     * @public
     */
    getNode: function () {
        return this._dialog.domNode;
    },

    /**
     * Gets the content node.
     * @type DOMNode
     * @public
     */
    getContentNode: function () {
        return this._contentNode;
    },    
    /**
     * Gets the form node.
     * @type DOMNode
     * @public
     */
    getForm: function() {
        if (this._dialog.domNode.getElementsByTagName("form")){
            return this._dialog.domNode.getElementsByTagName("form")[0];
        }
        else {
            return null;
        }
    },
    
    show: function() {
        return this._dialog.show();
    },
        
    hide: function() {
        return this._dialog.hide();
    },
    
    /**
     * This function adds a button with an onclick handler
     * 
     */
    addButton: function (/** String */ label, /** Function */ handler){
        
        var button = new dijit.form.Button({
            'label': label,
            onClick: handler
        });
        
        this._buttonNode.insert (button.domNode);
    },
    
    /**
     * This function sets the header and a subtitle if passed
     */
    setHeader: function (/** String */ title, /** String */ subtitle){
        
        var titleNode = new Element("h2").update(title);
        this._contentNode.insert(titleNode);
        
        if (subtitle && subtitle != ""){
            var subtitleNode = new Element("div", {
                "class": "line"
            }).update(subtitle);
            this._contentNode.insert(subtitleNode);
        }
    }
    
    // **************** PRIVATE METHODS **************** //
});

// vim:ts=4:sw=4:et:
