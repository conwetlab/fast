var ScreenflowEngineFactory = function () {

    var instance = null;

    var ScreenflowEngine = Class.create({

        initialize: function() {
            this.screens = new Hash();
            this.showedTabs = new Hash();
            this.allTabs = new Hash();
            this.rules = new Hash();
            this.menu = null;
            this.facts = new Hash();
            this.loaders = new Hash();
            this.emptyTab = null;
            this.events = new Hash();
            this.persistentKB = null;
        },

        setEngine: function (screens, events, menu, persistentKB) {
            this.menu = menu;
            for (var i=0; i < screens.length; i++) {
                this.screens.set(screens[i].id, screens[i]);
                this.addRule(screens[i]);
            }
            for (var i=0; i < events.length; i++) {
                var variables = this.events.get(events[i].fact_uri);
                if(!variables) {
                    variables = new Array();
                    this.events.set(events[i].fact_uri, variables);
                }
                variables.push(events[i]);
            }
            this.persistentKB = persistentKB;
            this.getPersistence();
        },

        getPersistence: function () {
            if(this.persistentKB){
                var persistence = new FastAPI.Persistence();
                try {
                    persistence.get(function(value){
                        if(!value){
                            //just run
                            this.run();
                            return;
                        }
                        var jsonLib = new FastAPI.Utils.JSON();
                        var facts = jsonLib.toObject(value);
                        for (var i=0; facts!= null && i<facts.length; i++){
                            this.addFact(facts[i]);
                        }
                        this.run();
                    }.bind(this));
                } catch (e) {
                    return;
                }
            } else{
                this.run();
            }
        },

        setPersistence: function () {
            if(this.persistentKB){
                var persistence = new FastAPI.Persistence();
                var kb = this.facts.values();
                try {
                    var jsonLib = new FastAPI.Utils.JSON();
                    persistence.set(jsonLib.toString(kb));
                } catch (e) {
                    return;
                }
            }
        },

        transformFact: function(factURI, attributeName, value){
            if(attributeName!=''){
                var fact = this.getFact(factURI);
                if(!fact){
                    fact = {uri: factURI, data: {}};
                }
                fact.data[attributeName] = value;
                return fact;
            } else {
                var jsonLib = new FastAPI.Utils.JSON();
                var fact = jsonLib.toObject(value);
                if (fact.uri == factURI){
                    return fact;
                } else {
                    return null;
                }
            }
        },

        manageVarFacts: function (addedFacts, deletedFacts){
            this.manageFacts(addedFacts, deletedFacts);
            var func = this.loaders.get(this.menu.getActiveTab().id);
            if(func){
                func();
            }
        },

        manageFacts: function (addedFacts, deletedFacts){
            for (var i=0; addedFacts!= null && i<addedFacts.length; i++){
                this.addFact(addedFacts[i]);
            }
            for (var i=0; deletedFacts!= null &&  i<deletedFacts.length; i++){
                this.deleteFact(deletedFacts[i]);
            }
            this.setPersistence();
            this.run();
        },

        addFact: function (fact){
            if(fact){
                this.facts.set(fact.uri, fact);
                this.throwEvents(fact);
                if (_debugger) {
                    _debugger.addFact(fact);
                }
            }
        },

        throwEvents: function (fact){
            var variables = this.events.get(fact.uri);
            for(var i=0; variables != null && i < variables.length; i++){
                var v = variables[i];
                if(v.variable != null){
                    if(v.fact_attr == ''){
                        var jsonLib = new FastAPI.Utils.JSON();
                        v.variable.set(jsonLib.toString(fact));
                    } else {
                        v.variable.set(fact.data[v.fact_attr]);
                    }
                }
            }
        },

        getFact: function (uri){
            return this.facts.get(uri);
        },

        deleteFact: function (uri){
            if(uri){
                this.facts.unset(uri);
            }
        },


        run: function (){
            var ruleIds = this.rules.keys();
            var oldTabs = this.showedTabs.keys();
            for(var i = 0; i < ruleIds.length; i++){
                var rule = this.rules.get(ruleIds[i]);
                if(this.evaluateCondition(rule)){
                    this.execute(rule.actions);
                } else {
                    this.execute(rule.noactions);
                }
            }
            var newTabs = this.showedTabs.keys();
            this.manageTabs(oldTabs, newTabs);
        },

        addRule: function (screen){
            this.rules.set(screen.id,
                    {id: screen.id,
                    title: screen.title,
                    condition: screen.pre,
                    actions:[function(pair){this.addScreen(screen);}.bind(this)],
                    noactions:[function(pair){this.deleteScreen(screen);}.bind(this)]});
        },

        evaluateCondition: function (rule){
            var conditions = rule.condition;
            if(!conditions || conditions.length==0){
                return true;
            }
            for(var i = 0; i < conditions.length ; i++){
                var ret = true;
                for(var j = 0; j < conditions[i].length ; j++){
                    if (!this.evaluateExpression(conditions[i][j])){
                        ret = false;
                        break;
                    }
                }
                if(ret){
                    return ret;
                }
            }
            return false;
        },

        evaluateExpression: function (expression){
            var fact_uri = expression.pattern.split(" ")[2]
            var fact = this.facts.get(fact_uri);
            var evaluation = true;
            if(!fact){
                evaluation =  false;
            }
            var positive = true;
            if (!expression.positive){ //it could be null
                positive = expression.positive;
            }
            return (positive == evaluation);
        },

        execute: function (actions){
            if(!actions){
                return;
            }
            for(var i = 0; i < actions.length; i++){
                actions[i]();
            }
        },

        addScreen: function (screen){
            var tab = this.allTabs.get(screen.id);
            if(!tab){
                tab = this.menu.addTab(screen);
                this.showedTabs.set(screen.id, tab);
                this.allTabs.set(screen.id, tab);
                this.menu.setEventListener(tab, "activate", this.loaders.get(screen.id));
                if (_debugger) {
                    _debugger.addScreen(screen);
                }
            }
            this.menu.unhideTab(tab);
        },

        deleteScreen: function (screen){
            var tab = this.allTabs.get(screen.id);
            if(tab){
                this.menu.hideTab(tab);
                this.showedTabs.unset(screen.id);
            }
        },

        addScreenLoader: function (screen, functionHandler){
            this.loaders.set(screen, functionHandler);
        },

        manageTabs: function (oldTabIds, newTabIds){
            if(newTabIds.length==0){
                this.emptyTab = this.menu.addTab({id: "", title: 'Gadget Message', html:'No reachable screens'});
                this.menu.setActiveTab(this.emptyTab);
            } else {
                var emptyTabDeleted = false;
                if(this.emptyTab != null){
                    this.menu.destroyTab(this.emptyTab);
                    this.emptyTab = null;
                    emptyTabDeleted = true;
                }
                for(var i=0; i < oldTabIds.length ; i++){
                    newTabIds = newTabIds.without(oldTabIds[i]);
                }
                if(newTabIds.length==1 || oldTabIds.length ==0 || emptyTabDeleted){
                    this.menu.setActiveTab(this.showedTabs.get(newTabIds[0]));
                }
            }
        }

    });


    return new function() {
        this.getInstance = function() {
            if (instance == null) {
                instance = new ScreenflowEngine();
             }
             return instance;
           }
    }

}();
