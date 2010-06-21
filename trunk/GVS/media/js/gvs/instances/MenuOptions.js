var MenuOptions = Class.create({
    initialize: function(domNode) {
        this._dijitMenu = new dijit.Menu();
        if (domNode) {
            this.bindDomNode(domNode);
        }
    },

    bindDomNode: function(domNode) {
        this._dijitMenu.bindDomNode(domNode);
    },

    addOption: function(label, handler, options) {
        var menuCfg = {label:label, onClick:handler};
        if (options) {
            Object.extend(menuCfg, options)
        }
        var menuItem = new dijit.MenuItem(menuCfg);
        this._dijitMenu.addChild(menuItem);
    }
});
