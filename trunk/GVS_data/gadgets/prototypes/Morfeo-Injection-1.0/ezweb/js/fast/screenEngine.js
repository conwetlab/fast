var ScreenEngineFactory = function () {

	// *******************
	// SINGLETON INSTANCES
	// *******************
	var instances = new Hash();

	function ScreenEngine (id) {
		
		this.id = id;
		
		this.piping = new Array();
		
		this.posts = new Hash(); // new Hash() [{name:..., origin:...}, ...]
		
		this.factIndexedActions = new Hash();
		
		this.triggerIndexedActions = new Hash();

		// **************
		// PUBLIC METHODS 
		// **************
		ScreenEngine.prototype.setEngine = function (screenflowEngine, piping, posts, scope) {
			this.screenflowEngine = screenflowEngine;
			if(piping){
				this.piping = piping;
				for (var i=0; piping!= null && i<piping.length; i++){
					var buildingBlock = piping[i];
					var actions = buildingBlock.actions;
					for(var j=0; actions!= null && j<actions.length;j++){
						var action = actions[j];
						var preconditions = action.preconditions;
						for(var k=0; preconditions!= null && k<preconditions.length; k++){
							var precondition = preconditions[k];
							var origins = precondition.origins;
							for(var h=0; origins!= null && h<origins.length; h++){
								var origin = origins[h];
								var factKey = _getKey(origin.id, origin.origin);
								var factActions = this.factIndexedActions.get(factKey);
								if (!factActions){
									factActions = new Array();
									this.factIndexedActions.set(factKey, factActions);
								}
								factActions.push({action: action, pre: precondition, origin: origin});
							}
						}
						
						var triggers = action.triggers;
						for(var k=0; triggers!= null && k<triggers.length; k++){
							var trigger = triggers[k];
							var triggerKey = _getKey(trigger.id, trigger.origin);
							var triggerActions = this.triggerIndexedActions.get(triggerKey);
							if (!triggerActions){
								triggerActions = new Array();
								this.triggerIndexedActions.set(triggerKey, triggerActions);
							}
							triggerActions.push({action: action, trigger: trigger});
						}
					}
				}
			}
			if(posts){
				for (var i=0; i<posts.length; i++){
					var post = posts[i];
					this.posts.set(_getKey(post.id, post.origin), post);
				}
			}
		}
		
		ScreenEngine.prototype.manageData = function (triggers, addedFacts, deletedFacts, origin){
			var modFacts = new Hash();
			for (var i=0; addedFacts!= null && i<addedFacts.length; i++){
				this.addFact(addedFacts[i], origin);
				modFacts.set(_getKey(addedFacts[i].id, origin), addedFacts[i]);
			}
			for (var i=0; deletedFacts!= null &&  i<deletedFacts.length; i++){
				this.deleteFact(deletedFacts[i], origin);
				modFacts.set(_getKey(deletedFacts[i].id, origin), deletedFacts[i]);
			}
			var sentTriggers = new Hash();
			for (var i=0; triggers!= null &&  i<triggers.length; i++){
				var trigger = {id: triggers[i], origin: origin};
				sentTriggers.set(_getKey(trigger.id, trigger.origin), triggers[i]);
			}
			this.run(sentTriggers, modFacts, origin);
		}
		
		ScreenEngine.prototype.addFact = function (fact, origin){
			if(fact){
				//Piping
				fact.origin = origin;
				var key = _getKey(fact.id, origin)
				var piping = this.factIndexedActions.get(key);
				for (var i=0; piping!= null && i<piping.length; i++){
					var pipe = piping[i];
					pipe.pre.value = fact;
				}
				//Post
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
				//Piping
				var key = _getKey(id, origin)
				var piping = this.factIndexedActions.get(key);
				for (var i=0; piping!= null && i<piping.length; i++){
					var pipe = piping[i];
					pipe.pre.value = null;
				}
				//Post
				var p = this.posts.get(key);
				if(p){
					this.screenflowEngine.manageFacts([],[p.name]);
				}
			}
		}
		
		ScreenEngine.prototype.searchFact = function (precondition){
			var f = precondition.value; 
			if(!f){
				var f = this.screenflowEngine.getFact(precondition.name);
				if(f){
					f = Object.clone(f);
					f.origin = null;
					precondition.value = f;
				}
			}
			return f;
		}
		
		// ************************
		// Engine methods
		// ************************
		
		ScreenEngine.prototype.restart = function (){
			for (var i=0; i<this.piping.length; i++){
				var buildingBlock = this.piping[i];
				var actions = buildingBlock.actions;
				for(var j=0; actions!= null && j<actions.length;j++){
					var action = actions[j];
					var preconditions = action.preconditions;
					for(var k=0; preconditions!= null && k<preconditions.length; k++){
						var precondition = preconditions[k];
						precondition.value = null;
					}
				}
			}
			this.manageData(["_onload"], null, null, null);
		}
		
		ScreenEngine.prototype.run = function (triggers, modFacts, origin){
			var candidateActions = this.getCandidateActions(triggers, modFacts, origin);
			var firedActions = this.getFiredActions(candidateActions);
			if (firedActions){
				for (var i = 0; i < firedActions.length; i++){
					this.execute(firedActions[i]);
				}
			}
		}
		
		ScreenEngine.prototype.getCandidateActions = function (triggers, modFacts){
			var candidateActions = new Array();
			var factKeys = modFacts.keys();
			for(var i = 0; i < factKeys.length ; i++){
				var factActions = this.factIndexedActions.get(factKeys[i]);
				if(factActions){
					candidateActions = candidateActions.concat(factActions);
				}
			}
			var triggerKeys = triggers.keys();
			for(var i = 0; i < triggerKeys.length ; i++){
				var triggerActions = this.triggerIndexedActions.get(triggerKeys[i]);
				if(triggerActions){
					candidateActions = candidateActions.concat(triggerActions);
				}
			}
			return candidateActions.uniq();
		}
		
		ScreenEngine.prototype.getFiredActions = function (actions){
			var firedActions = new Array();
			for(var i = 0; i < actions.length; i++){
				var action = actions[i].action;
				if(this.evaluatePrecondition(action.preconditions)){
					firedActions.push(action);
				}
			}
			return firedActions;
		}
		
		ScreenEngine.prototype.evaluatePrecondition = function (preconditions){
			if(!preconditions){
				return true;
			}
			for(var i = 0; i < preconditions.length ; i++){
				var pre = preconditions[i];
				if (!this.evaluateExpression(pre)){
					return false;
				}	
			}
			return true;
		}
		
		ScreenEngine.prototype.evaluateExpression = function (precondition){
			var fact = this.searchFact(precondition);
			var evaluation = true;
			if(!fact){
				evaluation =  false;	
			}
			var positive = precondition.positive;
			if (!positive){ //it could be null
				positive = false;
			}
			return (positive == evaluation);
		}
		
		ScreenEngine.prototype.execute = function (action){
			var params = new Array ();
			
			//pres
			for(var i=0; i < action.preconditions.length; i++){
				var pre = action.preconditions[i];
				if(pre.positive) {
					params.push(action.preconditions[i].value); //Mediation, if necessary
				}
			}
			//uses
			for(var i=0; i < action.uses.length; i++){
				params.push(this.screenflowEngine.getFact(action.uses[i].name));
			}
			
			action.funct.apply(this.scope, params);
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