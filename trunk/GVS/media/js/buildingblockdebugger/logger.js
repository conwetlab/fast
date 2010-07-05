var Logger = Class.create({
    /* Constants */
    ERROR: 'error',
    WARN: 'warning',

    /* Functions */
    initialize: function() {
        this._rootNode = new Element('ul', {
            'class': 'logger'
        });
    },

    /**
     * Set the root node of the logger
     */
    setLoggerNode: function(node) {
        node.update(this._rootNode);
    },

    /**
     * Logs a new entry in the log
     */
    log: function(message, _loglevel) {
        var date = new Date();

        var entry = new Element('li', {
            'class': _loglevel
        });
        logtext = _loglevel ? _loglevel.toUpperCase() + ": " : "";
        entry.update(sprintf("[%02u:%02u:%02u]: %s%s",
                            date.getHours(),
                            date.getMinutes(),
                            date.getSeconds(),
                            logtext,
                            message));
        this._rootNode.appendChild(entry);
    },

    /**
     * Clear log
     */
    clearLog: function() {
        this._rootNode.innerHTML = "";
    }
});
Logger = new Logger();
