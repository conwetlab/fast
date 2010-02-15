/**
 * This class handles the creation of pipes based on WireIt.Terminal
 * and WireIt.Wire classes. Due to the use of these classes, which are
 * not Prototype compliant classes, the syntax of the class is quite 
 * different than usual
 * The terminal object will be attached to each pre or post condition
 * of the instances (specifically, to the condition nodes of their 
 * respective view)
 * 
 * @constructs
 * @extends WireIt.Terminal
 */
var Terminal = function(/** DOMNode */ conditionNode, /** Object */ options, 
                        /** ComponentInstance */ instance,
                        /** String */ conditionId, /** String(optional) */ action) {
    
    /**
     * @private
     * @type DOMNode
     */
    this._conditionNode = conditionNode;
    
    /**
     * @private
     * @type DOMNode
     */
    this._terminalNode = new Element('div',
    {
        'title': this._conditionNode.title
    });
    
    var style = {
        'position':'absolute',
        'width': '1px',
        'height': '1px',
        'z-index': '50'
    };
    this._terminalNode.setStyle(style);  
    this._recalculatePosition();
    document.body.appendChild(this._terminalNode); 
   
    var wireConfig = {
            'width': 2,
            'borderwidth': 2,
            'color': '#EAEAEA',
            'bordercolor': '#808080'
    }
    var extendedOptions = {};
    extendedOptions = Object.extend(extendedOptions, options);
    extendedOptions.wireConfig = Object.extend(wireConfig, options.wireConfig);
         
    WireIt.Terminal.call(this, this._terminalNode, extendedOptions);

    /**
     * Instance in where the terminal is
     * @type ComponentInstance
     * @private
     */
    this._instance = instance;
    
    /**
     * This is the id of the condition inside the
     * resource that contains the terminal
     * @private
     * @type String
     */
    this._conditionId = conditionId;

    /**
     * This is the action
     * @private
     * @type String
     */
    this._action = action ? action: "";
} 

// Inheriting all methods
Object.extend(Terminal.prototype, WireIt.Terminal.prototype);

Object.extend(Terminal.prototype, /** @lends Terminal.prototype */ { 

    
    // **************** PUBLIC METHODS **************** //

    /**
     * Returns the resourceUri
     * @type String
     */
    getBuildingBlockUri: function() {
        // FIXME: extrange situation for prepost instances,
        // when building
        var uri;
        if (this._instance.constructor == PrePostInstance) {
            uri = null;
        } else {
            uri = this._instance.getUri();
        }
        return uri;
    },
    
    /**
     * Returns the resourceId
     * @type String
     */
    getBuildingBlockId: function() {
        // FIXME: extrange situation for prepost instances,
        // when building
        var id;
        if (this._instance.constructor == PrePostInstance) {
            id = "";
        } else {
            id = this._instance.getId();
        }
        return id;
    },

    /**
     * Returns the conditionId
     * @type String
     */
    getConditionId: function() {
        return this._conditionId;
    },

    /**
     * Returns the action
     * @type String
     */
    getActionId: function() {
        return this._action;
    },

    /**
     * Returns the instance
     * @type ComponentInstance
     */
    getInstance: function() {
        return this._instance;
    },
    
    /**
     * Destroy the terminal
     */
    destroy: function() {
        this.eventAddWire.unsubscribeAll();
        this.eventRemoveWire.unsubscribeAll();
        this._terminalNode.parentNode.removeChild(this._terminalNode);
        this.removeAllWires();
        this.remove();
    },
    
    /**
     * Updates the position when the container is moving
     */
    updatePosition: function() {
        this._recalculatePosition();
        this.redrawAllWires();        
    },
    
    /**
     * Adds a handler listening for the connection or deconnection of wires
     */
    onWireHandler: function(/** Function */ handler) {
        var context = {
            'handler': handler
        }
        this.eventAddWire.subscribe(this._wireAddHandler.bind(context));
        this.eventRemoveWire.subscribe(this._wireRemoveHandler.bind(context));    
    },

    /**
     * Sets the visibility of the terminal
     */
    setVisible: function(/** Boolean */ visible) {
        var style = {
            'visibility': visible ? 'visible': 'hidden'
        };
        this.el.setStyle(style);
    },
    
     // **************** PRIVATE METHODS **************** //


     /**
      * Recalculates the position of the terminal
      * @private
      */
    _recalculatePosition: function() {
        var position = Utils.getPosition(this._conditionNode);
        var style = {
            'top': position.top + 'px',
            'left':  position.left + 'px'
        }     
        this._terminalNode.setStyle(style);
    },


    /**
     * Handler called whenever a new wire is added to the terminal
     * @private
     */
    _wireAddHandler: function(/** Event */ event, /** Array */ params) {
        this.handler(event, params, true);    
    },


    /**
     * Handler called whenever a wire is removed from the terminal
     * @private
     */
    _wireRemoveHandler: function(/** Event */ event, /** Array */ params) {
        this.handler(event, params, false);    
    }
});