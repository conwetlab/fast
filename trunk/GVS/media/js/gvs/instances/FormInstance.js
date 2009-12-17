var FormInstance = Class.create(ComponentInstance,
    /** @lends FormInstance.prototype */ {

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
        return this._buildingBlockDescription.uri;    
    },
    
    /**
     * Creates the terminal
     */
    createTerminals: function(/** (Optional) Function */ handler) {
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
                    'left': 2
                }     
                var node = this._view.getConditionNode(pre.id, action.name);
                var terminal = new Terminal(node, options, this.getUri(), 
                                            this.getId(), pre.id, action.name);
                this._terminals.push(terminal);                
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
                    'top': 9,
                    'left': 2
                }
                var node = this._view.getConditionNode(post.id);
                var terminal = new Terminal(node, options, this.getUri(),
                                            this.getId(), post.id);
                terminal.onWireHandler(handler);
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
        return new FormView(this._buildingBlockDescription);
    }
    
});

// vim:ts=4:sw=4:et:
