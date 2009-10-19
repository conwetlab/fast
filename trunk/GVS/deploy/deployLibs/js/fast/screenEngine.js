var ScreenEngineFactory = function () {

	var instances = new Hash();

	var ScreenEngine = Class.create({

		initialize: function(id) {
			this.id = id;
			this.piping = new Array();
			this.posts = new Hash();
			this.factIndexedActions = new Hash();
			this.triggerIndexedActions = new Hash();
			this.buildingBlocks = new Hash();
		},

		setEngine: function (screenflowEngine, piping, posts) {
			this.screenflowEngine = screenflowEngine;
			if(piping){
				this.piping = piping;
				for (var i=0; piping!= null && i<piping.length; i++){
					var buildingBlock = piping[i];
					var actions = buildingBlock.actions;
					for(var j=0; actions!= null && j<actions.length;j++){
						var action = actions[j];
						action.scope = buildingBlock.scope;
						var preconditions = action.preconditions;
						for(var k=0; preconditions!= null && k<preconditions.length; k++){
							var precondition = preconditions[k];
							var origins = precondition.origins;
							for(var h=0; origins!= null && h<origins.length; h++){
								var origin = origins[h];
								var factKey = this._getKey(origin.id, origin.origin);
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
							var triggerKey = this._getKey(trigger.id, trigger.origin);
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
					this.posts.set(this._getKey(post.id, post.origin), post);
				}
			}
		},
		
		addBuildingBlock: function (buildingBlockId, obj) {
			this.buildingBlocks.set(buildingBlockId, obj);
		},
		
		getBuildingBlock: function (buildingBlockId) {
			return this.buildingBlocks.get(buildingBlockId);
		},
		
		manageData: function (triggers, addedFacts, deletedFacts, origin){
			var modFacts = new Hash();
			for (var i=0; addedFacts!= null && i<addedFacts.length; i++){
				this.addFact(addedFacts[i], origin);
				modFacts.set(this._getKey(addedFacts[i].id, origin), addedFacts[i]);
			}
			for (var i=0; deletedFacts!= null &&  i<deletedFacts.length; i++){
				this.deleteFact(deletedFacts[i], origin);
				modFacts.set(this._getKey(deletedFacts[i].id, origin), deletedFacts[i]);
			}
			var sentTriggers = new Hash();
			for (var i=0; triggers!= null &&  i<triggers.length; i++){
				var trigger = {id: triggers[i], origin: origin};
				sentTriggers.set(this._getKey(trigger.id, trigger.origin), triggers[i]);
			}
			this.run(sentTriggers, modFacts, origin);
		},
		
		addFact: function (fact, origin){
			if(fact){
				//Piping
				fact.origin = origin;
				var key = this._getKey(fact.id, origin)
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
					f.uri = p.pattern.split(" ")[2];
					this.screenflowEngine.manageFacts([f],[]);
				}
			}
		},
		
		deleteFact: function (id, origin){
			if(id){
				//Piping
				var key = this._getKey(id, origin)
				var piping = this.factIndexedActions.get(key);
				for (var i=0; piping!= null && i<piping.length; i++){
					var pipe = piping[i];
					pipe.pre.value = null;
				}
				//Post
				var p = this.posts.get(key);
				if(p){
					p.uri = p.pattern.split(" ")[2];
					this.screenflowEngine.manageFacts([],[p.uri]);
				}
			}
		},
		
		searchFact: function (precondition){
			var f = precondition.value; 
			if(!f){
				var f = this.screenflowEngine.getFact(precondition.uri);
				if(f){
					f = Object.clone(f);
					f.origin = null;
					precondition.value = f;
				}
			}
			return f;
		},
		
		
		restart: function (){
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
		},
		
		run: function (triggers, modFacts, origin){
			var candidateActions = this.getCandidateActions(triggers, modFacts, origin);
			var firedActions = this.getFiredActions(candidateActions);
			if (firedActions){
				for (var i = 0; i < firedActions.length; i++){
					this.execute(firedActions[i]);
				}
			}
		},
		
		getCandidateActions: function (triggers, modFacts){
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
		},
		
		getFiredActions: function (actions){
			var firedActions = new Array();
			for(var i = 0; i < actions.length; i++){
				var action = actions[i].action;
				if(this.evaluatePrecondition(action.preconditions)){
					firedActions.push(action);
				}
			}
			return firedActions;
		},
		
		evaluatePrecondition: function (preconditions){
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
		},
		
		evaluateExpression: function (precondition){
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
		},
		
		execute: function (action){
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
				params.push(this.screenflowEngine.getFact(action.uses[i].uri));
			}
			
			action.funct.apply(action.scope, params);
		},
		
		_getKey: function(id, origin){
			id = id? id: "";
			origin = origin? origin: "";
			return ([id, origin]).join("-");
	    }
	});

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