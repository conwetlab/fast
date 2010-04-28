var RecommendationManager = Class.create(/** @lends RecommendationManager.prototype */ {

	/**
     * Recommendation Manager.
     * @constructs
     */
    initialize: function() {
        /**
         * A list of current recommendations
         * @type Hash
         * @private
         */
        this._recommendations = new Hash();

        /**
         *
         */
        this._activeRecommendations = new Hash();

        /**
         * Current recommendation id
         * @type Number
         * @private
         */
        this._currentRecommendation = 1;

        /**
         * Current animation step
         * @type Number
         * @private
         */
        this._step = 0;

        /**
         * Timestamp when the animation started
         *
         * @type Number
         * @private
         */
        this._startTimespam = 0;

        /**
         * setTimeout handler
         *
         * @type Number
         * @private
         */
        this._timeout = null;
    },

    // **************** PUBLIC METHODS **************** //

	/**
	 * Sets the recommendations to manage
	 *
	setRecommendations: function(recommendations) {
    	this.clear();

    	this._recommendations = recommendations;
    	this._filterRecommendations();

    	var timeout = this._startFact ? null : 3000;
    	this._startAnimation(timeout);
    },*/

    /**
     * Adds a single recommendation
     */
    addRecommendation: function(localNode, externalNode) {
		if (this._recommendations.get(localNode.key) == undefined) {
			this._recommendations.set(localNode.key, {
					'className': 'recommendation' + this._currentRecommendation++,
					'localNode': localNode.node,
					'externalNodes': [],
					'nodes': [localNode.node]});
		}

    	var recommendation = this._recommendations.get(localNode.key);
		recommendation.externalNodes.push(externalNode.node);
		recommendation.nodes.push(externalNode.node);

		this._dirty = true;
    },

	/**
	 * Sets the fact that will be used as source in the connection
	 */
    setStartFact: function(fact) {
    	this._clear();
    	this._stopAnimation();
    	this._startFact = fact;

    	this._dirty = true;
    	if (this._startFact)
    		this.startAnimation();
    },

    /**
     * Starts recommendation animation
     */
    startAnimation: function() {
    	var timeout = this._startFact ? null : 3000;

    	this._clear();
    	this._stopAnimation();
    	if (this._dirty)
    		this._filterRecommendations();

    	this._startAnimation(timeout);
    },

	/**
	 * Clears all recommendations
	 */
	clear: function() {
    	this._clear();
    	this._stopAnimation();
    	this._recommendations = new Hash();
    	this._activeRecommendations = new Hash();
    	this._currentRecommendation = 1;
    	this._dirty = false;
    },

    // **************** PRIVATE METHODS **************** //

    /**
     * Updates this._activeRecommedations using the current contents of
     * this._recommendations and this._startFact.
     *
     * @private
     */
    _filterRecommendations: function() {
    	if (this._startFact) {
    		this._activeRecommendations = new Hash();
    		var filteredRecommendations = this._recommendations.get(this._startFact);
    		if (filteredRecommendations) {
    			this._activeRecommendations.set(this._startFact, filteredRecommendations);
    		}
    	} else {
    		this._activeRecommendations = this._recommendations;
    	}
    	this._dirty = false;
    },

    /**
     * Removes all node style included for recommendations.
     *
     * @private
     */
    _clear: function() {
    	this._recommendations.each(function(recommendation) {
    		var nodes = recommendation.value.nodes;
    		var className = recommendation.value.className;

    		nodes.each(function(node) {
    			node.removeClassName(className);
    			node.getElementsByClassName('recommendationLayer')[0].style.opacity = "";
    		}.bind(this));
    	}.bind(this));
    },

	/**
	 * Stops recommendation animation
	 *
	 * @private
	 */
    _stopAnimation: function() {
    	try {
    		this._startTimestamp = 0;
    		clearTimeout(this._timeout);
    	} catch (e) {}
    },

	/**
	 * Starts recommendation animation
	 *
	 * @private
	 */
    _startAnimation: function(duration) {
    	this._activeRecommendations.each(function(recommendation) {
    		var nodes;

    		if (this._startFact)
    			nodes = recommendation.value.externalNodes;
    		else
    			nodes = recommendation.value.nodes;

    		var className = recommendation.value.className;
    		nodes.each(function(node) {
    			node.getElementsByClassName('recommendationLayer')[0].style.opacity = 0;
    			node.addClassName(className);
    		}.bind(this));
    	}.bind(this));

    	this._step = 0;
    	this._duration = duration;
    	var now = new Date();
    	this._startTimestamp = now.getTime();
        this._timeout = setTimeout(this._timeoutCallback.bind(this), 100);
    },

    /**
     * @private
     */
    _timeoutCallback: function() {
        var end = false;
    	var opacity = Math.sin(Math.PI * this._step / 10);
    	opacity *= opacity;

    	if (opacity < 0.10) {
    		var now = new Date();
    		if (this._duration && ((now.getTime() - this._startTimestamp) > this._duration)) {
    			end = true;
    			opacity = 0;
    		}
    	}

    	this._activeRecommendations.each(function(recommendation) {
    		var nodes = recommendation.value.nodes;
    		var className = recommendation.value.className;
    		nodes.each(function(node) {
    			node.getElementsByClassName('recommendationLayer')[0].style.opacity = opacity;
    		}.bind(this));
    	}.bind(this));

    	if (!end) {
    		this._step++;
    		this._timeout = setTimeout(this._timeoutCallback.bind(this), 100);
    	}
    }

});

//vim:ts=4:sw=4:et:
