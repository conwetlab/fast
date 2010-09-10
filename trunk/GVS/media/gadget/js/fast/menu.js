var FASTMenu = Class.create({

    initialize: function(properties){
        this.properties = $H(properties).clone();
        this.tabs = new Hash();
        this.nextTabId = 0;
        this.menuContainer = new Element ("div", {"class": "ddcolortabs"});
        this.tabContainer = new Element ("ul");
        this.menuContainer.appendChild(this.tabContainer);
        this.colorLineElement = new Element ("div", {"class": "ddcolortabsline"});
        this.containerElement = new Element ("div", {"class": "contentcontainer"});
        this.menuContainer.appendChild(this.colorLineElement);
        this.menuContainer.appendChild(this.containerElement);
        var renderTo= $(this.properties.get("renderTo"));
        renderTo.appendChild(this.menuContainer);
        renderTo.appendChild(this.colorLineElement);
        renderTo.appendChild(this.containerElement);
        this.activeTab = null;
    },

    addTab: function (properties) {
        var id = properties["id"];
        var title = properties["title"];
        var content = properties["contentEl"];
        var contentElement = null;
        if(content){
            contentElement = $(content);
        } else {
            contentElement = new Element("div", {"class": "tabcontentHide"});
            var content = properties["html"];
            if (content){
                contentElement.innerHTML = content;
            } else {
                return;
            }
        }
        var tabElement = new Element("li");
        var linkElement = new Element("a");
        var titleElement = new Element("span");
        titleElement.innerHTML = title;
        this.tabContainer.appendChild(tabElement);
        tabElement.appendChild(linkElement);
        linkElement.appendChild(titleElement);
        this.containerElement.appendChild(contentElement);
        var tab = {id: id, title: title, tab: tabElement, link: linkElement, content: contentElement, eventListener: new Hash()};
        this.tabs.set(id, tab);
        var self = this;
        linkElement.onclick=function(){self.setActiveTab(id)}
        return tab;
    },

    getActiveTab: function () {
        return this.activeTab;
    },

    setActiveTab: function (tab) {
        var self = this;
        if (tab) {
            var tab = this.getTab(tab);
            this.tabs.each(function(pair){
                if(pair.key==tab.id){
                    pair.value.content.className = "tabcontentShow";
                    pair.value.link.className = "current";
                    self.activeTab = pair.value;
                } else {
                    pair.value.content.className = "tabcontentHide";
                    pair.value.link.className = "";
                }
            });
            var handler = tab.eventListener.get("activate");
            if(handler){
                handler();
            }
        } else {
            this.tabs.each(function(pair){
                pair.value.content.className = "tabcontentHide";
                pair.value.link.className = "";
            });
            this.activeTab = null;
        }
    },

    hideTab: function (tab) {
        var tab = this.getTab(tab);
        if(!tab){
            return;
        }
        tab.tab.style.display = "none";
        tab.link.className = "";
        tab.content.className = "tabcontentHide";
    },

    unhideTab: function (tab) {
        var tab = this.getTab(tab);
        if(!tab){
            return;
        }
        tab.tab.style.display = "inline";
    },

    destroyTab: function (tab) {
        var tab = this.getTab(tab);
        if(!tab){
            return;
        }
        this.tabContainer.removeChild(tab.tab);
        this.containerElement.removeChild(tab.content);
        this.tabs.unset(tab.id);
    },

    getTab: function (tab) {
        var id = null;
        if(tab.id == undefined){
            return this.tabs.get(tab);
        } else {
            return tab;
        }
    },

    setEventListener: function (tab, event, handler) {
        var tab = this.getTab(tab);
        tab.eventListener.set(event, handler);
    }
});
