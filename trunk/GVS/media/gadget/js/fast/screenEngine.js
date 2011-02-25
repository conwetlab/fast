/*...............................licence...........................................
 *
 *    (C) Copyright 2011 FAST Consortium
 *
 *     This file is part of FAST Platform.
 *
 *     FAST Platform is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as published by
 *     the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     FAST Platform is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU Affero General Public License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with FAST Platform.  If not, see <http://www.gnu.org/licenses/>.
 *
 *     Info about members and contributors of the FAST Consortium
 *     is available at
 *
 *     http://fast.morfeo-project.eu
 *
 *...............................licence...........................................*/
var ScreenEngineFactory = function () {

    var instances = new Hash();

    var ScreenEngine = Class.create({

        initialize: function(id) {
            this.id = id;
            this.buildingblocks = new Array();
            this.posts = new Hash();
            this.pres = new Hash();
            this.indexedActions = new Hash();
            this.pipingIndexedActions = new Hash();
            this.triggerIndexedActions = new Hash();
            this.buildingBlocks = new Hash();
        },

        setEngine: function (screenflowEngine, buildingblocks, piping, triggers, pres, posts) {
            this.screenflowEngine = screenflowEngine;
            if(buildingblocks){
                this.buildingblocks = buildingblocks;
                for (var i=0; buildingblocks!= null && i<buildingblocks.length; i++){
                    var buildingBlock = buildingblocks[i];
                    var actions = buildingBlock.actions;
                    for(var j=0; actions!= null && j<actions.length;j++){
                        var action = actions[j];
                        action.scope = buildingBlock.scope;
                        action.indexedPres = new Hash();
                        var preconditions = action.preconditions;
                        for(var k=0; preconditions!= null && k<preconditions.length; k++){
                            var precondition = preconditions[k];
                            action.indexedPres.set(precondition.id , precondition);
                        }
                        var actionKey = this._getKey([action.name, buildingBlock.name]);
                        this.indexedActions.set(actionKey, action);
                    }
                }
            }
            for(var i=0; piping!= null && i<piping.length; i++){
                var pipe = piping[i];
                var pipingKey = this._getKey([pipe.from.condition, pipe.from.buildingblock]);
                var pipingActions = this.pipingIndexedActions.get(pipingKey);
                if (!pipingActions){
                    pipingActions = new Array();
                    this.pipingIndexedActions.set(pipingKey, pipingActions);
                }
                var action = this.indexedActions.get(this._getKey([pipe.to.action, pipe.to.buildingblock]));
                var pre = null;
                if (action){
                    pre = action.indexedPres.get(pipe.to.condition);
                }
                pipingActions.push({action: action, pre: pre, piping: pipe});
            }
            for(var i=0; triggers!= null && i<triggers.length; i++){
                var trigger = triggers[i];
                var triggerKey = this._getKey([trigger.from.name, trigger.from.buildingblock]);
                var triggerActions = this.triggerIndexedActions.get(triggerKey);
                if (!triggerActions){
                    triggerActions = new Array();
                    this.triggerIndexedActions.set(triggerKey, triggerActions);
                }
                var action = this.indexedActions.get(this._getKey([trigger.to.action, trigger.to.buildingblock]));
                triggerActions.push({action: action});
            }
            if(pres){
                for (var i=0; i<pres.length; i++){
                    var pre = pres[i];
                    this.pres.set(pre.id, pre);
                }
            }
            if(posts){
                for (var i=0; i<posts.length; i++){
                    var post = posts[i];
                    this.posts.set(post.id, post);
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
                modFacts.set(this._getKey([addedFacts[i].id, origin]), addedFacts[i]);
            }
            for (var i=0; deletedFacts!= null &&  i<deletedFacts.length; i++){
                this.deleteFact(deletedFacts[i], origin);
                modFacts.set(this._getKey([deletedFacts[i].id, origin]), deletedFacts[i]);
            }
            var sentTriggers = new Hash();
            for (var i=0; triggers!= null &&  i<triggers.length; i++){
                var trigger = {id: triggers[i], origin: origin};
                sentTriggers.set(this._getKey([trigger.id, trigger.origin]), triggers[i]);
            }
            this.run(sentTriggers, modFacts, origin);
        },

        addFact: function (fact, origin){
            if(fact){
                //Piping
                fact.origin = origin;
                var key = this._getKey([fact.id, origin])
                var piping = this.pipingIndexedActions.get(key);
                for (var i=0; piping!= null && i<piping.length; i++){
                    var pipe = piping[i];
                    if(pipe.piping.to.buildingblock && pipe.piping.to.buildingblock != ''){ //Pipe to Building Block
                        pipe.pre.value = fact;
                    } else { //Post
                        var p = this.posts.get(pipe.piping.to.condition);
                        if(p){
                            var f = Object.clone(fact);
                            f.origin = this.id;
                            f.uri = p.pattern.split(" ")[2];
                            this.screenflowEngine.manageFacts([f],[]);
                        }
                    }
                }
            }
        },

        deleteFact: function (id, origin){
            if(id){
                //Piping
                var key = this._getKey([id, origin])
                var piping = this.pipingIndexedActions.get(key);
                for (var i=0; piping!= null && i<piping.length; i++){
                    var pipe = piping[i];
                    if(pipe.piping.to.buildingblock && pipe.piping.to.buildingblock != ''){ //Pipe to Building Block
                        pipe.pre.value = null;
                    } else { //Post
                        var p = this.posts.get(pipe.piping.to.condition);
                        if(p){
                            p.uri = p.pattern.split(" ")[2];
                            this.screenflowEngine.manageFacts([],[p.uri]);
                        }
                    }
                }
            }
        },

        searchFact: function (precondition){
            var f = precondition.value;
            if(!f){
                var uri = precondition.pattern.split(" ")[2];
                var f = this.screenflowEngine.getFact(uri);
                if(f){
                    f = Object.clone(f);
                    f.origin = null;
                    precondition.value = f;
                }
            }
            return f;
        },


        restart: function (){
            //Empty action pres
            for (var i=0; i<this.buildingblocks.length; i++){
                var buildingBlock = this.buildingblocks[i];
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
            //Piping of Screen pres
            var actionKeys = this.pipingIndexedActions.keys();
            for (var i=0; i<actionKeys.length; i++){
                var pipes = this.pipingIndexedActions.get(actionKeys[i]);
                for (var j=0; j<pipes.length; j++){
                    var pipe = pipes[j];
                    if (!pipe.piping.from.buildingblock || pipe.piping.from.buildingblock=='') {
                        var uri = pipe.pre.pattern.split(" ")[2];
                        pipe.pre.value = this.screenflowEngine.getFact(uri);
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
                var factActions = this.pipingIndexedActions.get(factKeys[i]);
                for(var j=0; factActions && j < factActions.length; j++){
                    if(factActions[j].action){ //Without post piping
                        candidateActions.push(factActions[j]);
                    }
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
                    params.push(action.preconditions[i].value);
                }
            }
            //uses
            for(var i=0; i < action.uses.length; i++){
                params.push(this.screenflowEngine.getFact(action.uses[i].uri));
            }

            action.funct.apply(action.scope, params);
        },

        _getKey: function(keys){
            var ks = new Array();
            for(var i=0; i < keys.length; i++){
                ks.push(keys[i]? keys[i]: "");
            }
            return ks.join("-");
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
