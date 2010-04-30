var PublishGadgetDialog = Class.create(ConfirmDialog /** @lends PublishGadgetDialog.prototype */, {
    /**
     * This class handles a dialog
     * able to publish a created gadget into a mashup platform
     * @constructs
     * @extends ConfirmDialog
     */
    initialize: function($super) {
        $super("Publish Gadget", ConfirmDialog.OK);

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
        this._initDialogInterface();
        $super();
    },

    // **************** PRIVATE METHODS **************** //

    /**
     * Publishes the created gadget
     * @private
     */
    _publishGadget: function(/** dijit.form.Button */ button, /** Hash */ options, /** String */ templateUrl) {
        var url = null;
        if (options.mashupPlatform == 'ezweb') {
            url = URIs.ezweb + "interfaces/gadget?template_uri=" + templateUrl;
        } else if (options.mashupPlatform == 'igoogle') {
            if (options.destination=='directory') {
                url = "http://www.google.com/ig/submit?url=" + templateUrl;
            } else if (options.destination=='personal'){
                url = "http://www.google.com/ig/adde?moduleurl=" + templateUrl;
            }
        } else if (options.mashupPlatform == 'orkut') {
            url = "http://sandbox.orkut.com/Main#AppInfo?appUrl=" + templateUrl;
        }
        this._deploy(button, url);
    },

    /**
     * This function deploy a gadget to EzWeb
     * @private
     */
    _deploy: function(/** domNode */ buttonNode, /**String*/ url) {
        var button = dijit.byId(buttonNode.id);
        button.attr("label", "Done!");
        button.attr("disabled", true);
        window.open(url);
        console.log(url);
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

        var tableData = [
            {'className': 'tableHeader',
             'fields': [{
                    'className': 'left',
                    'node': 'Mashup platform'
                 },{
                    'className': 'left',
                    'node': ''
                 }]
            }
        ];

        tableData.push(this._createPlatformRow('ezweb',
                {mashupPlatform: 'ezweb'},
                'EzWeb',
                this._gadgetBaseUrl + '/ezweb.xml'));
        tableData.push(this._createPlatformRow('igoogleDirectory',
                {mashupPlatform: 'igoogle', destination: 'directory'},
                'iGoogle Directory',
                this._gadgetBaseUrl + "/igoogle.xml"));
        tableData.push(this._createPlatformRow('igooglePersonal',
                {mashupPlatform: 'igoogle', destination: 'personal'},
                'iGoogle Personal Page',
                this._gadgetBaseUrl + "/igoogle.xml"));
        tableData.push(this._createPlatformRow('orkut',
                {mashupPlatform: 'orkut'},
                'Orkut',
                this._gadgetBaseUrl + "/igoogle.xml"));

        this._fillTable(table, tableData);
        this._setContent(dom);
    },

    /**
     * This function create a row for a destination platform
     * @private
     */
    _createPlatformRow: function (/** String */ id, /** Hash */ options, /** String */ title, /** String */ url) {
        return {'className': '',
            'fields': [{
                'className': 'mashup',
                'node': title + ' [<a href="' + url + '" target="blank">Template</a>]'
             },{
                'className': '',
                'node': this._buttons.set(id, new dijit.form.Button({
                    'label': 'Publish it!',
                    'onClick': function(e) {
                                this._publishGadget(e.element(), options, url);
                            }.bind(this)
                })).domNode
             }]
         };
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
