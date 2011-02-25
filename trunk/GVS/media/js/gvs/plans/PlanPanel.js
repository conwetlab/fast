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
var PlanPanel = Class.create(SetListener, /** @lends PlanPanel.prototype */ {
    /**
     * It handles the user interface of the plan selector
     * @extends SetListener
     * @constructs
     */
    initialize: function() {
        /**
         * DOM node of the panel
         * @type DOMNode
         * @private @member
         */
        this._node = new Element('div', {
            'class': 'panel plans',
            'style': 'display:none'
        });

        /**
         * Area where the plans will be shown
         * @type DOMNode
         * @private
         */
        this._plansZone = null;


        /**
         * The PlanSet which will handle the plans
         * @type PlanSet
         * @private
         */
        this._planSet = new PlanSet();

        this._planSet.setListener(this);

        /**
         * Boolean representing the interface status (visible or not)
         * @type Boolean
         * @private
         */
        this._visible = false;

        /**
         * Area to drop a plan
         * @type DOMNode
         * @private
         */
        this._dropZone = null;


        /**
         * The inference Engine
         * @type InferenceEngine
         * @private
         */
        this._inferenceEngine = null;

        this._createContent();


    },


    // **************** PUBLIC METHODS **************** //


    /**
     * Returns the DOMNode
     * @type DOMNode
     */
    getNode: function () {
        return this._node;
    },

    /**
     * Sets the drop Zone to drop the plans
     */
    setDropZone: function(/** DropZone */ dropZone) {
        this._dropZone = dropZone;
    },

    /***
     * Sets the inference engine
     */
    setInferenceEngine: function(/** InferenceEngine */ inferenceEngine) {
        this._inferenceEngine = inferenceEngine;
    },

    /**
     * Hides the plan panel
     */
    hide: function() {
        dojox.fx.wipeOut({
            node: this._node,
            duration: 300,
            onAnimate: this._updateDropArea.bind(this),
            onEnd: this._showDropArea.bind(this)
        }).play();
        this._visible = false;
    },


    /**
     * Returns the panel status
     */
    isVisible: function() {
        return this._visible;
    },


    /**
     * Starts the process of showing the plans
     */
    showPlans: function(/** Array */ plans) {
        this._planSet.setPlans(plans);
    },


    /**
     * Implementing the SetListener interface
     */
    setChanged: function() {
        var planComponents = new Array();
        this._planSet.getBuildingBlocks().each(function(plan) {
            planComponents.push(new PlanComponent(plan, this._dropZone, this._inferenceEngine));
        }.bind(this));

        this._plansZone.update("");

        planComponents.each(function(planComponent) {
            this._plansZone.appendChild(planComponent.getNode());
        }.bind(this));

        this._show();
    },
    // **************** PRIVATE METHODS **************** //


    /**
     * Shows the plan panel
     * @private
     */
    _show: function() {
        dojox.fx.wipeTo({
            node: this._node,
            duration: 300,
            height: 200,
            onAnimate: this._updateDropArea.bind(this),
            onEnd: this._updateDropArea.bind(this)
        }).play();
        this._visible = true;
    },

    /**
     * It recalculates the top position of the drop area
     * @private
     */
    _updateDropArea: function() {
        var top = (parseInt(this._node.clientHeight) + 1) + 'px';
        this._dropZone.getNode().setStyle({'top': top});
     },

     _showDropArea: function() {
        this._dropZone.getNode().setStyle({'top': '0px'});
     },

     /**
      * Creates the HTML structure
      * @private
      */
     _createContent: function() {
        var container = new Element('div');

        this._node.appendChild(container);

        var title = new Element('div', {
            'class': 'dijitAccordionTitle'
        }).update("Available plans for the selected screen");
        container.appendChild(title);

        var description = "Please drag & drop one of these sets of screens into ";
        description += "the screenflow area, to make the selected screen ";
        description += "reachable. ";
        var descriptionNode = new Element('div', {
            'class': 'text'
        }).update(description);
        container.appendChild(descriptionNode);

        this._plansZone = new Element('div',{
            'class': 'planZone'
        });
        container.appendChild(this._plansZone);

        var closeButton = new Element('div', {
            'class': 'button'
        });
        Element.observe(closeButton, 'click', function(event) {
                                                    event.stop();
                                                    this.hide();
                                              }.bind(this));
        container.appendChild(closeButton);
     }
});

// vim:ts=4:sw=4:et:
