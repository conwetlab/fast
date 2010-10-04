/* vi:et:ts=4: */

var BuildingBlock = Class.create({
    initialize: function(params) {
        this.parameter = params;
    },
    manageData: function(triggers, addedFacts, deletedFacts) {
        if (triggers.size() > 0) {
            Triggers.set(triggers);
        }
        if (addedFacts.size() > 0) {
            FactBase.setFacts(addedFacts);
        }
        if (deletedFacts.size() > 0) {
            FactBase.removeFacts(deletedFacts);
        }
    }
});

var Triggers = {
    set:function(triggers) {
        triggers.each(function(trigger) {
            Logger.log("Triggers thrown: ", trigger);
        });
    }
}

var FactBase = {
    _facts: new Hash(),
    setFacts: function(facts) {
        facts.each(function(fact) {
            Logger.groupCollapsed("Added fact: ", fact.id);
            Logger.dir(fact);
            Logger.groupEnd();
            this._facts.set(fact.id, fact);
        }, this);
        this._notifyObservers();
    },
    removeFacts: function(facts) {
        facts.each(function(fact) {
            Logger.log("Deleted fact: ", fact);
            this._facts.unset(fact);
        }, this);
        this._notifyObservers();
    },
    each: function(func, context) {
        this._facts.values().each(func, context);
    },
    _notifyObservers:function() {
        this.observer.update(this);
    }
}

var FactBaseView = {
    getNode: function() {
        return $("facts");
    },
    update: function(factBase) {
        this.getNode().innerHTML='';
        factBase.each(this._createFact, this);
    },
    _createFact: function(fact) {
        var data = fact.data;
        var data = JSON.formatJSON(data);
        var idNode   = new Element('div', {class:'factId'}).update(fact.id);
        var dataNode = new Element('pre', {class:'factData'}).update(data);
        var factNode = new Element('div', {class:'fact'});
        factNode.appendChild(idNode);
        factNode.appendChild(dataNode);
        this.getNode().appendChild(factNode);

        new TextAreaResizer(factNode);
    }
}

FactBase.observer = FactBaseView;
