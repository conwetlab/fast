var BuildingBlock = Class.create({
    /**
     * Constructor
     */
    initialize: function(_params) {
        this.parameter = _params;
    },

    /**
     * Manage data function
     */
    manageData: function(triggers, addedFacts, deletedFacts) {
        if (triggers.size() > 0) {
            Logger.log("Triggers thrown: " + triggers);
        }
        if (addedFacts.size() > 0) {
            var facts = "";
            addedFacts.each(function(fact) {
                facts += "<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; " + Object.toJSON(fact) + "";
            });
            Logger.log("Added facts: " + facts);
            FactBase.setFacts(addedFacts);
        }
        if (deletedFacts.size() > 0) {
            facts = "";
            deletedFacts.each(function(fact) {
                facts += "<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; " + Object.toJSON(fact) + "";
            });
            Logger.log("Deleted facts: " + facts);
            FactBase.removeFacts(deletedFacts);
        }
    }
});

var FactBase = Class.create({
    initialize: function() {
        this._rootNode = new Element('div');
        this._facts = new Hash();
    },
    /**
     * Set the root node of the fact base
     */
    setFactBase: function(node) {
        node.update(this._rootNode);
    },

    /**
     * Add new facts to the fact base
     */
    setFacts: function(facts) {
        facts.each(function(fact){
            var factNode;
            if (this._facts.get(fact.id)) {
                factNode = this._facts.get(fact.id);
                factNode.update("");
            } else {
                factNode = new Element('div', {
                    'class': 'fact'
                });
                factNode.observe('mouseover', function(e) {
                    factNode.setStyle({
                        'z-index': 10,
                        'position': 'absolute',
                        'width': '40%'
                    });
                    //FactData
                    factNode.childNodes[1].setStyle({
                        'height': '160px'
                    });
                });
                factNode.observe('mouseout', function(e) {
                    factNode.setStyle({
                        'z-index': 1,
                        'position': 'static',
                        'width': '150px'
                    });
                    //FactData
                    factNode.childNodes[1].setStyle({
                        'height': '60px'
                    });
                });
                this._facts.set(fact.id, factNode);
                this._rootNode.appendChild(factNode);
            }

            var factId = new Element('div', {
                'class': 'factId'
            }).update(fact.id);
            factNode.appendChild(factId);

            var factData = new Element('div', {
                'class': 'factData'
            }).update(Object.toJSON(fact.data));
            factNode.appendChild(factData);
        }.bind(this));
    },
    /**
     * Remove a set of facts from the fact base
     */
    removeFacts: function(facts) {
        facts.each(function(fact){
            var factNode = this._facts.get(fact);
            if (factNode) {
                this._facts.unset(fact);
                factNode.parentNode.removeChild(factNode);
            }
        }.bind(this));
    }
});
FactBase = new FactBase();
