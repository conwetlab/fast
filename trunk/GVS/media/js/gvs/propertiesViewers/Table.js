var Table = Class.create( /** @lends Table.prototype */ {
    /**
     * This abstract class handles the different properties tables
     * belonging to different documents
     * @abstract
     * @constructs
     */ 
    initialize: function(/** DOMNode */ parentNode, /** String */ baseTitle, /** String */ region) {
        /** 
         * Variable
         * @type DOMNode
         * @private @member
         */
        this._parentNode = parentNode;
        
        /** 
         * Variable
         * @type String
         * @private @member
         */
        this._title = baseTitle;
        
        var uidGenerator = UIDGeneratorSingleton.getInstance();
         /** 
         * Variable
         * @type String
         * @private @member
         */
        this._id = uidGenerator.generate("propTable");
        
                 /** 
         * Variable
         * @type String
         * @private @member
         */
        this._titleId = uidGenerator.generate("propTitle");
        
        /** 
         * Variable
         * @type DOM
         * @private @member
         */      
        this._tableNode = new Element ('table',{
            'id': this._id,
            'class': 'properties_table'
        });
        
        var container= new dijit.layout.ContentPane({
            'id': uidGenerator.generate("propPane"),
            'region': region,
            'splitter': true
        });
        var divTitle = new Element ('div',{
            'id': this._titleId,
            'class': 'dijitAccordionTitle'
        }).update(this._title);
        
        container.domNode.insert(divTitle);
        container.domNode.insert(this._tableNode);
        this._parentNode.addChild(container);
    },
    

    // **************** PUBLIC METHODS **************** //

    /**
     * Set the table title
     */
    setTitle: function (/** String */ title) {
        this._title = title;
        $(this._titleId).update(title);
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
           var td = new Element ('td',{ //TODO: Review this classname
              'class': 'bold'  
           }).update(title);
           tr.insert(td);
        });
        
        this._tableNode.insert(tr);
    },

    /**
     * Updates the data in the table
     */      
    insertDataValues: function (/** Array */ data)  {
        
        var mine = this;
        
        data.each (function(line){
            var tr = new Element('tr');
            
            //TODO: What happen with the classes, maybe another method?
            line.each (function(field){
               var td = new Element ('td');
               var div = new Element ('div').update(field);
               td.insert(div)
               tr.insert(td);
            });
            mine._tableNode.insert(tr);
        });
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
