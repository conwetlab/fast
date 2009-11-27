var ResourceInstance = Class.create(ComponentInstance,
    /** @lends ResourceInstance.prototype */ {

    /**
     * Pre or Post instance.
     * @constructs
     * @extends ComponentInstance
     */
    initialize: function($super, /** DomainConceptDescription */ domainConceptDescription, 
            /** InferenceEngine */ inferenceEngine) {
        $super(domainConceptDescription, inferenceEngine);
        
        /**
         * Uri of the pre or post in the catalogue
         * @type String
         * @private @member
         */
        this._uri = null;       
        
        /**
         * Terminals for screen design
         * @type Array
         * @private 
         */
        this._terminals = new Array();
        
    },

    // **************** PUBLIC METHODS **************** //

    /**
     * Somehow something the user can comprehend
     * Implementing TableModel interface
     * @override
     */
    getTitle: function() {
        return this._buildingBlockDescription.label['en-gb']; 
    },
    
    /**
     * This function returns the relevant info
     * to the properties table
     * Implementing TableModel interface
     * @overrides
     */
    getInfo: function() {
        var info = new Hash();
        return info;
    },
    
    
    /**
     * Transform the instance into JSON-like
     * string
     * @type String
     */
    toJSON: function() {
        var json = {
           
        }
        return Object.toJSON(json);
    },
    
    
    
    /**
     * @override
     */
    getUri: function() {
        return this._uri;    
    },
    
    /**
     * Creates the terminal
     */
    createTerminals: function(/** (Optional) Function */ handler) {
        var options = {
            'direction':[0,1],
            'offsetPosition': {
                'top': -2,
                'left': 10
            },
            'wireConfig': {
                'drawingMethod': 'arrows'
            }
        };
        this._buildingBlockDescription.actions.each(function(action) {
            action.preconditions.each(function(pre) { 
                  options.ddConfig = {
                     'type': 'input',
                     'allowedTypes': ['output']
                  }       
                var node = this._view.getConditionNode(pre.id);
                var terminal = new Terminal(node, options, this._buildingBlockDescription.id, pre.id); 
                this._terminals.push(terminal);                
            }.bind(this));   
        }.bind(this));
        this._buildingBlockDescription.postconditions.each(function(post) {
                options.alwaysSrc = true;
                options.ddConfig = {
                     'type': 'output',
                     'allowedTypes': ['input']
                }
                var node = this._view.getConditionNode(post.id);
                var terminal = new Terminal(node, options, this._buildingBlockDescription.id, post.id);
                terminal.addWireHandler(handler);
                this._terminals.push(terminal);
            }.bind(this)); 
    },
    
    /**
     * Destroy the instance
     * @override
     */
    destroy: function($super) {
        $super();
        if (this._terminals) {
            this._terminals.each(function(terminal){
                terminal.destroy();    
            });
        }
    },
    
    /*onStart: function() {
        if (this._terminals) {
            this._terminals.each(function(terminal){
                terminal.wires.each(function(wire) {
                    wire.element.setStyle({'display': 'none'});            
                });
            });
        }
    },*/
    
    /**
     * On position update
     * @override
     */
    onUpdate: function(/** Number */ x, /** Number */ y) {
        if (this._terminals) {
            this._terminals.each(function(terminal){
                terminal.updatePosition();    
            });
        }
    },
    /**
     * @override
     */
    onFinish: function($super, changingZone) {
        $super(changingZone);
        /*if (this._terminals) {
            this._terminals.each(function(terminal){
                terminal.updatePosition();    
                terminal.wires.each(function(wire) {
                    wire.element.setStyle({'display': 'block'});            
                });
            });
        }*/
       this.onUpdate();
    }, 
    /**

    // **************** PRIVATE METHODS **************** //
    /**
     * Creates a new View instance for the component
     * @type BuildingBlockView
     * @override
     */
    _createView: function () {
        return new ResourceView(this._buildingBlockDescription);
    }
    
});

// vim:ts=4:sw=4:et:
