var Table = Class.create( /** @lends Table.prototype */ {
    /**
     * This abstract class handles the different properties tables
     * belonging to different documents
     * @abstract
     * @constructs
     */ 
    initialize: function(/** DOMNode */ parentNode, /** String */ baseTitle, 
            /** String */ region, /** String (optional) */ minSize) {
        /** 
         * Parent node
         * @type DOMNode
         * @private @member
         */
        this._parentNode = parentNode;
        
        /** 
         * Title of the table
         * @type String
         * @private @member
         */
        this._title = baseTitle;
        
        /**
         * Node of the title
         * @type DOMNode
         * @private @member 
         */
        this._titleNode = new Element ('div',{
            'class': 'dijitAccordionTitle '
        }).update(this._title);
        
        /** 
         * Node of the table
         * @type DOMNode
         * @private @member
         */      
        this._tableNode = new Element ('table',{
            'class': 'propertiesTable'
        });

        var style = (region == "left") ? 'width: 50%': 'width: auto';
        var container= new dijit.layout.ContentPane({
            'region': region,
            'splitter': true,
            'style': style,
            'class': 'tableArea'
        });
        if (minSize) {
            container.attr('minSize', minSize);
        } 
        
        container.domNode.insert(this._titleNode);
        container.domNode.insert(this._tableNode);
        this._parentNode.addChild(container);
    },
    

    // **************** PUBLIC METHODS **************** //

    /**
     * Set the table title
     */
    setTitle: function (/** String */ title) {
        this._title = title;
        this._titleNode.update(title);
    },

    /**
     * Returns the table title
     * @type String
     */    
    getTitle: function () {
        return this._title;
    },

    /**
     * Returns the table Node
     * @type DOM
     */    
    getTableNode: function () {
        return this._tableNode;
    },

    /**
     * Sets the field titles
     * @type String
     */    
    insertFieldTitles: function (/** Array */ fieldTitles) {
        var tr = new Element('tr', {
            'class': 'tableHeader'
        });
        
        fieldTitles.each (function(title){
           var td = new Element ('td').update(title);
           tr.insert(td);
        });
        
        this._tableNode.insert(tr);
    },

    /**
     * Updates the data in the table
     */      
    insertDataValues: function (/** Hash */ data)  {
        
        data.each (function(line){
            var tr = new Element('tr');
            
            //TODO: What happen with the classes, maybe another method?
            line.each (function(field){
               var td = new Element ('td');
               var div = new Element ('div').update(field);
               if (typeof field === "string") {
                   div.setAttribute('title', field);
               }
               td.insert(div)
               tr.insert(td);
            });
            this._tableNode.insert(tr);
        }.bind(this));
    },

    /**
     * Empty the data in the table
     */      
    emptyTable : function (){
        this._tableNode.update("");
    }
    
    

    // **************** PRIVATE METHODS **************** //

    
});

// vim:ts=4:sw=4:et:
