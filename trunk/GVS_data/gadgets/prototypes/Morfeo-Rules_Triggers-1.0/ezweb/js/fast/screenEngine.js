var ScreenEngineFactory = function () {

	// *******************
	// SINGLETON INSTANCES
	// *******************
	var instances = new Hash();

	function ScreenEngine (id) {
		
		this.id = id;
		
		this.facts = new Hash();
		
		this.factDictionary = new Hash();
		
		this.rules = new Hash(); // new Hash() [{trigger: "...", condition:[fact1,...], actions:[act1, ...]}, ...]
		
		this.posts = new Hash(); // new Hash() [{name:..., origin:...}, ...]
		
		this.factIndexedRules = new Hash();
		
		this.triggerIndexedRules = new Hash();

		// **************
		// PUBLIC METHODS 
		// **************
		ScreenEngine.prototype.setEngine = function (screenflowEngine, rules, posts, dictionary) {
			this.screenflowEngine = screenflowEngine;
			if(rules){
				for (var i=0; i<rules.length; i++){
					var rule = rules[i];
					this.rules.set(i, rules[i]);
					if(rule.condition){
						for(var j = 0; j < rule.condition.length; j++){
							var fact = rule.condition [j];
							var factKey = _getKey(fact.id, fact.origin);
							var factRules = this.factIndexedRules.get(factKey);
							if (!factRules){
								factRules = new Array();
								this.factIndexedRules.set(factKey, factRules);
							}
							factRules.push(i);
						}
					}
					if(rule.trigger){
						var triggerKey = _getKey(rule.trigger.id, rule.trigger.origin);
						var triggerRules = this.triggerIndexedRules.get(triggerKey);
						if (!triggerRules){
							triggerRules = new Array();
							this.triggerIndexedRules.set(triggerKey, triggerRules);
						}
						triggerRules.push(i);
					}
				}
			}
			if(posts){
				for (var i=0; i<posts.length; i++){
					var post = posts[i];
					this.posts.set(_getKey(post.id, post.origin), post);
				}
			}
			if(dictionary){
				for (var i=0; i<dictionary.length; i++){
					var entry = dictionary[i];
					this.factDictionary.set(_getKey(entry.factId, entry.origin), entry);
				}
			}
		}
		
		// **********************
		// Knowledge Base methods
		// **********************
		
		ScreenEngine.prototype.manageData = function (triggerId, addedFacts, deletedFacts, origin){
			var modFacts = new Array();
			for (var i=0; addedFacts!= null && i<addedFacts.length; i++){
				this.addFact(addedFacts[i], origin);
				modFacts.push(_getKey(addedFacts[i].id, origin));
			}
			for (var i=0; deletedFacts!= null &&  i<deletedFacts.length; i++){
				this.deleteFact(deletedFacts[i], origin);
				modFacts.push(_getKey(deletedFacts[i].id, origin));
			}
			this.run(triggerId, modFacts, origin);
		}
		
		ScreenEngine.prototype.addFact = function (fact, origin){
			if(fact){
				fact.origin = origin;
				var key = _getKey(fact.id, origin)
				this.facts.set(key, fact);
				var p = this.posts.get(key);
				if(p){
					var f = Object.clone(fact);
					f.origin = this.id;
					f.name = p.name;
					this.screenflowEngine.manageFacts([f],[]);
				}
			}
		}
		
		ScreenEngine.prototype.deleteFact = function (id, origin){
			if(id){
				var key = _getKey(id, origin)
				this.facts.unset(key);
				var p = this.posts.get(key);
				if(p){
					this.screenflowEngine.manageFacts([],[p.name]);
				}
			}
		}
		
		ScreenEngine.prototype.getFact = function (id, origin){
			var key = _getKey(id, origin)
			return this.facts.get(key);
		}
		
		ScreenEngine.prototype.searchFact = function (id, origin){
			var f = this.getFact(id, origin); 
			if(!f && !origin){
				var entry = this.factDictionary.get(_getKey(id, origin));
				if (entry) {
					var f = this.screenflowEngine.getFact(entry.name);
					if(f){
						f = Object.clone(f);
						f.origin = null;
						this.addFact(f, f.origin);
					}
				}
			}
			return f;
		}
		
		// ************************
		// Inference Engine methods
		// ************************
		
		ScreenEngine.prototype.restart = function (){
			this.facts = new Hash();
			this.run("_onload", null, null, null);
		}
		
		ScreenEngine.prototype.run = function (triggerId, modFactsKeys, origin){
			var candidateRuleIds = this.getCandidateRuleIds(triggerId, modFactsKeys, origin);
			var firedRules = this.getFiredRules(triggerId, candidateRuleIds, origin);
			if (firedRules){
				for (var i = 0; i < firedRules.length; i++){
					this.execute(firedRules[i]);
				}
			}
		}
		
		ScreenEngine.prototype.getCandidateRuleIds = function (triggerId, modFactsKeys, origin){
			var candidateRules = new Array();
			if(modFactsKeys){
				for(var i = 0; i < modFactsKeys.length ; i++){
					var factRules = this.factIndexedRules.get(modFactsKeys[i]);
					if(factRules){
						candidateRules = candidateRules.concat(factRules);
					}
				}
			}
			if(triggerId){
				var triggerKey = _getKey(triggerId, origin);
				var triggerRules = this.triggerIndexedRules.get(triggerKey);
				if(triggerRules){
					candidateRules = candidateRules.concat(triggerRules);
				}
			}
			return candidateRules.uniq();
		}
		
		ScreenEngine.prototype.getFiredRules = function (triggerId, candidateRulesId, origin){
			var firedRules = new Array();
			for(var i = 0; i < candidateRulesId.length; i++){
				var rule = this.rules.get(candidateRulesId[i]);
				if(this.evaluateTrigger(rule.trigger,triggerId, origin) && this.evaluateCondition(rule)){
					firedRules.push(rule);
				}
			}
			return firedRules;
		}
		
		ScreenEngine.prototype.evaluateTrigger = function (ruleTrigger, triggerId, origin){
			if(!ruleTrigger){
				return true;
			} else {
				if(ruleTrigger.id==triggerId && ruleTrigger.origin==origin){
					return true;
				}
			}
			return false;
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
			var fact = this.searchFact(expression.id, expression.origin);
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
		
		var _getKey = function(id, origin){
			id = id? id: "";
			origin = origin? origin: "";
			return ([id, origin]).join("-");
	    }

	}
	
	// **********************
	// SINGLETON GET INSTANCE
	// **********************
	return new function(id) {
    	this.getInstance = function(id) {
    		var instance = instances.get(id);
    		if (instance == null) {
        		instance = new ScreenEngine(id);
        		instances.set(id, instance);
         	}
         	return instance;
       	}
	}
	
}();