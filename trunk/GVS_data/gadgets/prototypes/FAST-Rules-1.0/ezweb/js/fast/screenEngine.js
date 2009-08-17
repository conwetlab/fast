var ScreenEngineFactory = function () {

	// *******************
	// SINGLETON INSTANCES
	// *******************
	var instances = new Hash();

	function ScreenEngine () {
		
		this.facts = new Hash();
		
		this.rules = null; // new Hash() [{id:..., condition:[fact1,...], actions:[act1, ...]}, ...]
		
		this.posts = null; // new Hash() [factname1, ...]
		
		this.factIndexedRules = new Hash();

		// **************
		// PUBLIC METHODS 
		// **************
		ScreenEngine.prototype.setEngine = function (screenflowEngine, rules, posts) {
			this.screenflowEngine = screenflowEngine;
			if(rules){
				this.rules = rules;
			} else {
				this.rules = new Hash();
			}
			if(posts){
				this.posts = posts;
			} else {
				this.posts = new Hash();
			}
			this.indexRules();
		}
		
		ScreenEngine.prototype.indexRules = function (){
			var ruleIds = this.rules.keys();
			for(var i = 0; i < ruleIds.length; i++){
				var rule = this.rules.get(ruleIds[i]);
				if(rule.condition){
					for(var j = 0; j < rule.condition.length; j++){
						var fact = rule.condition [j];
						var factRules = this.factIndexedRules.get(fact.name);
						if (!factRules){
							factRules = new Hash();
							this.factIndexedRules.set(fact.name, factRules);
						}
						factRules.set(rule.id, rule.id);
					}
				}
			}
		}
		
		// **********************
		// Knowledge Base methods
		// **********************
		
		ScreenEngine.prototype.manageFacts = function (addedFacts, deletedFacts){
			var modFacts = new Hash();
			for (var i=0; addedFacts!= null && i<addedFacts.length; i++){
				this.addFact(addedFacts[i]);
				modFacts.set(addedFacts[i].name, addedFacts[i].name);
			}
			for (var i=0; deletedFacts!= null &&  i<deletedFacts.length; i++){
				this.deleteFact(deletedFacts[i]);
				modFacts.set(deletedFacts[i], deletedFacts[i]);
			}
			this.run(modFacts.values());
		}
		
		ScreenEngine.prototype.addFact = function (fact){
			if(fact){
				this.facts.set(fact.name, fact);
				var p = this.posts.get(fact.name);
				if(p){
					this.screenflowEngine.manageFacts([fact],[]);
				}
			}
		}
		
		ScreenEngine.prototype.getFact = function (name){
			return this.facts.get(name);
		}
		
		ScreenEngine.prototype.deleteFact = function (name){
			if(name){
				this.facts.unset(name);
				var p = this.posts.get(name);
				if(p){
					this.screenflowEngine.manageFacts([],[name]);
				}
			}
		}
		
		ScreenEngine.prototype.searchFact = function (name){
			var f = this.facts.get(name)
			if(!f){
				f = this.screenflowEngine.getFact(name);
				if (f) {
					f = Object.clone(f);
					this.facts.set(f.name, f);
				}
			}
			return f;
		}
		
		// ************************
		// Inference Engine methods
		// ************************
		
		ScreenEngine.prototype.restart = function (){
			this.facts = new Hash();
			this.run();
		}
		
		ScreenEngine.prototype.run = function (modFactsNames){
			var candidateRuleIds = this.getCandidateRuleIds(modFactsNames);
			var firedRules = this.getFiredRules(candidateRuleIds);
			if (firedRules){
				for (var i = 0; i < firedRules.length; i++){
					this.execute(firedRules[i]);
				}
			}
		}
		
		ScreenEngine.prototype.getCandidateRuleIds = function (modFactsNames){
			if(modFactsNames){
				var candidateRules = new Array();
				for(var i = 0; i < modFactsNames.length ; i++){
					var factRules = this.factIndexedRules.get(modFactsNames[i]);
					if(factRules){
						candidateRules = candidateRules.concat(factRules.keys());
					}
				}
				return candidateRules.uniq();
			} else {
				return this.rules.keys();
			}
		}
		
		ScreenEngine.prototype.getFiredRules = function (candidateRulesId){
			var firedRules = new Array();
			for(var i = 0; i < candidateRulesId.length; i++){
				var rule = this.rules.get(candidateRulesId[i]);
				if(this.evaluateCondition(rule)){
					firedRules.push(rule);
				}
			}
			return firedRules;
		}
		
		ScreenEngine.prototype.evaluateCondition = function (rule){
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
		
		ScreenEngine.prototype.evaluateExpression = function (expression){
			var fact = this.searchFact(expression.name);
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
		
		ScreenEngine.prototype.execute = function (rule){
			var actions = rule.actions;
			if(!actions){
				return;
			}
			for(var i = 0; i < actions.length; i++){
				actions[i]();
			}
		}
		
	}
	
	// **********************
	// SINGLETON GET INSTANCE
	// **********************
	return new function(id) {
    	this.getInstance = function(id) {
    		var instance = instances.get(id);
    		if (instance == null) {
        		instance = new ScreenEngine();
        		instances.set(id, instance);
         	}
         	return instance;
       	}
	}
	
}();