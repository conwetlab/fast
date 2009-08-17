var ScreenflowEngineFactory = function () {

	// ******************
	// SINGLETON INSTANCE
	// ******************
	var instance = null;

	function ScreenflowEngine () {
		
		this.screens = new Hash(); // All Screens
		
		this.screenTabs = new Hash(); // All showed screen tabs
		
		this.allTabs = new Hash(); // All created screen tab
		
		this.rules = new Hash();
		
		this.menu = null;
		
		this.facts = new Hash();
		
		this.loaders = new Hash();
		
		this.emptyTab = null;
		
		this.events = new Hash();

		// ****************
		// PUBLIC METHODS 
		// ****************
		ScreenflowEngine.prototype.setEngine = function (screens, events, menu) {
			this.menu = menu;
			this.screens = screens;
			this.events = events;
			this.screens.each(function(pair){this.addRule(pair.value);}.bind(this));
		}
		
		// **********************
		// Knowledge Base methods
		// **********************
		ScreenflowEngine.prototype.transformFact = function(factName, attributeName, value){
			if(attributeName!=''){
				var fact = this.getFact(factName);
				if(!fact){
					fact = {name: factName, data: {}};
				}
				fact.data[attributeName] = value;
				return fact;
			} else {
				var fact = eval('('+value+')');
				if (fact.name == factName){
					return fact;
				} else {
					return null;
				}
			}
		}
		
		ScreenflowEngine.prototype.manageVarFacts = function (addedFacts, deletedFacts){
			this.manageFacts(addedFacts, deletedFacts);
			var func = this.loaders.get(this.menu.getActiveTab().title);
			func();
		}
		
		ScreenflowEngine.prototype.manageFacts = function (addedFacts, deletedFacts){
			for (var i=0; addedFacts!= null && i<addedFacts.length; i++){
				this.addFact(addedFacts[i]);
			}
			for (var i=0; deletedFacts!= null &&  i<deletedFacts.length; i++){
				this.deleteFact(deletedFacts[i]);
			}
			this.run();
		}
		
		ScreenflowEngine.prototype.addFact = function (fact){
			if(fact){
				this.facts.set(fact.name, fact);
				this.throwEvents(fact);
			}
		}
		
		ScreenflowEngine.prototype.throwEvents = function (fact){
			var factEvents = this.events.get(fact.name);
			if(factEvents){
				var variables = factEvents.keys();
				for(var i=0; i < variables.length; i++){
					var v = factEvents.get(variables[i]);
					if(v.fact_attr == ''){
						v.variable.set(Object.toJSON(fact));	
					} else {
						v.variable.set(fact[v.fact_attr]);
					}
				}
			}
		}
		
		ScreenflowEngine.prototype.getFact = function (name){
			return this.facts.get(name);
		}
		
		ScreenflowEngine.prototype.deleteFact = function (name){
			if(name){
				this.facts.unset(name);
			}
		}
		
		// ************************
		// Inference Engine methods
		// ************************
		ScreenflowEngine.prototype.run = function (){
			var ruleIds = this.rules.keys();
			for(var i = 0; i < ruleIds.length; i++){
				var rule = this.rules.get(ruleIds[i]);
				if(this.evaluateCondition(rule)){
					this.execute(rule.actions);
				} else {
					this.execute(rule.noactions);
				}
			}
			this.manageTabs();
		}

		ScreenflowEngine.prototype.addRule = function (screen){
			this.rules.set(screen.title,
					{id: screen.title,
					condition: screen.pre,
					actions:[function(pair){this.addScreen(screen);}.bind(this)],
					noactions:[function(pair){this.deleteScreen(screen);}.bind(this)]});
		}
		
		ScreenflowEngine.prototype.evaluateCondition = function (rule){
			var conditions = rule.condition;
			if(!conditions){
				return true;
			}
			for(var i = 0; i < conditions.length ; i++){
				if (!this.evaluateExpression(conditions[i])){
					return false;
				}	
			}
			return true;
		}
		
		ScreenflowEngine.prototype.evaluateExpression = function (expression){
			var fact = this.facts.get(expression.name);
			var evaluation = true;
			if(!fact){
				evaluation =  false;	
			}
			var positive = expression.positive;
			if (!positive){ //it could be null
				positive = false;
			}
			return (positive == evaluation);
		}
		
		ScreenflowEngine.prototype.execute = function (actions){
			if(!actions){
				return;
			}
			for(var i = 0; i < actions.length; i++){
				actions[i]();
			}
		}
		
		ScreenflowEngine.prototype.addScreen = function (screen){
			var tab = this.allTabs.get(screen.title);
			if(!tab){
				tab = this.menu.addTab(screen);
				this.screenTabs.set(screen.title, tab);
				this.allTabs.set(screen.title, tab);
				this.menu.setEventListener(tab, "activate", this.loaders.get(screen.title));
			}
			this.menu.unhideTab(tab);
		}
		
		ScreenflowEngine.prototype.deleteScreen = function (screen){
			var tab = this.allTabs.get(screen.title);
			if(tab){
				this.menu.hideTab(tab);
				this.screenTabs.unset(screen.title);
			}	
		}
		
		ScreenflowEngine.prototype.addScreenLoader = function (screen, functionHandler){
			this.loaders.set(screen, functionHandler);
		}
		
		ScreenflowEngine.prototype.manageTabs = function (){
			var keys = this.screenTabs.keys();
			var screenNumber = keys.length;
			if(screenNumber==0){
				this.emptyTab = this.menu.addTab({title: 'Gadget Message', html:'No reachable screens'});
				this.menu.setActiveTab(this.emptyTab);
			} else {
				if(this.emptyTab != null){
					this.menu.destroyTab(this.emptyTab);
					this.emptyTab = null;
				}
				if(screenNumber==1){
					this.menu.setActiveTab(this.screenTabs.get(keys[0]));
				}
			}
		}
		
	}
	
	// **********************
	// SINGLETON GET INSTANCE
	// **********************
	return new function() {
    	this.getInstance = function() {
    		if (instance == null) {
        		instance = new ScreenflowEngine();
         	}
         	return instance;
       	}
	}
	
}();