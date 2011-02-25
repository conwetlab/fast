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
var OperatorView = Class.create(BuildingBlockView,
    /** @lends OperatorView.prototype */ {

    /**
     * Operators graphical representation
     * @constructs
     * @extends BuildingBlockView
     */
    initialize: function($super,/** OperatorDescription */ description) {

        $super();

        /**
         * Precondition Icons
         * @type Hash
         * @private
         */
        this._preIcons = new Hash();

        /**
         * Postcondition Icons
         * @type Hash
         * @private
         */
        this._postIcons = new Hash();


        this._node = new Element("div", {
            "class": "view operator",
            "title": description.name
        });

        var actions = description.actions;

        // TODO: Better action support: put the name of the action somewhere
        // and separation between actions
        var preOrdered = new Array();

        actions.each(function(action) {
            action.preconditions.each(function(pre) {
                var fact = FactFactory.getFactIcon(pre, "embedded");
                this._preIcons.set(pre.id, fact);
                preOrdered.push(fact);
            }.bind(this));

        }.bind(this));

        var postOrdered = new Array();

        if (description.postconditions && description.postconditions[0] instanceof Array) {
            var posts =  description.postconditions[0];
        } else {
            var posts = description.postconditions;
        }

        posts.each(function(post) {
                var fact = FactFactory.getFactIcon(post, "embedded");
                this._postIcons.set(post.id, fact);
                postOrdered.push(fact);
            }.bind(this));

        var size = preOrdered.size();
        for (var i=0; i < size; i++){
        	var factNode = preOrdered[i].getNode();
        	this._node.appendChild(factNode);
        	var position = this._getPosition(true, i, size, 0);
            factNode.setStyle({
                'top': Math.round(position.y) + 'px',
                'left': Math.round(position.x) + 'px'
            });
        }

        size = postOrdered.size();
        for (var i=0; i < size; i++){
        	var factNode = postOrdered[i].getNode();
        	var position = this._getPosition(false, i, size, 0);
        	this._node.appendChild(factNode);
            factNode.setStyle({
                'top': Math.round(position.y) + 'px',
                'left': Math.round(position.x) + 'px'
            });
        }

        /*if (description.icon){
            var imageContainer = new Element ('div',
                    {'class': 'screenImage' });
            var image = new Element ('img',{
                    'class': 'img',
                    'src': description.icon
            imageContainer.appendChild (image);
        }*/

        /*if (description.icon){
            this._node.appendChild(imageContainer);
        }*/

        var titleNode = new Element("div", {"class":"title"});
        titleNode.update(description.label['en-gb']);
        this._node.appendChild(titleNode);


    },

    // **************** PRIVATE METHODS **************** //

    /**
     * This function returns the position of a PRE/POST fact
     *
     */
    _getPosition: function(/** Boolean */ isPre, /** Integer */ order, /** Integer */ size, /** Integer */ orientation) {
    	var width = 74;
        var height = 60;
    	var x = width * (order+1) / (size+1);
    	if ((order+1) != (size + 1) / 2) { // No middle
    		x += (order < size/2)? -4 : 3;
    	}

    	if(isPre && orientation == 0 || !isPre && orientation == 1){
	    	if (x > width/2) { // Choose side
				var y = 3*height/2 - x *(height/2)/(width/2);
			} else {
				var y = x*(height/2)/(width/2) + height/2;
			}
    	} else {
	    	if(x > width/2) { // Choose side
				var y = x*(height/2)/(width/2) - height/2 - 4;
			} else {
				var y = height/2 - x *(height/2)/(width/2) - 4;
			}
    	}
        return {'x': x, 'y': y};
    },

    // **************** PUBLIC METHODS **************** //
    /**
     * This function returns the domNode of the condition that has
     * the id passed as parameter
     */
    getConditionNode: function(/** String */ id) {
        return this._preIcons.get(id) ? this._preIcons.get(id).getNode() : this._postIcons.get(id).getNode();
    },

    /**
     * Colorize the component depending on the reachability
     * @public @override
     */
    setReachability: function( /** Hash */ reachabilityData) {
        this._setViewReachability(reachabilityData, this._preIcons,
                                this._postIcons.values(), this._node);
    },

    /**
     * This function update orientation of the operator
     *
     */
    updateOrientation: function(orientation) {
    	if(!orientation){
    		orientation = 0;
    	}
    	var pres = this._preIcons.values();
    	var size = pres.length;
    	for(var i=0; i < size; i++){
    		var factNode = pres[i].getNode();
    		var position = this._getPosition(true, i, size, orientation);
    		factNode.setStyle({
                'top': Math.round(position.y) + 'px',
                'left': Math.round(position.x) + 'px'
            });
    	}
    	var posts = this._postIcons.values();
    	var size = posts.length;
    	for(var i=0; i < size; i++){
    		var factNode = posts[i].getNode();
    		var position = this._getPosition(false, i, size, orientation);
    		factNode.setStyle({
                'top': Math.round(position.y) + 'px',
                'left': Math.round(position.x) + 'px'
            });
    	}
    },

    /**
     * Removes the DOM Elements and frees building blocks
     * @override
     */
    destroy: function ($super) {
        // Let the garbage collector to do its job
        this._preIcons = null;
        this._postIcons = null;
        $super();
    }

    // **************** PRIVATE METHODS **************** //
});

// vim:ts=4:sw=4:et:
