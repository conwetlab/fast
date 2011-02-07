var iServeDialog = Class.create(ConfirmDialog /** @lends iServeDialog.prototype */, {
    /**
     * Shows iServe services
     * @constructs
     * @extends ConfirmDialog
     */
    initialize: function($super, iServeList) {
        $super("iServe External Services", ConfirmDialog.OK);

        /**
         * List of iServe services
         * @private
         * @type Array
         */
        this._iServeList = iServeList;
    },

    // **************** PUBLIC METHODS **************** //


    // **************** PRIVATE METHODS **************** //


    /**
     * initDialogInterface
     * This function creates the dom structure
     * @private
     * @override
     */
    _initDialogInterface: function () {
        var content = new Element("div");

        var header = new Element("h2").update("About this services");
        content.appendChild(header);

        var p1 = new Element("p").update(
            'This services are extracted from ' +
            '<a href="http://iserve.kmi.open.ac.uk/">iServe</a>, ' +
            'which is a platform to discover services through their semantic ' +
            'information.<br /> All of them are related to the building block you ' +
            'are creating, so hopefully some of them will be useful for you.'
        );
        content.appendChild(p1);

        var p2 = new Element("p").update(
            'The proposed services are not GVS-compliant, so you ' +
            'will have to wrap them. You can use the GVS to do so. '
        );
        content.appendChild(p2);

        var table = new Element("table", {"class": "propertiesTable"});
        table.setStyle();
        content.appendChild(table);

        var tHead = new Element("tr", {"class": "tableHeader"});
        table.appendChild(tHead);


        var serviceTitle = new Element("td").update("Service Name");
        tHead.appendChild(serviceTitle);

        var serviceUri = new Element("td").update("Service URL");
        tHead.appendChild(serviceUri);

        var info = new Element("td").update("Get more info");
        tHead.appendChild(info);

        this._iServeList.each(function(service) {
            var row = new Element("tr");
            table.appendChild(row);

            var name = service.label || "-";
            var serviceName = new Element("td").update(name);
            row.appendChild(serviceName);

            var url = new Element("td").update(service.address);
            row.appendChild(url);

            var moreinfo = new Element("td").update(
                '<a target="_blank" style="text-decoration:none" href="' + service.service + '">+</a>'
            );
            row.appendChild(moreinfo);
        });

        this._setContent(content);
    }
});

// vim:ts=4:sw=4:et:
