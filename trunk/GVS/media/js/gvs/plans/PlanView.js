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
var PlanView = Class.create(BuildingBlockView,
    /** @lends PlanView.prototype */ {

    /**
     * Plans graphical representation
     * @constructs
     * @extends BuildingBlockView
     */
    initialize: function($super, /** Array */ plan) {

        $super();

        this._node = new Element('div', {'class': 'plan view'});

        var nScreens = 0;
        plan.each(function(screenDescription) {
            var screenView = new ScreenView(screenDescription);
            this._node.appendChild(screenView.getNode());
            nScreens++;
        }.bind(this));
        // width = (size of each screen)* (number of screens)
        // + (margin+padding)*(number of screens)
        var width = 102*nScreens + 6*nScreens;
        var widthText = width + 'px';
        this._node.setStyle({'width': widthText});
    },

    // **************** PUBLIC METHODS **************** //

    /**
     * Colorize the component depending on the reachability
     * @public @override
     */
    setReachability: function( /** Hash */ reachabilityData) {

        //Do nothing
    },

    /**
     * Removes the DOM Elements and frees building blocks
     * @override
     */
    destroy: function () {
        // Let the garbage collector to do its job

    }

    // **************** PRIVATE METHODS **************** //
});

// vim:ts=4:sw=4:et:
