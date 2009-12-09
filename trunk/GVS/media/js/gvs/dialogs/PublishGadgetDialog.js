var PublishGadgetDialog = Class.create(ConfirmDialog /** @lends PublishGadgetDialog.prototype */, {
    /**
     * This class handles a dialog
     * able to publish a created gadget into a mashup platform
     * @constructs
     * @extends ConfirmDialog
     */ 
    initialize: function($super) {
        $super("Publish Gadget", "ok");   
        
        /**
         * Base url of the gadget being published
         * @private
         * @type String
         */
        this._gadgetBaseUrl = null;    
        
        /**
         * Hash containing the references to all the buttons
         * @type Hash
         * @private
         */
        this._buttons = new Hash(); 
    },
    
    // **************** PUBLIC METHODS **************** //

    
    /**
     * show
     * @override
     */
    show: function ($super, /** String */ gadgetBaseUrl) {
        this._gadgetBaseUrl = gadgetBaseUrl;  
        $super();
        this._buttons.get('ezweb').attr("label", "Publish it!");
        this._buttons.get('ezweb').attr("disabled", false);
        
    },

    // **************** PRIVATE METHODS **************** //

    /**
     * Publishes the created gadget
     * @private
     */
    _publishGadget: function(/** dijit.form.Button */ button, /** String */ mashupPlatform) {
        if (mashupPlatform == 'ezweb') {
            var gadgetUrl = this._gadgetBaseUrl + '/ezweb.xml';
            Utils.ezWebDeploy(button, gadgetUrl);
        }
    },

    /** 
     * initDialogInterface
     * This function creates the dom structure
     * @private
     * @override
     */
    _initDialogInterface: function () {
        var dom = new Element('div');
        
        var title = new Element('h2', {
            'class': 'detailsTitle'
        }).update("Publish Gadget");
        dom.appendChild(title);
        
        var contents = new Element('div', {
            'class': 'deployment'
        });
        
        var table = new Element('table');
        contents.appendChild(table);
        dom.appendChild(contents);
        
        this._buttons.set('ezweb', new dijit.form.Button({
            'label': 'Publish it!',
            'onClick': function(e) {
                        this._publishGadget(e.element(), 'ezweb');
                    }.bind(this)
        }));

        this._buttons.set('igoogle', new dijit.form.Button({
            'label': 'Publish it!',
            'onClick': function(e) {
                        this._publishGadget(e.element(), 'igoogle');
                    }.bind(this),
            'disabled': true
        }));
                                
        
        var tableData = [
            {'className': 'tableHeader',
             'fields': [{
                'className': 'left',
                'node': 'Mashup platform'    
             },{
                'className': 'left',
                'node': ''
             }]
            },
            {'className': '',
             'fields': [{
                'className': 'mashup',
                'node': 'EzWeb ' + '[<a href="' + this._gadgetBaseUrl + "/ezweb.xml" + '" target="blank">Template</a>]'
             },{
                'className': '',
                'node': this._buttons.get('ezweb').domNode
             }]
            },
             {'className': '',
             'fields': [{
                'className': 'mashup',
                'node': 'iGoogle (Not available)'    
             },{
                'className': '',
                'node': this._buttons.get('igoogle').domNode
             }]
            }
        ];
        
        this._fillTable(table, tableData);
        this._setContent(dom);
    },
    
    /**
     * This function fills a table with data
     * @private
     */
    _fillTable: function(/** DOMNode */ tableNode, /** Array */ data) {
        data.each(function(row) {
            var tr = new Element('tr', {
                'class': row.className
            });
            row.fields.each(function(field) {
                var td = new Element('td', {
                    'class': field.className    
                }).update(field.node);
                tr.appendChild(td);
            });
            tableNode.appendChild(tr);
        });
    }
});

// vim:ts=4:sw=4:et:
