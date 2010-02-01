var OperatorInstance = Class.create(ComponentInstance,
    /** @lends OperatorInstance.prototype */ {

    /**
     * Pre or Post instance.
     * @constructs
     * @extends ComponentInstance
     */
    initialize: function($super, /** BuildingBlockDescription */ description, 
            /** InferenceEngine */ inferenceEngine) {
        $super(description, inferenceEngine);
              
        
        /**
         * Terminals for screen design
         * @type Hash
         * @private 
         */
        this._terminals = new Hash();
        
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
     * @override
     */
    getUri: function() {
        return this._buildingBlockDescription.uri;    
    },
    
    /**
     * Creates the terminal
     */
    createTerminals: function(/** Function */ handler) {
        var options = {
            'direction':[0,1],
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
                options.offsetPosition =  {
                    'top': 6,
                    'left': 0
                }     
                var node = this._view.getConditionNode(pre.id);
                var terminal = new Terminal(node, options, this, pre.id, action.name);
                this._terminals.set(pre.id, terminal);
            }.bind(this));   
        }.bind(this));
        
        var posts;
        if (this._buildingBlockDescription.postconditions && 
                this._buildingBlockDescription.postconditions[0] instanceof Array) {
            posts = this._buildingBlockDescription.postconditions[0];
        } else {
            posts = this._buildingBlockDescription.postconditions;
        }
        
        posts.each(function(post) {
                options.alwaysSrc = true;
                options.ddConfig = {
                     'type': 'output',
                     'allowedTypes': ['input']
                }
                options.offsetPosition = {
                    'top': -10,
                    'left': 2
                }
                var node = this._view.getConditionNode(post.id);
                var terminal = new Terminal(node, options, this, post.id);
                terminal.onWireHandler(handler);
                this._terminals.set(post.id, terminal);
            }.bind(this)); 
    },

    /**
     * Gets a terminal from an id
     * @type Terminal
     */
    getTerminal: function(/** String */ id) {
        return this._terminals.get(id);
    },

    /**
     * This function returns a list with all the
     * preconditions of the instance,
     * ready to be set in the FactPane
     * @type Array
     * @override
     */
    getPreconditionTable: function(/** Hash */ reachability) {
        return this._getConditionList("actions", reachability);
    },

    
    
    /**
     * Destroy the instance
     * @override
     */
    destroy: function($super) {
        $super();
        if (this._terminals) {
            this._terminals.values().each(function(terminal){
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
            this._terminals.values().each(function(terminal){
                terminal.updatePosition();    
            });
        }
    },

    // **************** PRIVATE METHODS **************** //
    /**
     * Creates a new View instance for the component
     * @type BuildingBlockView
     * @override
     */
    _createView: function () {
        return new OperatorView(this._buildingBlockDescription);
    }
    
});

// vim:ts=4:sw=4:et:
