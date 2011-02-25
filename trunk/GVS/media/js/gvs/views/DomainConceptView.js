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
var DomainConceptView = Class.create( BuildingBlockView,
    /** @lends DomainConceptView.prototype */ {

    /**
     * Domain Concepts graphical representation
     * @constructs
     * @extends BuildingBlockView
     */
    initialize: function($super, /** BuildingBlockDescription */ description) {
        $super();

        this._factIcon = FactFactory.getFactIcon(description, "standalone").getNode();

        this._node = new Element("div", {
            "class": "view domainConcept"
        });
        this._node.appendChild(this._factIcon);

    },

    // **************** PUBLIC METHODS **************** //

    /**
     * @override
     */
    setReachability: function (/** Object */ reachabilityData) {
        var reachability = (reachabilityData.reachability !== undefined) ?
                            reachabilityData.reachability : reachabilityData.satisfied;
        Utils.setSatisfeabilityClass(this._factIcon, reachability);
    },

    getReachability: function() {
        return this._factIcon.hasClassName("satisfeable");
    }

});

// vim:ts=4:sw=4:et:
