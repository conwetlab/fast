var EngineFactory = function () {

	// *********************************
	// SINGLETON INSTANCE
	// *********************************
	var instance = null;

	function Engine () {
		
		this.screens = new Hash();
		
		this.screenTabs = new Hash();
		
		this.allTabs = new Hash();
		
		this.menu = null;
		
		this.facts = new Hash();
		
		this.loaders = new Hash();
		
		this.emptyTab = null;
		
		this.events = new Hash();

		// ****************
		// PUBLIC METHODS 
		// ****************
		Engine.prototype.setEngine = function (screens, events, menu) {
			this.menu = menu;
			this.screens = screens;
			this.events = events;
		}
		
		Engine.prototype.transformFact = function(factName, attributeName, value){
			if(attributeName!=''){
				var fact = this.getFact(factName);
				if(!fact){
					fact = {name: factName};
				}
				fact[attributeName] = value;
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
		
		Engine.prototype.manageVarFacts = function (addedFacts, deletedFacts){
			this.manageFacts(addedFacts, deletedFacts);
			var func = this.loaders.get(this.menu.getActiveTab().title);
			func();
		}
		
		Engine.prototype.manageFacts = function (addedFacts, deletedFacts){
			for (var i=0; addedFacts!= null && i<addedFacts.length; i++){
				this.addFact(addedFacts[i]);
			}
			for (var i=0; deletedFacts!= null &&  i<deletedFacts.length; i++){
				this.deleteFact(deletedFacts[i]);
			}
			this.run();
		}
		
		Engine.prototype.addFact = function (fact){
			if(fact){
				this.facts.set(fact.name, fact);
				this.throwEvents(fact);
			}
		}
		
		Engine.prototype.throwEvents = function (fact){
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
		
		Engine.prototype.getFact = function (name){
			return this.facts.get(name);
		}
		
		Engine.prototype.deleteFact = function (name){
			if(name){
				this.facts.unset(name);
			}
		}
		
		Engine.prototype.run = function (){
			this.screens.each(function(pair){this.manageScreen(pair.value);}.bind(this))
			this.manageTabs();
		}
		
		Engine.prototype.manageScreen = function (screen){
			if(this.isReachable(screen)){
				this.addScreen(screen);	
			} else {
				this.deleteScreen(screen);	
			}
		}
		
		Engine.prototype.addScreen = function (screen){
			var tab = this.allTabs.get(screen.title);
			if(!tab){
				tab = this.menu.addTab(screen);
				this.screenTabs.set(screen.title, tab);
				this.allTabs.set(screen.title, tab);
				this.menu.setEventListener(tab, "activate", this.loaders.get(screen.title));
			}
			this.menu.unhideTab(tab);
		}
		
		Engine.prototype.deleteScreen = function (screen){
			var tab = this.allTabs.get(screen.title);
			if(tab){
				this.menu.hideTab(tab);
				this.screenTabs.unset(screen.title);
			}	
		}
		
		Engine.prototype.addScreenLoader = function (screen, functionHandler){
			this.loaders.set(screen, functionHandler);
		}
		
		Engine.prototype.manageTabs = function (){
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
		
		Engine.prototype.isReachable = function (screen){
			return this.evaluatePres(screen);
		}
		
		Engine.prototype.evaluatePres = function (screen){
			var screenpres = screen.pre;
			for(var i=0; i < screenpres.length; i++){
				if (!this.evaluateFact(screenpres[i])){
					return false;
				}	
			}
			return true;
		}
		
		Engine.prototype.evaluateFact = function (fact){
			if(!this.facts.get(fact)){
				return false;	
			}
			return true;
		}
		
	}
	
	// *********************************
	// SINGLETON GET INSTANCE
	// *********************************
	return new function() {
    	this.getInstance = function() {
    		if (instance == null) {
        		instance = new Engine();
         	}
         	return instance;
       	}
	}
	
}();