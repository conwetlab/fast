/*
    http://www.JSON.org/json_parse.js
    2009-05-31
    2010-04-08 - Modified at CoNWeT Lab (comments allowed)

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    This file creates a cjson_parse function.

        cjson_parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = cjson_parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

    This is a reference implementation. You are free to copy, modify, or
    redistribute.

    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.
*/

/*members "", "\"", "\/", "\\", at, b, call, charAt, f, fromCharCode,
    hasOwnProperty, message, n, name, push, r, t, text
*/

var cjson_parse = (function () {

// This is a function that can parse a JSON text, producing a JavaScript
// data structure. It is a simple, recursive descent parser. It does not use
// eval or regular expressions, so it can be used as a model for implementing
// a JSON parser in other languages.

// We are defining the function inside of another function to avoid creating
// global variables.

    var at,     // The index of the current character
        ch,     // The current character
        escapee = {
            '"':  '"',
            '\\': '\\',
            '/':  '/',
            b:    '\b',
            f:    '\f',
            n:    '\n',
            r:    '\r',
            t:    '\t'
        },
        text,

        error = function (m) {

// Call error when something is wrong.

            throw {
                name:    'SyntaxError',
                message: m,
                at:      at,
                text:    text
            };
        },

        next = function (c) {

// If a c parameter is provided, verify that it matches the current character.

            if (c && c !== ch) {
                error("Expected '" + c + "' instead of '" + ch + "'");
            }

// Get the next character. When there are no more characters,
// return the empty string.

            ch = text.charAt(at);
            at += 1;
            return ch;
        },

        number = function () {

// Parse a number value.

            var number,
                string = '';

            if (ch === '-') {
                string = '-';
                next('-');
            }
            while (ch >= '0' && ch <= '9') {
                string += ch;
                next();
            }
            if (ch === '.') {
                string += '.';
                while (next() && ch >= '0' && ch <= '9') {
                    string += ch;
                }
            }
            if (ch === 'e' || ch === 'E') {
                string += ch;
                next();
                if (ch === '-' || ch === '+') {
                    string += ch;
                    next();
                }
                while (ch >= '0' && ch <= '9') {
                    string += ch;
                    next();
                }
            }
            number = +string;
            if (isNaN(number)) {
                error("Bad number");
            } else {
                return number;
            }
        },

        comment = function () {

// When parsing for block or line comments, we must look for // and /*.

            if (ch === '/') {
                next();
                if (ch === '/') {
                        while (next()) {
                                if (ch === '\n') {
                                        next();
                                        return;
                                }
                        }
                } else if (ch === '*') {
                        while (next()) {
                                if (ch === '*') {
                                        while (ch === '*') {
                                                next();
                                        }
                                        if (ch === '/') {
                                                next();
                                                return;
                                        }
                                }
                        }
                }
            }
            error("Bad comment");
        },

        string = function () {

// Parse a string value.

            var hex,
                i,
                string = '',
                uffff;

// When parsing for string values, we must look for " and \ characters.

            if (ch === '"') {
                while (next()) {
                    if (ch === '"') {
                        next();
                        return string;
                    } else if (ch === '\\') {
                        next();
                        if (ch === 'u') {
                            uffff = 0;
                            for (i = 0; i < 4; i += 1) {
                                hex = parseInt(next(), 16);
                                if (!isFinite(hex)) {
                                    break;
                                }
                                uffff = uffff * 16 + hex;
                            }
                            string += String.fromCharCode(uffff);
                        } else if (typeof escapee[ch] === 'string') {
                            string += escapee[ch];
                        } else {
                            break;
                        }
                    } else {
                        string += ch;
                    }
                }
            }
            error("Bad string");
        },

        white = function () {

// Skip whitespace.

            while (ch && (ch <= ' ' || ch === '/')) {
                if (ch === '/') {
                        comment();
                } else {
                        next();
                }
            }
        },

        word = function () {

// true, false, or null.

            switch (ch) {
            case 't':
                next('t');
                next('r');
                next('u');
                next('e');
                return true;
            case 'f':
                next('f');
                next('a');
                next('l');
                next('s');
                next('e');
                return false;
            case 'n':
                next('n');
                next('u');
                next('l');
                next('l');
                return null;
            }
            error("Unexpected '" + ch + "'");
        },

        value,  // Place holder for the value function.

        array = function () {

// Parse an array value.

            var array = [];

            if (ch === '[') {
                next('[');
                white();
                if (ch === ']') {
                    next(']');
                    return array;   // empty array
                }
                while (ch) {
                    array.push(value());
                    white();
                    if (ch === ']') {
                        next(']');
                        return array;
                    }
                    next(',');
                    white();
                }
            }
            error("Bad array");
        },

        object = function () {

// Parse an object value.

            var key,
                object = {};

            if (ch === '{') {
                next('{');
                white();
                if (ch === '}') {
                    next('}');
                    return object;   // empty object
                }
                while (ch) {
                    key = string();
                    white();
                    next(':');
                    if (Object.hasOwnProperty.call(object, key)) {
                        error('Duplicate key "' + key + '"');
                    }
                    object[key] = value();
                    white();
                    if (ch === '}') {
                        next('}');
                        return object;
                    }
                    next(',');
                    white();
                }
            }
            error("Bad object");
        };

    value = function () {

// Parse a JSON value. It could be an object, an array, a string, a number,
// or a word.

        white();
        switch (ch) {
        case '{':
            return object();
        case '[':
            return array();
        case '"':
            return string();
        case '-':
            return number();
        default:
            return ch >= '0' && ch <= '9' ? number() : word();
        }
    };

// Return the cjson_parse function. It will have access to all of the above
// functions and variables.

    return function (source, reviver) {
        var result;

        text = source;
        at = 0;
        ch = ' ';
        result = value();
        white();
        if (ch) {
            error("Syntax error");
        }

// If there is a reviver function, we recursively walk the new structure,
// passing each name/value pair to the reviver function for possible
// transformation, starting with a temporary root object that holds the result
// in an empty key. If there is not a reviver function, we simply return the
// result.

        return typeof reviver === 'function' ? (function walk(holder, key) {
            var k, v, value = holder[key];
            if (value && typeof value === 'object') {
                for (k in value) {
                    if (Object.hasOwnProperty.call(value, k)) {
                        v = walk(value, k);
                        if (v !== undefined) {
                            value[k] = v;
                        } else {
                            delete value[k];
                        }
                    }
                }
            }
            return reviver.call(holder, key, value);
        }({'': result}, '')) : result;
    };
}());

/* CodeMirror main module
 *
 * Implements the CodeMirror constructor and prototype, which take care
 * of initializing the editor frame, and providing the outside interface.
 */

// The CodeMirrorConfig object is used to specify a default
// configuration. If you specify such an object before loading this
// file, the values you put into it will override the defaults given
// below. You can also assign to it after loading.
var CodeMirrorConfig = window.CodeMirrorConfig || {};

var CodeMirror = (function(){
  function setDefaults(object, defaults) {
    for (var option in defaults) {
      if (!object.hasOwnProperty(option))
        object[option] = defaults[option];
    }
  }
  function forEach(array, action) {
    for (var i = 0; i < array.length; i++)
      action(array[i]);
  }

  // These default options can be overridden by passing a set of
  // options to a specific CodeMirror constructor. See manual.html for
  // their meaning.
  setDefaults(CodeMirrorConfig, {
    stylesheet: "",
    path: "",
    parserfile: [],
    basefiles: ["util.js", "stringstream.js", "select.js", "undo.js", "editor.js", "tokenize.js"],
    iframeClass: null,
    passDelay: 200,
    passTime: 50,
    lineNumberDelay: 200,
    lineNumberTime: 50,
    continuousScanning: false,
    saveFunction: null,
    onChange: null,
    undoDepth: 50,
    undoDelay: 800,
    disableSpellcheck: true,
    textWrapping: true,
    readOnly: false,
    width: "",
    height: "300px",
    autoMatchParens: false,
    parserConfig: null,
    tabMode: "indent", // or "spaces", "default", "shift"
    reindentOnLoad: false,
    activeTokens: null,
    cursorActivity: null,
    lineNumbers: false,
    indentUnit: 2,
    domain: null
  });

  function addLineNumberDiv(container) {
    var nums = document.createElement("DIV"),
        scroller = document.createElement("DIV");
    nums.style.position = "absolute";
    nums.style.height = "100%";
    if (nums.style.setExpression) {
      try {nums.style.setExpression("height", "this.previousSibling.offsetHeight + 'px'");}
      catch(e) {} // Seems to throw 'Not Implemented' on some IE8 versions
    }
    nums.style.top = "0px";
    nums.style.overflow = "hidden";
    container.appendChild(nums);
    scroller.className = "CodeMirror-line-numbers";
    nums.appendChild(scroller);
    return nums;
  }

  function frameHTML(options) {
    if (typeof options.parserfile == "string")
      options.parserfile = [options.parserfile];
    if (typeof options.stylesheet == "string")
      options.stylesheet = [options.stylesheet];

    var html = ["<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.0 Transitional//EN\" \"http://www.w3.org/TR/html4/loose.dtd\"><html><head>"];
    // Hack to work around a bunch of IE8-specific problems.
    html.push("<meta http-equiv=\"X-UA-Compatible\" content=\"IE=EmulateIE7\"/>");
    forEach(options.stylesheet, function(file) {
      html.push("<link rel=\"stylesheet\" type=\"text/css\" href=\"" + file + "\"/>");
    });
    forEach(options.basefiles.concat(options.parserfile), function(file) {
      html.push("<script type=\"text/javascript\" src=\"" + options.path + file + "\"><" + "/script>");
    });
    html.push("</head><body style=\"border-width: 0;\" class=\"editbox\" spellcheck=\"" +
              (options.disableSpellcheck ? "false" : "true") + "\"></body></html>");
    return html.join("");
  }

  var internetExplorer = document.selection && window.ActiveXObject && /MSIE/.test(navigator.userAgent);

  function CodeMirror(place, options) {
    // Backward compatibility for deprecated options.
    if (options.dumbTabs) options.tabMode = "spaces";
    else if (options.normalTab) options.tabMode = "default";

    // Use passed options, if any, to override defaults.
    this.options = options = options || {};
    setDefaults(options, CodeMirrorConfig);

    var frame = this.frame = document.createElement("IFRAME");
    if (options.iframeClass) frame.className = options.iframeClass;
    frame.frameBorder = 0;
    frame.style.border = "0";
    frame.style.width = '100%';
    frame.style.height = '100%';
    // display: block occasionally suppresses some Firefox bugs, so we
    // always add it, redundant as it sounds.
    frame.style.display = "block";

    var div = this.wrapping = document.createElement("DIV");
    div.style.position = "relative";
    div.className = "CodeMirror-wrapping";
    div.style.width = options.width;
    div.style.height = options.height;
    // This is used by Editor.reroutePasteEvent
    var teHack = this.textareaHack = document.createElement("TEXTAREA");
    div.appendChild(teHack);
    teHack.style.position = "absolute";
    teHack.style.left = "-10000px";
    teHack.style.width = "10px";

    // Link back to this object, so that the editor can fetch options
    // and add a reference to itself.
    frame.CodeMirror = this;
    if (options.domain && internetExplorer) {
      this.html = frameHTML(options);
      frame.src = "javascript:(function(){document.open();" +
        (options.domain ? "document.domain=\"" + options.domain + "\";" : "") +
        "document.write(window.frameElement.CodeMirror.html);document.close();})()";
    }
    else {
      frame.src = "javascript:false";
    }

    if (place.appendChild) place.appendChild(div);
    else place(div);
    div.appendChild(frame);
    if (options.lineNumbers) this.lineNumbers = addLineNumberDiv(div);

    this.win = frame.contentWindow;
    if (!options.domain || !internetExplorer) {
      this.win.document.open();
      this.win.document.write(frameHTML(options));
      this.win.document.close();
    }
  }

  CodeMirror.prototype = {
    init: function() {
      if (this.options.initCallback) this.options.initCallback(this);
      if (this.options.lineNumbers) this.activateLineNumbers();
      if (this.options.reindentOnLoad) this.reindent();
    },

    getCode: function() {return this.editor.getCode();},
    setCode: function(code) {this.editor.importCode(code);},
    selection: function() {this.focusIfIE(); return this.editor.selectedText();},
    reindent: function() {this.editor.reindent();},
    reindentSelection: function() {this.focusIfIE(); this.editor.reindentSelection(null);},

    focusIfIE: function() {
      // in IE, a lot of selection-related functionality only works when the frame is focused
      if (this.win.select.ie_selection) this.focus();
    },
    focus: function() {
      this.win.focus();
      if (this.editor.selectionSnapshot) // IE hack
        this.win.select.setBookmark(this.win.document.body, this.editor.selectionSnapshot);
    },
    replaceSelection: function(text) {
      this.focus();
      this.editor.replaceSelection(text);
      return true;
    },
    replaceChars: function(text, start, end) {
      this.editor.replaceChars(text, start, end);
    },
    getSearchCursor: function(string, fromCursor, caseFold) {
      return this.editor.getSearchCursor(string, fromCursor, caseFold);
    },

    undo: function() {this.editor.history.undo();},
    redo: function() {this.editor.history.redo();},
    historySize: function() {return this.editor.history.historySize();},
    clearHistory: function() {this.editor.history.clear();},

    grabKeys: function(callback, filter) {this.editor.grabKeys(callback, filter);},
    ungrabKeys: function() {this.editor.ungrabKeys();},

    setParser: function(name) {this.editor.setParser(name);},
    setSpellcheck: function(on) {this.win.document.body.spellcheck = on;},
    setStylesheet: function(names) {
      if (typeof names === "string") names = [names];
      var activeStylesheets = {};
      var matchedNames = {};
      var links = this.win.document.getElementsByTagName("link");
      // Create hashes of active stylesheets and matched names.
      // This is O(n^2) but n is expected to be very small.
      for (var x = 0, link; link = links[x]; x++) {
        if (link.rel.indexOf("stylesheet") !== -1) {
          for (var y = 0; y < names.length; y++) {
            var name = names[y];
            if (link.href.substring(link.href.length - name.length) === name) {
              activeStylesheets[link.href] = true;
              matchedNames[name] = true;
            }
          }
        }
      }
      // Activate the selected stylesheets and disable the rest.
      for (var x = 0, link; link = links[x]; x++) {
        if (link.rel.indexOf("stylesheet") !== -1) {
          link.disabled = !(link.href in activeStylesheets);
        }
      }
      // Create any new stylesheets.
      for (var y = 0; y < names.length; y++) {
        var name = names[y];
        if (!(name in matchedNames)) {
          var link = this.win.document.createElement("link");
          link.rel = "stylesheet";
          link.type = "text/css";
          link.href = name;
          this.win.document.getElementsByTagName('head')[0].appendChild(link);
        }
      }
    },
    setTextWrapping: function(on) {
      if (on == this.options.textWrapping) return;
      this.win.document.body.style.whiteSpace = on ? "" : "nowrap";
      this.options.textWrapping = on;
      if (this.lineNumbers) {
        this.setLineNumbers(false);
        this.setLineNumbers(true);
      }
    },
    setIndentUnit: function(unit) {this.win.indentUnit = unit;},
    setUndoDepth: function(depth) {this.editor.history.maxDepth = depth;},
    setTabMode: function(mode) {this.options.tabMode = mode;},
    setLineNumbers: function(on) {
      if (on && !this.lineNumbers) {
        this.lineNumbers = addLineNumberDiv(this.wrapping);
        this.activateLineNumbers();
      }
      else if (!on && this.lineNumbers) {
        this.wrapping.removeChild(this.lineNumbers);
        this.wrapping.style.marginLeft = "";
        this.lineNumbers = null;
      }
    },

    cursorPosition: function(start) {this.focusIfIE(); return this.editor.cursorPosition(start);},
    firstLine: function() {return this.editor.firstLine();},
    lastLine: function() {return this.editor.lastLine();},
    nextLine: function(line) {return this.editor.nextLine(line);},
    prevLine: function(line) {return this.editor.prevLine(line);},
    lineContent: function(line) {return this.editor.lineContent(line);},
    setLineContent: function(line, content) {this.editor.setLineContent(line, content);},
    removeLine: function(line){this.editor.removeLine(line);},
    insertIntoLine: function(line, position, content) {this.editor.insertIntoLine(line, position, content);},
    selectLines: function(startLine, startOffset, endLine, endOffset) {
      this.win.focus();
      this.editor.selectLines(startLine, startOffset, endLine, endOffset);
    },
    nthLine: function(n) {
      var line = this.firstLine();
      for (; n > 1 && line !== false; n--)
        line = this.nextLine(line);
      return line;
    },
    lineNumber: function(line) {
      var num = 0;
      while (line !== false) {
        num++;
        line = this.prevLine(line);
      }
      return num;
    },
    jumpToLine: function(line) {
      if (typeof line == "number") line = this.nthLine(line);
      this.selectLines(line, 0);
      this.win.focus();
    },
    currentLine: function() { // Deprecated, but still there for backward compatibility
      return this.lineNumber(this.cursorLine());
    },
    cursorLine: function() {
      return this.cursorPosition().line;
    },

    activateLineNumbers: function() {
      var frame = this.frame, win = frame.contentWindow, doc = win.document, body = doc.body,
          nums = this.lineNumbers, scroller = nums.firstChild, self = this;
      var barWidth = null;

      function sizeBar() {
        if (frame.offsetWidth == 0) return;
        for (var root = frame; root.parentNode; root = root.parentNode);
        if (!nums.parentNode || root != document || !win.Editor) {
          // Clear event handlers (their nodes might already be collected, so try/catch)
          try{clear();}catch(e){}
          clearInterval(sizeInterval);
          return;
        }

        if (nums.offsetWidth != barWidth) {
          barWidth = nums.offsetWidth;
          nums.style.left = "-" + (frame.parentNode.style.marginLeft = barWidth + "px");
        }
      }
      function doScroll() {
        nums.scrollTop = body.scrollTop || doc.documentElement.scrollTop || 0;
      }
      // Cleanup function, registered by nonWrapping and wrapping.
      var clear = function(){};
      sizeBar();
      var sizeInterval = setInterval(sizeBar, 500);

      function nonWrapping() {
        var nextNum = 1, pending;
        function update() {
          var target = 50 + Math.max(body.offsetHeight, Math.max(frame.offsetHeight, body.scrollHeight || 0));
          var endTime = new Date().getTime() + self.options.lineNumberTime;
          while (scroller.offsetHeight < target && (!scroller.firstChild || scroller.offsetHeight)) {
            scroller.appendChild(document.createElement("DIV"));
            scroller.lastChild.innerHTML = nextNum++;
            if (new Date().getTime() > endTime) {
              if (pending) clearTimeout(pending);
              pending = setTimeout(update, self.options.lineNumberDelay);
              break;
            }
          }
          doScroll();
        }
        var onScroll = win.addEventHandler(win, "scroll", update, true),
            onResize = win.addEventHandler(win, "resize", update, true);
        clear = function(){onScroll(); onResize(); if (pending) clearTimeout(pending);};
        update();
      }
      function wrapping() {
        var node, lineNum, next, pos;

        function addNum(n) {
          if (!lineNum) lineNum = scroller.appendChild(document.createElement("DIV"));
          lineNum.innerHTML = n;
          pos = lineNum.offsetHeight + lineNum.offsetTop;
          lineNum = lineNum.nextSibling;
        }
        function work() {
          if (!scroller.parentNode || scroller.parentNode != self.lineNumbers) return;

          var endTime = new Date().getTime() + self.options.lineNumberTime;
          while (node) {
            addNum(next++);
            for (; node && !win.isBR(node); node = node.nextSibling) {
              var bott = node.offsetTop + node.offsetHeight;
              while (scroller.offsetHeight && bott - 3 > pos) addNum("&nbsp;");
            }
            if (node) node = node.nextSibling;
            if (new Date().getTime() > endTime) {
              pending = setTimeout(work, self.options.lineNumberDelay);
              return;
            }
          }
          // While there are un-processed number DIVs, or the scroller is smaller than the frame...
          var target = 50 + Math.max(body.offsetHeight, Math.max(frame.offsetHeight, body.scrollHeight || 0));
          while (lineNum || (scroller.offsetHeight < target && (!scroller.firstChild || scroller.offsetHeight)))
            addNum(next++);
          doScroll();
        }
        function start() {
          doScroll();
          node = body.firstChild;
          lineNum = scroller.firstChild;
          pos = 0;
          next = 1;
          work();
        }

        start();
        var pending = null;
        function update() {
          if (pending) clearTimeout(pending);
          if (self.editor.allClean()) start();
          else pending = setTimeout(update, 200);
        }
        self.updateNumbers = update;
        var onScroll = win.addEventHandler(win, "scroll", doScroll, true),
            onResize = win.addEventHandler(win, "resize", update, true);
        clear = function(){
          if (pending) clearTimeout(pending);
          if (self.updateNumbers == update) self.updateNumbers = null;
          onScroll();
          onResize();
        };
      }
      (this.options.textWrapping ? wrapping : nonWrapping)();
    }
  };

  CodeMirror.InvalidLineHandle = {toString: function(){return "CodeMirror.InvalidLineHandle";}};

  CodeMirror.replace = function(element) {
    if (typeof element == "string")
      element = document.getElementById(element);
    return function(newElement) {
      element.parentNode.replaceChild(newElement, element);
    };
  };

  CodeMirror.fromTextArea = function(area, options) {
    if (typeof area == "string")
      area = document.getElementById(area);

    options = options || {};
    if (area.style.width && options.width == null)
      options.width = area.style.width;
    if (area.style.height && options.height == null)
      options.height = area.style.height;
    if (options.content == null) options.content = area.value;

    if (area.form) {
      function updateField() {
        area.value = mirror.getCode();
      }
      if (typeof area.form.addEventListener == "function")
        area.form.addEventListener("submit", updateField, false);
      else
        area.form.attachEvent("onsubmit", updateField);
    }

    function insert(frame) {
      if (area.nextSibling)
        area.parentNode.insertBefore(frame, area.nextSibling);
      else
        area.parentNode.appendChild(frame);
    }

    area.style.display = "none";
    var mirror = new CodeMirror(insert, options);
    return mirror;
  };

  CodeMirror.isProbablySupported = function() {
    // This is rather awful, but can be useful.
    var match;
    if (window.opera)
      return Number(window.opera.version()) >= 9.52;
    else if (/Apple Computers, Inc/.test(navigator.vendor) && (match = navigator.userAgent.match(/Version\/(\d+(?:\.\d+)?)\./)))
      return Number(match[1]) >= 3;
    else if (document.selection && window.ActiveXObject && (match = navigator.userAgent.match(/MSIE (\d+(?:\.\d*)?)\b/)))
      return Number(match[1]) >= 6;
    else if (match = navigator.userAgent.match(/gecko\/(\d{8})/i))
      return Number(match[1]) >= 20050901;
    else if (match = navigator.userAgent.match(/AppleWebKit\/(\d+)/))
      return Number(match[1]) >= 525;
    else
      return null;
  };

  return CodeMirror;
})();

var DragHandler = Class.create(
    /** @lends DragHandler.prototype */ {

    /**
     * Enables an object to be dragged.
     *
     * @param dragSource
     *      An object implementing DragSource
     * @constructs
     */
    initialize: function (/** DragSource */ dragSource) {

        /**
         * An object returning objects to be dragged.
         * @type DragSource
         * @private
         */
        this._dragSource = dragSource;

        /**
         * Currently dragged object
         * @type Object
         * @private
         */
        this._draggedObject = null;

        /**
         * Zone from which the dragsource is dragged.
         * It can be null.
         * @type DropZone
         * @private
         */
        this._initialDropZone = null;

        /**
         * Valid Zones to drop the dragged object, plus their position
         * @type Array
         * @private
         */
        this._dropZonesInfo = new Array();


        // Wrappers to the event handlers
        this._boundedStartDrag = this._startDrag.bind(this);
        this._boundedUpdate = this._update.bind(this);
        this._boundedEndDrag = this._endDrag.bind(this);
    },


    /**
     * Initializes the drag'n'drop handlers and sets the drop zones
     */
    enableDragNDrop: function (/** DropZone */ currentZone, /** Array */ validDropZones) {

        this._initialDropZone = currentZone;
        this._initialDropZonePosition = null;

        validDropZones.each(function(dropZone) {
            this._dropZonesInfo.push({
                'dropZone': dropZone,
                'position': null
            });
        }.bind(this));

        // add mousedown event listener
        Event.observe (this._dragSource.getHandlerNode(), "mousedown",
                this._boundedStartDrag , true);
    },


    // **************** PRIVATE METHODS **************** //


    /**
     * Drag intialization.
     * @private
     */
    _startDrag: function(e) {
        e = e || window.event; // needed for IE

        // Aux data for position calculation
        this._mouseXStart = 0;
        this._mouseYStart = 0;
        this._x = 0;
        this._y = 0;
        this._offLimitX = 0;
        this._offLimitY = 0;

        // Only attend to left button events
        // (or right button for left-handed persons)
        if (!BrowserUtils.isLeftButton(e.button)) {
            return false;
        }

        // An object is retrieved to be dragged
        this._draggedObject = this._dragSource.getDraggableObject();
        var draggableNode = this._draggedObject.getHandlerNode();

        this._initialArea = draggableNode.parentNode;

        // Set the dropZones areas in coordinates
        this._dropZonesInfo.each (function(dropZoneInfo) {
            var dropZoneNode = dropZoneInfo.dropZone.getNode();
            dropZoneInfo.position = Geometry.getClientRectangle(dropZoneNode);
        }.bind(this));
        if (this._initialDropZone) {
            var initialDropZoneNode = this._initialDropZone.getNode();
            this._initialDropZonePosition = Geometry.getRectangle(initialDropZoneNode);
        }

        this._toggleEventHandlers(true);

        this._draggedObject.onStart();


        this._mouseXStart = parseInt(e.screenX);
        this._mouseYStart = parseInt(e.screenY);
        this._y = draggableNode.offsetTop;
        this._x = draggableNode.offsetLeft;

        if (this._isChangingZone()) {
            draggableNode.addClassName("dragOnChangeLayer");
        } else {
            draggableNode.addClassName("dragLayer");
        }

        return false;
    },


    /**
     * Update position event handler
     * @private
     */
    _update: function (e) {
        e = e || window.event; // needed for IE

        var mouseX = parseInt(e.screenX);
        var mouseY = parseInt(e.screenY);

        this._updateNodePosition(mouseX, mouseY);
        this._updateNodeStatus(this._isValidPosition());

        this._draggedObject.onUpdate(this._x, this._y);

        var draggableNode = this._draggedObject.getHandlerNode();
    },


    /**
     * Drop event handler
     * @private
     */
    _endDrag: function(e) {
        e = e || window.event; // needed for IE

        // Only attend to left button events
        // (or right button for left-handed persons)
        if (!BrowserUtils.isLeftButton(e.button))
            return false;

        this._toggleEventHandlers(false);

        var draggableNode = this._draggedObject.getHandlerNode();
        draggableNode.removeClassName("dragLayer");
        draggableNode.removeClassName("dragOnChangeLayer");

        //Remove element transparency
        this._updateNodeStatus(true);

        var accepted;
        var dropPosition;
        // When changing zone, try to get the draggable accepted by the dropZone
        if (this._isChangingZone()) {
            var dropZone = this._inWhichDropZone();
            if (dropZone) {
                dropPosition = Geometry.adaptDropPosition(dropZone.getNode(), draggableNode);
                this._initialArea.removeChild(draggableNode);
                accepted = dropZone.drop(this._draggedObject, dropPosition);
            } else {
                this._initialArea.removeChild(draggableNode);
                accepted = false;
            }

            if (!accepted) {
                // Destroy the element (it is an invalid copy)
                this._draggedObject.destroy();
            }
        } else {
            accepted = true;
            dropPosition = {
                'top': draggableNode.offsetTop,
                'left': draggableNode.offsetLeft
            };
        }

        if (accepted) {
            this._draggedObject.onFinish(this._isChangingZone(), dropPosition);
        }
        this._draggedObject = null;

        return false;
    },

    /**
     * Enable and disable the different event handlers
     * @private
     */
    _toggleEventHandlers: function (/** Boolean */ startDrag) {
        if (startDrag) {
            // disable context menu and text selection
            document.oncontextmenu = function() { return false; };
            document.onmousedown = function() { return false; };
            document.onselectstart =  function() { return false; };

            Event.stopObserving (this._draggedObject.getHandlerNode(), 'mousedown',
                    this._boundedStartDrag, true);
            Event.observe (document, 'mouseup',   this._boundedEndDrag, true);
            Event.observe (document, 'mousemove', this._boundedUpdate, true);
        } else {
            // Reenable context menu and text selection
            document.onmousedown = null;
            document.oncontextmenu = null;
            document.onselectstart = null;
            Event.observe (this._dragSource.getHandlerNode(), "mousedown",
                    this._boundedStartDrag, true);
            Event.stopObserving (document, "mouseup",   this._boundedEndDrag, true);
            Event.stopObserving (document, "mousemove", this._boundedUpdate,  true);
        }
    },

    /**
     * This function detects if the node is going to change from one zone to
     * another
     * @private
     * @type Boolean
     */
    _isChangingZone: function() {
       return (this._initialDropZone == null);
    },


     /**
     * This function calculates whether the element
     * is over a valid drop zone or not, and
     * check the DropZone Restrictions
     * @private
     * @type Boolean
     */
    _isValidPosition: function(){
        if (this._isChangingZone()) {
            return (this._inWhichDropZone() != null);
        } else {
            return true;
        }
    },

     /**
     * This function calculates the exact dropZone the element
     * is
     * @private
     * @type DropZone
     */
    _inWhichDropZone: function(){
        for (var i=0; i < this._dropZonesInfo.length; i++) {
            if (Geometry.intersects(this._dropZonesInfo[i].position,
                        this._getDraggableNodeRectangle())) {
                return this._dropZonesInfo[i].dropZone;
            }
        }
        return null;
    },
    /**
     * @private
     * @type Object
     */
    _getDraggableNodeRectangle: function () {
        var draggableNode = this._draggedObject.getHandlerNode();
        return {
            'top': draggableNode.offsetTop,
            'left': draggableNode.offsetLeft,
            'bottom': draggableNode.offsetTop + draggableNode.offsetHeight,
            'right': draggableNode.offsetLeft + draggableNode.offsetWidth
        };
    },

    /**
     * This function updates the position of a node
     * regarding the absolute position of the mouse
     * @private
     */
    _updateNodePosition: function(/** Number */ x, /** Number */ y) {
        var xDelta = x - this._mouseXStart;
        var yDelta = y - this._mouseYStart;
        this._mouseXStart = x;
        this._mouseYStart = y;

        var node = this._draggedObject.getHandlerNode();
        if (!this._isChangingZone()) {
            var ranges = Geometry.dragRanges(this._initialDropZonePosition,
                    this._getDraggableNodeRectangle());

            var effectiveUpdateX = Geometry.updateAxis(ranges.x, xDelta, this._offLimitX);
            xDelta = effectiveUpdateX.delta;
            this._offLimitX = effectiveUpdateX.offLimit;

            var effectiveUpdateY = Geometry.updateAxis(ranges.y, yDelta, this._offLimitY);
            yDelta = effectiveUpdateY.delta;
            this._offLimitY = effectiveUpdateY.offLimit;
        }

        this._y = this._y + yDelta;
        this._x = this._x + xDelta;

        node.style.top = this._y + 'px';
        node.style.left = this._x + 'px';
    },


     /**
     * This function updates node interface,
     * taking into account if it is in a valid
     * position or not
     * @private
     */
    _updateNodeStatus: function(/** Boolean */ isValid){
        if (isValid){
            this._draggedObject.getHandlerNode().removeClassName('disabled');
        }
        else {
            this._draggedObject.getHandlerNode().addClassName('disabled');
        }
    }



});

// vim:ts=4:sw=4:et:

var DragSource = Class.create( /** @lends DragSource.prototype */ {
    /**
     * This is the interface for widgets that are sources of drag'n'drop
     * operations.
     * @abstract
     * @constructs
     */
    initialize: function() {

        /**
         * Handles the drag'n'drop stuff
         * @type DragHandler
         * @private
         */
        this._dragHandler = new DragHandler(this);
    },

    // **************** PUBLIC METHODS **************** //

    /**
     * Returns the node of the area that can start a dragging operation.
     * @type Object
     * @abstract
     */
    getHandlerNode: function () {
        throw "Abstract Method invocation: DragSource::_getHandlerNode";
    },

    /**
     * Enables the drag'n'drop
     */
    enableDragNDrop: function(/** DropZone */ currentDropZone, /** Array */ validDropZones) {
        this._dragHandler.enableDragNDrop(currentDropZone, validDropZones);
    },


    /**
     * Returns the object to be dragged.
     * @type Object   Object implementing getNode() method
     * @abstract
     */
    getDraggableObject: function () {
        throw "Abstract Method invocation: DragSource::getDraggableObject";
    },


    /**
     * Drag'n'drop start event handler
     * @protected
     */
    onStart: function() {},


    /**
     * Update position event handler
     * @protected
     */
    onUpdate: function(/** Number */ x, /** Number */ y) {},


    /**
     * Drag'n'drop position event handler
     * @protected
     */
    onFinish: function(/**Boolean*/ finishedOK) {},

    /**
     * This function can add restrictions to the calculation
     * of a valid position in a drag'n'drop action
     * @protected
     * @type Boolean
     */
    isValidPosition: function(/** Integer */ x, /**Integer */ y) {
        return true;
    }
});

// vim:ts=4:sw=4:et:

var Area = Class.create( /** @lends Area.prototype */ {
    /**
     * This class represents an area to drop elements of some kind
     * It implements the DropZone interface
     * @param Function onDropHandler(DropZone zone, ComponentInstance droppedInstance)
     * @constructs
     */
    initialize: function(/** String */ areaClass, /** Array */ acceptedElements, /** Function */ onDropHandler, /** Object */ _options) {
        var options = Utils.variableOrDefault(_options, {});
        options = Object.extend ({
            style : ""
        }, options);

        /**
         * List of valid elements to be dropped in the area
         * @type Array
         * @private
         */
        this._acceptedElements = acceptedElements;


        /**
         * Function to be called whenever an element
         * is dropped into the area
         * The handler must return if the element is accepted
         * @type Function
         * @private
         */
        this._onDropHandler = onDropHandler;

        if (options.region != 'center') {
            if (options['minHeight'] != null) {
                options.style += "height: " + options['minHeight'] + 'px;';
            }
            if (options['minWidth'] != null) {
                options.style += "width: " + options['minWidth'] + 'px;';
            }
        }

        /**
         * ContentPane of the area
         * @type dijit.layout.ContentPane
         * @private
         */
        this._contentPane = new dijit.layout.ContentPane(options);

        /**
         * DOM Node of the area
         * @type DOMNode
         * @private
         */
        this._node = new Element('div', {
            'class': 'dropArea ' + areaClass
        });
        this._contentPane.setContent(this._node);
    },


    // **************** PUBLIC METHODS **************** //

    /**
     * Implementing DropZone Interface: getNode
     * @type DOMNode
     */
    getNode: function() {
        return this._node;
    },

    /**
     * Returns the  widget
     * @type dijit.*
     */
    getWidget: function () {
        return this._contentPane;
    },

    /**
     * Implementing DropZone Interface: drop
     * @type DOMNode
     */
    drop: function(/** ComponentInstance */ element, /** Object */ position) {

        var accepted =  this._onDropHandler(this, element, position);
        return accepted;
    },


    /**
     * Implementing DropZone Interface: accepts
     * @type DOMNode
     */
    accepts: function() {
        return this._acceptedElements;
    },


    setLayout: function() {
        //TODO: Think about Layouts
    }


    // **************** PRIVATE METHODS **************** //



});

// vim:ts=4:sw=4:et:

var BuildingBlockFactory = Class.create(
    /** @lends BuildingBlockFactory.prototype */ {

    /**
     * Abstract building block factory
     * @constructs
     * @abstract
     */
    initialize: function() {


    },


    // **************** PUBLIC METHODS **************** //


    /**
     * Gets the type of building block this factory mades.
     * @type String
     */
    getBuildingBlockType: function (){
        throw "Abstract method invocation. BuildingBlockFactory::getBuildingBlockType";
    },


    /**
     * Gets the human-readable name of the building block type.
     * @type String
     */
    getBuildingBlockName: function (){
        return Constants.BuildingBlockNames[this.getBuildingBlockType()];
    },


    /**
     * Gets building block descriptions by URI
     * @type {BuildingBlockDescription[]}
     * @abstract
     */
    getBuildingBlocks: function (/*...*/) {
        throw "Abstract method invocation. BuildingBlockFactory::getBuildingBlockDescriptions";
    },

    /**
     * Gets a new instance of the type of the factory
     * @abstract
     * @type ComponentInstance
     */
    getInstance: function(/** BuildingBlockDescription */description, /** InferenceEngine */ engine) {
        throw "Abstract method invocation. BuildingBlockFactory::getInstance";
    }

});

// vim:ts=4:sw=4:et:

var ScreenflowFactory = Class.create(BuildingBlockFactory,
    /** @lends ScreenflowFactory.prototype */ {

    /**
     * Factory of screenflow building blocks.
     * @constructs
     * @extends BuildingBlockFactory
     */
    initialize: function($super) {
        $super();

         /**
         * Hash table (organized by URI)
         * containing all the BB descriptions
         * @type Hash
         * @private @member
         */
        this._buildingBlockDescriptions = new Hash();

    },

    // **************** PUBLIC METHODS **************** //
    /**
     * Gets the type of building block this factory mades.
     * @type String
     * @override
     */
    getBuildingBlockType: function (){
        return Constants.BuildingBlock.SCREENFLOW;
    },


    /**
     * Gets building block descriptions by URI
     * @type {BuildingBlockDescription[]}
     * @override
     */
    getBuildingBlocks: function (/** Array */ uris) {
        var result = new Array();
        $A(uris).each(function(uri){
            if(this._buildingBlockDescriptions.get(uri)) {
                result.push(this._buildingBlockDescriptions.get(uri));
            } else {
                throw "Ooops. Something went wrong. " +
                      "ScreenflowFactory::getBuildingBlocks";
            }
        }.bind(this));
        return result;
    },

    /**
     * This function retrieves the pending elements from the serverside
     * catalogue
     */
    cacheBuildingBlocks: function (/** Array */ uris, /** Function */ callback){
        //URIs not already retrieved
        var pendingURIs = new Array();
        $A(uris).each (function (uri){
            if (!this._buildingBlockDescriptions.get(uri)){
                pendingURIs.push (uri);
            }
        }.bind(this));

        if (pendingURIs.size() > 0) {
            var postData = Object.toJSON(pendingURIs);
            PersistenceEngine.sendPost(URIs.catalogueGetMetadata,
                null, postData,
                {
                    'mine': this,
                    'callback': callback
                },
                this._onSuccess, Utils.onAJAXError);
        } else {
            callback();
        }
    },

    /**
     * Gets a new instance of the type of the factory
     * @override
     * @type ScreenInstance
     */
    getInstance: function(/** BuildingBlockDescription */description, /** InferenceEngine */ engine) {
        return new ScreenflowInstance(description, engine);
    },

    // **************** PRIVATE METHODS **************** //



    /**
     * Callback function
     */
    _onSuccess: function(/**XMLHttpRequest*/ transport) {
        var metadata = transport.responseText.evalJSON();
        //update the Screenflow Factory
        this.mine._updateBuildingBlockDescriptions(metadata.screens);
        //call the callback function passed as argument
        this.callback();
    },

    /**
     * This function creates the different screen Descriptions
     * @private
     */
    _updateBuildingBlockDescriptions: function (/** Array */ screenflowDescriptions) {

        for (var i=0; i< screenflowDescriptions.length ; i++) {
            this._buildingBlockDescriptions.set(screenflowDescriptions[i].uri,
                                        new ScreenflowDescription (screenflowDescriptions[i]));
        }
    }
});

// vim:ts=4:sw=4:et:

var ScreenFactory = Class.create(BuildingBlockFactory,
    /** @lends ScreenFactory.prototype */ {

    /**
     * Factory of screen building blocks.
     * @constructs
     * @extends BuildingBlockFactory
     */
    initialize: function($super) {
        $super();

         /**
         * Hash table (organized by URI)
         * containing all the BB descriptions
         * @type Hash
         * @private @member
         */
        this._buildingBlockDescriptions = new Hash();

    },

    // **************** PUBLIC METHODS **************** //
    /**
     * Gets the type of building block this factory mades.
     * @type String
     * @override
     */
    getBuildingBlockType: function (){
        return Constants.BuildingBlock.SCREEN;
    },


    /**
     * Gets building block descriptions by URI
     * @type {BuildingBlockDescription[]}
     * @override
     */
    getBuildingBlocks: function (/** Array */ uris) {
        var result = new Array();
        $A(uris).each(function(uri){
            if(this._buildingBlockDescriptions.get(uri)) {
                result.push(this._buildingBlockDescriptions.get(uri));
            } else {
                throw "Ooops. Something went wrong. " +
                      "ScreenFactory::getBuildingBlocks";
            }
        }.bind(this));
        return result;
    },

    /**
     * This function retrieves the pending elements from the serverside
     * catalogue
     */
    cacheBuildingBlocks: function (/** Array */ uris, /** Function */ callback){
        //URIs not already retrieved
        var pendingURIs = new Array();
        $A(uris).each (function (uri){
            if (!this._buildingBlockDescriptions.get(uri)){
                pendingURIs.push (uri);
            }
        }.bind(this));

        if (pendingURIs.size() > 0) {
            var postData = Object.toJSON(pendingURIs);
            PersistenceEngine.sendPost(URIs.catalogueGetMetadata,
                null, postData,
                {
                    'mine': this,
                    'callback': callback
                },
                this._onSuccess, Utils.onAJAXError);
        } else {
            callback();
        }
    },

    /**
     * Gets a new instance of the type of the factory
     * @override
     * @type ScreenInstance
     */
    getInstance: function(/** BuildingBlockDescription */description, /** InferenceEngine */ engine) {
        return new ScreenInstance(description, engine);
    },

    // **************** PRIVATE METHODS **************** //



    /**
     * Callback function
     */
    _onSuccess: function(/**XMLHttpRequest*/ transport) {
        var metadata = transport.responseText.evalJSON();
        //update the Screen Factory
        this.mine._updateBuildingBlockDescriptions(metadata.screens);
        //call the callback function passed as argument
        this.callback();
    },

    /**
     * This function creates the different screen Descriptions
     * @private
     */
    _updateBuildingBlockDescriptions: function (/** Array */ screenDescriptions) {

        for (var i=0; i< screenDescriptions.length ; i++) {
            this._buildingBlockDescriptions.set(screenDescriptions[i].uri,
                                        new ScreenDescription (screenDescriptions[i]));
        }
    }
});

// vim:ts=4:sw=4:et:

var DomainConceptFactory = Class.create(BuildingBlockFactory,
    /** @lends DomainConceptFactory.prototype */ {

    /**
     * Factory of domain concept building blocks.
     * @constructs
     * @extends BuildingBlockFactory
     */
    initialize: function($super) {
        $super();

    },

    /**
     * Gets the type of building block this factory mades.
     * @type String
     * @override
     */
    getBuildingBlockType: function (){
        return Constants.BuildingBlock.DOMAIN_CONCEPT;
    },

    // **************** PUBLIC METHODS **************** //
    /**
     * @override
     */
    getBuildingBlocks: function(/** Array */ tags, /** Function */ callback){
        var url = this._createUrl(tags);
        PersistenceEngine.sendGet(url,
                {
                    'callback': callback
                },
                this._onSuccess, this._onError);
    },

    // **************** PUBLIC METHODS **************** //

    _createUrl: function(/** Array */ tags){
        if (tags.size() > 0) {
            var processedTags = tags.collect(function(tag) {
                return tag.label['en-gb'];
            }).join("+");
            return URIs.catalogueTagConcepts.replace('<tags>', processedTags);
        } else {
            return URIs.catalogueAllConcepts;
        }
    },

    _onSuccess: function (/** XMLHttpRequest */ transport) {
        var metadata = transport.responseText.evalJSON();
        var result = new Array();

        $A(metadata).each(function(conceptProperties) {
            result.push(new PrePostDescription(conceptProperties));
        });
        this.callback(result);
    },

    _onError: function (/**XMLHttpRequest*/ transport, /** Exception */ e) {
        Logger.serverError(transport, e);
    }

});

// vim:ts=4:sw=4:et:

var FormFactory = Class.create(BuildingBlockFactory,
    /** @lends FormFactory.prototype */ {

    /**
     * Factory of Form building blocks.
     * @constructs
     * @extends BuildingBlockFactory
     */
    initialize: function($super) {
        $super();

         /**
         * Hash table (organized by URI)
         * containing all the BB descriptions
         * @type Hash
         * @private @member
         */
        this._buildingBlockDescriptions = new Hash();

    },

    // **************** PUBLIC METHODS **************** //
    /**
     * Gets the type of building block this factory mades.
     * @type String
     * @override
     */
    getBuildingBlockType: function (){
        return Constants.BuildingBlock.FORM;
    },


    /**
     * Gets building block descriptions by URI
     * @type {BuildingBlockDescription[]}
     * @override
     */
    getBuildingBlocks: function (/** Array */ uris) {
        var result = new Array();
        $A(uris).each(function(uri){
            if(this._buildingBlockDescriptions.get(uri)) {
                result.push(this._buildingBlockDescriptions.get(uri));
            } else {
                throw "Ooops. Something went wrong. " +
                    "BuildingBlockFactory::getBuildingBlocks";
            }
        }.bind(this));
        return result;
    },

    /**
     * This function retrieves the pending elements from the serverside
     * catalogue
     */
    cacheBuildingBlocks: function (/** Array */ uris, /** Function */ callback){
        //URIs not already retrieved
        var pendingURIs = new Array();
        $A(uris).each (function (uri){
            if (!this._buildingBlockDescriptions.get(uri)){
                pendingURIs.push (uri);
            }
        }.bind(this));

        if (pendingURIs.size() > 0) {
            var postData = Object.toJSON(pendingURIs);
            PersistenceEngine.sendPost(URIs.catalogueGetMetadata,
                null, postData,
                {
                    'mine': this,
                    'callback': callback
                },
                this._onSuccess, Utils.onAJAXError);
        } else {
            callback();
        }
    },

    /**
     * Gets a new instance of the type of the factory
     * @override
     * @type FormInstance
     */
    getInstance: function(/** BuildingBlockDescription */description, /** InferenceEngine */ engine) {
        return new FormInstance(description, engine);
    },

    // **************** PRIVATE METHODS **************** //



    /**
     * Callback function
     */
    _onSuccess: function(/**XMLHttpRequest*/ transport) {
        var metadata = transport.responseText.evalJSON();
        //update the Form Factory
        this.mine._updateBuildingBlockDescriptions(metadata.forms);
        //call the callback function passed as argument
        this.callback();
    },

    /**
     * This function creates the different Form Descriptions
     * @private
     */
    _updateBuildingBlockDescriptions: function (/** Array */ formDescriptions) {

        for (var i=0; i< formDescriptions.length ; i++) {
            this._buildingBlockDescriptions.set(formDescriptions[i].uri,
                                        new FormDescription (formDescriptions[i]));
        }
    }
});

// vim:ts=4:sw=4:et:

var OperatorFactory = Class.create(BuildingBlockFactory,
    /** @lends OperatorFactory.prototype */ {

    /**
     * Factory of Operator building blocks.
     * @constructs
     * @extends BuildingBlockFactory
     */
    initialize: function($super) {
        $super();

         /**
         * Hash table (organized by URI)
         * containing all the BB descriptions
         * @type Hash
         * @private @member
         */
        this._buildingBlockDescriptions = new Hash();

    },

    // **************** PUBLIC METHODS **************** //
    /**
     * Gets the type of building block this factory mades.
     * @type String
     * @override
     */
    getBuildingBlockType: function (){
        return Constants.BuildingBlock.OPERATOR;
    },


    /**
     * Gets building block descriptions by URI
     * @type {BuildingBlockDescription[]}
     * @override
     */
    getBuildingBlocks: function (/** Array */ uris) {
        var result = new Array();
        $A(uris).each(function(uri){
            if(this._buildingBlockDescriptions.get(uri)) {
                result.push(this._buildingBlockDescriptions.get(uri));
            } else {
                throw "Ooops. Something went wrong. " +
                    "BuildingBlockFactory::getBuildingBlocks";
            }
        }.bind(this));
        return result;
    },

    /**
     * This function retrieves the pending elements from the serverside
     * catalogue
     */
    cacheBuildingBlocks: function (/** Array */ uris, /** Function */ callback){
        //URIs not already retrieved
        var pendingURIs = new Array();
        $A(uris).each (function (uri){
            if (!this._buildingBlockDescriptions.get(uri)){
                pendingURIs.push (uri);
            }
        }.bind(this));

        if (pendingURIs.size() > 0) {
            var postData = Object.toJSON(pendingURIs);
            PersistenceEngine.sendPost(URIs.catalogueGetMetadata,
                null, postData,
                {
                    'mine': this,
                    'callback': callback
                },
                this._onSuccess, Utils.onAJAXError);
        } else {
            callback();
        }
    },

    /**
     * Gets a new instance of the type of the factory
     * @override
     * @type OperatorInstance
     */
    getInstance: function(/** BuildingBlockDescription */description, /** InferenceEngine */ engine) {
        return new OperatorInstance(description, engine);
    },

    // **************** PRIVATE METHODS **************** //



    /**
     * Callback function
     */
    _onSuccess: function(/**XMLHttpRequest*/ transport) {
        var metadata = transport.responseText.evalJSON();
        //update the Operator Factory
        this.mine._updateBuildingBlockDescriptions(metadata.operators);
        //call the callback function passed as argument
        this.callback();
    },

    /**
     * This function creates the different Operator Descriptions
     * @private
     */
    _updateBuildingBlockDescriptions: function (/** Array */ operatorDescriptions) {

        for (var i=0; i< operatorDescriptions.length ; i++) {
            this._buildingBlockDescriptions.set(operatorDescriptions[i].uri,
                                        new BuildingBlockDescription (operatorDescriptions[i]));
        }
    }
});

// vim:ts=4:sw=4:et:

var ResourceFactory = Class.create(BuildingBlockFactory,
    /** @lends ResourceFactory.prototype */ {

    /**
     * Factory of Resource building blocks.
     * @constructs
     * @extends BuildingBlockFactory
     */
    initialize: function($super) {
        $super();

         /**
         * Hash table (organized by URI)
         * containing all the BB descriptions
         * @type Hash
         * @private @member
         */
        this._buildingBlockDescriptions = new Hash();

    },

    // **************** PUBLIC METHODS **************** //
    /**
     * Gets the type of building block this factory mades.
     * @type String
     * @override
     */
    getBuildingBlockType: function (){
        return Constants.BuildingBlock.RESOURCE;
    },


    /**
     * Gets building block descriptions by URI
     * @type {BuildingBlockDescription[]}
     * @override
     */
    getBuildingBlocks: function (/** Array */ uris) {
        var result = new Array();
        $A(uris).each(function(uri){
            if(this._buildingBlockDescriptions.get(uri)) {
                result.push(this._buildingBlockDescriptions.get(uri));
            } else {
                throw "Ooops. Something went wrong. " +
                    "BuildingBlockFactory::getBuildingBlocks";
            }
        }.bind(this));
        return result;
    },

    /**
     * Gets a new instance of the type of the factory
     * @override
     * @type ResourceInstance
     */
    getInstance: function(/** BuildingBlockDescription */description, /** InferenceEngine */ engine) {
        return new ResourceInstance(description, engine);
    },

    /**
     * This function retrieves the pending elements from the serverside
     * catalogue
     */
    cacheBuildingBlocks: function (/** Array */ uris, /** Function */ callback){
        //URIs not already retrieved
        var pendingURIs = new Array();
        $A(uris).each (function (uri){
            if (!this._buildingBlockDescriptions.get(uri)){
                pendingURIs.push (uri);
            }
        }.bind(this));

        if (pendingURIs.size() > 0) {
            var postData = Object.toJSON(pendingURIs);

            PersistenceEngine.sendPost(URIs.catalogueGetMetadata,
                null, postData,
                {
                    'mine': this,
                    'callback': callback
                },
                this._onSuccess, Utils.onAJAXError);
        } else {
            callback();
        }
    },

    // **************** PRIVATE METHODS **************** //



    /**
     * Callback function
     */
    _onSuccess: function(/**XMLHttpRequest*/ transport) {
        var metadata = transport.responseText.evalJSON();
        //update the Resource Factory
        this.mine._updateBuildingBlockDescriptions(metadata.backendservices);
        //call the callback function passed as argument
        this.callback();
    },

    /**
     * This function creates the different Resource Descriptions
     * @private
     */
    _updateBuildingBlockDescriptions: function (/** Array */ resourceDescriptions) {

        for (var i=0; i< resourceDescriptions.length ; i++) {
            this._buildingBlockDescriptions.set(resourceDescriptions[i].uri,
                                        new BuildingBlockDescription (resourceDescriptions[i]));
        }
    }
});

// vim:ts=4:sw=4:et:

/**
 * Local catalogue
 * @constructs
 * @static
 */
var Catalogue = Class.create();

// **************** STATIC ATTRIBUTES **************** //

Object.extend(Catalogue, {
    /**
     * BuildingBlock factories
     * @type Hash
     * @private
     */
    _factories: {
        'screen': new ScreenFactory(),
        'screenflow': new ScreenflowFactory(),
        'domainConcept': new DomainConceptFactory(),
        'form': new FormFactory(),
        'resource': new ResourceFactory(),
        'operator': new OperatorFactory()
    }
});

// **************** STATIC METHODS ******************* //

Object.extend(Catalogue, {

    // **************** PUBLIC METHODS **************** //

    /**
     * Gets a building block factory for a given type of building blocks
     * @type BuildingBlockFactory
     * @public
     */
    getBuildingBlockFactory: function(/** String */buildingBlockType) {
        return this._factories[buildingBlockType];
    },

    getFacts: function() {
        var onSuccess = function(response) {
            var factMetadata = response.responseText.evalJSON();
            FactFactory.setFacts(factMetadata);
        }
        var onError = function(response, e) {
            console.error(e);
        }

        PersistenceEngine.sendGet(URIs.catalogueGetFacts, this, onSuccess, onError);
    },

    getDomainConcepts: function() {
        var onDConceptsSuccess = function(response){
            var domainConceptMetadata = response.responseText.evalJSON();
            this.getBuildingBlockFactory(Constants.BuildingBlock.DOMAIN_CONCEPT).
                updateBuildingBlockDescriptions(domainConceptMetadata.domainConcepts);
            var paletteController = GVS.getDocumentController().getCurrentDocument().
                getPaletteController();
            var domainConceptPalette = paletteController.
                getPalette(Constants.BuildingBlock.DOMAIN_CONCEPT);
            domainConceptPalette.paintComponents();
        }
        var onDConceptsError = function(response, e) {
            console.error(e);
        }

        PersistenceEngine.sendGet(URIs.catalogueGetDomainConcepts,
            this, onDConceptsSuccess, onDConceptsError);
    },

    // TODO: redesign
    createScreen: function(/**String*/screenJson) {
        var createScreenOnSuccess = function(response){

            var screen = JSON.parse(response.responseText);
            //FIXME the catalogue should response with an http error
            if (screen.uri == undefined || screen.uri == null) {
                console.log("createScreenOnError");
                alert("Server error in the Screen creation");
            }
            else {
                var alertMsg = "Screen correctly created!\nLabel: " +
                        screen.label['en-GB'] + "\nURI: " + screen.uri;
                alert(alertMsg);
            }
        }

        var createScreenOnError = function(transport, e){
            alert(e.message);
            //TODO error handling
        }

        var persistenceEngine = PersistenceEngineFactory.getInstance();
        persistenceEngine.sendPost(URIs.catalogueCreateScreen, null, screenJson,
            this, createScreenOnSuccess, createScreenOnError);
    }
});

// vim:ts=4:sw=4:et:

var BuildingBlockDescription = Class.create(
    /** @lends BuildingBlockDescription.prototype */ {

    /**
     * Generic building block description. All the building block classes extends
     * this one.
     * @constructs
     */
    initialize: function(/** Hash */ properties) {
        Utils.addProperties(this, properties);
    },


    // **************** PUBLIC METHODS **************** //

    /**
     * Adds properties to the ScreenflowDescription
     */
    addProperties: function(properties) {
        Utils.addProperties(this, properties);
    },

    /**
     * This function translate the stored properties into
     * a JSON-like object
     * @type Object
     */
    toJSON: function() {
        var result = {};
        $H(this).each(function(pair) {
            if (!(pair.value instanceof Function)) {
                result[pair.key] = pair.value;
            }
        });

        return result;

    },

    /**
     * Implementing the TableModel interface
     * @type String
     */
    getTitle: function() {
        return this.label ? this.label['en-gb'] : this.name;
    },

    /**
     * Returns the id of the building block
     * @type String
     */
    getId: function() {
        return this.id;
    },

    /**
     * This function returns if the data inside the description is valid
     * @type Boolean
     */
    isValid: function() {
        return true;
    },

    /**
     * For document descriptions, return the existing canvas instancies
     */
    getCanvasInstances:function() {
        return [];
    },

    /**
     * For document descriptions, return the existing canvas instancies
     */
    getConditionInstances:function() {
        return [];
    },

    getPreconditionsList: function() {
        if (! this.actions) {
            return this._getConditionsList("preconditions");
        }
        var result = [];
        $A(this.actions).each(function(action) {
            $A(action.preconditions).each(function(p){ result.push(p); });
        });
        return result;
    },

    getPostconditionsList: function() {
        return this._getConditionsList("postconditions");
    },

    // **************** PRIVATE METHODS **************** //

    _getConditionsList: function(type){
        if (this[type].length > 1){ //More than one set of conditions
            console.log("OR support not implemented yet");
            return null;
        }
        return this[type][0];
    }

});

// vim:ts=4:sw=4:et:

var FormDescription = Class.create(BuildingBlockDescription,
    /** @lends FormDescription.prototype */ {

    /**
     * Form building block description.
     * @constructs
     * @extends BuildingBlockDescription
     */
    initialize: function($super, /** Hash */ properties) {
        $super(properties);
    },

    /**
     * This method creates a DOM Node with the preview
     * of the Form
     * @type DOMNode
     */
    getPreview: function() {
        var node = new Element('div', {
            'class': 'preview'
        });
        var errorField = new Element('div', {
            'class': 'error'
        });
        node.appendChild(errorField);

        var image = new Element ('img', {
            'src': this.screenshot,
            'onerror': 'this.src = "/fast/images/gui/imageNotFound.png";'
        });

        node.appendChild(image);
        return node;
    },
});

// vim:ts=4:sw=4:et:

var ScreenDescription = Class.create(BuildingBlockDescription,
    /** @lends ScreenDescription.prototype */ {

    /**
     * Screen building block description.
     * @constructs
     * @extends BuildingBlockDescription
     */
    initialize: function($super, /** Hash */ properties) {
        $super(properties);

        // Components of the screen when built inside FAST
        this._preconditions = new Hash();
        this._postconditions = new Hash();
        this._buildingBlocks = new Hash();
        this._pipes = new Hash();
        this._triggers = new Hash();
    },

    // ****************** PUBLIC METHODS ******************* //

    /**
     * to JSON object function
     * @type Object
     */
    toJSON: function() {
        var result = {
            "preconditions": this.getPreconditions().size() > 0 ? [this.getPreconditions()] : [],
            "postconditions": this.getPostconditions().size() > 0 ? [this.getPostconditions()] : [],
            "definition": {
                "buildingblocks": this._getScreenBuildingBlocks(),
                "pipes": this._getScreenPipes(),
                "triggers": this._getTriggers()
            }
        };
        result = Object.extend(result,{
            "name": this.name,
            "label": this.label,
            "tags": this.tags,
            "version": this.version,
            "id": this.id,
            "creator": this.creator,
            "description": this.description,
            "rights": this.rights,
            "creationDate": this.creationDate,
            "icon": this.icon,
            "screenshot": this.screenshot,
            "homepage": this.homepage,
            "type": "screen"
        });
        return result;
    },

    /**
     * This method creates a DOM Node with the preview
     * of the Screen
     * @type DOMNode
     */
    getPreview: function() {
        var node = new Element('div', {
            'class': 'preview'
        });
        var errorField = new Element('div', {
            'class': 'error'
        });
        node.appendChild(errorField);
        var image = new Element ('img', {
            'src': this.screenshot,
            'onerror': "this.parentNode.childNodes[0].update('Image not available');" +
                "this.src='"+ URIs.logoFast + "';"
        });
        node.appendChild(image);
        return node;
    },

    /**
     * Implementing the TableModel interface
     * @type Array
     */
    getInfo: function() {
        var info = new Hash();
        info.set('Title', this.label['en-gb']);
        info.set('Tags', this.tags.collect(function(tag) {
                return tag.label['en-gb'];
            }).join(", "));
        info.set('Version', this.version);
        return info;
    },

    /**
     * Adds a pre instance to the description
     */
    addPre: function(/** PrePostInstance */ pre, /** Object */ position) {
        this._preconditions.set(pre.getId(), {
            'buildingblock': pre,
            'position': position
        });
    },

    /**
     * Adds a post instance
     */
    addPost: function(/** PrePostInstance */ post, /** Object */ position) {
        this._postconditions.set(post.getId(),{
            'buildingblock': post,
            'position': position
        });
    },

    /**
     * Updates the position of a *-condition
     * @type Boolean
     */
    updatePrePost: function(/** PrePostInstance */ prepost, /** Object */ position) {
        var list;
        if (prepost.getType() == "pre") {
            list = this._preconditions;
        } else {
            list = this._postconditions;
        }
        var prePost = list.get(prepost.getId());
        var origin = prePost.position;

        if (origin.top != position.top || origin.left != position.left) {
            prePost.position = position;
            return true;
        } else {
            return false;
        }
    },

    /**
     * Adds a building block (other than pre/post) to the description
     */
    addBuildingBlock: function (/** ComponentInstance */ instance, /** Object */ position, /** Integer */ orientation) {
        this._buildingBlocks.set(instance.getId(),{
            'buildingblock': instance,
            'position': position,
            'orientation': orientation
        });
    },

    /**
     * Updates the position of a building block
     * @type Boolean
     */
    updateBuildingBlock: function (/** ComponentInstance */ instance, /** Object */ position, /** Integer */ orientation) {
        var buildingBlock = this._buildingBlocks.get(instance.getId());
        var origin = buildingBlock.position;

        if (origin.top != position.top || origin.left != position.left
        		|| origin.orientation != orientation) {
            buildingBlock.position = position;
            buildingBlock.orientation = orientation;
            return true;
        }
        return false;
    },

    /**
     * Adds a pipe
     */
    addPipe: function(/** Pipe */ pipe) {
        this._pipes.set(pipe.getId(), pipe);
    },

    addTrigger: function(/** Trigger */ trigger) {
        if (this._triggers.get(trigger.getId())) {
            // TODO: is this situation possible?
            this._triggers.unset(trigger.getId());
        } else {
            this._triggers.set(trigger.getId(), trigger);
        }
    },

    /**
     * Get all the pipes of the screen
     * @type Array
     */
    getPipes: function() {
        var pipes = new Array();
        this._pipes.values().each(function(pipe) {
            pipes.push(pipe.getJSONforCheck());
        });
        return pipes;
    },

    /**
     * Get a list of preconditions in form of a JSON Object
     * @type Array
     */
    getPreconditions: function() {
        var list = new Array();
        this._preconditions.values().each(function(pre) {
            var element = Object.extend(pre.buildingblock.toJSONForScreen(),
                            {'position': pre.position});
            list.push(element);
        }.bind(this));
        return list;
    },

    /**
     * Get a list of postconditions in form of a JSON Object
     * @type Array
     */
    getPostconditions: function() {
        var list = new Array();
        this._postconditions.values().each(function(post) {
            var element = Object.extend(post.buildingblock.toJSONForScreen(),
                            {'position': post.position});
            list.push(element);
        }.bind(this));
        return list;
    },

    /**
     * Get a list of canvas instances
     * @type Array
     */
    getCanvasInstances: function() {
        var result = new Array();
        this._buildingBlocks.values().each(function(instance){
            result.push(instance.buildingblock);
        });
        return result;
    },

   /**
    * Finds an instance by its id
    * @private
    * @type ComponentInstance
    */
    getInstance: function(/** String */ id) {
        return this._buildingBlocks.get(id).buildingblock;
    },

    /**
     * Finds an instance by its uri
     * @private
     * @type ComponentInstance
     */
     getInstanceByUri: function(/** String */ uri) {
         return this._buildingBlocks.values().detect(function(instance) {
                     return instance.buildingblock.getUri() == uri;
         }).buildingblock;
     },

    /**
     * Finds all instance with a given uri
     * @private
     * @type ComponentInstance
     */
     getInstancesByUri: function(/** String */ uri) {
         var elements = [];

         this._buildingBlocks.values().each(function(instance) {
             if (instance.buildingblock.getUri() == uri)
                 elements.push(instance.buildingblock);
         }).buildingblock;

         return elements;
     },

    /**
     * Returns true if an element with the parameter uri is in the screen
     * @type Boolean
     */
    contains: function(/** String */ uri) {
        var element = this._buildingBlocks.values().detect(function(instance) {
                    return instance.buildingblock.getUri() == uri;
        });
        if (element) {
            return true;
        } else {
            return false;
        }
    },

    /**
     * Get a list of pre and post condition instances
     * @type Array
     */
    getConditionInstances: function() {
        var result = new Array();
        this._preconditions.values().each(function(pre){
            result.push(pre.buildingblock);
        });
        this._postconditions.values().each(function(post){
            result.push(post.buildingblock);
        });
        return result;
    },


    /**
     * Get a pre by its string identifier
     * @type PrePostInstance
     */
    getPre: function(/** String */ id) {
        if (this._preconditions.get(id)) {
            return this._preconditions.get(id).buildingblock;
        } else {
            return null;
        }

    },

    /**
     * Get a post by its string identifier
     * @type PrePostInstance
     */
    getPost: function(/** String */ id) {
        if (this._postconditions.get(id)) {
            return this._postconditions.get(id).buildingblock;
        } else {
            return null;
        }
    },

    /**
     * Removes an instance from the screen description
     */
    remove: function(/** Object */ instance) {
        switch (instance.constructor) {
            case PrePostInstance:
                if (this._preconditions.get(instance.getId())) {
                    this._preconditions.unset(instance.getId());
                } else {
                    this._postconditions.unset(instance.getId());
                }
                break;
            case Pipe:
                this._pipes.unset(instance.getId());
                break;
            case Trigger:
            case ScreenTrigger:
                this._triggers.unset(instance.getId());
                break;
            default:
                this._buildingBlocks.unset(instance.getId());
        }
    },

    // ******************** PRIVATE METHODS ************** //

    /**
     * Get building block list for screen composition
     * @private
     * @type Array
     */
     _getScreenBuildingBlocks: function() {
        var buildingBlocks = new Array();
        this._buildingBlocks.values().each(function(block) {
            buildingBlocks.push({
                'id': block.buildingblock.getId(),
                'uri': block.buildingblock.getUri(),
                'position': block.position,
                'orientation': block.buildingblock.getOrientation(),
                'parameter': block.buildingblock.getParams()
            });
        });
        return buildingBlocks;
    },

    /**
     * Get the pipe list for screen composition
     * @private
     * @type Array
     */
    _getScreenPipes: function() {
        var pipes = new Array();
        this._pipes.values().each(function(pipe) {
            pipes.push(pipe.getJSONforScreen());
        });
        return pipes;
    },

    /**
     * Get the trigger list for screen composition
     * @private
     * @type Array
     */
    _getTriggers: function() {
        var triggers = new Array();
        this._triggers.values().each(function(trigger) {
            triggers.push(trigger.toJSON());
        });
        return triggers;
    }

});

// vim:ts=4:sw=4:et:

var ScreenflowDescription = Class.create(BuildingBlockDescription,
    /** @lends ScreenflowDescription.prototype */ {

    /**
     * Screenflow building block description.
     * @constructs
     * @extends BuildingBlockDescription
     */
    initialize: function($super, /** Hash */ properties) {
        $super(properties);


        this._screens = new Hash();
        this._preconditions = new Hash();
        this._postconditions = new Hash();
    },

    /**
     * to JSON object function
     * @type Object
     */
    toJSON: function() {
        var result = {
            "definition": {
                "screens": this._getScreens(),
                "preconditions": this.getPreconditions(),//.size() > 0 ? [this.getPreconditions()] : [],
                "postconditions": this.getPostconditions()//.size() > 0 ? [this.getPostconditions()] : []
            }
        };
        result = Object.extend(result,{
            "name": this.name,
            "label": this.label,
            "tags": this.tags,
            "version": this.version,
            "id": this.id,
            "creator": this.creator,
            "description": this.description,
            "rights": this.rights,
            "creationDate": this.creationDate,
            "icon": this.icon,
            "screenshot": this.screenshot,
            "homepage": this.homepage,
            "type": "screenflow"
        });
        return result;
    },

    /**
     * Adds a new screen.
     * @param ScreenDescription
     *      Screen to be added to the
     *      Screenflow document.
     */
    addScreen: function (/** ScreenInstance */ instance, /** Object */ position) {
        this._screens.set(instance.getUri(), {
            "buildingblock":   instance,
            "position": position
        });
    },

    /**
     * Updates the position of the screen
     */
    updateScreen: function (/** String */ uri, /** Object */ position) {
        var buildingBlock = this._screens.get(uri);
        var origin = buildingBlock.position;

        if (origin.top != position.top || origin.left != position.left) {
            buildingBlock.position = position;
            return true;
        } else {
            return false;
        }
    },

    /**
     * Delete a screen.
     * @param ScreenDescription
     *      Screen to be deleted from the
     *      Screenflow document.
     */
    remove: function(/** String */ uri) {
        this._screens.unset(uri);
        this._preconditions.unset(uri);
        this._postconditions.unset(uri);
    },
    /**
     * Adds a new *-condition to the screenflow description
     */
    addPrePost: function(/** PrePostInstance */ instance, /** Object */ position) {
        switch(instance.getType()) {
            case 'pre':
                this._preconditions.set(instance.getUri(), {'buildingblock': instance,
                                                            'position': position});
                break;
            case 'post':
                this._postconditions.set(instance.getUri(), {'buildingblock': instance,
                                                            'position': position});
                break;
            default:
                //Do nothing
        }
    },

    updatePrePost: function(/** String */ uri, /** Object */ position) {
        var condition = this._preconditions.get(uri);
        if (!condition) {
            condition = this._postconditions.get(uri);
        }
        var origin = condition.position;
        if (origin.top != position.top || origin.left != position.left) {
            condition.position = position;
            return true;
        }
        return false;
    },


    /**
     * Implementing the TableModel interface
     * @type Array
     */
    getInfo: function() {
        var info = new Hash();
        info.set('Title', this.getTitle());
        info.set('Tags', this.tags.collect(function(tag) {
                return tag.label['en-gb'];
            }).join(", "));
        info.set('Version', this.version);
        return info;
    },

    /**
     * Get a list of preconditions in form of a JSON Object
     * @type Array
     */
    getPreconditions: function() {
        var list = new Array();
        this._preconditions.values().each(function(pre) {
            var element = Object.extend(pre.buildingblock.toJSONForScreenflow(), {'position':
                pre.position});
            list.push(element);
        }.bind(this));
        return list;
    },

    /**
     * Get a list of postconditions in form of a JSON Object
     * @type Array
     */
    getPostconditions: function() {
        var list = new Array();
        this._postconditions.values().each(function(post) {
            var element = Object.extend(post.buildingblock.toJSONForScreenflow(), {'position':
                post.position});
            list.push(element);
        }.bind(this));
        return list;
    },

    /**
     * Get a list of canvas instances
     * @type Array
     */
    getCanvasInstances: function() {
        var result = new Array();
        var list = this._screens.values().concat(this._preconditions.values());
        list = list.concat(this._postconditions.values());
        list.each(function(instance){
            result.push(instance.buildingblock);
        });
        return result;
    },

    /**
     * Returns true if an element with the parameter uri is in the screen
     * @type Boolean
     */
    contains: function(/** String */ uri) {
        var list = this._screens.values().concat(this._preconditions.values());
        list = list.concat(this._postconditions.values());
        var element = list.detect(function(instance) {
                    return instance.buildingblock.getUri() == uri;
        });
        if (element) {
            return true;
        } else {
            return false;
        }
    },

    /**
     * Necessary for compatibility with other BuildingblockDescriptions
     * @type Array
     */
    getConditionInstances: function() {
        return new Array();
    },

    //************************ PRIVATE METHODS *******************//
    /**
     * @type Array
     * @private
     */
    _getScreenUris: function() {
        return this._screens.keys();
    },

    /**
     * Return the list of screens
     * @type Array
     * @private
     */
    _getScreens: function() {
        var result = new Array();
        this._screens.values().each(function(screen){
            result.push({
                'uri': screen.buildingblock.getUri(),
                'position': screen.position,
                'title': screen.buildingblock.getTitle()
            });
        });
        return result;
    }
});

// vim:ts=4:sw=4:et:

var PrePostDescription = Class.create(BuildingBlockDescription,
    /** @lends PrePostDescription.prototype */ {

    /**
     * Pre/Post building block description.
     * @constructs
     * @extends BuildingBlockDescription
     */
    initialize: function($super, /** Hash */ properties) {
        $super(properties);
    },

    // ****************** PUBLIC METHODS ******************* //

    clone: function(){
        return new PrePostDescription(this.toJSON());
    },

    /**
     * Overriding getTitle.
     * @type String
     */
    getTitle: function() {
        if (!this.title) {
            this._updateTitle();
        }
        return this.title;
    },

    // ******************** PRIVATE METHODS ************** //

    /**
     * Creates the title of the palette component
     * @type String
     * @private
     */
    _updateTitle: function() {

        if (this['http://www.w3.org/2000/01/rdf-schema#label']) {
            this.title =
                 this['http://www.w3.org/2000/01/rdf-schema#label'].
                 replace("@en","");

        } else if (this['label']) {
            var languages = $H(this['label']).keys();
            if (languages.size() == 1) {
                this.title = this['label'][languages[0]];
            } else {
                // TODO: What to do here?
            }
        } else { // Extract the title from the uri
            var uri;
            if (this.uri) {
                uri = this.uri;
            } else {
                uri = Utils.extractURIfromPattern(this.pattern);
            }
            this.title = this._createTitle(uri);
        }
    },


    /**
     * This function creates a title from the uri identifier
     * @private
     * @type String
     */
    _createTitle: function(/** String */ uri) {
        if (uri) {
            var pieces = uri.split("#");
            var identifier = "";
            if (pieces.length > 1){
                identifier = pieces[1];
            }
            else { //The uri has not identifier, try the last part of the url
                pieces = uri.split("/");
                identifier = pieces[pieces.length - 1];
            }
            return this._sanitizeTitle(identifier);
        } else {
            return "Unknown Domain Concept";
        }
    },

    /**
     * This function returns a human-readable title from an
     * identifier
     * @private
     * @type String
     */
    _sanitizeTitle: function (/** String */ title) {
        //FIXME: I18NString
        var result = title.replace("@en","");
        //separate identifier from its forming words
        var words = result.match(/[A-Z][a-z0-9]+|\s+[a-z][a-z0-9]*/g);
        if (words) {
            words.map(function(e) {
                return e.strip();
            });
            result = words.join(" ");
        }
        return result;
    }

});

// vim:ts=4:sw=4:et:

var InferenceEngine = Class.create( /** @lends InferenceEngine.prototype */ {
    /**
     * This abstract class represents an inference engine as a proxy for the
     * catalogue, handling the reachability and recommendation of building blocks
     * @constructs
     * @abstract
     */
    initialize: function() {
        /**
         * This stores the reachability data
         * @type Hash
         * @private @member
         */
        this._reachabilityData = new Hash();

        /**
         * Listeners list hashed by resource URI
         * @type Hash
         * @private @member
         */
        this._listeners = new Hash();
    },


    // **************** PUBLIC METHODS **************** //

    /**
     * This function calls findAndCheck in the catalogue and calls a
     * callback upon completion.
     */
    findCheck: function (/**Array*/ canvas, /** Array*/ elements,
                         /** Array */ tags,
                         /** String*/ criteria,
                         /** Function */ callback) {

        var body = this._constructBody(canvas, elements, tags, criteria);
        var context = {
            'callback': callback,
            'mine': this
        };
        PersistenceEngine.sendPost(this._getUri("findCheck"), null, body,
                context, this._findCheckOnSuccess, this._onError);
    },

    /**
     * This function calls the check operation in the catalogue
     */
    check: function (/**Array*/ canvas, /** Object */ elements,
                    /** Array */ tags,
                    /** String*/ criteria,
                    /** Function */ callback) {
        var body = this._constructBody(canvas, elements, tags, criteria, "check");
        var context = {
            'callback': callback,
            'mine': this
        };
        PersistenceEngine.sendPost(this._getUri("check"), null, body, context,
                                    this._checkOnSuccess, this._onError);
    },

    /**
     * Register an object for interest on the reachability of a URI-identified
     * resources. The listener object must implement these methods:
     *
     *    void setReachability(Hash reachabilityData);
     *
     * Reachability data vary for different resource types:
     *   * Screens: TODO
     *   * ...
     */
    addReachabilityListener: function(/** String */ uri, /** Object */ listener) {
        this._getListenerList(uri).push(listener);

        if (this._reachabilityData.get(uri)) {
            listener.setReachability(this._reachabilityData.get(uri));
        }
    },

    /**
     * De-register an object from the reachability listeners
     */
    removeReachabilityListener: function (/** String  */uri, /** Object */ listener) {
        var index = this._getListenerList(uri).indexOf(listener);

        if (index >= 0) {
            //Remove the element
            this._listeners.get(uri)[index] = null;
            this._listeners.set(uri,this._listeners.get(uri).compact());
        }
    },

    /**
     * Returns the reachability information about
     * the preconditions of a given screen
     * @type Hash
     */
    getPreconditionReachability: function(/** String */ uri) {
        var reachabilityData = this._reachabilityData.get(uri);
        var result = new Hash();
        if (reachabilityData.preconditions) {
            if (reachabilityData.preconditions.length > 1) {
            //More than one set of preconditions
            console.log("OR precondition support not implemented yet");
            return null;
            }
            else {
                var preconditions = reachabilityData.preconditions[0];
                $A(preconditions).each(function(pre) {
                    var uri = Utils.extractURIfromPattern(pre.pattern);
                    result.set(uri, pre.satisfied);
                });
            }
        } else {
            if (reachabilityData.actions) {
                $A(reachabilityData.actions).each(function(action) {
                    $A(action.preconditions).each(function(pre) {
                        var uri = Utils.extractURIfromPattern(pre.pattern);
                        result.set(uri,pre.satisfied);
                    });
                });
            } else {
                console.log("unknown reachability data format");
                return null;
            }
        }
        return result;
    },

    /**
     * Returns a boolean determining if a building block is reachable
     * by its uri
     * @type Boolean
     */
     isReachable: function (/** String */ uri) {
         var reachabilityData = this._reachabilityData.get(uri);
         if (reachabilityData) {
            return reachabilityData.reachability;
         } else {
            return null;
         }
     },

    // **************** PRIVATE METHODS **************** //

    /**
     * Creates a body to be sent in an AJAX call to the
     * catalogue
     * @private @abstract
     * @type String
     */
    _constructBody: function(/**Array*/ canvas, /** Object */ elements,
                    /** Array */ tags,
                    /** String*/ criteria) {
        throw "Abstract Method invocation: InferenceEngine::_constructBody";
    },

    /**
     * Gets the uri to be called
     * @private @abstract
     * @type String
     */
    _getUri: function (/** String */ operation) {
        throw "Abstract Method invocation: InferenceEngine::_getUri";
    },


    /**
     * onSuccess callback
     * @private
     * @abstract
     */
    _findCheckOnSuccess: function(/**XMLHttpRequest*/ transport){
        throw "Abstract method invocation: InferenceEngine::_findCheckOnSuccess";
    },

    /**
     * onSuccess callback
     * @private
     * @abstract
     */
    _checkOnSuccess: function(transport){
        throw "Abstract method invocation: InferenceEngine::_CheckOnSuccess";
    },

    /**
     * Error handler
     * @private
     */
    _onError: function(transport, e){
        Utils.showMessage("Something went wrong", {
            'error': true,
            'hide': true
        });
        Logger.serverError(transport,e);
    },

    /**
     * Returns a list of listeners of an uri
     * @private
     */
    _getListenerList: function (/** String */ uri) {
        var list = this._listeners.get(uri);
        if (!list) {
            list = new Array();
            this._listeners.set(uri, list);
        }
        return list;
    },
    /**
     * Updates and notifies the reachability
     * of a list of elements
     * @private
     */
    _updateReachability: function(/** Array */ elements) {
        elements.each(function(element) {
            this._reachabilityData.set(element.uri, element);
            this._notifyReachability(element.uri);
        }.bind(this));
    },

    /**
     * Notifies the reachability information to all the relevant
     * listeners
     * @private
     */
    _notifyReachability: function(/** String */ uri) {
        this._getListenerList(uri).each(function(listener) {
            listener.setReachability(this._reachabilityData.get(uri));
        }.bind(this));
    }
});

// vim:ts=4:sw=4:et:

var ScreenflowInferenceEngine = Class.create(InferenceEngine /** @lends ScreenflowInferenceEngine.prototype */, {
    /**
     * This class handles the reachability and recommendation of building blocks
     * It communicates with the serverside catalogue to retrieve this information
     * @extends InferenceEngine
     * @constructs
     */
    initialize: function($super) {
        $super();
    },


    // **************** PUBLIC METHODS **************** //


    /**
     * This function calls the catalogue to create a plan for a given screen
     */
    getPlans: function(/** Array */ canvas, /** String */ screenUri,
                        /** Function */ handler) {
        var body = {
            "goal": screenUri,
            "canvas": canvas
        };
        var bodyJSON = Object.toJSON(body);
        PersistenceEngine.sendPost(URIs.cataloguePlanner, null, bodyJSON, {'handler': handler},
                                    this._planOnSuccess, this._onError);
    },

    // **************** PRIVATE METHODS **************** //

    /**
     * plan onSuccess
     * @private
     */
    _planOnSuccess: function(transport) {
        var result = JSON.parse(transport.responseText);
        this.handler(result);
    },


    /**
     * Creates a body to be sent in an AJAX call to the
     * catalogue
     * @private
     * @overrides
     * @type String
     */
    _constructBody: function(/**Array*/ canvas, /** Array*/ elements,
                    /** Array */ tags,
                    /** String*/ criteria) {

        /*var domainContext = {
            'tags': tags,
            'user': GVS.getUser().getUserName()
        };*/

        var domainContext = {
            'tags': tags.collect(function(tag){ return tag.label['en-gb']}),
            'user': GVS.getUser().getUserName()
        }
        var body = {
            'canvas': canvas,
            'elements': elements,
            'domainContext': domainContext,
            'criterion': criteria
        };
        return Object.toJSON(body);
    },

    /**
     * Gets the uri for a given operation
     * @private
     * @overrides
     */
    _getUri:function (/** String */ operation) {
        switch(operation) {
            case "findCheck":
                return URIs.catalogueScreenflowFindCheck;
                break;
            case "check":
                return URIs.catalogueScreenflowCheck;
                break;
            default:
                return "";
        }
    },

    /**
     * onSuccess callback
     * @private
     * @overrides
     */
    _findCheckOnSuccess: function(/**XMLHttpRequest*/ transport){
        var result = JSON.parse(transport.responseText);
        if (result.elements) {
            var paletteElements = result.elements;
        }


        this.mine._updateReachability(paletteElements);

        // Notifying about new uris
        var screenURIs = new Array();
        $A(paletteElements).each(function(element) {
           screenURIs.push(element.uri);
        });

        this.callback(screenURIs);
    },

    /**
     * onSuccess callback
     * @private
     * @overrides
     */
    _checkOnSuccess: function(transport){
        var result = JSON.parse(transport.responseText);
        var elements = result.elements.concat(result.canvas).uniq();

        this.mine._updateReachability(elements);
        this.callback();
    }
});

// vim:ts=4:sw=4:et:

var ScreenInferenceEngine = Class.create( /** @lends ScreenInferenceEngine.prototype */ InferenceEngine, {
    /**
     * This class handles the reachability and recommendation of building blocks
     * It communicates with the serverside catalogue to retrieve this information
     * @extends InferenceEngine
     * @constructs
     */
    initialize: function($super) {
        $super();
    },


    // **************** PUBLIC METHODS **************** //



    // **************** PRIVATE METHODS **************** //
     /**
     * Creates a body to be sent in an AJAX call to the
     * catalogue
     * @private
     * @overrides
     * @type String
     */
    _constructBody: function(/**Array*/ canvas, /** Object */ elements,
                    /** Array */ tags,
                    /** String*/ criteria, /** String(Optional) */ _method) {
        var method = Utils.variableOrDefault(_method, "");
        /*var domainContext = {
            'tags': tags,
            'user': GVS.getUser().getUserName()
        };*/

        var domainContext = {
            'tags': tags.collect(function(tag){ return tag.label['en-gb']}),
            'user': GVS.getUser().getUserName()
        }
        var body = {
            'canvas': canvas,
            'domainContext': domainContext,
            'criterion': criteria
        };
        if (method == "check") {
            body.search = false;
        }
        body = Object.extend(body, elements);
        return Object.toJSON(body);
    },

    /**
     * Gets the uri for a given operation
     * @private
     * @overrides
     */
    _getUri:function (/** String */ operation) {
        return URIs.catalogueScreenFindCheck;
    },

    /**
     * onSuccess callback
     * @private
     * @overrides
     */
    _findCheckOnSuccess: function(/** XMLHttpRequest */ transport){
        var result = JSON.parse(transport.responseText);

        if (result.canvas && result.canvas.length > 0) {
            // There is some reachability information
              this.mine._updateReachability(result.canvas);
        }

        this.callback(result);
    },

    /**
     * onSuccess callback
     * @private
     * @overrides
     */
    _checkOnSuccess: function(transport){
        try {
             var result = JSON.parse(transport.responseText);
             this.mine._updateReachability(result.canvas);
             this.callback(result);
        }
        catch (e) {

        }
    }
});

// vim:ts=4:sw=4:et:

var BuildingBlockSet = Class.create( /** @lends BuildingBlockSet.prototype */ {
    /**
     * This class handles a set of building blocks for a given context.
     * This list will be updated.
     * @constructs
     */
    initialize: function(/** Array */ tags, /** BuildingBlockFactory */ factory) {
        /**
         * Associated tags
         * @type Array
         * @private @member
         */
        this._tags = tags;

        /**
         * Building block factory
         * @type BuildingBlockFactory
         * @private @member
         */
        this._factory = factory;


        /**
         * Set listener
         * @type SetListener
         * @private @member
         */
        this._listener = null;

        /**
         * List of BuildingBlock URIs
         * @type Array
         * @private @member
         */
        this._uris = new Array();
    },


    // **************** PUBLIC METHODS **************** //

    /**
     * Returns all the building block descriptions from the set
     * @type Array
     * @override
     */
    getBuildingBlocks: function () {
        return this._factory.getBuildingBlocks(this._uris);
    },

    /**
     * Gets the type of building block this factory mades.
     * @type String
     */
    getBuildingBlockType: function (){
        return this._factory.getBuildingBlockType();
    },

    /**
     * Gets the human-readable name of the building block type.
     * @type String
     */
    getBuildingBlockName: function (){
        return this._factory.getBuildingBlockName();
    },

    setListener: function (/** SetListener */ listener) {
        this._listener = listener;
    },

     /**
     * Add new building blocks to the set by uri
     */
    addURIs: function (/** Array */ uris) {
        this._requestedUris = uris;
        this._factory.cacheBuildingBlocks(uris, this._cachedElements.bind(this));
    },

    /**
     * This is the callback called when returning from the
     * building block factory
     * @private
     */
    _cachedElements: function () {
        this._uris = this._uris.concat(this._requestedUris).uniq();
        this._listener.setChanged();
    }
});

// vim:ts=4:sw=4:et:

var DomainConceptSet = Class.create(BuildingBlockSet, /** @lends DomainConceptSet.prototype */ {
    /**
     * This class handles a set of building blocks for a given context.
     * This list will be updated.
     * @constructs
     * @extends BuildingBlockSet
     */
    initialize: function($super, /** Array */ tags, /** DomainConceptFactory */ factory) {
        $super(tags, factory);

        /**
         * Domain concepts
         * @type Array
         * @private
         */
        this._domainConcepts = new Array();

    },


    // **************** PUBLIC METHODS **************** //

    /**
     * Starts the data retrieval of the domain concepts
     */
    startRetrievingData: function() {
        this._factory.getBuildingBlocks(this._tags, this._onSuccess.bind(this));
    },


    /**
     * Returns all the building block descriptions from the set
     * @type Array
     * @override
     */
    getBuildingBlocks: function () {
        return this._domainConcepts;
    },

    // **************** PRIVATE METHODS **************** //

    /**
     * @private
     */
    _onSuccess: function(/** Array */ domainConcepts) {
        this._domainConcepts = domainConcepts;
        this._listener.setChanged();
    }
});

// vim:ts=4:sw=4:et:

var SetListener = Class.create( /** @lends SetListener.prototype */ {
    /**
     * This class is an interface
     * @constructs
     */
    initialize: function() {
    },

    /**
     * This function is called when a
     * Building Block set changes
     */
    setChanged: function () {
        throw "Abstract method invocation: SetListener::setChanged";
    }

});

// vim:ts=4:sw=4:et:

var Table = Class.create( /** @lends Table.prototype */ {
    /**
     * This abstract class handles the different properties tables
     * belonging to different documents
     * @abstract
     * @constructs
     */
    initialize: function(/** DOMNode */ parentNode, /** String */ baseTitle,
            /** String */ region, /** String (optional) */ minSize) {
        /**
         * Parent node
         * @type DOMNode
         * @private @member
         */
        this._parentNode = parentNode;

        /**
         * Title of the table
         * @type String
         * @private @member
         */
        this._title = baseTitle;

        /**
         * Node of the title
         * @type DOMNode
         * @private @member
         */
        this._titleNode = new Element ('div',{
            'class': 'dijitAccordionTitle '
        }).update(this._title);

        /**
         * Node of the table
         * @type DOMNode
         * @private @member
         */
        this._tableNode = new Element ('table',{
            'class': 'propertiesTable'
        });

        var style = (region == "left") ? 'width: 50%': 'width: auto';
        var container= new dijit.layout.ContentPane({
            'region': region,
            'splitter': true,
            'style': style,
            'class': 'tableArea'
        });
        if (minSize) {
            container.attr('minSize', minSize);
        }

        container.domNode.insert(this._titleNode);
        container.domNode.insert(this._tableNode);
        this._parentNode.addChild(container);
    },


    // **************** PUBLIC METHODS **************** //

    /**
     * Set the table title
     */
    setTitle: function (/** String */ title) {
        this._title = title;
        this._titleNode.update(title);
    },

    /**
     * Returns the table title
     * @type String
     */
    getTitle: function () {
        return this._title;
    },

    /**
     * Returns the table Node
     * @type DOM
     */
    getTableNode: function () {
        return this._tableNode;
    },

    /**
     * Sets the field titles
     * @type String
     */
    insertFieldTitles: function (/** Array */ fieldTitles) {
        var tr = new Element('tr', {
            'class': 'tableHeader'
        });

        fieldTitles.each (function(title){
           var td = new Element ('td').update(title);
           tr.insert(td);
        });

        this._tableNode.insert(tr);
    },

    /**
     * Updates the data in the table
     */
    insertDataValues: function (/** Hash */ data)  {

        data.each (function(line){
            var tr = new Element('tr');

            //TODO: What happen with the classes, maybe another method?
            line.each (function(field){
               var td = new Element ('td');
               var div = new Element ('div').update(field);
               if (typeof field === "string") {
                   div.setAttribute('title', field);
               }
               td.insert(div)
               tr.insert(td);
            });
            this._tableNode.insert(tr);
        }.bind(this));
    },

    /**
     * Empty the data in the table
     */
    emptyTable : function (){
        this._tableNode.update("");
    }



    // **************** PRIVATE METHODS **************** //


});

// vim:ts=4:sw=4:et:

var PropertiesPane = Class.create( /** @lends PropertiesPane.prototype */ {
    /**
     * This class handles the properties pane
     * @constructs
     */
    initialize: function(/** DOMNode */ parentNode) {
        /**
         * Variable
         * @type Table
         * @private @member
         */
        this._propertiesTable = new Table(parentNode, 'Properties', 'left');

        this._propertiesTable.insertFieldTitles(['Property','Value']);

    },


    // **************** PUBLIC METHODS **************** //


    /**
     * This function updates the table with data coming from
     * the currently selected element
     * @param element
     *          Something implementing TableModel interface
     *              * String getTitle()
     *              * Array getInfo()
     *              * Array getTriggerMapping(): Optional method
     */
    fillTable: function (/** Object */ element) {
        this._clearElement();

        var title = element.getTitle();

        this._propertiesTable.insertDataValues(element.getInfo());
        this._propertiesTable.setTitle((title ? 'Properties of '  + title : 'Properties'));
    },

    /**
     * This function add a new section to the table, without removing the actual
     * data. A section is a title row, and values
     */
    addSection: function (/** Array */ title, /** Hash */ values) {
        this._propertiesTable.insertFieldTitles(title);
        this._propertiesTable.insertDataValues(values);
    },

    // **************** PRIVATE METHODS **************** //

    /**
     * This function empties the table
     * @private
     */
    _clearElement: function (){
        this._propertiesTable.emptyTable();
        this._propertiesTable.setTitle('Properties');
        this._propertiesTable.insertFieldTitles(['Property','Value']);
    }


});

// vim:ts=4:sw=4:et:

var FactPane = Class.create( /** @lends FactPane.prototype */ {
    /**
     * This class handles the pre/post inspector
     * @constructs
     */
    initialize: function(/** DOMNode */ parentNode) {
        /**
         * Variable
         * @type Table
         * @private @member
         */
        this._factTable = new Table(parentNode, 'Facts', 'center');

    },


    // **************** PUBLIC METHODS **************** //


    /**
     * This function updates the table with data passed
     * as parameters
     */
    fillTable: function (/** Array */ preList,
                         /** Array */ postList, /** Array */ factList) {

        this._factTable.emptyTable();

        if (preList.size() > 0) {
            this._factTable.insertFieldTitles(['PRE','Description', 'Semantics']);
            this._factTable.insertDataValues(preList);
        }

        if (postList.size() > 0) {
            this._factTable.insertFieldTitles(['POST','Description', 'Semantics']);
            this._factTable.insertDataValues(postList);
        }

        if (factList.size() > 0) {
            this._factTable.insertFieldTitles(['Fact','Description', 'Semantics']);
            this._factTable.insertDataValues(factList);
        }
    }

    // **************** PRIVATE METHODS **************** //

});

// vim:ts=4:sw=4:et:

var Toolbar = Class.create( /** @class @lends Toolbar.prototype */ {
    /**
     * The toolbar itself
     *
     * @constructs
     * @constructor
     */
    initialize: function() {
        /**
         * @type dijit.dialog.Toolbar
         * @private @member
         */
        this._toolbar = dijit.byId("toolbar");

        /**
         * List of toolbar models
         * @type Array
         * @private @member
         */
        this._models = new Array();

        /**
         * List of section elements.
         * Each section have another array with the Widget of the buttons plus a
         * separator on the first position (index 0).
         *
         * @type Array
         * @private @member
         */
        this._sections = new Array();
        this._sections[0] = new Array();
    },

    /**
     * Sets the model for the toolbar section on the given position.
     * ToolbarModel must provide objects implementing the following interface:
     *
     *   interface ToolbarElement
     *      Widget getWidget()  // dojo widget
     * @
     */
    setModel: function(/** Number */position, /** ToolbarModel */ model) {
        this._removeModel(position);

        if (model) {
            var toolbarElements = model.getToolbarElements();

            if (toolbarElements.size() > 0) {
                this._models[position] = model;

                this._initSection(position);

                toolbarElements.each(function (element) {
                    this._sections[position].push(element.getWidget());
                }.bind(this));
            }
        }

        this._refreshToolbar();
    },

    // ************************ PRIVATE METHODS ************************* //

    /**
     * Removes the model from the given position
     * @private
     */
    _removeModel: function(/** Number */ position) {
        if (this._models[position]) {
            this._models[position] = null;
            this._sections[position].clear();
        }
    },

    /**
     * Initializes a section
     * @private
     */
    _initSection: function(/** Number */ position) {
        if (!this._sections[position]) {
            this._sections[position] = new Array();
        }
        if (position != 0 && !this._sections[position][0]) {
            this._sections[position][0] = new dijit.ToolbarSeparator();
        }
    },

    /**
     * Refresh the toolbar interface
     * Called when something happens (a model has been added or removed)
     * @private
     */
    _refreshToolbar: function() {
        this._toolbar.getDescendants().each(function(descendant) {
            this._toolbar.removeChild(descendant);
        }.bind(this));

        this._sections.each(function (section) {
            section.each(function (element) {
                this._toolbar.addChild(element);
            }.bind(this));
        }.bind(this));
    }

});

// vim:ts=4:sw=4:et:

var ToolbarModel = Class.create( /** @lends ToolbarModel.prototype */ {
    /**
     * Provides toolbar elements for a toolbar section.
     * @abstract
     * @constructs
     */
    initialize: function() {

        /**
         * All the toolbar elements
         * @type Hash
         * @private @member
         */
        this._toolbarElements = new Hash();

        /**
         * Order of the elements in the toolbar interface
         * @type Array
         * @private @member
         */
        this._toolbarElementOrder = new Array();

    },


    // **************** PUBLIC METHODS **************** //


    /**
     *
     * @type Array   Array of ToolbarElement
     */
    getToolbarElements: function() {
        var elements = new Array();
        this._toolbarElementOrder.each(function(name) {
            elements.push(this._toolbarElements.get(name));
        }.bind(this));
        return elements;
    },

    // **************** PRIVATE METHODS **************** //


    /**
     * Adds a new element to the list
     * @private
     */
    _addToolbarElement: function(/** String */ elementName, /** ToolbarElement */ element) {
        this._toolbarElementOrder.push(elementName);
        this._toolbarElements.set(elementName, element);
    }
});

// vim:ts=4:sw=4:et:

var ToolbarButton = Class.create( /** @lends ToolbarButton.prototype */ {
    /**
     * Button as a toolbar element.
     * Implementing ToolbarElement interface
     * @constructs
     * @param Boolean enabled (optional)
     */
    initialize: function(/** String */ label, /** String */ iconName,
            /** Function */ onClick, /** Boolean*/ enabled) {
        /**
         * The button Widget
         * @type dijit.form.Button
         * @private @member
         */
        this._widget = new dijit.form.Button ({
            'label': label,
            'iconClass': 'toolbarIcon ' + iconName + 'Icon',
            'onClick': onClick,
            'showLabel': false,
            'disabled': (enabled !== undefined)? (!enabled) : false
        });
    },


    // **************** PUBLIC METHODS **************** //


    /**
     * Returns the button widget
     * @type dijit.form.Button
     */
    getWidget: function () {
        return this._widget;
    },

    setEnabled: function(/** Boolean */ enabled) {
        this._widget.attr('disabled',!enabled);
    }

});

// vim:ts=4:sw=4:et:

var ToolbarDropDown = Class.create( /** @lends ToolbarDropDown.prototype */ {
    /**
     * DropDown as a toolbar element.
     * Implementing ToolbarElement interface
     * @constructs
     * @param Boolean enabled (optional)
     */
    initialize: function(/** String */ label, /** String */ iconName, /** Boolean*/ enabled) {

        /**
         * The Menu inside the DropDown
         * @type dijit.Menu
         * @private
         */
        this._menu = new dijit.Menu();

        /**
         * The DropDown Widget
         * @type dijit.form.DropDown
         * @private @member
         */
        this._widget = new dijit.form.DropDownButton ({
            'label': label,
            'showLabel': true,
            'iconClass': 'toolbarIcon ' + iconName + 'Icon',
            'dropDown': this._menu,
            'disabled': (enabled !== undefined)? (!enabled) : false
        });
    },


    // **************** PUBLIC METHODS **************** //
    /**
     * This function adds a new menu item into the DropDown
     */
    addMenuItem: function(/** String */ label, /** Function */ onClick, /** String */ iconName) {
        var item = new dijit.MenuItem({
            'label': label,
            'showLabel': true,
            'onClick': onClick
        });
        if (iconName) {
            item.attr('iconClass', 'dropDownIcon ' + iconName + 'Icon');
        }
        this._menu.addChild(item);
    },

    /**
     * Returns the DropDown widget
     * @type dijit.form.DropDown
     */
    getWidget: function () {
        return this._widget;
    },

    /**
     * Set the status of the widget
     */
    setEnabled: function(/** Boolean */ enabled) {
        this._widget.attr('disabled',!enabled);
    }


});

// vim:ts=4:sw=4:et:

var Menu = Class.create( /** @lends Menu.prototype */ {
    /**
     * The Menu itself
     *
     * @constructs
     */
    initialize: function(/** KeyPressRegistry */ registry) {
        /**
         * @type dijit.MenuBar
         * @private @member
         */
        this._menu = dijit.byId("menu");

        /**
         * List of menu models
         * @type Hash
         * @private @member
         */
        this._models = new Hash();

        /**
         * Key press registry
         * @type KeyPressRegistry
         * @private
         */
        this._registry = registry;

        /**
         * Array of current menuElements
         * @type Array
         * @private
         */
        this._menuElements = new Array();

    },

    /**
     * Sets the model for the menu.
     * The model can contains different menus and elements
     */
    setModel: function(/** String */ keyword, /** MenuModel */ model) {
        this._models.unset(keyword);

        if (model) {
            this._models.set(keyword, model);
        }
        var menuConfig = this._mergeAllModels(this._models.values());
        this._createMenu(menuConfig);
    },

    // ************************ PRIVATE METHODS ************************* //


    /**
     * Merge all different model objects in order to create
     * a single menu
     * @private
     * @type Array
     */
    _mergeAllModels: function(/** Array */ models) {
        var resultHash = new Hash();
        models.each(function(model){
            resultHash = this._mergeMenuElements(resultHash, $H(model.getMenuElements()));
        }.bind(this));

        var result = resultHash.values().clone();

        result.sort(function(a,b) {
                        var left = a.get('weight') ? a.get('weight') : MenuElement.MAXIMUM_WEIGHT;
                        var right = b.get('weight') ? b.get('weight') : MenuElement.MAXIMUM_WEIGHT;
                        return left - right;
                    });

        return result;
    },


    /**
     * Merge all menu subelements from two elements
     * @private
     * @type Hash
     */
    _mergeMenuElements: function(/** Hash */ left, /** Hash */ right) {
        var result = new Hash();
        // All the keys without duplicates
        var keys = left.keys().concat(right.keys()).uniq();
        keys.each(function(key) {
            if(left.get(key) && right.get(key)) {
                result.set(key, this._mergeMenuElement($H(left.get(key)),$H(right.get(key))));

            } else if (left.get(key)) {
                result.set(key,$H(left.get(key)));

            } else if (right.get(key)) {
                result.set(key,$H(right.get(key)));
            }
        }.bind(this));
        return result;
    },


    /**
     * Returns an element with Union of the attributes
     * of the two passed as parameters
     * @private
     * @type Hash
     */
    _mergeMenuElement: function(/** Hash */ left, /** Hash */ right) {
        var result = new Hash();

        // All the keys without duplicates
        var keys = left.keys().concat(right.keys()).uniq();
        keys.each(function(key) {
            if(left.get(key) && right.get(key)) {
                if (key == 'children') {
                    result.set(key, this._mergeMenuElements($H(left.get(key)), $H(right.get(key))));

                } else {
                    if (left.get(key) != right.get(key)) {
                        throw "Conflicting menu element property " + key;
                    }

                    result.set(key, left.get(key));
                }

            } else if (left.get(key)) {
                result.set(key,left.get(key));

            } else if (right.get(key)) {
                result.set(key,right.get(key));
            }
        }.bind(this));
        return result;
    },


    /**
     * Creates the menu widget structure from a menu configuration object
     * @private
     */
    _createMenu: function(/** Array */ menuConfiguration) {
        //Unregistering the old menu elements
        this._menuElements.each(function(element) {
            element.unregister(this._registry);
        }.bind(this));
        this._menuElements.clear();
        menuConfiguration.each(function(menuElement) {
            var menuElementObject = menuElement.toObject();
            switch(menuElementObject.type.toLowerCase()) {
                case "submenu":
                    var element = new SubMenu(menuElementObject, true);
                    break;
                case "action":
                    var element = menuElementObject.action;
                    break;
            }
            this._menuElements.push(element);
            this._menu.addChild(element.getWidget());
            element.register(this._registry);
        }.bind(this));
    }
});

// vim:ts=4:sw=4:et:

var MenuElement = Class.create( /** @lends MenuElement.prototype */ {
    /**
     * Element for a menu
     * @constructs
     * @abstract
     */
    initialize: function(/** Number */ weight) {
        /**
         * The button Widget
         * @type dijit.*
         * @private
         */
        this._widget = null;

        /**
         * Ordering weight, the lower, the sooner the menu element
         * appears within a menu group
         * @type Number
         * @private
         */
        this._weight = weight;
        if (!this._weight) {
            this._weight = MenuElement.MAXIMUM_WEIGHT;
        }
    },


    // **************** PUBLIC METHODS **************** //


    /**
     * Returns the  widget
     * @type dijit.*
     */
    getWidget: function () {
        return this._widget;
    },

    /**
     * Returns the weight
     * @type Number
     */
    getWeight: function() {
        return this._weight;
    },

    /**
     * Register key handlers
     * @abstract
     */
    register: function(/** KeyPressRegistry */ registry) {
        throw "Abstract method invocation. MenuElement::register";
    },

    /**
     * Unregister key handlers and destroy the
     * widgets when necessary
     * @abstract
     */
    unregister: function(/** KeyPressRegistry */ registry) {
        throw "Abstract method invocation. MenuElement::unregister";
    }
});
// *************** CONSTANTS **************//
MenuElement.MAXIMUM_WEIGHT = 10000;
// vim:ts=4:sw=4:et:

var MenuAction = Class.create(MenuElement, /** @lends MenuAction.prototype */ {
    /**
     * Element for a menu
     * @constructs
     * @extends MenuElement
     * @param Hash extraParams (optional)
     *           Hash containing some of these extra params
     *           * (String)iconName Name of the icon if present
     *           * (Boolean)enabled state of the element
     *           * (String)accelKey key shortcut to access to the element
     */
    initialize: function($super, /** Object */ data, /** Boolean */ mainMenu) {
        $super(data.weight);
        if (mainMenu) {
            this._widget = new dijit.MenuBarItem ({
                'label': data.label,
                'onClick': data.handler,
                'showLabel': true
            });
        } else {
            this._widget = new dijit.MenuItem ({
                'label': data.label,
                'onClick': data.handler,
                'showLabel': true
            });
        }

        /**
         * Handler function
         * @type Function
         * @private
         */
        this._handler = data.handler;

        /**
         * Accel key shortcut to use the menu item,
         * if any
         * @type String
         * @private
         */
        this._shortcut = (data.shortcut ? data.shortcut : null);

        if (this._shortcut) {
            this._widget.attr('accelKey', this._shortcut);
        }

        /**
         * Item state
         * @type Boolean
         * @private
         */
        this._enabled = null;
        this.setEnabled(data.enabled !== undefined ? data.enabled : true);

        if (data.iconName) {
            this._widget.attr('iconClass', 'dijitMenuItemIcon menuIcon ' + data.iconName + 'MenuIcon');
        }
    },


    // **************** PUBLIC METHODS **************** //


    /**
     * Sets the element enabled
     * It must be called to set it disabled
     * when the menuitem is going to be left
     * outside of the menu
     */
    setEnabled: function(/** Boolean */ enabled) {
        this._enabled = enabled;
        this._widget.attr('disabled',!enabled);
    },

    /**
     * Register key handlers
     * @override
     */
    register: function(/** KeyPressRegistry */ registry) {
        if (this._shortcut) {
            registry.addHandler(this._shortcut, this._keyPressHandler.bind(this));
        }
    },

    /**
     * Unregister key handlers
     * @override
     */
    unregister: function(/** KeyPressRegistry */ registry) {
        if (this._shortcut) {
            registry.removeHandler(this._shortcut);
        }
    },

    // ************** PRIVATE METHODS **************** //

    /**
     * function to capture key strokes and decide if
     * calling the handler depending on the status of the
     * action (enabled or disabled)
     */
    _keyPressHandler: function() {
        if (this._enabled) {
           this._handler();
        }
    }
});

// vim:ts=4:sw=4:et:

var SubMenu = Class.create(MenuElement, /** @lends SubMenu.prototype */ {
    /**
     * Element for a menu
     * @constructs
     * @extends MenuElement
     */
    initialize: function($super, /** Object */ data, /** Boolean */ mainMenu) {
        $super(data.weight);

        var menu = new dijit.Menu({});

        if (mainMenu) {
            this._widget = new dijit.PopupMenuBarItem({
                    'label': data.label,
                    'popup': menu
                });
        } else {
            this._widget = new dijit.PopupMenuItem({
                    'label': data.label,
                    'popup': menu
                });
        }


        /**
         * Array for storing the different groups
         * that contains the Submenu children
         * @type Array
         * @private
         */
        this._groups = new Array();

        var child;
        $H(data.children).each(function(pair) {
            var childData = $H(pair.value).toObject();
            switch (childData.type.toLowerCase()) {
                case 'action':
                    child = childData.action;
                    break;
                case 'submenu':
                    child = new SubMenu(childData);
                    break;
            }
            this._addChild(childData.group, child);
        }.bind(this));
        this._createSubMenu(menu);
    },


    // **************** PUBLIC METHODS **************** //

    /**
     * Register key handlers
     * @override
     */
    register: function(/** KeyPressRegistry */ registry) {
        this._groups.each(function(group) {
            group.each(function(child){
                child.register(registry);
            });
        });
    },

    /**
     * Unregister key handlers and destroy the widget
     * @override
     */
    unregister: function(/** KeyPressRegistry */ registry) {
        this._groups.each(function(group) {
            group.each(function(child){
                child.unregister(registry);
            });
        });
        this._widget.destroy(false);
    },

    // ***************** PRIVATE METHODS *************** //

     /**
     * Adds a new child to the submenu
     * @private
     */
    _addChild: function(/** Number */ group, /** MenuElement */ child) {
        if (!this._groups[group]) {
            this._groups[group] = new Array();
        }
        this._groups[group].push(child);
        this._groups[group].sort(function(a, b){
            return a.getWeight() - b.getWeight();
        });
    },


    /**
     * creates the submenu widget with the information
     * stored in the children's list
     * @private
     */
    _createSubMenu: function(/** Menu */ parent) {

        for(var i=0; i < this._groups.size(); i++) {
            if (this._groups[i]) {
                this._groups[i].each(function(element){
                    parent.addChild(element.getWidget());
                });
                if (i != this._groups.size() - 1) {
                    // Not last group
                    parent.addChild(new dijit.MenuSeparator());
                }
            }
        }
        parent.startup();
    }
});

// vim:ts=4:sw=4:et:

var AbstractDocument = Class.create(ToolbarModel, /** @lends AbstractDocument.prototype */ {
    /**
     * Represents a document and its tab. Subclasses must provide the
     * inner content.
     * @extends ToolbarModel
     * @abstract
     * @constructs
     */
    initialize: function($super, /** String */ title,
        /** Boolean (Optional) */ _isWidgetProvided) {
        $super();

        var isWidgetProvided = Utils.variableOrDefault(_isWidgetProvided, false);

        /**
         * Tab title
         * @type String
         * @private
         */
        this._title = title;

        /**
         * Actual Tab Id
         * @type String
         * @private
         */
        this._tabId = UIDGenerator.generate("tab");


        /**
         * Initial tab content (empty by default)
         * @type DOMNode
         * @private
         */
        this._tabContent = new Element("div", {
            "class": "document"
        });

        /**
         * Actual tab
         * @type dijit.layout.ContentPane
         * @private
         */
        this._tab = null;

        if (!isWidgetProvided) {
            this._tab = new dijit.layout.ContentPane({
                title: this._title,
                id: this._tabId,
                closable: true,
                onClose: this._closeDocument.bind(this)
            }, null);

            this._tab.setContent(this._tabContent);
        } else {
            this._tab = this._getWidget();
        }
    },

    // **************** PUBLIC METHODS **************** //

    /**
     * Gets the tab id.
     * @type String
     */
    getTabId: function() {
        return this._tabId;
    },


    /**
     * Gets the tab node.
     * @type DOMNode
     */
    getTab: function() {
        return this._tab;
    },


    /**
     * Gets the title.
     * @type String
     */
    getTitle: function() {
        return this._title;
    },

    /**
     * Gets the content node.
     * @type DOMNode
     */
    getNode: function() {
        return this._tabContent;
    },

    /**
     * Method called on del. Might be overloaded
     */
    onKeyPressed: function(/** String */ key) {
        // Do nothing
    },


    /**
     * Implementing menu model interface
     * @type Object
     */
    getMenuElements: function() {
        return {};
    },

    show: function() {
        // Do nothing
    },

    hide: function() {
        // Do nothing
    },

    // **************** PRIVATE METHODS **************** //

    /**
     * Close document event handler.
     * @private
     */
    _closeDocument: function() {
        GVS.getDocumentController().closeDocument(this._tabId);
        return true;
    },

    /**
     * Sets the document title
     * @private
     */
    _setTitle: function(/** String */ title) {
        this._title = title;
        this._tab.attr("title", this._title);
    }
});

// vim:ts=4:sw=4:et:

var ExternalDocument = Class.create(AbstractDocument, /** @lends ExternalDocument.prototype */ {
    /**
     * Represents an external content
     * inner content.
     * @abstract
     * @extends AbstractDocument
     * @constructs
     */
    initialize: function ($super,
            /** String */ title,
            /** String */ url) {

        /**
         * Url of the external content
         * @type String
         * @private
         */
        this._url = url;


        $super(title);

        this._tabContent.appendChild(new Element('iframe', {
            'src': this._url,
            'style':'border: 0px; width: 100%; height: 100%; margin: 0px; padding:0px;'
        }));
    }

    // **************** PRIVATE METHODS **************** //

});

// vim:ts=4:sw=4:et:

var PaletteDocument = Class.create(AbstractDocument, /** @lends PaletteDocument.prototype */ {
    /**
     * Represents a document and its tab. Subclasses must provide the
     * inner content.
     * @abstract
     * @extends AbstractDocument
     * @constructs
     * @param validBuildingBlocks
     *      Containing the different valid building blocks and their respective drop Zones
     */
    initialize: function ($super,
            /** String */ typeName,
            /** Object */ properties,
            /** InferenceEngine */ inferenceEngine) {
        $super(properties.name);

        /**
         * List of tags
         * @type Array
         */
        this._tags = properties.tags;

        /**
         * Buildingblock type
         * @type String
         * @private
         */
        this._typeName = typeName;

        /**
         * InferenceEngine
         * @type InferenceEngine
         * @private @member
         * @abstract
         */
        this._inferenceEngine = inferenceEngine;


        /**
         * Building block sets of the palettes
         * @type Array
         * @private
         */
        this._buildingBlockSets = this._getSets();

        /**
         * Palette Controller
         * @type PaletteController
         * @private @member
         */
        this._paletteController = null;


        /**
         * Screen canvas position cache
         * @private
         * @type ScreenCanvasCache
         */
        this._canvasCache = null;


        /**
         * @type dijit.layout.BorderContainer
         * @private @member
         */
        this._inspectorArea = new dijit.layout.BorderContainer({
            "region":"bottom",
            "design":"horizontal",
            "style":"height: 180px; z-index:21 !important;",
            "minSize":"100",
            "maxSize":"220",
            "persist":false,
            "splitter":true
        });

        /**
         * @type PropertiesPane
         * @private @member
         */
        this._propertiesPane = new PropertiesPane(this._inspectorArea);

        /**
         * Table representing the different facts of the screenflow
         * @type FactPane
         * @private @member
         */
        this._factPane = new FactPane(this._inspectorArea);

        /**
         * Main border container
         * @type dijit.layout.BorderContainer
         * @private @member
         */
        this._mainBorderContainer = null;

        /**
         * Has unsaved changes control variable
         * @type Boolean
         * @private
         */
        this._isDirty = false;

        /**
         * An operation pending to be executed when
         * the saving process is finished
         * @type Function
         * @private
         */
        this._pendingOperation = null;


         /**
         * Main border container
         * @type dijit.layout.BorderContainer
         * @private @member
         */
        this._designContainer = new dijit.layout.BorderContainer({
            region: 'center',
            design: 'sidebar',
            splitter: true,
            gutters: false
        });

        /**
         * Areas of the canvas
         * @type Hash
         * @private
         */
        this._areas = this._getAreas();

        // Adding the dropping areas to the document
        this._areas.values().each(function(area) {
            var contentPane = area.getWidget();
            this._designContainer.addChild(contentPane);

            var contentNode = area.getNode();

            contentNode.observe('click', function() {
                this._onClick();
            }.bind(this));
            contentNode.observe('dblclick', function() {
                this._onClick();
            }.bind(this));
        }.bind(this));

        this._renderMainUI();

         /**
         * This property represents the selected element
         * @type BuildingBlockInstance
         * @private @member
         */
        this._selectedElement = null;

        /**
         * The document description
         * @type BuildingBlockDescription
         * @private @member
         */
        this._description = this._getDescription(properties);

        /**
         * Properties dialog
         * @type PropertiesDialog
         * @private
         */
        this._propertiesDialog = new PropertiesDialog(this._typeName, this._description,
                                                        this._onPropertiesChange.bind(this));

        if (this._description.getId()) {
            // We are loading the document
            this._canvasCache = this._getCanvasCache(properties);
        }
    },

    /**
     * Returns the selected element for the screenflow document
     * @type ComponentInstance
     */
    getSelectedElement: function () {
        return this._selectedElement;
    },


    /**
     * Returns the BuildingBlock Description for the screenflow document
     * @type ScreenDescription
     */
    getBuildingBlockDescription: function () {
        return this._description;
    },

    /**
     * Implementing event listener
     * @override
     */
    modified: function(/** ComponentInstance */ element) {
        this._updatePanes();
        this._setDirty(true);
    },


    /**
     * Implementing event listener
     */
    elementClicked: function(/** ComponentInstance */ element) {
        this._setSelectedElement(element);
    },

    /**
     * Implementing event listener
     */
    elementDblClicked: function(/** ComponentInstance */ element, /** Event */ e) {
        this._setSelectedElement(element);
    },

    /**
     * Implementing event listener
     */
    positionUpdated: function(/** ComponentInstance */ element, /** Object */ position) {
        this._setDirty(true);
    },

    /**
     * Implementing event listener
     */
    orientationUpdated: function(/** ComponentInstance */ element, /** Integer */ orientation) {
        this._setDirty(true);
    },

    /**
     * Key press event handler
     * @override
     */
    onKeyPressed: function(/** String */ key) {
        switch(key) {
            case 'delete':
                this._startDeletingSelectedElement();
                break;
            case 'space':
                this._previewSelectedElement();
                break;
            default:
                // Ignore
                break;
        }
    },

    /**
     * @override
     */
    getMenuElements: function() {
        return {
                'file': {
                    'type': 'SubMenu',
                    'label': 'File',
                    'weight': 1,
                    'children': {
                        'save': {
                            'type': 'Action',
                            'action': new MenuAction({
                                'label': 'Save',
                                'handler': function() {
                                    this._save();
                                }.bind(this),

                                'shortcut': 'Alt+S'
                            }),
                            'weight': 1,
                            'group': 1
                        },
                        'saveas': {
                            'type': 'Action',
                            'action': new MenuAction({
                                'label': 'Save as...',
                                'handler': function() {
                                    this._saveAs();
                                }.bind(this)
                            }),
                            'weight': 2,
                            'group': 1
                        }
                    }
                }
            };
    },

    deleteInstance: function(instanceId) {
        var title = instanceId.getTitle();
        confirm("You are about to remove " + title + " from canvas. Are you sure?",
            function(confirmed) {
                confirmed && this._deleteInstance(instanceId);
            }.bind(this)
        );
    },

    rotateInstance: function(element) {
        element.setOrientation((element.getOrientation() + 1) % 2);
        var orientation = element.getOrientation();
        element.getView().updateOrientation(orientation);
        element.onRotate(orientation);
        this.orientationUpdated(element, orientation);
    },

    // **************** PRIVATE METHODS **************** //

    /**
     * Inits the catalogue population
     * @private
     */
    _start: function() {
        this._paletteController = new PaletteController(this._buildingBlockSets,
                                        this._areas.values(), this._inferenceEngine);

        this._renderPaletteArea();
        this._configureToolbar();
        if (this._buildingBlockSets.size() > 0) {
            Utils.showMessage("Loading building blocks");
        }
        var paletteStatus = this._getEmptyPalette();


        // Start retrieving data
        this._inferenceEngine.findCheck(
                [],
                paletteStatus,
                this._tags,
                'reachability',
                this._findCheckCallback.bind(this)
        );
        var domainConceptSet = this._buildingBlockSets.detect(function(set) {
            return set.constructor == DomainConceptSet;
        })
        if (domainConceptSet) {
            domainConceptSet.startRetrievingData();
        }
        if (this._description.getId() == null) {
            this._setDirty(true);
        }
    },


    /**
     * Select an element in the document
     * @param element ComponentInstance
     *      Element to be selected for the
     *      Screenflow document.
     * @private
     */
    _setSelectedElement: function (element) {
        if (this._selectedElement != null) {
            this._selectedElement.getView().setSelected(false);
        }

        if (element != undefined) {
            this._selectedElement = element;
            this._selectedElement.getView().setSelected(true);
        } else {
            this._selectedElement = null;
        }

        this._updateToolbar(this._selectedElement);

        if (element) {
            this._refreshReachability();
        } else {
            this._updatePanes();
        }
    },


    /**
     * This function init the process of deleting the element
     * @private
     */
    _startDeletingSelectedElement: function () {
        if (this._selectedElement != null) { //Delete an element from the canvas
            var title = null;
            if (this._selectedElement.getTitle()){
                title = 'the element "' + this._selectedElement.getTitle() + '"';
            } else {
                title = "the selected element";
            }

            confirm("You are about to remove " + title + " from canvas. Are you sure?",
                    function(/** Boolean */ confirmed) {
                        if (confirmed) {
                            this._deleteSelectedElement();
                        }
                    }.bind(this)
            );
        }
    },

    /**
     * This function rotate the element
     * @private
     */
    _rotateSelectedElement: function () {
        var element = this._selectedElement;
        if (element != null) {
            this.rotateInstance(element);
        }
    },


    /**
     * Constructs the document content.
     * @private
     */
    _renderMainUI: function(){

        this._mainBorderContainer = new dijit.layout.BorderContainer({
            design:"sidebar",
            liveSplitters:"false",
            splitter:"true"
        });

        this._mainBorderContainer.addChild(this._renderCenterContainer());

        this._tab.setContent(this._mainBorderContainer.domNode);
    },


    /**
     * Sets the screen saving status
     * @private
     */
    _setDirty: function(/** Boolean */ dirty) {
        this._isDirty = dirty;
        this._toolbarElements.get('save').setEnabled(dirty);
        if (dirty) {
            this._setTitle(this._description.name + '*');
        } else {
            this._setTitle(this._description.name);
        }
    },


    /**
     * Renders the palette area
     * @private
     */
    _renderPaletteArea: function() {
        this._mainBorderContainer.addChild(this._paletteController.getNode());
    },


    /**
     * deletes the selected element
     * @private
     */
    _deleteSelectedElement: function() {
        if (this._selectedElement) {
            this._deleteInstance(this._selectedElement);
            this._setSelectedElement();
        }
    },


    /**
     * Previews the selected element
     * depending on the type of the
     * selected element
     * @private
     */
    _previewSelectedElement: function() {
        if (this._selectedElement) {
            this._selectedElement.showPreviewDialog();
        }
    },


    /**
     * Call whenever a properties dialog has been changed
     * @private
     */
    _onPropertiesChange: function() {
        this._setTitle(this._description.name);
        this._setDirty(true);
    },


    /**
     * Gets the elements of the canvas
     * @type Array
     * @private
     */
    _getCanvasUris: function () {
        var canvas = new Array();

        this._description.getCanvasInstances().each(function(instance) {
            canvas.push({
                'uri': instance.getUri()
            });
        });
        return canvas;
    },


     /**
     * This function returns the data array containing all the
     * facts belonging to the screenflow
     * @type Array
     */
    _getAllFacts: function() {
        var resultHash = new Hash();
        var instanceList = this._description.getCanvasInstances().
                                concat(this._description.getConditionInstances());
        instanceList.each(function(instance){
            if (instance.constructor != PrePostInstance) {
                var preReachability = this._inferenceEngine.getPreconditionReachability(
                            instance.getUri());
                var preconditions = instance.getPreconditionTable(preReachability);
                preconditions.each(function(pre) {
                    if (!resultHash.get(pre[2]/*The uri of the pre*/)) {
                        resultHash.set(pre[2], pre);
                    }
                });

                var postReachability = this._inferenceEngine.isReachable(
                            instance.getUri());
                var postconditions = instance.getPostconditionTable(postReachability);
                postconditions.each(function(post) {
                    if (!resultHash.get(post[2]/*The uri of the post*/)) {
                        resultHash.set(post[2], post);
                    }
                });
            } else {
                //PrePostInstance
                var factInfo = instance.getConditionTable();
                if (!resultHash.get(factInfo[2]/*The uri of the pre/post*/)) {
                    resultHash.set(factInfo[2], factInfo);
                }
            }
        }.bind(this));
        return resultHash.values();
    },


    /**
     * Close document event handler.
     * @overrides
     * @private
     */
    _closeDocument: function() {

        if (this._isDirty) {
            var text = new Element('div', {
                'style': 'text-align:center'
            }).update("The document has unsaved changes. Do you want to save?");
            var dialog = new ConfirmDialog("Warning",
                                           ConfirmDialog.SAVE_DISCARD_CANCEL,
                                           {'callback': this._effectiveCloseDocument.bind(this),
                                            'contents': text});
            dialog.show();
        } else {
            this._effectiveCloseDocument(ConfirmDialog.DISCARD);
        }
        return false;
    },


    /**
     * Effectively close the document
     * @private
     */
    _effectiveCloseDocument: function(/** String */ status) {

        switch (status) {
            case ConfirmDialog.SAVE:
                this._pendingOperation = this._effectiveCloseDocument.bind(this);
                this._save(false);
                break;

            case ConfirmDialog.CANCEL:
                break;

            case ConfirmDialog.DISCARD:
            default:
                var removeFromServer = false;
                if (!this._description.getId()) {
                    removeFromServer = true;
                }
                this._description.getCanvasInstances().each(function(instance) {
                    instance.destroy(removeFromServer, true);
                }.bind(this));

                this._description.getConditionInstances().each(function(instance) {
                    instance.destroy(removeFromServer, true);
                }.bind(this));

                GVS.getDocumentController().closeDocument(this._tabId);

        }
    },


    /**
     * onClick handler
     * @private
     */
    _onClick: function() {
        this._setSelectedElement();
    },


    /**
     * Delete a screen.
     * @param instance ComponentInstance
     *      Instance to be deleted from the
     *      Screenflow document.
     * @abstract
     * @private
     */
    _deleteInstance: function(instance) {
        var node = instance.getView().getNode();
        node.parentNode.removeChild(node);
        this._setSelectedElement();
        instance.destroy(true);
        this._setDirty(true);
        this._refreshReachability();
    },

    _addToArea:function(/** Area */ area, /** ComponentInstance */ instance,
                        /** Object */ position, /** Integer */ orientation){
    	var view = instance.getView();
        var node = view.getNode();
        area.getNode().appendChild(node);
        node.setStyle({
            'left': position.left + "px",
            'top': position.top + "px",
            'position': 'absolute'
        });

        if (instance.constructor == OperatorInstance) {
            view.updateOrientation(orientation);
        }
    },

    /**
     * Starts the process of saving the screenflow
     * @private
     * @override
     */
    _save: function(/** Boolean (Optional) */ _showMessage) {
        var showMessage = Utils.variableOrDefault(_showMessage, true);
        if (showMessage) {
            Utils.showMessage("Saving " + this._typeName);
        }
        var buildingblock = $H(this._description.toJSON())
                            .merge($H(this._getExtraProperties()));
        var params = {'buildingblock':
            Object.toJSON(buildingblock.toObject())
        };
        params = Object.extend(params, this._getExtraParams());
        if (this._description.getId() == null) {
            // Save it for the first time
            PersistenceEngine.sendPost(this._getSaveUri(), params, null,
                                       this, this._onSaveSuccess, this._onSaveError);
        } else {
            var uri = URIs.buildingblock + this._description.getId();
            PersistenceEngine.sendUpdate(uri, params, null,
                                      this, this._onSaveSuccess, this._onSaveError);
        }
    },

    /**
     * Create a copy of the document with a new name/version
     * To be extended
     * @private
     */
    _saveAs: function(/** Boolean */ cloned) {
        if (this._description.getId()) {
            var saveAsDialog = new SaveAsDialog(this._getType(),
                                                this._description.name,
                                                this._description.version,
                                                this._onSaveAsSuccess.bind(this),
                                                cloned);
            saveAsDialog.show();
        } else {
            this._save();
        }
    },

    _onSaveAsSuccess: function(/** String */ name, /** String */ version) {
        this._description.name = name;
        this._description.label['en-gb'] = name;
        this._description.version = version;
        this._description.id = null;
        this._description.creationDate = null;
        this._setTitle(this._description.name);
        this._save();
    },


    /**
     * On success handler when saving
     * @private
     */
    _onSaveSuccess: function(/** XMLHttpRequest */ transport) {
        this._setDirty(false);
        Utils.showMessage("Saved", {
            'hide': true
        });
        this._updatePanes();
        if (this._description.getId() == null) {
            var data = JSON.parse(transport.responseText);
            this._description.addProperties({'id': data.id,
                                            'version': data.version,
                                            'creationDate': data.creationDate});
        }
        if (this._pendingOperation) {
            var operation = this._pendingOperation;
            this._pendingOperation = null;
            operation();
        }
    },

    /**
     * On save error: the screen already exists
     * @private
     */
    _onSaveError: function(/** XMLHttpRequest */ transport) {
        // TODO: think about what to do when a screen cannot be saved
        // (problems with wrong versions)
        if (!this._pendingOperation) {
            Utils.showMessage("Cannot save " + this._typeName, {
                'hide': true,
                'error': true
            });
        } else {
            var operation = this._pendingOperation;
            this._pendingOperation = null;
            this._setDirty(false);
            operation();
        }
    },

    /**
     * Creates the instances coming from a list of uris
     * @private
     */
    _createInstances: function(/** BuildingBlockFactory */ factory, /** Array */ buildingBlocks,
                                /** Area */ area) {
        buildingBlocks.each(function(buildingBlock) {
            // More than one buildingblock for a given uri
            var ids = this._canvasCache.getIds(buildingBlock.uri);
            ids.each(function(id) {
                var instance = factory.getInstance(buildingBlock, this._inferenceEngine);
                instance.setId(id);
                instance.setParams(this._canvasCache.getParams(id));
                var position = this._canvasCache.getPosition(id);
                instance.onFinish(true, position);
                var dropNode = area.getNode();
                $("main").appendChild(instance.getView().getNode());
                var effectivePosition = Geometry.adaptInitialPosition(dropNode,
                                        instance.getView().getNode(), position);
                $("main").removeChild(instance.getView().getNode());
                this._drop(area, instance, effectivePosition, this._canvasCache.getOrientation(id), true);
            }.bind(this));
        }.bind(this));
    },

    /**
     * Returns the areas of the document
     * @private
     * @abstract
     * @type Hash
     */
    _getAreas:function() {
        throw "Abstract method invocation: PaletteDocument::_getAreas";
    },

    /**
     * Returns the sets of the document
     * @private
     * @abstract
     * @type Array
     */
    _getSets:function() {
        throw "Abstract method invocation: PaletteDocument::_getSets";
    },

    /**
     * Gets the document description
     * @abstract
     * @private
     * @type BuildingBlockDescription
     */
    _getDescription: function(/** Object */ properties) {
        throw "Abstract method invocation: PaletteDocument::_getDescription";
    },

    /**
     * Get the canvas cache for loading
     * @abstract
     * @private
     * @type String
     */
    _getCanvasCache: function(/** Object */ properties) {
        throw "Abstract method invocation: PaletteDocument::_getCanvasCache";
    },

    /**
     * This function creates the area containing the canvas
     * and the inspectors
     * @abstract
     * @private
     */
    _renderCenterContainer: function() {
        throw "Abstract method invocation. PaletteDocument::_renderCenterContainer";
    },

    /**
     * Updates the toolbar with the selected element
     * @private
     */
    _updateToolbar: function(/** ComponentInstance */ element) {
        // Do nothing
    },

    /**
     * Updates the panes with the selected element
     * @private
     */
    _updatePanes: function() {
        // Do nothing
    },

    /**
     * Returns extra params for specific building blocks
     * @type Object
     * @private
     */
    _getExtraParams: function() {
        return {};
    },

    /**
     * Returns extra properties of the building block
     * @type Object
     * @private
     */
    _getExtraProperties: function() {
        return {};
    },

    /**
     * Returns the save uri
     * @type String
     * @private
     * @abstract
     */
    _getSaveUri: function() {
        throw "Abstract method invocation. PaletteDocument::_getSaveUri";
    },

    /**
     * Returns the empty palette status
     * @type Object
     * @private
     * @abstract
     */
    _getEmptyPalette: function() {
        throw "Abstract method invocation. PaletteDocument::_getEmptyPalette";
    },

    /**
     * Get the document type for saving purposes
     * @type String
     * @private
     * @abstract
     */
    _getType: function() {
        throw "Abstract method invocation. PaletteDocument::_getType";
    }
});

// vim:ts=4:sw=4:et:

var WelcomeDocument = Class.create(AbstractDocument,
    /** @lends WelcomeDocument.prototype */ {

    /**
     * WelcomeDocument is the initial document and allows the user to access
     * to the most important GVS features as starting point.
     * @constructs
     * @extends AbstractDocument
     */
    initialize: function($super) {
        $super("Welcome!");
        this._populate ();
    },



    // **************** PUBLIC METHODS **************** //

    // **************** PRIVATE METHODS **************** //


    /**
     * Constructs the document content.
     * @private
     */
    _populate: function(){
        var content = this.getNode();

        content.addClassName("welcome");

        var logo = new Element('img', {
            'src': URIs.logoFast
        });
        content.appendChild(logo);
        var documentTitle = new Element ("div", {"class": "documentTitle"}).
            update("Welcome to the Gadget Visual Storyboard!");
        content.appendChild(documentTitle);
        var welcomeIntro = new Element ("div", {"id": "intro"}).
            update("Choose your desired action:");
        content.appendChild (welcomeIntro);

        var newScreenflowButton = new dijit.form.Button({
            label: "Edit a new Screenflow",
            onClick: function() {GVS.action("newScreenflow");}}
        );
        var openScreenflowButton = new dijit.form.Button({
            label: "Browse Screenflows...",
            onClick: function() {GVS.action("browseScreenflows");}}
        );

        var newScreenButton = new dijit.form.Button({
            label: "Edit a new Screen",
            onClick: function() {GVS.action("newScreen");}}
        );
        var browseScreensButton = new dijit.form.Button({
            label: "Browse Screens...",
            onClick: function() {GVS.action("browseScreens");}}
        );

        var newBuildingBlockButton = new dijit.form.Button({
            label: "Add a Building Block from sources",
            onClick: function() {GVS.action("newBuildingBlock");}}
        );

        var browseBuildingBlockButton = new dijit.form.Button({
            label: "Browse Building Blocks...",
            onClick: function() {GVS.action("browseBuildingBlocks");}}
        );

        var openWrapperServiceButton = new dijit.form.Button({
            label: "Create a resource from a service",
            onClick: function() {GVS.action("wrapperService");}}
        );
        var mediationButton = new dijit.form.Button({
            label: "Create operator for concepts",
            onClick: function() {GVS.action("mediation");}}
        );
        var manageConceptsButton = new dijit.form.Button({
            label: "Manage Domain Concepts",
            onClick: function() {GVS.action("manageConcepts");}}
        );

        var buttonsContainer = new Element("div");
        buttonsContainer.appendChild(new Element("div").update("Screenflows"));
        buttonsContainer.appendChild(newScreenflowButton.domNode);
        buttonsContainer.appendChild(new Element("br"));
        buttonsContainer.appendChild(openScreenflowButton.domNode);
        buttonsContainer.appendChild(new Element("div").update("Screens"));
        buttonsContainer.appendChild(newScreenButton.domNode);
        buttonsContainer.appendChild(new Element("br"));
        buttonsContainer.appendChild(browseScreensButton.domNode);

        var wrapper = new Element("div", {
            "style": "visibility:hidden;"
        });
        wrapper.appendChild(newBuildingBlockButton.domNode);
        wrapper.appendChild(new Element("br"));
        wrapper.appendChild(browseBuildingBlockButton.domNode);
        wrapper.appendChild(new Element("br"));
        wrapper.appendChild(document.createTextNode("---"));
        if (URIs.wrapperService != "") {
            wrapper.appendChild(new Element("br"));
            wrapper.appendChild(openWrapperServiceButton.domNode);
        }
        if (URIs.dataMediation != "") {
            wrapper.appendChild(new Element("br"));
            wrapper.appendChild(mediationButton.domNode);
        }
        if (URIs.factTool != "") {
            wrapper.appendChild(new Element("br"));
            wrapper.appendChild(manageConceptsButton.domNode);
        }


        var link = new Element("a", {
            "href": "javascript:"
        }).update("Show advanced features...");
        link.observe("click", function(e) {
            if (wrapper.style.visibility == "hidden") {
                wrapper.setStyle({"visibility":"visible"});
                link.update("Hide advanced features...");
            } else {
                wrapper.setStyle({"visibility":"hidden"});
                link.update("Show advanced features...");
            }
        });

        buttonsContainer.appendChild(new Element("br"));
        buttonsContainer.appendChild(new Element("br"));
        buttonsContainer.appendChild(link);
        buttonsContainer.appendChild(new Element("br"));
        buttonsContainer.appendChild(new Element("br"));
        buttonsContainer.appendChild(wrapper);

        content.appendChild(buttonsContainer);
    }
});

// vim:ts=4:sw=4:et:

var DocumentController = Class.create(
    /** @lends DocumentController.prototype */ {

    /**
     * Container that manages the set of open documents.
     * @constructs
     */
    initialize: function() {
        /**
         * List of open documents
         * @type Hash
         * @private
         */
        this._documents = new Hash();

        /**
         * Currently selected document
         * @type AbstractDocument
         * @private
         */
        this._currentDocument = null;

        /**
         * Welcome Document, if any
         * @type WelcomeDocument
         * @private
         */
        this._welcomeDocument = null;

        /**
         * The keypress registry
         * @type KeyPressRegistry
         * @private
         */
        this._registry = new KeyPressRegistry();

        /**
         * Toolbar handler object
         * @type Toolbar
         * @private @member
         */
        this._toolbar = new Toolbar();

        /**
         * Menu handler
         * @type Menu
         * @private
         */
        this._menu = new Menu(this._registry);

        /**
         * The document container element
         * @type diji.layout.TabContainer
         */
        this._documentContainer = dijit.byId("documentContainer");

        // Arming onFocus callback
        dojo.connect(this._documentContainer, "selectChild", function(tab){
            DocumentController.prototype._selectDocument.apply(this, arguments);
        }.bind(this));

        // The welcome document is the initial document
        this.showWelcomeDocument();

        this._registry.addHandler('delete', this._onKeyPressed.bind(this));
        this._registry.addHandler('space' , this._onKeyPressed.bind(this));
    },

    // **************** PUBLIC METHODS **************** //


    /**
     * Creates a new screenflow document
     */
    createScreenflow: function(/** String */ name, /** String */ tags,
                               /** String */ version){
        var screenflow = new ScreenflowDocument({
            'name': name,
            'tags': tags,
            'version': version
        });
        this.addDocument(screenflow);
    },

    /**
     * Opens an existing screenflow by its id
     */
    loadScreenflow: function(/** String */ id) {

        var uri = URIs.buildingblock + id;
        PersistenceEngine.sendGet(uri, {'mine':this}, this._onScreenflowLoadSuccess,
                                        this._onLoadError);
    },

    /**
     * Opens an existing screenflow by its id
     */
    cloneScreenflow: function(/** String */ id) {

        var uri = URIs.buildingblock + id;
        PersistenceEngine.sendGet(uri, {'mine':this, 'cloned': true},
                                        this._onScreenflowLoadSuccess,
                                        this._onLoadError);
    },


    /**
     * Creates a new screen document
     */
    createScreen: function(/** String */ name, /** Array */ tags,
                            /** String */ version){
        var screen = new ScreenDocument({
                'name': name,
                'tags': tags,
                'version': version
            });
        this.addDocument(screen);
    },

    /**
     * Opens an existing screen by its id
     */
    loadScreen: function(/** String */ id) {

        var uri = URIs.buildingblock + id;
        PersistenceEngine.sendGet(uri, {'mine':this}, this._onScreenLoadSuccess,
                                    this._onLoadError);
    },

    /**
     * Clones an existing screen
     */
    cloneScreen: function(/** String */ id) {
        var uri = URIs.buildingblock + id;
        PersistenceEngine.sendGet(uri, {'mine':this, 'cloned': true},
                                    this._onScreenLoadSuccess,
                                    this._onLoadError);
    },

    loadBuildingBlock: function(/** String */ id){
        var uri = URIs.buildingblock + id;
         PersistenceEngine.sendGet(uri, {'mine':this}, function(transport) {
            var bBData = JSON.parse(transport.responseText);
            var buildingBlock = new BuildingBlockDocument(bBData);
            this.mine.addDocument(buildingBlock);
            buildingBlock.createTextEditors();
        }, this._onLoadError);
    },

    /**
     * Creates a new buildingblock document
     */
    createForm: function(/** String */ name, /** Array */ tags,
                            /** String */ version){
        this._createBuildingBlock(name,tags,version,
            BuildingBlockDocument.FORM);
    },

    /**
     * Creates a new buildingblock document
     */
    createOperator: function(/** String */ name, /** Array */ tags,
                            /** String */ version){
        this._createBuildingBlock(name,tags,version,
            BuildingBlockDocument.OPERATOR);
    },

    /**
     * Creates a new buildingblock document
     */
    createResource: function(/** String */ name, /** Array */ tags,
                            /** String */ version){
        this._createBuildingBlock(name,tags,version,
            BuildingBlockDocument.RESOURCE);
    },

    /**
     * Opens an external tool
     */
    openExternalTool: function(title, uri) {
        var tool = new ExternalDocument(title, uri);
        this.addDocument(tool);
    },

    /**
     * Shows the welcome document
     */
    showWelcomeDocument: function() {
        if (this._welcomeDocument) {
            this._documentContainer.selectChild(this._welcomeDocument.getTabId());
            this._selectDocument(this._welcomeDocument.getTabId());
        } else {
            this._welcomeDocument = new WelcomeDocument();
            this.addDocument(this._welcomeDocument);
        }
    },

    /**
     * Adds a new document.
     */
    addDocument: function(doc){
        this._documents.set(doc.getTabId(), doc);
        this._documentContainer.addChild(doc.getTab());

        if (this._documents.keys().size() > 1) {
            this._documentContainer.selectChild(doc.getTabId());
        }
    },

    /**
     * Gets a document.
     * @param docId: document Id
     * @type AbstractDocument
     */
    getDocument: function(docId) {
        return this._documents.get(docId);
    },

    /**
     * Gets the currently focused document.
     * @type AbstractDocument
     */
    getCurrentDocument: function(){
        return this._currentDocument;
    },


    /**
     * this function closes a document by its Id
     * @param id String
     */
    closeDocument: function(id) {

        // Go to the previous tab and not to the
        // initial tab
        this._documentContainer.back();

        // Remove the reference to the welcome document, if
        // the document being closed is it
        if (this._welcomeDocument && this._welcomeDocument.getTabId() == id) {
            this._welcomeDocument = null;
        }

        // Remove the tab
        this._documentContainer.removeChild(dijit.byId(id));
        dijit.byId(id).destroyRecursive(true);

        this._documents.unset(id);


        if ($H(this._documents).keys().length == 0){
             //Show the welcome Document
             this.showWelcomeDocument();
        }
    },

    /**
     * Returns the toolbar object
     * @type Toolbar
     */
    getToolbar: function() {
        return this._toolbar;
    },


    /**
     * Returns the menu object
     * @type Menu
     */
    getMenu: function() {
        return this._menu;
    },
    /**
     *
     * @type KeyPressRegistry
     */
    getKeyPressRegistry: function() {
        return this._registry;
    },
    // **************** PRIVATE METHODS **************** //


    /**
     * Select Document event handler.
     * @private
     */
    _selectDocument: function( /** {String|DOMNode} */ tab) {
        var id;

        if (tab.id) {  // it is tab widget
            id = tab.id;
        } else { //it is a string id
            id = tab;
        }
        if (this._currentDocument) {
            this._currentDocument.hide();
        }
        this._currentDocument = this._documents.get(id);
        this._currentDocument.show();

        this._toolbar.setModel(1, this._currentDocument);
        this._menu.setModel('document', this._currentDocument);
        // FIXME: Workaround for removing focus from the tab node
        $("logout").focus();
        $("logout").blur();
    },


    /**
     * OnKeyPressed listener
     * @private
     */
    _onKeyPressed: function(/** String */ key) {
        this._currentDocument.onKeyPressed(key);
    },

    /**
     * On screenflow load success
     * @private
     */
    _onScreenflowLoadSuccess: function (/** XMLHttpRequest */ transport) {
        var screenflowData = JSON.parse(transport.responseText);
        screenflowData.cloned = this.cloned;
        screenflowData.uri = null;
        var screenflow = new ScreenflowDocument(screenflowData);
        this.mine.addDocument(screenflow);
        screenflow.loadInstances();
    },

    /**
     * On screen load success
     * @private
     */
    _onScreenLoadSuccess: function (/** XMLHttpRequest */ transport) {
        var screenData = JSON.parse(transport.responseText);
        screenData.cloned = this.cloned;
        screenData.uri = null;
        var screen = new ScreenDocument(screenData);
        this.mine.addDocument(screen);
        screen.loadInstances();
    },

    /**
     * Creates a new Building block
     * @private
     */
    _createBuildingBlock: function(/** String */ name, /** Array */ tags,
                                  /** String */ version, /** String */ type) {
        var buildingBlock = new BuildingBlockDocument({
            'type': type,
            'name': name,
            'tags': tags,
            'version': version
        });
        this.addDocument(buildingBlock);
        buildingBlock.createTextEditors();
    },


    _onLoadError: function() {
        Utils.showMessage("Can not open the selected element", {
            'error': true,
            'hide': true
        });
    }
});

// vim:ts=4:sw=4:et:

var ScreenflowDocument = Class.create(PaletteDocument,
    /** @lends ScreenflowDocument.prototype */ {

    /**
     * Screenflow document.
     * @constructs
     * @extends PaletteDocument
     */
    initialize: function($super, /** Object */ properties) {
        /**
         * Panel that will contain the plans
         * @private
         * @type PlanPanel
         */
        this._planPanel = new PlanPanel();

        $super("Screenflow", properties, new ScreenflowInferenceEngine());

        this._planPanel.setDropZone(this._areas.get('screen'));
        this._planPanel.setInferenceEngine(this._inferenceEngine);

        /**
         * @type GadgetDialog
         * @private @member
         */
        this._gadgetDialog = new GadgetDialog(this._description);

        /**
         * @type Player
         * @private @member
         */
        this._player = new ScreenflowPlayer();

        this._start();

        /**
         * "Edit the selected element" menu action
         * @type MenuAction
         * @private
         */
        this._editMenuAction = new MenuAction({
                            'label': 'Edit screen',
                            'weight':1,
                            'enabled': false,
                            'handler': function() {
                                this._cloneSelectedElement();
                            }.bind(this)});

        // Are the unreachable items shown?
        this._unreachableShown = true;
    },


    // **************** PUBLIC METHODS **************** //

    /**
     * Loads the definition of a screenflow, when the screen is opened
     */
    loadInstances: function() {

        var screenFactory = Catalogue.
            getBuildingBlockFactory(Constants.BuildingBlock.SCREEN);
        screenFactory.cacheBuildingBlocks(this._canvasCache.getScreenURIs(),
                    this._onScreenLoaded.bind(this));
    },


    /**
     * Implementing event listener
     * @override
     */
    positionUpdated: function(/** ComponentInstance */ element, /** Object */ position) {
        var isChanged;
        switch (element.constructor) {
            case ScreenInstance:
                isChanged = this._description.updateScreen(element.getUri(), position);
                break;
            case PrePostInstance:
                isChanged = this._description.updatePrePost(element.getUri(), position);
                break;
        }
        if (isChanged) {
            this._setDirty(true);
        }
    },

    /**
     * @override
     */
    getMenuElements: function($super) {
        var parentMenu = $super();
        return Object.extend(parentMenu, {
            'edit': {
                'type': 'SubMenu',
                'weight': 2,
                'label': 'Edit',
                'children': {
                    'clone': {
                        'type': 'Action',
                        'action': this._editMenuAction,
                        'group': 0
                    }
                }
            }
        });
    },

    /**
     * Creates a clone of the element screen
     */
    cloneElement: function(element) {
        var description = element.getBuildingBlockDescription();
        if (description.definition) {
            GVS.getDocumentController().cloneScreen(description.id);
        }
    },

    /**
     * Creates a plan taking as end the Element
     */
    getPlansElement: function(element) {
        var uri = element.getUri();
        var canvas = this._getCanvasUris();
        this._inferenceEngine.getPlans(canvas, uri,
            this._onSuccessGetPlans.bind(this)
        );
    },

    // **************** PRIVATE METHODS **************** //
    /**
     * Returns the areas of the document
     * @override
     * @private
     * @type Hash
     */
    _getAreas: function() {
        // Dropping areas
        var screenArea = new Area('screen',
                                $A([Constants.BuildingBlock.SCREEN]),
                                this._drop.bind(this),
                                {splitter: true, region: 'center'});
        var preArea = new Area('pre',
                                $A([Constants.BuildingBlock.DOMAIN_CONCEPT]),
                                this._drop.bind(this),
                                {splitter: true, region: 'left', minWidth:100});
        var postArea = new Area('post',
                                $A([Constants.BuildingBlock.DOMAIN_CONCEPT]),
                                this._drop.bind(this),
                                {splitter: true, region: 'right', minWidth:100});
        screenArea.getNode().parentNode.appendChild(this._planPanel.getNode());

        return $H({
            'screen': screenArea,
            'pre': preArea,
            'post': postArea
        });

    },

    /**
     * @private
     * @override
     */
    _getSets: function() {
        // Palette sets
        var screenSet = new BuildingBlockSet(this._tags, Catalogue.
                            getBuildingBlockFactory(Constants.BuildingBlock.SCREEN));
        var domainConceptSet = new DomainConceptSet(this._tags, Catalogue.
                            getBuildingBlockFactory(Constants.BuildingBlock.DOMAIN_CONCEPT));

        return [screenSet, domainConceptSet];
    },

    /**
     * Gets the document description
     * @override
     * @private
     * @type BuildingBlockDescription
     */
    _getDescription: function(/** Object */ properties) {
        // Screen Definition

        var description;
        if (properties.id) {
            // An existing screen
            description = Object.clone(properties);
            // Removing the definition, which will be interpreted in other
            // functions
            /*description.definition = null;
            description.precondition = null;
            description.postconditions = null;*/
            // TODO
        } else {
            // A new screenflow
            description = {
                'label': {'en-gb': properties.name},
                'name': properties.name,
                'version': properties.version,
                'tags':  this._tags,
                "creator": GVS.getUser().getUserName(),
                "description": {"en-gb": "Please fill the description..."},
                "rights": "http://creativecommons.org/",
                "creationDate": null,
                "icon": "http://fast.morfeo-project.eu/icon.png",
                "screenshot": "http://fast.morfeo-project.eu/screenshot.png",
                "homepage": "http://fast.morfeo-project.eu/"
            };
        }

        return new ScreenflowDescription(description);
    },

    /**
     * Get the canvas cache for loading
     * @override
     * @private
     * @type String
     */
    _getCanvasCache: function(/** Object */ properties) {
        return new ScreenflowCanvasCache(properties);
    },

    /**
     * Returns the save uri
     * @type String
     * @private
     * @override
     */
    _getSaveUri: function() {
        return URIs.screenflow;
    },

    /*
     * @override
     */
    _getType: function() {
        return "screenflow";
    },


    /**
     * Returns the empty palette status
     * @type Object
     * @private
     * @override
     */
    _getEmptyPalette: function() {
        return [];
    },


    /**
     * Implementing DropZone interface
     * @type Object
     *      It must contain two variables
     *      * Boolean accepted: the element is accepted
     *      * Boolean handledByDropZone: The position of the element
     *                                   will be defined by the dropzone and
     *                                   not by the draghandler
     */
    _drop: function(/** Area */ area, /** ComponentInstance */ instance, /** Object */ position,
        /** Boolean (Optional) */ _isLoading) {
        var isLoading = Utils.variableOrDefault(_isLoading, false);

        // Reject repeated elements (except domain concepts)
        if (this._description.contains(instance.getUri())) {
            Utils.showMessage("There is another element like this. Cannot add it", {
                'hide': true,
                'error': true
            });
            return false;
        }

        if (!instance.getId()) {
            instance.setId(UIDGenerator.generate(instance.getTitle()));
        } else {
            if (instance.constructor != PrePostInstance) {
                UIDGenerator.setStartId(instance.getId());
            }
        }

        if (instance.constructor != PlanInstance) {
            this._addToArea(area, instance, position);
            instance.setEventListener(this);
            instance.enableDragNDrop(area,[area]);
        }

        switch (instance.constructor) {
            case ScreenInstance:
                this._description.addScreen(instance, position);
                if (!isLoading) {
                    this._setSelectedElement(instance);
                }

                break;

            case PrePostInstance:
                instance.setChangeHandler(this._onPrePostChange.bind({
                        'mine':this,
                        'position': position,
                        'isLoading': isLoading
                    }));
                if (area.getNode().className.include("pre")) {
                    instance.setType("pre");
                } else if (area.getNode().className.include("post")) {
                    instance.setType("post");
                }
                break;

            case PlanInstance:
                this._planPanel.hide();
                this._addPlan(instance, position);
                this._refreshReachability();
                this._setSelectedElement();
                break;
        }
        this._setDirty(true);
        // Only for piping
        //instance.getView().addGhost();
        return true;
    },

    /**
     * Delete an instance.
     * @param ComponentInstance
     *      Instance to be deleted from the
     *      Screenflow document.
     * @override
     */
    _deleteInstance: function($super, /** ComponentInstance */ instance) {

        this._description.remove(instance.getUri());
        $super(instance);
    },

    /**
     * Callback to be called when the findCheck operation
     * finishes
     * @private
     */
    _findCheckCallback: function(/** Array */ uris) {
        // Update screen palette
        var screenPalette = this._paletteController.getPalette(Constants.BuildingBlock.SCREEN);
        var screenSet = screenPalette.getBuildingBlockSet();
        screenSet.addURIs(uris);
    },

    _configureToolbar: function() {
        this._addToolbarElement('save', new ToolbarButton(
                'Save the current screenflow',
                'save',
                this._save.bind(this),
                false // disabled by default
            ));
        this._addToolbarElement('properties', new ToolbarButton(
                'Edit screenflow properties',
                'properties',
                this._propertiesDialog.show.bind(this._propertiesDialog),
                true
            ));
        this._addToolbarElement('player', new ToolbarButton(
                'Play Screenflow',
                'player',
                this._playScreenflow.bind(this),
                false // disabled by default
            ));
        this._addToolbarElement('debugger', new ToolbarButton(
                'Debug (Test) Screenflow',
                'debugger',
                this._debugScreenflow.bind(this),
                false // disabled by default
            ));
        this._addToolbarElement('build', new ToolbarButton(
                'Build Gadget',
                'build',
                this._buildGadget.bind(this),
                false // disabled by default
            ));
        this._addToolbarElement('refresh', new ToolbarButton(
                'Refresh the buildingBlocks catalog',
                'refresh',
                this._refresh.bind(this),
                true
            ));
        this._addToolbarElement('toggleVisibility', new ToolbarButton(
                'Toggle Unreachable screens visibility',
                'toggle',
                this._toggleUnreachableScreens.bind(this),
                true
            ));
        this._addToolbarElement('previewElement', new ToolbarButton(
                'Preview selected element',
                'preview',
                this._previewSelectedElement.bind(this),
                false // disabled by default
            ));
        this._addToolbarElement('planner', new ToolbarButton(
                'Create a plan for this screen',
                'planner',
                this._getPlans.bind(this),
                false // disabled by default
            ));
        this._addToolbarElement('cloneElement', new ToolbarButton(
                'Clone selected element',
                'clone',
                this._cloneSelectedElement.bind(this),
                false // disabled by default
            ));
        this._addToolbarElement('deleteElement', new ToolbarButton(
                'Delete selected element',
                'delete',
                this._startDeletingSelectedElement.bind(this),
                false // disabled by default
            ));

    },

    /**
     * This function updates all the BuildingBlocks
     * Elements: canvas and palettes
     * @private
     */
    _refresh: function() {
        var canvas = this._getCanvasUris();
        var palette = this._paletteController.getComponentUris(Constants.BuildingBlock.SCREEN);

        this._inferenceEngine.findCheck(
                canvas,
                palette,
                this._tags,
                'reachability',
                this._findCheckCallback.bind(this)
        );
    },

    /**
     * This function updates the toolbar status
     * @private
     */
    _updateToolbar: function(/** ComponentInstance */ element) {
        this._toolbarElements.get('deleteElement').setEnabled(element!=null);
        this._toolbarElements.get('previewElement').setEnabled(element!=null);
        this._toolbarElements.get('planner').setEnabled(
            element!=null && element.constructor == ScreenInstance
        );
        var enableClone = (element!=null &&
                            element.constructor == ScreenInstance &&
                            element.getBuildingBlockDescription().definition != null);
        this._toolbarElements.get('cloneElement').setEnabled(enableClone);
        this._editMenuAction.setEnabled(enableClone);
    },

    /**
     * This function creates the area containing the canvas
     * and the inspectors
     * @override
     */
    _renderCenterContainer: function() {

        var centerContainer = new dijit.layout.BorderContainer({
            design:"headline",
            liveSplitters:"false",
            region:"center"
        });

        this._designContainer.domNode.addClassName('canvas');

        centerContainer.addChild(this._designContainer);
        centerContainer.addChild(this._inspectorArea);

        return centerContainer;
    },


    /**
     * This function creates
     * the inspector area
     * @private
     */
    _createInspectorArea: function(){

        var inspectorArea = new dijit.layout.BorderContainer({
            region:"bottom",
            design:"horizontal",
            style:"height: 180px;",
            minSize:"100",
            maxSize:"220",
            persist:"false",
            splitter:true
            });
        return inspectorArea;
    },



    /**
     * This function updates the reachability in all
     * Elements: canvas and palettes
     * @private
     */
    _refreshReachability: function (/** Boolean (Optional) */_isFindCheck) {
        var isFindCheck = Utils.variableOrDefault(_isFindCheck, false);
        var canvas = this._getCanvasUris();
        var palette = this._paletteController.getComponentUris(Constants.BuildingBlock.SCREEN);

        if (isFindCheck) {
            this._inferenceEngine.findCheck(canvas, palette, this._tags,
                                    'reachability', this._updatePanes.bind(this));
        } else {
            this._inferenceEngine.check(canvas, palette, this._tags,
                                    'reachability', this._updatePanes.bind(this));
        }

        // FIXME: we must learn about document reachability from the inference
        //        engine. By the moment, one screen == deployable screenflow ;)
        this._toolbarElements.get('build').setEnabled(canvas.size() > 0);
        this._toolbarElements.get('player').setEnabled(canvas.size() > 0);
        this._toolbarElements.get('debugger').setEnabled(canvas.size() > 0);
    },


    /**
     * This function updates the properties table and
     * the pre/post pane depending on the selected element
     * @private
     */
    _updatePanes: function() {
        var facts = this._getAllFacts();
        if (!this._selectedElement) {
            this._propertiesPane.fillTable(this._description);
            this._factPane.fillTable([], [], facts);
        } else {
            this._propertiesPane.fillTable(this._selectedElement);

            if (this._selectedElement.constructor == ScreenInstance) {
                var preReachability = this._inferenceEngine.getPreconditionReachability(
                            this._selectedElement.getUri());
                var preconditions = this._selectedElement.getPreconditionTable(preReachability);

                var postReachability = this._inferenceEngine.isReachable(
                            this._selectedElement.getUri());
                var postconditions = this._selectedElement.getPostconditionTable(postReachability);

                this._factPane.fillTable(preconditions,postconditions,[]);
            } else {
                //PrePostInstance
                if (this._selectedElement.getType()) {
                    //Pre or post condition
                    var factInfo = [this._selectedElement.getConditionTable(
                        this._inferenceEngine.isReachable(this._selectedElement.getUri())
                    )];
                    this._factPane.fillTable([], [], factInfo);
                }
            }
        }
        this._refreshVisibility();
    },

    /**
     * This function returns the data array containing all the
     * facts belonging to the screenflow
     * @type Array
     */
    _getAllFacts: function() {
        var resultHash = new Hash();
        this._description.getCanvasInstances().each(function(instance) {
            if (instance.constructor == ScreenInstance) {
                var preReachability = this._inferenceEngine.getPreconditionReachability(
                            instance.getUri());
                var preconditions = instance.getPreconditionTable(preReachability);
                preconditions.each(function(pre) {
                    if (!resultHash.get(pre[2]/*The uri of the pre*/)) {
                        resultHash.set(pre[2], pre);
                    }
                });

                var postReachability = this._inferenceEngine.isReachable(
                            instance.getUri());
                var postconditions = instance.getPostconditionTable(postReachability);
                postconditions.each(function(post) {
                    if (!resultHash.get(post[2]/*The uri of the post*/)) {
                        resultHash.set(post[2], post);
                    }
                });
            } else {
                //PrePostInstance
                var factInfo = instance.getConditionTable(
                    this._inferenceEngine.isReachable(instance.getUri())
                );
                if (!resultHash.get(factInfo[2]/*The uri of the pre/post*/)) {
                    resultHash.set(factInfo[2], factInfo);
                }
            }
        }.bind(this));
        return resultHash.values();
    },

    /**
     * Play a screenflow
     * @private
     */
    _playScreenflow: function () {
        if (this._isDirty) {
                this._pendingOperation = this._playScreenflow.bind(this);
                this._save(false);
        } else {
            this._player.playScreenflow(this._description);
        }
    },

    /**
     * Debug a screenflow
     * @private
     */
    _debugScreenflow: function () {
        if (this._isDirty) {
                this._pendingOperation = this._debugScreenflow.bind(this);
                this._save(false);
        } else {
            this._player.debugScreenflow(this._description);
        }
    },

    /**
     * Build a gadget for the screenflow
     * @private
     */
    _buildGadget: function () {
        if (this._isDirty) {
                this._pendingOperation = this._buildGadget.bind(this);
                this._save(false);
        } else {
            this._gadgetDialog.show();
        }
    },

    /**
     * Runs when a *-condition changes
     * @private
     */
    _onPrePostChange: function(/** PrePostInstance */ instance) {
        this.mine._description.addPrePost(instance, this.position);
        if (!this.isLoading) {
            this.mine._refreshReachability();
            this.mine._setSelectedElement(instance);
            this.mine._setDirty(true);
        }
    },

    /**
     * Creates a plan taking as end the selected Element
     * @private
     */
    _getPlans: function() {
        if (this._planPanel.isVisible()) {
            this._planPanel.hide();
        } else {
            this.getPlansElement(this._selectedElement);
        }
    },

    /**
     * Called when the plans are returned
     * @private
     */
    _onSuccessGetPlans: function(/** Array */ plans) {
        if (plans.length > 0 && plans[0].length > 0) {
            this._planPanel.showPlans(plans);
        } else {
            alert("Sorry, but there is not any available plan for the selected screen");
        }
    },


    /**
     * This function adds all the (new) screens of the plan
     * to the screenflow
     * @private
     */
    _addPlan: function(/** PlanInstance */ plan, /** Object */ position){
        var screenPosition = {
            'left': position.left + 3, //with margin
            'top': position.top + 3
        };

        plan.getPlanElements().each(function(screenDescription) {
            if (!this._description.contains(screenDescription.uri)) {
                var screen = new ScreenInstance(screenDescription,
                        this._inferenceEngine);
                this._description.addScreen(screen, screenPosition);
                screen.onFinish(true);

                this._addToArea(this._areas.get('screen'), screen, screenPosition);
                //Incrementing the screen position for the next screen
                screenPosition.left += 108; // Screen size=100 + margin=6 + border=2
                screen.setEventListener(this);
                screen.enableDragNDrop(this._areas.get('screen'),[this._areas.get('screen')]);
            }
        }.bind(this));
    },

    /**
     * On screens loaded
     * @private
     */
    _onScreenLoaded: function() {
        var screenFactory = Catalogue.
                getBuildingBlockFactory(Constants.BuildingBlock.SCREEN);
        var screens = screenFactory.getBuildingBlocks(this._canvasCache.getScreenURIs());
        this._createInstances(screenFactory, screens, this._areas.get('screen'));
        this._loadConditions();
    },

    /**
     * Create the pre and post conditions
     * @private
     */
     _createConditions: function(/** Array */ conditionList, /** DropZone */ area) {
        conditionList.each(function(condition) {
            var description = new PrePostDescription(condition);
            var instance = new PrePostInstance(description, this._inferenceEngine);
            instance.onFinish(true, condition.position);
            var zonePosition = area.getNode();
            $("main").appendChild(instance.getView().getNode());
            var effectivePosition = Geometry.adaptInitialPosition(zonePosition,
                                    instance.getView().getNode(), condition.position);
            $("main").removeChild(instance.getView().getNode());
            this._drop(area, instance, effectivePosition, true);
            this._description.addPrePost(instance, effectivePosition);
        }.bind(this));
    },

    /**
     * Function that loads the pre and post conditions
     * @private
     */
    _loadConditions: function() {
        // Load pre and postconditions
        this._createConditions(this._canvasCache.getPreconditions(), this._areas.get('pre'));
        this._createConditions(this._canvasCache.getPostconditions(), this._areas.get('post'));
        this._setDirty(false);
        this._refreshReachability();
        if (this._description.cloned) {
            this._saveAs(true);
        }
    },

    /**
     * Creates a clone of the selected screen
     * @private
     */
    _cloneSelectedElement: function() {
        this.cloneElement(this._selectedElement);
    },

    /**
     * Toggles the status of the unreachable screens of the palette
     * (hidden/shown)
     * @private
     */
    _toggleUnreachableScreens: function() {
        this._unreachableShown = !this._unreachableShown;
        this._refreshVisibility();
    },

    /**
     * Refreshes the visibility of unreachable screens
     * @private
     */
    _refreshVisibility: function() {

        var screenPalette = this._paletteController.getPalette(Constants.BuildingBlock.SCREEN);
        var paletteNode = screenPalette.getContentNode();

        var visibility = this._unreachableShown ? "block": "none";
        $A(paletteNode.childNodes).each(function(element) {
            if (element.match(".slot")) {

                if (element.firstChild.match(".unsatisfeable")) {
                    element.setStyle({
                        "display": visibility
                    });
                }
                if (element.firstChild.match(".satisfeable")) {
                    element.setStyle({
                        "display": "block"
                    });
                }
            }
        }, this);
    }
});

// vim:ts=4:sw=4:et:

var ScreenDocument = Class.create(PaletteDocument,
    /** @lends ScreenDocument.prototype */ {

    /**
     * Screen document.
     * @constructs
     * @extends PaletteDocument
     */
    initialize: function($super, /** Object */ properties) {

        /**
         * Form instance of the screen, if any
         * @type FormInstance
         * @private
         */
        this._formInstance = null;

        /**
         * Pipe Factory
         * @type PipeFactory
         * @private
         */
        this._pipeFactory = new PipeFactory();


        /**
         * Trigger mapping factory
         * @type TriggerMappingFactory
         * @private
         */
        this._triggerMappingFactory = new TriggerMappingFactory();

        /**
         * List of dojo connection objects
         * @type Array
         * @private
         */
        this._dojoConnections = new Array();

        /**
         * Recommendation Manager
         * @private
         */
        this._recommendationManager = new RecommendationManager();

        /**
         * Whether this ScreenDocument is closing
         * @private
         */
        this._closed = false;

        $super("Screen", properties, new ScreenInferenceEngine());

        this._start();

        function addEventDragSplitter(spl, handler) {
            var moveConnect;

            dojo.connect(spl, "_startDrag", function() {
                moveConnect = dojo.connect(null, "onmousemove", handler);
            });
            dojo.connect(spl, "_stopDrag", function(evt) {
                dojo.disconnect(moveConnect);
            });
        }

        this._repaint = this._repaint.bind(this);

        Event.observe(window, 'resize', this._repaint);

        var leftSplitter = this._mainBorderContainer.getSplitter("left");
        addEventDragSplitter(leftSplitter, this._repaint);

        var bottomSplitter = this._centerContainer.getSplitter("bottom");
        addEventDragSplitter(bottomSplitter, this._repaint);

        this._designContainer.domNode.addClassName('canvas');

        dojo.forEach(["left", "bottom", "right", "top"], function(region) {
            var splitter = this._designContainer.getSplitter(region);
            addEventDragSplitter(splitter, this._repaint);
        }.bind(this));
    },


    // **************** PUBLIC METHODS **************** //


    /**
     * @override
     */
    show: function() {
        this._pipeFactory.showPipes();
    },

    /**
     * @override
     */
    hide: function() {
        this._pipeFactory.hidePipes();
    },


    /**
     * Loads the definition of a screen, when the screen is opened
     */
    loadInstances: function() {

        var formFactory = Catalogue.
            getBuildingBlockFactory(Constants.BuildingBlock.FORM);
        formFactory.cacheBuildingBlocks(this._canvasCache.getFormURI(),
                    this._onFormLoaded.bind(this));

        var operatorFactory = Catalogue.
            getBuildingBlockFactory(Constants.BuildingBlock.OPERATOR);
        operatorFactory.cacheBuildingBlocks(this._canvasCache.getOperatorURIs(),
                    this._onOperatorsLoaded.bind(this));

        var resourceFactory = Catalogue.
            getBuildingBlockFactory(Constants.BuildingBlock.RESOURCE);
        resourceFactory.cacheBuildingBlocks(this._canvasCache.getResourceURIs(),
                    this._onResourcesLoaded.bind(this));
    },


    /**
     * Implementing event listener
     * @override
     */
    positionUpdated: function(/** ComponentInstance */ element, /** Object */ position, /** Integer */ orientation) {
        var isChanged;
        switch (element.constructor) {
            case PrePostInstance:
                isChanged = this._description.updatePrePost(element, position);
                break;
            default:
                isChanged = this._description.updateBuildingBlock(element, position, orientation);
                break;
        }
        if (isChanged) {
            this._setDirty(true);
        }
    },


    // **************** PRIVATE METHODS **************** //

    /**
     * Returns the areas of the document
     * @override
     * @private
     * @type Hash
     */
    _getAreas: function() {
        // Dropping areas
        var formArea = new Area('form',
                                $A([Constants.BuildingBlock.FORM]),
                                this._drop.bind(this),
                                {splitter: true, region: 'top', minHeight:150});
        var operatorArea = new Area('operator',
                                    $A([Constants.BuildingBlock.OPERATOR]),
                                    this._drop.bind(this),
                                    {splitter: true, region: 'center', minHeight:350, minWidth:200});
        var resourceArea = new Area('resource',
                                    $A([Constants.BuildingBlock.RESOURCE]),
                                    this._drop.bind(this),
                                    {splitter: true, region: 'bottom', minHeight:100});
        var preArea = new Area('pre',
                                $A([Constants.BuildingBlock.DOMAIN_CONCEPT]),
                                this._drop.bind(this),
                                {splitter: true, region: 'left', minWidth:100});
        var postArea = new Area('post',
                                $A([Constants.BuildingBlock.DOMAIN_CONCEPT]),
                                this._drop.bind(this),
                                {splitter: true, region: 'right', minWidth:100});

        return $H({
            'form': formArea,
            'operator': operatorArea,
            'resource': resourceArea,
            'pre': preArea,
            'post': postArea
        });

    },

    /**
     * @private
     * @override
     */
    _getSets: function() {
      // Palette sets
        var formSet = new BuildingBlockSet(this._tags, Catalogue.
                            getBuildingBlockFactory(Constants.BuildingBlock.FORM));
        var operatorSet = new BuildingBlockSet(this._tags, Catalogue.
                                getBuildingBlockFactory(Constants.BuildingBlock.OPERATOR));
        var resourceSet = new BuildingBlockSet(this._tags, Catalogue.
                                getBuildingBlockFactory(Constants.BuildingBlock.RESOURCE));
        var domainConceptSet = new DomainConceptSet(this._tags, Catalogue.
                                getBuildingBlockFactory(Constants.BuildingBlock.DOMAIN_CONCEPT));

        return [formSet, operatorSet, resourceSet, domainConceptSet];
    },

    /**
     * Gets the document description
     * @override
     * @private
     * @type BuildingBlockDescription
     */
    _getDescription: function(/** Object */ properties) {
        // Screen Definition

        var description;
        if (properties.id) {
            // An existing screen
            description = Object.clone(properties);
            // Removing the definition, which will be interpreted in other
            // functions
            description.definition = null;
            description.precondition = null;
            description.postconditions = null;
        } else {
            // A new screen
            description = {
                'label': {'en-gb': properties.name},
                'name': properties.name,
                'version': properties.version,
                'tags':  this._tags,
                "creator": GVS.getUser().getUserName(),
                "description": {"en-gb": "Please fill the description..."},
                "rights": "http://creativecommons.org/",
                "creationDate": null,
                "icon": "http://fast.morfeo-project.eu/icon.png",
                "screenshot": "http://fast.morfeo-project.eu/screenshot.png",
                "homepage": "http://fast.morfeo-project.eu/"
            };
        }

        return new ScreenDescription(description);
    },

    /**
     * Get the canvas cache for loading
     * @override
     * @private
     * @type String
     */
    _getCanvasCache: function(/** Object */ properties) {
        return new ScreenCanvasCache(properties);
    },

    /**
     * Returns the save uri
     * @type String
     * @private
     * @override
     */
    _getSaveUri: function() {
        return URIs.screen;
    },

    /*
     * @override
     */
    _getType: function() {
        return "screen";
    },

    /**
     * Returns the empty palette status
     * @type Object
     * @private
     * @override
     */
    _getEmptyPalette: function() {
        return {
            "forms": [],
            "operators": [],
            "backendservices": [],
            "preconditions": [],
            "postconditions":[],
            "pipes":[]
        };
    },

    /**
     * @private
     * @override
     */
    _effectiveCloseDocument: function($super, /** String */ status) {
        if (!status || status == ConfirmDialog.DISCARD) {
            this._closed = true;
        }

        $super(status);

        if (!status || status == ConfirmDialog.DISCARD) {
            this._dojoConnections.each(function(connection){
                dojo.disconnect(connection);
            }.bind(this));

            // Remove circular dependencies
            this._dojoConnections = null;
            this._repaint = null;
        }
    },


    /**
     * An element has been dropped into an area inside the canvas
     * @private
     * @type Boolean
     */
    _drop: function(/** Area */ area, /** ComponentInstance */ instance, /** Object */ position, /** Integer */ orientation,
        /** Boolean (Optional) */ _isLoading) {
        var isLoading = Utils.variableOrDefault(_isLoading, false);
        // Reject repeated elements (except domain concepts or operators)
        if (instance.constructor != OperatorInstance  &&
                this._description.contains(instance.getUri())) {
            Utils.showMessage("There is another element like this. Cannot add it", {
                'hide': true,
                'error': true
            });
            return false;
        }
        if (instance.constructor == FormInstance) {
            if (this._formInstance) {
                Utils.showMessage("Only one form per screen is allowed", {
                    'hide': true,
                    'error': true
                });
                return false;
            } else {
                this._formInstance = instance;
                this._description.icon = instance.getBuildingBlockDescription().icon;
                this._description.screenshot = instance.getBuildingBlockDescription().screenshot;
            }
        }

        this._addToArea(area, instance, position, orientation);

        if (!instance.getId()) {
            instance.setId(UIDGenerator.generate(instance.getTitle()));
        } else {
            UIDGenerator.setStartId(instance.getId());
        }

        var terminalHandlers = {
            'onPipeCreationStart': this._onPipeCreationStartHandler.bind(this),
            'onPipeCreationCancel': this._onPipeCreationCancelHandler.bind(this),
            'onPipeCreation': this._onPipeCreationHandler.bind(this),
            'onPipeDeletion': this._onPipeDeletionHandler.bind(this)
        };

        if (instance.constructor != PrePostInstance) {
            instance.createTerminals(terminalHandlers);
            this._description.addBuildingBlock(instance, position, orientation);
        } else {
            instance.setConfigurable(false);

            if (area.getNode().className.include("pre")) {
                instance.setType("pre");
                instance.createTerminal(terminalHandlers);
                this._description.addPre(instance, position);
                instance.getView().setReachability({"satisfied": true});
            } else if (area.getNode().className.include("post")) {
                instance.setType("post");
                instance.createTerminal(terminalHandlers);
                this._description.addPost(instance, position);
            }
        }
        if (!isLoading) {
            var triggerAction = null;
            switch (instance.constructor) {
            case FormInstance:
                var found = false;
                var actions = instance.getBuildingBlockDescription().actions;
                for (var i = 0; i < actions.length; i++) {
                    if (actions[i].name == 'init') {
                        found = true;
                        break;
                    }
                }

                if (found)
                    triggerAction = 'init';

                break;
            case ResourceInstance:
                var actions = instance.getBuildingBlockDescription().actions;
                if (actions.length > 0)
                    triggerAction = actions[0].name;

                break;
            }

            if (triggerAction) {
                var triggerData = {
                    'from': {
                        'instance': ScreenTrigger.INSTANCE_NAME,
                        'name': ScreenTrigger.ONLOAD
                    },
                    'to': {
                        'instance': instance,
                        'action': triggerAction
                    }
                }
                var trigger = this._triggerMappingFactory.createTrigger(triggerData);
                this._description.addTrigger(trigger);
            }

            this._setSelectedElement(instance);
        }
        instance.setEventListener(this);
        instance.enableDragNDrop(area,[area]);
        instance.getView().addGhost();
        this._setDirty(true);
        return true;
    },

    /**
     * Launched whenever a pipe creation is started
     */
    _onPipeCreationStartHandler: function(/** Wire */ wire, /** Terminal */ startTerminal) {
        var instance = startTerminal.getInstance();
        var factKey;

        if (instance instanceof FormInstance) {
            factKey = "form_" + instance.getId() +
                      (startTerminal.getActionId() ? "_" + startTerminal.getActionId() : '') +
                      "_" + startTerminal.getConditionId();
        } else if (instance instanceof PrePostInstance) {
            factKey = instance.getType() + "_" + instance.getId();
        } else if (instance instanceof ResourceInstance) {
            factKey = "service_" + instance.getId() +
                      "_" + startTerminal.getActionId() +
                      "_" + startTerminal.getConditionId();
        } else if (instance instanceof OperatorInstance) {
            factKey = "operator_" + instance.getId() +
                      "_" + startTerminal.getActionId() +
                      "_" + startTerminal.getConditionId();
        }

        if (this._selectedElement != instance)
            this._setSelectedElement(instance);

        this._recommendationManager.setStartFact(factKey);
    },

    /**
     * Launched whenever a pipe creation is canceled
     */
    _onPipeCreationCancelHandler: function(/** Wire */ wire) {
        this._recommendationManager.setStartFact(null);
    },

    /**
     * Launched whenever a pipe is removed
     * @private
     */
    _onPipeDeletionHandler: function(/** Wire */ wire) {
        if (this._closed)
            return;

        var pipe = this._pipeFactory.getPipe(wire);
        if (pipe) {
            this._pipeFactory.removePipe(pipe);
            this._description.remove(pipe);

            this._refreshReachability();
            this._setDirty(true);
        }
    },

    /**
     * Launched whenever a pipe is added
     * @private
     */
    _onPipeCreationHandler: function(/** Wire */ wire) {
        var pipe = this._pipeFactory.getPipe(wire);
        if (pipe) {
            this._description.addPipe(pipe);

            this._refreshReachability();
            this._setDirty(true);
        }
    },

    /**
     * Select an element in the document
     * @param element ComponentInstance
     *      Element to be selected for the
     *      Screenflow document.
     * @override
     */
    _setSelectedElement: function ($super, element) {
        if (element == null) {
            this._recommendationManager.clear();
        }

        $super(element);
    },

    /**
     * Delete an instance.
     * @param instance ComponentInstance
     *      Instance to be deleted from the
     *      Screen document.
     * @override
     */
    _deleteInstance: function($super, /** ComponentInstance */ instance) {

        if (instance.constructor == FormInstance) {
                this._formInstance = null;
        }
        this._description.remove(instance);

        this._pipeFactory.getPipes(instance).each(function(pipe){
            this._pipeFactory.removePipe(pipe);
            this._description.remove(pipe);
        }.bind(this));

        this._triggerMappingFactory.getRelatedTriggers(instance).each(function(trigger) {
            this._triggerMappingFactory.removeTrigger(trigger);
            this._description.remove(trigger);
        }.bind(this));

        $super(instance);
    },

    /**
     * Callback to be called when the findCheck operation
     * finishes
     * @private
     */
    _findCheckCallback: function(/** Object */ componentUris) {
        $H(componentUris).each(function(pair) {
            var palette = this._paletteController.getPalette(Constants.CatalogueRelationships[pair.key]);
            if (palette) {
                var set = palette.getBuildingBlockSet();
                set.addURIs(pair.value);
            }
        }.bind(this));
    },

    /**
     * Configure the toolbar
     * @private
     */
    _configureToolbar: function() {

        this._addToolbarElement('save', new ToolbarButton(
                'Save the current screen',
                'save',
                this._save.bind(this),
                false
            ));
        this._addToolbarElement('properties', new ToolbarButton(
                'Edit screen properties',
                'properties',
                this._propertiesDialog.show.bind(this._propertiesDialog),
                true
            ));
        this._addToolbarElement('debugger', new ToolbarButton(
                'Debug (Test) Screen',
                'debugger',
                this._debugScreen.bind(this),
                false // disabled by default
            ));
        this._addToolbarElement('share', new ToolbarButton(
                'Share the current screen with the community',
                'share',
                this._share.bind(this),
                true
            ));
        this._addToolbarElement('refresh', new ToolbarButton(
                'Refresh the buildingBlocks catalog',
                'refresh',
                this._refresh.bind(this),
                true
            ));
        this._addToolbarElement('deleteElement', new ToolbarButton(
                'Delete selected element',
                'delete',
                this._startDeletingSelectedElement.bind(this),
                false // disabled by default
            ));
        this._addToolbarElement('rotate', new ToolbarButton(
                'Rotate selected element',
                'rotate',
                this._rotateSelectedElement.bind(this),
                false
            ));
    },

    /**
     * This function updates all the BuildingBlocks
     * Elements: canvas and palettes
     * @private
     */
    _refresh: function() {
        var body = {
            'forms': this._paletteController.getComponentUris(Constants.BuildingBlock.FORM),
            'operators': this._paletteController.getComponentUris(Constants.BuildingBlock.OPERATOR),
            'backendservices': this._paletteController.getComponentUris(Constants.BuildingBlock.RESOURCE),
            'pipes': this._description.getPipes(),
            'preconditions': this._description.getPreconditions(),
            'postconditions': this._description.getPostconditions()
        }

        this._inferenceEngine.findCheck(
            [],
            body,
            this._tags,
            'reachability',
            this._findCheckCallback.bind(this)
        );
    },

    /**
     * This function updates the toolbar status
     * @private
     * @override
     */
    _updateToolbar: function(/** ComponentInstance */ element) {
        this._toolbarElements.get('deleteElement').setEnabled(element!=null);
        if (element!=null){
            var elementDescription = element.getBuildingBlockDescription();
            this._toolbarElements.get('rotate').setEnabled(elementDescription.type == Constants.BuildingBlock.OPERATOR);
        } else {
            this._toolbarElements.get('rotate').setEnabled(false);
        }
        this._toolbarElements.get("debugger").setEnabled(this._formInstance != null);
    },

    /**
     * This function creates the area containing the canvas
     * and the inspectors
     * @override
     */
    _renderCenterContainer: function() {

        var centerContainer = new dijit.layout.BorderContainer({
            design:"headline",
            liveSplitters:"false",
            region:"center"
        });

        centerContainer.addChild(this._designContainer);
        centerContainer.addChild(this._inspectorArea);

        this._centerContainer = centerContainer;

        return centerContainer;
    },


    /**
     * This function repaints the terminals in the document
     * @private
     */
    _repaint: function() {
        this._description.getCanvasInstances().each(function(instance){
            instance.onUpdate();
        });
        this._description.getConditionInstances().each(function(instance) {
            instance.onUpdate();
        });
    },


    /**
     * This function updates the reachability in all
     * Elements: canvas and palettes
     * @private
     */
    _refreshReachability: function (/** Boolean (Optional) */_isFindCheck) {
        var isFindCheck = Utils.variableOrDefault(_isFindCheck, true);

        this._recommendationManager.clear();

        var canvas = this._getCanvasUris();
        var body = {
            'forms': this._paletteController.getComponentUris(Constants.BuildingBlock.FORM),
            'operators': this._paletteController.getComponentUris(Constants.BuildingBlock.OPERATOR),
            'backendservices': this._paletteController.getComponentUris(Constants.BuildingBlock.RESOURCE),
            'pipes': this._description.getPipes(),
            'preconditions': this._description.getPreconditions(),
            'postconditions': this._description.getPostconditions()
        }
        if (this._selectedElement && this._selectedElement.getUri()) {
            body.selectedItem = this._selectedElement.getUri();
        } else if (this._selectedElement) {
            body.selectedItem = this._selectedElement.getId();
        }

        if (isFindCheck) {
            this._inferenceEngine.findCheck(canvas, body,  this._tags,
                                    'reachability', this._onUpdateReachability.bind(this));
        } else {
            this._inferenceEngine.check(canvas, body, this._tags, 'reachability',
                                        this._onUpdateReachability.bind(this));
        }
    },

    /**
     * Parses the information coming in the
     *
     * @private
     */
    _parseConnectionElement: function(/** Hash */ desc, /** Boolean */ origin) {
        if (desc.buildingblock == null) {
            // Pre/Post condition
            var type;
            var instance;

            if (origin) {
                type = 'pre';
                instance = this._description.getPre(desc.condition);
            } else {
                type = 'post';
                instance = this._description.getPost(desc.condition);
            }

            return {'instance': instance,
                    'node': instance.getView().getNode(),
                    'key': type + '_' + desc.condition};
        } else {
            var buildingblock = this._description.getInstanceByUri(desc.buildingblock);

            if (desc.buildingblock.search("/forms/") != -1) {
                var key = 'form_' + buildingblock.getId() +
                          (desc.action ? '_' + desc.action : '') +
                          '_' + desc.condition
                return {'instance': buildingblock,
                        'node': buildingblock.getView().getConditionNode(desc.condition, desc.action),
                        'key': key};
            } else if (desc.buildingblock.search("/services/") != -1) {
                var view = buildingblock.getView();

                var actionName;
                if (origin) {
                    actionName = "postconditions";
                } else {
                    actionName = view._icons.keys()[0];  // TODO remove this hack
                }
                var node = view.getConditionNode(desc.condition, actionName);

                return {'instance': buildingblock,
                        'node': node,
                        'key': 'service_' + buildingblock.getId() + "_" + actionName + "_" + desc.condition};
            } else if (desc.buildingblock.search("/operators/") != -1) {
                return {'instance': buildingblock,
                        'node': buildingblock.getView().getConditionNode(desc.condition, desc.action),
                        'key': 'operator_' + buildingblock.getId() + "_" + desc.action + "_" + desc.condition};
            } else {
                throw 'unknowk building block at ScreenDocument::_parseConnectionElement';
            }
        }
    },

    /**
     * @private
     */
    _onUpdateReachability: function(reachabilityData) {
        if (reachabilityData.postconditions) {
            reachabilityData.postconditions.each(function(post) {
                var postInstance = this._description.getPost(post.id);
                var view = postInstance.getView();
                if (view) {
                    view.setReachability(post);
                }
            }.bind(this));
        }
        if (reachabilityData.pipes) {
            reachabilityData.pipes.each(function(pipeData) {
                // TODO improve this

                var from, destinations;

                if (pipeData.from.buildingblock) {
                    var fromInstances = this._description.getInstancesByUri(pipeData.from.buildingblock);
                    origins = fromInstances.map(function(fromInstance) {
                        return fromInstance.getTerminal(pipeData.from.condition, "postconditions");
                    });
                } else {
                    origins = [this._description.getPre(pipeData.from.condition).getTerminal()];
                }

                if (pipeData.to.buildingblock) {
                    var toInstances = this._description.getInstancesByUri(pipeData.to.buildingblock);

                    destinations = toInstances.map(function(toInstance) {
                        return toInstance.getTerminal(pipeData.to.condition, pipeData.to.action);
                    });
                } else {
                    destinations = [this._description.getPost(pipeData.to.condition).getTerminal()];
                }

                origins.each(function(from) {
                    destinations.each(function(to) {
                        var pipe = this._pipeFactory.getPipeFromTerminals(from, to);
                        if (pipe) {
                            pipe.setReachability(pipeData);
                        }
                    }.bind(this));
                }.bind(this));
            }.bind(this));
        }

        if (reachabilityData.connections) {
            reachabilityData.connections.each(function(connection) {
                var from, to, localNode, externalNode;

                try {
                    from = this._parseConnectionElement(connection.from, true);
                    to = this._parseConnectionElement(connection.to, false);
                } catch (e) {
                    return;
                }

                if (from.instance == this._selectedElement) {
                    localNode = from;
                    externalNode = to;
                } else if (to.instance == this._selectedElement) {
                    localNode = to;
                    externalNode = from;
                } else {
                    return; // We are not interested in this connection => continue with the next
                }

                this._recommendationManager.addRecommendation(localNode, externalNode);
            }.bind(this));
            this._recommendationManager.startAnimation();
        }

        this._updatePanes();
    },


    /**
     * This function updates the properties table and
     * the pre/post pane depending on the selected element
     * @private
     */
    _updatePanes: function() {

        if (!this._selectedElement) {
            this._propertiesPane.fillTable(this._description);
            var facts = this._getAllFacts();
            this._factPane.fillTable([], [], facts);
        } else {
            this._propertiesPane.fillTable(this._selectedElement);

            if (this._selectedElement.constructor != PrePostInstance) {

                var instanceActions = this._getInstanceActions();
                this._propertiesPane.addSection(['Action', 'Triggers'], instanceActions);

                var preReachability = this._inferenceEngine.getPreconditionReachability(
                            this._selectedElement.getUri());
                var preconditions = this._selectedElement.getPreconditionTable(preReachability);

                var postReachability = this._inferenceEngine.isReachable(
                            this._selectedElement.getUri());
                var postconditions = this._selectedElement.getPostconditionTable(postReachability);

                this._factPane.fillTable(preconditions,postconditions,[]);
            } else {
                //PrePostInstance
                if (this._selectedElement.getType()) {
                    //Pre or post condition
                    var factInfo = [this._selectedElement.getConditionTable()];
                    this._factPane.fillTable([], [], factInfo);
                }
            }
        }
    },


    /**
     * This function returns a hash containing all the actions of the
     * selected element and its triggers, if any
     * @private
     * @type Hash
     */
    _getInstanceActions: function() {
        var triggers = this._triggerMappingFactory.getTriggerList(this._selectedElement);
        var result = new Hash();
        var actions = this._selectedElement.getBuildingBlockDescription().actions;
        actions.each(function(action) {
            result.set(action.name, this._buildTriggerList(action.name, triggers.get(action.name)));
        }.bind(this));
        return result;
    },

    /**
     * This function builds a HTML chunk with the list of triggers of an action and
     * the button to change the trigger mappings
     * @private
     * @type DOMNode
     */
    _buildTriggerList: function(/** String */ actionName, /** Array */ triggerList) {

        var result = new Element('div');
        var content = "";
        if (triggerList) {
            triggerList.each(function(trigger) {
                content += trigger.getTriggerName() + ", ";
            });
            content = content.slice(0, -2);
        } else {
            content = new Element('span', {
                'class': 'triggerInfo'
            }).update("No triggers for this action");
        }
        result.update(content);
        var triggerDialog = new TriggerDialog(actionName, triggerList,
                                            this._description.getCanvasInstances(),
                                            this._onTriggerChange.bind(this));
        result.appendChild(triggerDialog.getButtonNode());
        return result;
     },

     /**
      * Called whenever a trigger dialog finishes its job
      * @private
      */
     _onTriggerChange: function(/** String*/ action, /** Array */ triggersAdded,
                                /** Array */ triggersRemoved) {
        triggersAdded.each(function(triggerInfo) {
            var triggerSplittedInfo = triggerInfo.split("#");
            var instance;
            if (triggerSplittedInfo[0] == ScreenTrigger.INSTANCE_NAME) {
                instance = triggerSplittedInfo[0];
            } else {
                instance = this._description.getInstance(triggerSplittedInfo[0]);
            }
            var triggerData = {
                'from': {
                    'instance': instance,
                    'name': triggerSplittedInfo[1]
                },
                'to': {
                    'instance': this._selectedElement,
                    'action': action
                }
            }
            var trigger = this._triggerMappingFactory.createTrigger(triggerData);
            this._description.addTrigger(trigger);
        }.bind(this));

        triggersRemoved.each(function(triggerInfo) {
            var triggerSplittedInfo = triggerInfo.split("#");
            var instance;
            if (triggerSplittedInfo[0] == ScreenTrigger.INSTANCE_NAME) {
                instance = triggerSplittedInfo[0];
            } else {
                instance = this._description.getInstance(triggerSplittedInfo[0]);
            }
            var triggerData = {
                'from': {
                    'instance': instance,
                    'name': triggerSplittedInfo[1]
                },
                'to': {
                    'instance': this._selectedElement,
                    'action': action
                }
            }
            var trigger = this._triggerMappingFactory.removeTrigger(triggerData);
            this._description.remove(trigger);
        }.bind(this));
        this._updatePanes();
        this._setDirty(true);
     },

     _share: function() {
        if (this._description.isValid()) {
            if (this._isDirty) {
                this._pendingOperation = this._share.bind(this);
                this._save(false);
            } else {
                var text = new Element('div', {
                    'style': 'text-align:center; width: 30em; margin: 0 auto;'
                }).update("You are about to share the screen. After that, " +
                         "you will not be able to edit the screen anymore. " +
                         "You can either close the screen or create a clone " +
                         "(Save with another name/version)");
                var dialog = new ConfirmDialog("Warning",
                                               ConfirmDialog.CUSTOM,
                                               {'callback': this._onShareDialogEvent.bind(this),
                                                'contents': text,
                                                'buttons': {
                                                    'clone': 'Share and create a clone',
                                                    'close': 'Share and close',
                                                    'cancel': 'Cancel'
                                                },
                                                'style': 'width: '
                                                });
                dialog.show();
            }

        } else {
            this._propertiesDialog.show(this._share.bind(this));
        }

     },

    /**
     * This function will be called whenever an event is triggered in the
     * share dialog
     * @private
     */
    _onShareDialogEvent: function(/** String */ status) {
        if (status != "cancel") {
            var uri = URIs.share.replace("<id>", this._description.getId());
            PersistenceEngine.sendPost(uri, null, null,
                                      {'mine': this, 'status': status},
                                      this._onShareSuccess, Utils.onAJAXError);
        }
    },

    /**
     * On share success
     * @private
     */
    _onShareSuccess: function(/** XMLHttpRequest */ transport) {
        Utils.showMessage("Screen successfully shared", {'hide': true});
        switch(this.status) {
            case 'clone':
                this.mine._saveAs(true);
                break;
            case 'close':
                this.mine._effectiveCloseDocument(ConfirmDialog.DISCARD);
                break;
        }
    },

    /**
     * On forms loaded
     * @private
     */
    _onFormLoaded: function() {
        var formFactory = Catalogue.
            getBuildingBlockFactory(Constants.BuildingBlock.FORM);
        var forms = formFactory.getBuildingBlocks(this._canvasCache.getFormURI());
        this._createInstances(formFactory, forms, this._areas.get('form'));
        this._canvasCache.setLoaded(Constants.BuildingBlock.FORM);
        this._loadConnections();
    },

    /**
     * On operators loaded
     * @private
     */
    _onOperatorsLoaded: function() {
        var operatorFactory = Catalogue.
                    getBuildingBlockFactory(Constants.BuildingBlock.OPERATOR);
        var operators = operatorFactory.getBuildingBlocks(this._canvasCache.getOperatorURIs());
        this._createInstances(operatorFactory, operators, this._areas.get('operator'));
        this._canvasCache.setLoaded(Constants.BuildingBlock.OPERATOR);
        this._loadConnections();
    },

    /**
     * On resources loaded
     * @private
     */
    _onResourcesLoaded: function() {
        var resourceFactory = Catalogue.
                getBuildingBlockFactory(Constants.BuildingBlock.RESOURCE);
        var resources = resourceFactory.getBuildingBlocks(this._canvasCache.getResourceURIs());
        this._createInstances(resourceFactory, resources, this._areas.get('resource'));
        this._canvasCache.setLoaded(Constants.BuildingBlock.RESOURCE);
        this._loadConnections();
    },


    /**
     * Create the pre and post conditions
     * @private
     */
     _createConditions: function(/** Array */ conditionList, /** DropZone */ area) {
        conditionList.each(function(condition) {
            var description = new PrePostDescription(condition);
            var instance = new PrePostInstance(description, this._inferenceEngine, false);
            instance.setId(condition.id);
            instance.onFinish(true, condition.position);
            var zonePosition = area.getNode();
            $("main").appendChild(instance.getView().getNode());
            var effectivePosition = Geometry.adaptInitialPosition(zonePosition,
                                    instance.getView().getNode(), condition.position);
            $("main").removeChild(instance.getView().getNode());
            this._drop(area, instance, effectivePosition, true);
        }.bind(this));
    },

    /**
     * Creates the pipes programmatically
     * @private
     */
    _createPipes: function(/** Array */ pipes) {
        pipes.each(function(pipeData) {
            var fromInstance;
            var fromTerminal;
            if (pipeData.from.buildingblock != "") {
                fromInstance = this._description.getInstance(pipeData.from.buildingblock);
                fromTerminal = fromInstance.getTerminal(pipeData.from.condition);
            } else {
                fromInstance = this._description.getPre(pipeData.from.condition);
                if (!fromInstance) {
                    fromInstance = this._description.getPost(pipeData.from.condition);
                }
                fromTerminal = fromInstance.getTerminal();
            }
            var toInstance;
            var toTerminal;
            if (pipeData.to.buildingblock != "") {
                toInstance = this._description.getInstance(pipeData.to.buildingblock);
                toTerminal = toInstance.getTerminal(pipeData.to.condition, pipeData.to.action);
            } else {
                toInstance = this._description.getPre(pipeData.to.condition);
                if (!toInstance) {
                    toInstance = this._description.getPost(pipeData.to.condition);
                }
                toTerminal = toInstance.getTerminal();
            }
            var pipe = this._pipeFactory.getPipe(fromTerminal, toTerminal);
            this._description.addPipe(pipe);
        }.bind(this));
    },

    /**
     * Creates the triggers
     * @private
     */
    _createTriggers: function(/** Array */ triggers) {
        triggers.each(function(triggerJSON) {
            var fromInstance = null;
            if (triggerJSON.from.buildingblock != "") {
                fromInstance = this._description.getInstance(triggerJSON.from.buildingblock);
            }
            var toInstance = this._description.getInstance(triggerJSON.to.buildingblock);
            var triggerData = {
                'from': {
                    'instance': fromInstance ? fromInstance : ScreenTrigger.INSTANCE_NAME,
                    'name': fromInstance ? triggerJSON.from.name : ScreenTrigger.ONLOAD
                },
                'to': {
                    'instance': toInstance,
                    'action': triggerJSON.to.action
                }
            }
            var trigger = this._triggerMappingFactory.createTrigger(triggerData);
            this._description.addTrigger(trigger);
        }.bind(this));
    },

    /**
     * Function that loads the triggers and the pipes of the loaded screens
     * @private
     */
    _loadConnections: function() {

        if (this._canvasCache.areInstancesLoaded()) {
            // Load pre and postconditions
            this._createConditions(this._canvasCache.getPreconditions(), this._areas.get('pre'));
            this._createConditions(this._canvasCache.getPostconditions(), this._areas.get('post'));
            this._createPipes(this._canvasCache.getPipes());
            this._createTriggers(this._canvasCache.getTriggers());
            this._setDirty(false);
            this._refreshReachability();
            if (this._description.cloned) {
                this._saveAs(true);
            }
        }
    },

    /**
     * Debug a scree,
     * @private
     */
    _debugScreen: function () {
        if (this._isDirty) {
                this._pendingOperation = this._debugScreen.bind(this);
                this._save(false);
        } else {
            var uri = URIs.storePlayScreenflow + "?screen=" +
            this._description.getId() + "&debugLevel=debug";
            var pres = this._description.getPreconditions();
            if (pres.length >= 1) {
                uri+= "&factURI=" + encodeURIComponent(pres[0].uri);
            }
            GVS.getDocumentController().openExternalTool("Screen Debugger", uri);
        }
    },
});

// vim:ts=4:sw=4:et:

var BuildingBlockDocument = Class.create(PaletteDocument, /** @lends BuildingBlockDocument.prototype */ {
    /**
     *
     * @abstract
     * @extends PaletteDocument
     * @constructs
     */
    initialize: function ($super,/** Object */ properties) {
        this._type = properties['type'];
        this._uri = URIs[this._type];
        this._codeURI = properties['code'];
        this._codeInline = properties['codeInline'];

        this._jsonText = new Element("textarea");
        this._jsonContainer = new Element('div', {
            'class': 'codeContainer'
        }).update(this._jsonText);

        this._codeText = new Element("textarea");
        this._codeContainer = new Element('div', {
            'class': 'codeContainer'
        }).update(this._codeText);

        $super("Building Block", properties, new DumbInferenceEngine());
        this._start();
    },

    /**
     * Create the CodeMirror text editors
     * To be called after the document has been added into the GVS
     * CodeMirror needs to be instantiated into Elements already
     * added to the DOM
     */
    createTextEditors: function() {


        var JSONContent = this._getJSONProperties();

        this._jsonEditor = CodeMirror.fromTextArea(this._jsonText, {
                'height': "100%",
                'parserfile': ["tokenizejavascript.js",
                    "parsejavascript.js"],
                'parserConfig': {
                    'json': true
                },
                'stylesheet': ["fast/js/lib/codemirror/css/jscolors.css"],
                'path': "fast/js/lib/codemirror/js/",
                'lineNumbers': true,
                'tabMode': "shift",
                'reindentOnLoad': true,
                'content': JSONContent,
                'saveFunction': this._save.bind(this),
                'onChange': this._propertiesChanged.bind(this)
            });

        var parsers = ["tokenizejavascript.js", "parsejavascript.js"];
        var stylesheet = ["fast/js/lib/codemirror/css/jscolors.css"];
        if (this._type == BuildingBlockDocument.FORM) {
            parsers = ["parsexml.js", "parsecss.js", "tokenizejavascript.js",
                        "parsejavascript.js", "parsehtmlmixed.js"];
            stylesheet = [  "fast/js/lib/codemirror/css/xmlcolors.css",
                            "fast/js/lib/codemirror/css/jscolors.css",
                            "fast/js/lib/codemirror/css/csscolors.css"
                        ];
        }

        this._codeEditor = CodeMirror.fromTextArea(this._codeText, {
                'height': "100%",
                'parserfile': parsers,
                'stylesheet': stylesheet,
                'path': "fast/js/lib/codemirror/js/",
                'lineNumbers': true,
                'tabMode': "shift",
                'reindentOnLoad': true,
                'onChange': function() {
                                this._setDirty(true);
                                this._description.addProperties({
                                    'codeInline': this._codeEditor.getCode()
                                });
                            }.bind(this),
                'initCallback': this._loadCodeText.bind(this)
            });
    },

    // **************** PRIVATE METHODS **************** //

    /**
     * @private
     * @override
     */
    _start: function($super) {
        $super();
        if (this._type == "operator" || this._type == "resource") {
            this._toolbarElements.get('debugger').setEnabled(true);
        }
    },

    _loadCodeText: function(codeEditor) {
        if (this._codeInline) {
            codeEditor.setCode(this._codeInline);
            this._setDirty(false);
        } else {
            if (this._codeURI) {
                this._loadRemoteCodeText(codeEditor);
            } else {
                var codeText = this._getInitialCodeContent(this._type);
                codeEditor.setCode(codeText);
            }
        }
    },

    _loadRemoteCodeText: function(codeEditor) {
        new Ajax.Request('/proxy', {
            method: 'post',
            parameters: {url:this._codeURI, method:'get'},
            onSuccess: function(transport) {
                var codeText = transport.responseText
                codeEditor.setCode(codeText);
                this._setDirty(false);
            }.bind(this),
            onFailure: function() {
                Utils.showMessage("Can not open code of the selected element", {
                'error': true,
                'hide': true});
            }
        });
    },

    /**
     * Returns the areas of the document
     * @override
     * @private
     * @type Hash
     */
    _getAreas: function() {
        // Dropping areas
        var jsonArea = new Area('json',
                                [],
                                null,
                                {splitter: true, region: 'top', minHeight:300});
        var codeArea = new Area('code',
                                [],
                                null,
                                {splitter: true, region: 'center'});
        var preArea = new Area('pre',
                                $A([Constants.BuildingBlock.DOMAIN_CONCEPT]),
                                this._drop.bind(this),
                                {splitter: true, region: 'left', minWidth:100});
        var postArea = new Area('post',
                                $A([Constants.BuildingBlock.DOMAIN_CONCEPT]),
                                this._drop.bind(this),
                                {splitter: true, region: 'right', minWidth:100});

        jsonArea.getNode().appendChild(new Element('div',
                {'class':'title'}).update("Building Block Metainformation"));
        jsonArea.getNode().appendChild(this._jsonContainer);
        codeArea.getNode().appendChild(new Element('div',
                {'class': 'title'}).update("Building Block Code"));
        codeArea.getNode().appendChild(this._codeContainer);
        return $H({
            'json': jsonArea,
            'code': codeArea
        });

    },

    /**
     * @private
     * @override
     */
    _getSets: function() {
        // Palette sets
        var domainConceptSet = new DomainConceptSet(this._tags, Catalogue.
                            getBuildingBlockFactory(Constants.BuildingBlock.DOMAIN_CONCEPT));

        return [];
    },

    /**
     * Gets the document description
     * @override
     * @private
     * @type BuildingBlockDescription
     */
    _getDescription: function(/** Object */ properties) {

        var description;
        if (properties.id) {
            // An existing buildingblock
            description = Object.clone(properties);
        } else {
            // A new buildingblock
            description = {
                'type': this._type,
                'label': {'en-gb': properties.name},
                'name': properties.name,
                'version': properties.version,
                'tags':  this._tags,
                "creator": GVS.getUser().getUserName(),
                "description": {"en-gb": "Please fill the description..."},
                "rights": "http://creativecommons.org/",
                "icon": "http://fast.morfeo-project.eu/icon.png",
                "screenshot": "http://fast.morfeo-project.eu/screenshot.png",
                "homepage": "http://fast.morfeo-project.eu/",
                "libraries": [],
                "actions": [],
                "postconditions": [],
                "triggers": [],
                "parameterTemplate":"",
            };
        }

        return new BuildingBlockDescription(description);
    },

    /*
     * @override
     */
    _onSaveSuccess: function($super, /** XMLHttpRequest */ transport) {
        var data = JSON.parse(transport.responseText);
        if (this._description.getId() == null) {
            this._description.addProperties({
                    "id": data.id,
                    "version": data.version,
                    "creationDate": data.creationDate,
                    "code": data.code
            });
            this._save(false);
        } else {
            $super(transport);
        }
    },

    /**
     * Get the canvas cache for loading
     * @override
     * @private
     * @type String
     */
    _getCanvasCache: function(/** Object */ properties) {
        // TODO
        return null;
    },

    /**
     * Returns the uri of code
     * @private
     * @type URI
     */
    _getCodeURI: function() {
        return this._description['code'];
    },

    /**
     * Returns the save uri
     * @type String
     * @private
     * @override
     */
    _getSaveUri: function() {
        return this._uri;
    },

    /*
     * @override
     */
    _getType: function() {
        return this._type;
    },

    /**
     * Returns the empty palette status
     * @type Object
     * @private
     * @override
     */
    _getEmptyPalette: function() {
        return [];
    },

    /**
     * @private
     */
    _drop: function(area, instance, position) {
        this._addToArea(area, instance, position);

        if (!instance.getId()) {
            instance.setId(UIDGenerator.generate(instance.getTitle()));
        } else {
            UIDGenerator.setStartId(instance.getId());
        }
        instance.setConfigurable(false);

        if (area.getNode().className.include("pre")) {
            instance.setType("pre");
            instance.getView().setReachability({"satisfied": true});
        } else if (area.getNode().className.include("post")) {
            instance.setType("post");
        }
        instance.setEventListener(this);
        instance.enableDragNDrop(area,[area]);
        this._setDirty(true);
        return true;
    },

    /**
     * @private
     */
    _configureToolbar: function() {
        this._addToolbarElement('save', new ToolbarButton(
                'Save the current screenflow',
                'save',
                this._save.bind(this),
                false // disabled by default
            ));
        this._addToolbarElement('properties', new ToolbarButton(
                'Edit Building Block properties',
                'properties',
                this._propertiesDialog.show.bind(this._propertiesDialog),
                true
            ));
        this._addToolbarElement('share', new ToolbarButton(
                'Share the current building block with the community',
                'share',
                this._share.bind(this),
                true
            ));
        this._addToolbarElement('debugger', new ToolbarButton(
                'Debugger the current building block code',
                'debugger',
                function() {
                    this._pendingOperation = function() {
                        var url = URIs.debugger + '?url=' +
                            encodeURIComponent(this._getCodeURI());
                        var title = "BuildingBlockTest " + this.getTitle();
                        var options = 'menubar=no,toolbar=no,width=800,height=600';
                        window.open(url, title, options);
                    }.bind(this);
                    this._save(true);
                }.bind(this),
                false
            ));
    },

    /**
     * Starts the sharing process
     * @private
     * @overrides
     */
     _share: function() {
        if (this._isDirty) {
            this._pendingOperation = this._share.bind(this);
            this._save(false);
        } else {
            var text = new Element('div', {
                'style': 'text-align:center; width: 30em; margin: 0 auto;'
            }).update("You are about to share the building blokc. After that, " +
                     "you will not be able to edit it anymore. " +
                     "You can either close it or create a clone " +
                     "(Save with another name/version)");
            var dialog = new ConfirmDialog("Warning",
                                           ConfirmDialog.CUSTOM,
                                           {
                                            'callback': this._onShareDialogEvent.bind(this),
                                            'contents': text,
                                            'buttons': {
                                                'clone': 'Share and create a clone',
                                                'close': 'Share and close',
                                                'cancel': 'Cancel'
                                                },
                                            });
            dialog.show();
        }
     },

    /**
     * This function will be called whenever an event is triggered in the
     * share dialog
     * @private
     */
    _onShareDialogEvent: function(/** String */ status) {
        if (status != "cancel") {
            var uri = URIs.share.replace("<id>", this._description.getId());
            PersistenceEngine.sendPost(uri, null, null,
                                      {'mine': this, 'status': status},
                                      this._onShareSuccess, Utils.onAJAXError);
        }
    },

    /**
     * On share success
     * @private
     */
    _onShareSuccess: function(/** XMLHttpRequest */ transport) {
        Utils.showMessage("Building block successfully shared", {'hide': true});
        switch(this.status) {
            case 'clone':
                this.mine._saveAs(true);
                break;
            case 'close':
                this.mine._effectiveCloseDocument(ConfirmDialog.DISCARD);
                break;
        }
    },

    /**
     * Callback called whenever the JSON properties editor is changed
     * @private
     */
    _propertiesChanged: function() {
        this._setDirty(true);
        try {
            var jsonContent = cjson_parse(this._jsonEditor.getCode());
            this._description.addProperties(jsonContent);
            Utils.showMessage();
        } catch (e) {
            Utils.showMessage("The properties are not well formed. It will not " +
                              "work", {'error': true});
            this._toolbarElements.get('save').setEnabled(false);
        }
    },

    /**
     * @override
     */
    _onPropertiesChange: function($super) {
        $super();
        this._jsonEditor.setCode(this._getJSONProperties());
        this._jsonEditor.reindent();
    },

    /**
     * Returns the building block properties in JSON-like string
     * @private
     * @type String
     */
    _getJSONProperties: function() {
        var validContents = $H(this._description.toJSON()).clone();
        ["code","codeInline", "id", "creationDate"].each(function(element){
            validContents.unset(element);
        });
        var JSONContent = Object.toJSON(validContents.toObject()).replace(/,\s*"/g, ",\n\"");
        JSONContent = JSONContent.replace(/{/g, "{\n");
        JSONContent = JSONContent.replace(/}/g, "\n}");
        return JSONContent;
    },


    /**
     * This function creates the area containing the canvas
     * and the inspectors
     * @private
     * @override
     */
    _renderCenterContainer: function() {

        var centerContainer = new dijit.layout.BorderContainer({
            design:"headline",
            liveSplitters:"false",
            region:"center"
        });

        this._designContainer.domNode.addClassName('canvas');

        centerContainer.addChild(this._designContainer);

        return centerContainer;
    },

    /**
     * This function returns the initial code content from a given
     * building block
     * @private
     * @type String
     */
    _getInitialCodeContent: function (buildingBlockType) {
        var content;
        switch (buildingBlockType) {
            case BuildingBlockDocument.FORM:
                content =   "<html>\n" +
                            "<head>\n" +
                            "<script type=\"text/javascript\">\n" +
                            "var {{buildingblockId}} = Class.create(BuildingBlock, {\n" +
                            "init: function (){}\n" +
                            "});\n" +
                            "</script>\n" +
                            "</head>\n" +
                            "<body>\n" +
                            "</body>\n" +
                            "</html>";
                break;
            case BuildingBlockDocument.OPERATOR:
                content = "operatorFunction: function(inputFacts) {\n" +
                          "}";
                break;
            case BuildingBlockDocument.RESOURCE:
                content = "serviceFunction: function(inputFacts) { \n" +
                          "}";
                break;
            default:
                content = "";
        }

        return content;
    },

    _findCheckCallback: function() {
        // Do nothing
    },

    _refreshReachability: function() {
        // Do nothing
    }
});
BuildingBlockDocument.FORM = "form";
BuildingBlockDocument.OPERATOR = "operator";
BuildingBlockDocument.RESOURCE = "resource";

/**
 * This class is included here due to PaletteDocument restrictions,
 * which need an instance of an InferenceEngine. As this document
 * does not need any kind of inference, the class does nothing
 */
var DumbInferenceEngine = Class.create({
    initialize: function(){},
    findCheck: function(){},
    addReachabilityListener: function(){},
    removeReachabilityListener: function(){}
});

// vim:ts=4:sw=4:et:

var ScreenCanvasCache = Class.create( /** @lends ScreenCanvasCache.prototype */ {
    /**
     *
     * @constructs
     */
    initialize: function (/** Object */ properties) {
        /**
         * Buildingblocks of the screen
         * @type Array
         * @private
         */
        this._buildingblocks = properties.definition.buildingblocks;

        /**
         * Pipes of the screen
         * @type Array
         * @private
         */
        this._pipes = properties.definition.pipes;

        /**
         * Triggers of the screen
         * @type Array
         * @private
         */
        this._triggers = properties.definition.triggers;

        /**
         * Preconditions of the screen
         * @type Array
         * @private
         */
        this._preconditions = properties.preconditions[0] ? properties.preconditions[0]:
                               new Array();

        /**
         * Postconditions of the screen
         * @type Array
         * @private
         */
        this._postconditions = properties.postconditions[0] ? properties.postconditions[0]:
                               new Array();

        /**
         * Array of already loaded building block types
         * @type Array
         * @private
         */
        this._elementsLoaded = new Array();
    },


    // **************** PRIVATE METHODS **************** //
    /**
     * Gets the uri of the form (if any) in form of Array, to
     * get compatibility with factory method
     * @type Array
     */
    getFormURI: function () {
        var form = this._buildingblocks.detect(function(element) {
            return (element.uri.search(/forms/i) != -1);
        });
        if (form) {
            return [form.uri];
        } else {
            return [];
        }

    },

    /**
     * Returns the list of operator URIs
     * @type Array
     */
    getOperatorURIs: function() {
        var elements = this._buildingblocks.findAll(function(element) {
            return (element.uri.search(/operators/i) != -1);
        });
        var result = new Array();
        elements.each(function(element) {
            if (result.indexOf(element.uri) == -1) {
                result.push(element.uri);
            }
        });
        return result;
    },

    /**
     * Returns the list of resource URIs
     * @type Array
     */
    getResourceURIs: function() {
        var elements = this._buildingblocks.findAll(function(element) {
            return (element.uri.search(/services/i) != -1);
        });
        var result = new Array();
        elements.each(function(element) {
            if (result.indexOf(element.uri) == -1) {
                result.push(element.uri);
            }
        });
        return result;
    },

    /**
     * Returns the list of preconditions
     * @type Array
     */
    getPreconditions: function() {
        return this._preconditions;
    },

    /**
     * Returns the list of postconditions
     * @type Array
     */
    getPostconditions: function() {
        return this._postconditions;
    },

    /**
     * Returns the list of pipes
     * @type Array
     */
    getPipes: function() {
        return this._pipes;
    },

    /**
     * Returns the list of triggers
     * @type Array
     */
    getTriggers: function() {
        return this._triggers;
    },

    /**
     * Returns the id of an element by its URI
     * @type Array
     */
    getIds: function(/** String */ uri) {
        var elements = this._buildingblocks.findAll(function(element) {
            return element.uri == uri;
        });
        if (elements) {
            return elements.collect(function(element){return element.id});
        } else {
            return null;
        }
    },

    /**
     * Returns the parameters of an element by its URI
     * @type Object
     */
    getParams: function (/** String */ id) {
        var element = this._buildingblocks.detect(function(element) {
            return element.id == id;
        });
        if (element) {
            return element.parameter;
        } else {
            return null;
        }
    },

    /**
     * Returns the position of an element by its URI
     * @type Object
     */
    getPosition: function (/** String */ id) {
        var element = this._buildingblocks.detect(function(element) {
            return element.id == id;
        });
        if (element) {
            return element.position;
        } else {
            return null;
        }
    },

    /**
     * Returns the orientation of an element by its URI
     * @type Object
     */
    getOrientation: function (/** String */ id) {
        var element = this._buildingblocks.detect(function(element) {
            return element.id == id;
        });
        if (element) {
            return element.orientation;
        } else {
            return null;
        }
    },

    /**
     * Sets a buildingblock type as already loaded
     */
    setLoaded: function (/** String */ buildingblocktype) {
        this._elementsLoaded.push(buildingblocktype);
    },

    /**
     * Returns true if all the buildingblocks (operators, services and
     * resources), have been loaded
     * @type Boolean
     */
    areInstancesLoaded: function() {
        var result = (this._elementsLoaded.indexOf(Constants.BuildingBlock.RESOURCE) != -1);
        result = result && (this._elementsLoaded.indexOf(Constants.BuildingBlock.OPERATOR) != -1);
        result = result && (this._elementsLoaded.indexOf(Constants.BuildingBlock.FORM) != -1);
        return result;
    }

});

// vim:ts=4:sw=4:et:

var ScreenflowCanvasCache = Class.create( /** @lends ScreenflowCanvasCache.prototype */ {
    /**
     *
     * @constructs
     */
    initialize: function (/** Object */ properties) {
        /**
         * Preconditions of the screenflow
         * @type Array
         * @private
         */
        this._screens = properties.definition.screens ?
                        properties.definition.screens :
                        new Array();

        /**
         * Preconditions of the screenflow
         * @type Array
         * @private
         */
        this._preconditions = properties.definition.preconditions ?
                              properties.definition.preconditions :
                              new Array();

        /**
         * Postconditions of the screenflow
         * @type Array
         * @private
         */
        this._postconditions = properties.definition.postconditions
                               ? properties.definition.postconditions:
                               new Array();

        /**
         * Array of already loaded building block types
         * @type Array
         * @private
         */
        this._elementsLoaded = new Array();
    },


    // **************** PRIVATE METHODS **************** //

    /**
     * Returns the list of screens
     * @type Array
     */
    getScreenURIs: function() {
        var result = new Array();
        this._screens.each(function(element) {
            result.push(element.uri);
        });
        return result;
    },

    /**
     * Returns the list of preconditions
     * @type Array
     */
    getPreconditions: function() {
        return this._preconditions;
    },

    /**
     * Returns the list of postconditions
     * @type Array
     */
    getPostconditions: function() {
        return this._postconditions;
    },

    /**
     * Returns the id of an element by its URI
     * @type Array
     */
    getIds: function(/** String */ uri) {
        var elements = this._screens.findAll(function(element) {
            return element.uri == uri;
        });
        if (elements) {
            return elements.collect(function(element){return element.uri});
        } else {
            return null;
        }
    },

    /**
     * Returns the parameters of an element by its URI
     * @type Object
     */
    getParams: function (/** String */ id) {
        return "";
    },

    /**
     * Returns the position of an element by its URI
     * @type Object
     */
    getPosition: function (/** String */ id) {
        var element = this._screens.detect(function(element) {
            return element.uri == id;
        });
        if (element) {
            return element.position;
        } else {
            return null;
        }
    },

    /**
     * Returns the orientation of an element by its URI
     * @type Object
     */
    getOrientation: function (/** String */ id) {
        var element = this._screens.detect(function(element) {
            return element.uri == id;
        });
        if (element) {
            return element.orientation;
        } else {
            return null;
        }
    },

    /**
     * Sets a buildingblock type as already loaded
     */
    setLoaded: function (/** String */ buildingblocktype) {
        this._elementsLoaded.push(buildingblocktype);
    },

    /**
     * Returns true if all the buildingblocks (operators, services and
     * resources), have been loaded
     * @type Boolean
     */
    areInstancesLoaded: function() {
        return this._elementsLoaded.indexOf(Constants.BuildingBlock.SCREEN) != -1;
    }

});

// vim:ts=4:sw=4:et:

var Fact = Class.create(
    /** @lends Fact.prototype */ {

    /**
     * Describes an individual fact.
     * @constructs
     */
    initialize: function (
        /** String */ uri,
        /** String */ shortcut,
        /** String */ description
    ) {
        /**
         * Fact identifier.
         * @type String
         */
        this._uri = uri;

        /**
         * Fact shortcut.
         * @type String
         */
        this._shortcut = shortcut;

        /**
         * Brief description.
         * @type String
         */
        this._description = description;
    },

    // **************** PUBLIC METHODS **************** //


    /**
     * Gets the fact identifier.
     * @return String
     */
    getUri: function (){
        return this._uri;
    },


    /**
     * Gets the fact shortcut.
     * @return String
     */
    getShortcut: function (){
        return this._shortcut;
    },


    /**
     * Gets the fact brief description.
     * @return String
     */
    getDescription: function (){
        return this._description;
    }

    // **************** PRIVATE METHODS **************** //
});

// vim:ts=4:sw=4:et:

/**
 * This class is used to create facts representations.
 * @constructs
 */
var FactFactory = Class.create();

// **************** STATIC ATTRIBUTES **************** //

Object.extend(FactFactory, {
    /**
     * Cached facts.
     * @type Hash
     * @private
     */
    _cachedFacts: new Hash(),

    /**
     * This array stores the shortcuts
     * being used in the execution
     * @type Array
     * @private
     */
    _cachedShortcuts: new Array()
});

// **************** STATIC METHODS ******************* //

Object.extend(FactFactory, {

    /**
     * Gets the root node of a icon for a give fact identified by uri.
     * @param String size  Icon size ("inline"|"embedded"|"standalone")
     * @type FactIcon
     */
    getFactIcon: function (/** Object */ factData, size) {
        var fact = this._getFact(factData);
        return new FactIcon(fact, size);
    },

    /**
     * Gets the fact uri
     * @type String
     */
    getFactUri: function (/** Object */ factData) {
        var uri;
        if (factData.uri) {
            uri = factData.uri;
        } else if (factData.pattern) {
            uri = Utils.extractURIfromPattern(factData.pattern);
        }
        else { //We don't know the uri
            uri = "http://unknown.uri#?";
        }
        return uri;
    },

    // **************** PRIVATE METHODS **************** //

    /**
     * Gets a fact
     * @type Fact
     * @private
     */
    _getFact: function (/** Object */ factData) {

        var uri = this.getFactUri(factData);

        //The fact didn't exist, create a new one
        if(this._cachedFacts.get(uri)==null){
                this._cachedFacts.set(uri, new Fact(uri,
                    this._extractShortcut(uri), this._extractDescription(factData)));
        }
        return this._cachedFacts.get(uri);
    },


    /**
     * This function returns a shortcut coming from the URI
     * TODO: Add more criteria to determine the shortcut
     * @type String
     * @private
     */
    _extractShortcut: function(/** String */ uri) {
        var pieces = uri.split("#");
        var identifier = "";
        if (pieces.length > 1){
            identifier = pieces[1];
        } else { //The uri has not identifier, try the last part of the url
            pieces = uri.split("/");
            identifier = pieces[pieces.length - 1];
        }

        identifier = identifier.substr(0, 1).toUpperCase() + identifier.substr(1);

        //Let's try with capital letters...
        var letters = identifier.match(/[A-Z]/g);
        if (letters && letters.length > 1) { //More than one capital letter
            //try only with 2 letters
            //Put the second letter in lower case
            //letters[1]= letters[1].toLowerCase();
            shortcut = letters.slice(0, 2).join("");

            if (this._cachedShortcuts.indexOf(shortcut) == -1) {
                this._cachedShortcuts.push(shortcut);
                return shortcut;
            }
        }

        //Let's try with the first two letters
        identifier[1]= identifier[1].toLowerCase();
        var shortcut = identifier.slice(0,2);
        if (this._cachedShortcuts.indexOf(shortcut) == -1){
            this._cachedShortcuts.push(shortcut);
            return shortcut;

        }
        //If none of the above have worked out, show the first letter
        //Despite they have been used before
        shortcut = identifier.slice(0, 1);
        return shortcut;
    },

    /**
     * This function extract the description from fact or concept metadata
     * @private
     * @type String
     */
    _extractDescription: function(/** Object */ factData) {
        if(factData.label && factData.label['en-gb']) {
            return factData.label['en-gb'];
        }
        var comment = factData["http://www.w3.org/2000/01/rdf-schema#comment"];
        if(comment) {
            return comment.replace("@en","");
        }
        var label = factData["http://www.w3.org/2000/01/rdf-schema#label"];
        if(label) {
            return label.replace("@en","");
        }
    }
});

// vim:ts=4:sw=4:et:

var FactIcon = Class.create( /** @lends FactIcon.prototype */ {

    /**
     * Graphical representation of a fact.
     * @constructs
     * @param Fact fact
     * @param String size  Icon size ("inline"|"embedded"|"standalone")
     */
    initialize: function(fact, size) {
        /**
         * Fact
         * @type Fact
         * @private
         */
        this._fact = fact;

        /**
         * Icon size
         * @type String
         * @private
         */
        this._size = size;

        /**
         * Fact icon root node
         * @type DOMNode
         * @private
         */
        this._node = new Element ("div", {
                "class": this._size + "_fact fact"
                });

        var contentLayer = new Element("div", {
                "class": "contentLayer"
                });
        this._node.appendChild(contentLayer);
        contentLayer.update(this._fact.getShortcut());

        var recommendationLayer = new Element("div", {
            "class": "recommendationLayer"
            });
        this._node.appendChild(recommendationLayer);
    },


    // **************** PUBLIC METHODS **************** //


    /**
     * Gets the root node.
     * @type DOMNode
     * @public
     */
    getNode: function () {
        return this._node;
    },
     /**
     * Gets the fact object
     * @type Fact
     * @public
     */
    getFact: function () {
        return this._fact;
    }

    // **************** PRIVATE METHODS **************** //
});

// vim:ts=4:sw=4:et:

var MenuOptions = Class.create({
    initialize: function(domNode) {
        this._dijitMenu = new dijit.Menu();
        if (domNode) {
            this.bindDomNode(domNode);
        }
    },

    bindDomNode: function(domNode) {
        this._dijitMenu.bindDomNode(domNode);
    },

    addOption: function(label, handler, options) {
        var menuCfg = {label:label, onClick:handler};
        if (options) {
            Object.extend(menuCfg, options)
        }
        var menuItem = new dijit.MenuItem(menuCfg);
        this._dijitMenu.addChild(menuItem);
    }
});

var ComponentInstance = Class.create(DragSource,
    /** @lends ComponentInstance.prototype */ {

    /**
     * This class is an instance of a palette component
     * in the Document area
     * @constructs
     * @extends DragSource
     */
    initialize: function($super, /**BuildingBlockDescription*/ buildingBlockDescription,
             /** InferenceEngine */ inferenceEngine) {
        $super();

        /**
         * BuildingBlock description this class is instance of
         * @type BuildingBlockDescription
         * @private @member
         */
        this._buildingBlockDescription = buildingBlockDescription;

        /**
         * Identification of the instance inside its container
         * @type String
         * @private
         */
        this._id = null;

        /**
         * Orientation of the instance inside its container
         * @type Integer
         * @private
         */
        this._orientation = 0;


        /**
         * Title of the instance
         * @private
         * @type String
         */
        this._title = this._buildingBlockDescription.getTitle();

        /**
         * BuildingBlock description graphical representation
         * @type BuildingBlockView
         * @private
         */
        this._view = this._createView();

        this._menu = new MenuOptions(this._view.getNode());
        this._menu.addOption('Delete', function(){
            this.document.deleteInstance(this);
        }.bind(this));

        /**
         * BuildingBlock params
         * @type String
         * @private
         */
        this._params = '{}';

        /**
         * Inference engine to receive reachability updates
         * @type InferenceEngine
         * @private
         */
        this._inferenceEngine = inferenceEngine;

        /**
         * Event listener
         * @type Object
         * @private
         */
        this._listener = null;

        this.document = null;

        if (this.getUri()) {
            this._inferenceEngine.addReachabilityListener(this.getUri(), this._view);
        }


    },

    // **************** PUBLIC METHODS **************** //

    /**
     * Somehow something the user can comprehend
     * Implementing TableModel interface
     * @type String
     */
    getTitle: function() {
        return this._title;
    },

    /**
     * This function returns an array of lines representing the
     * key information of the building block, in order to be shown in
     * a table
     * Implementing TableModel interface
     * @type Hash
     */
    getInfo: function() {
        var info = new Hash();

        info.set('Title', this.getTitle());
        info.set('Description', this._buildingBlockDescription.description['en-gb']);
        info.set('Tags', this._buildingBlockDescription.tags.collect(function(tag) {
                return tag.label['en-gb'];
            }).join(", "));

        var params = document.createElement('div');
        var paramsText = this.getParams();
        var parameterized = paramsText.strip().length > 0;
        if (parameterized) {
            try {
                var json = json = cjson_parse(paramsText);

                parameterized = false;
                for (var i in json) {
                    params.addClassName('json-icon-bg');
                    parameterized = true;
                    break;
                }
            } catch (e) {
                params.addClassName('text-icon-bg');
            }
        }

        if (!parameterized) {
            var span = document.createElement('span');
            span.addClassName('triggerInfo');
            span.appendChild(document.createTextNode('No parameterized'));
            params.appendChild(span);
        }

        var paramsDialog = new ParamsDialog(this.getTitle(),
                               this.getParams(),
                               this._buildingBlockDescription.parameterTemplate,
                               this.setParams.bind(this));
        params.appendChild(paramsDialog.getButtonNode());

        info.set('Parameters', params);
        return info;
    },


    /**
     * Adds event listener
     */
    setEventListener: function(/** Object */ listener) {
        this._listener = listener;
        this.document = listener;
    },

    /**
     * Returns the uri of the instance
     * @type
     */
    getUri: function() {
        return this._buildingBlockDescription.uri;
    },

    /**
     * Returns the node that can be clicked to start a drag-n-drop operation.
     * @type DOMNode
     * @override
     */
    getHandlerNode: function() {
        return this._view.getNode();
    },

    /**
     * Returns the node that is going to be moved in drag-n-drop operation.
     * @type DOMNode
     * @override
     */
    getDraggableObject: function() {
        return this;
    },

     /**
     * Returns the root node
     * @type DOMNode
     * @public
     */
    getView: function() {
        return this._view;
    },

    /**
     * Gets the component orientation
     * @type Integer
     * @public
     */
    getOrientation: function() {
        return this._orientation;
    },

    /**
     * Sets the component orientation
     * @params Integer
     * @public
     */
    setOrientation: function(/** Object */ orientation) {
        this._orientation = orientation;
    },

    /**
     * Gets the component params
     * @type Object
     * @public
     */
    getParams: function() {
        return this._params;
    },

    /**
     * Sets the component params
     * @params Object
     * @public
     */
    setParams: function(/** Object */ params) {
        this._params = params;

        if (this._listener && this._listener.modified) {
            this._listener.modified(this);
        }
    },

    /**
     * Sets the title of the instance
     * @public
     */
    setTitle: function(/** String */ title) {
        this._title = title;
        this._view.setTitle(title);

        if (this._listener && this._listener.modified) {
            this._listener.modified(this);
        }
    },

    /**
     * Returns the building block description
     * @public
     */
    getBuildingBlockDescription: function() {
        return this._buildingBlockDescription;
    },


    /**
     * Returns the building block type of this class
     * @public
     */
    getBuildingBlockType: function() {
        return this._buildingBlockType;
    },


    /**
     * Gets the id
     */
    getId: function() {
        return this._id;
    },


    /**
     * Sets the id
     */
    setId: function(id) {
        this._id = id;
    },

    /**
     * Destroys the view
     * @public
     */
    destroy: function() {
        this._inferenceEngine.removeReachabilityListener(this._buildingBlockDescription.uri, this._view);
        this._view.destroy();
        this._view = null;
    },

    /**
     * On position update
     */
    onUpdate: function(/** Number */ x, /** Number */ y) {},

    /**
     * Drop event handler for the DragSource
     * @param changingZone
     *      True if a new Instance has
     *      been added to the new zone.
     * @override
     */
    onFinish: function(changingZone, /** Object */ position) {
        if (changingZone) {
            this._view.addEventListener (function(event){
                event.stop();
                this._onClick();
            }.bind(this),'mousedown');
            this._view.addEventListener (function(event){
                event.stop();
            },'click');
            this._view.addEventListener (function(event){
                event.stop();
                this._onDoubleClick(event);
            }.bind(this),'dblclick');
        } else {
            if (this._listener) {
                this._listener.positionUpdated(this, position);
            }
        }
        this.onUpdate();
    },

    /**
     * This function returns a list with all the
     * preconditions of the instance,
     * ready to be set in the FactPane
     * @type Array
     */
    getPreconditionTable: function(/** Hash */ reachability) {
        var conditions = this._buildingBlockDescription.getPreconditionsList();
        return $A(conditions).map(function(condition){
            return this._getConditionItem(condition, reachability);
        }.bind(this));
    },

    /**
     * This function returns a list with all the
     * postconditions of the instance,
     * ready to be set in the FactPane
     * @type Array
     */
    getPostconditionTable: function(/** Boolean */ reachability) {
        var conditions = this._buildingBlockDescription.getPostconditionsList();
        return $A(conditions).map(function(condition){
            return this._getConditionItem(condition, reachability);
        }.bind(this));
    },

    // **************** PRIVATE METHODS **************** //

    /**
     * Creates a new View instance for the component
     * @type BuildingBlockView
     * @abstract
     */
    _createView: function () {
        throw "Abstract Method invocation: ComponentInstance::_createView"
    },

    /**
     * This function is called when the attached view is clicked
     * must be overriden by descendants
     * @private
     */
    _onClick: function (){
        if (this._listener) {
            this._listener.elementClicked(this);
        }
    },
    /**
     * This function is called when the attached view is dbl-clicked
     * must be overriden by descendants
     * @private
     */
    _onDoubleClick: function (/** Event */ event){
        if (this._listener) {
            this._listener.elementDblClicked(this, event);
        }
    },

    /**
     * Gets a line of the list
     * @private
     * @type String
     */
    _getConditionItem: function(/** Object */ condition, /** Object */ reachability) {
        var uri = FactFactory.getFactUri(condition);

        var fact = FactFactory.getFactIcon(condition, "embedded").getNode();
        if (reachability.constructor == Hash) {
            Utils.setSatisfeabilityClass(fact, reachability.get(uri));
        } else {
            Utils.setSatisfeabilityClass(fact, reachability);
        }

        if (condition.positive === false) {
            fact.addClassName('negative');
        }

        var description = condition.label['en-gb'];

        return [fact, description, uri];
    }

});

// vim:ts=4:sw=4:et:

var ScreenInstance = Class.create(ComponentInstance,
    /** @lends ScreenInstance.prototype */ {

    /**
     * Screen instance.
     * @constructs
     * @extends ComponentInstance
     */
    initialize: function($super, /**BuildingBlockDescription*/ buildingBlockDescription,
             /** InferenceEngine */ inferenceEngine) {
        $super(buildingBlockDescription, inferenceEngine);

        /**
         * @type PreviewDialog
         * @private @member
         */
        this._dialog = null;

        this._menu.addOption('Preview', function(){
            this.showPreviewDialog();
        }.bind(this));
        if (this.getBuildingBlockDescription().definition != null) {
            this._menu.addOption('Clone', function(){
                this.document.cloneElement(this);
            }.bind(this));
        }
        this._menu.addOption('Create a Plan', function(){
            this.document.getPlansElement(this);
        }.bind(this));
    },

    // **************** PUBLIC METHODS **************** //

    /**
     * @override
     */
    getInfo: function() {
        var info = new Hash();
        var titleDialog = new TitleDialog(this.getTitle(),
                                          this.setTitle.bind(this));
        var titleArea = new Element("div");
        var titleText = new Element("span").update(this.getTitle());
        titleArea.appendChild(titleText);
        titleArea.appendChild(titleDialog.getButtonNode());
        info.set('Title', titleArea);
        info.set('Description', this._buildingBlockDescription.description['en-gb']);
        info.set('Tags', this._buildingBlockDescription.tags.collect(function(tag) {
                return tag.label['en-gb'];
            }).join(", "));
        return info;
    },

    /**
     * This function shows the dialog to change
     * the instance properties
     */
    showPreviewDialog: function () {
        if (!this._dialog) {
            this._dialog = new PreviewDialog(this.getTitle(), this._buildingBlockDescription.getPreview());
        }
        this._dialog.show();
    },

    // **************** PRIVATE METHODS **************** //
    /**
     * Creates a new View instance for the component
     * @type BuildingBlockView
     * @override
     */
    _createView: function () {
        return new ScreenView(this._buildingBlockDescription);
    },

    /**
     * This function is called when the attached view is dbl-clicked
     * @private
     * @override
     */
    _onDoubleClick: function (/** Event */ event){
        this.showPreviewDialog();
    }
});

// vim:ts=4:sw=4:et:

var PrePostInstance = Class.create(ComponentInstance,
    /** @lends PrePostInstance.prototype */ {

    /**
     * Pre or Post instance.
     * @constructs
     * @extends ComponentInstance
     */
    initialize: function($super, /** BuildingBlockDescription */ domainConceptDescription,
            /** InferenceEngine */ inferenceEngine, /** Boolean (Optional) */ _isConfigurable) {

        $super(domainConceptDescription.clone(), inferenceEngine);

        if (!this._buildingBlockDescription.pattern) {
            this._buildingBlockDescription.pattern = "?x " +
                "http://www.w3.org/1999/02/22-rdf-syntax-ns#type " +
                this._buildingBlockDescription.uri;
        }


        if (!this._buildingBlockDescription.label) {
            this._buildingBlockDescription.label = {
                'en-gb': this._buildingBlockDescription.title
            };
        }

        if (this._buildingBlockDescription.id) {
            this._id = this._buildingBlockDescription.id;
        }

        /**
         * @type DomainConceptDialog
         * @private @member
         */
        this._dialog = null;


        /**
         * @private @member
         * @type Function
         */
        this._changeHandler = null;


        /**
         * Terminal for screen design
         * @type Terminal
         * @private
         */
        this._terminal = null;

        /**
         * It states if the instance
         * can be configured by the user
         * @type Boolean
         * @private
         */
        this._isConfigurable = Utils.variableOrDefault(_isConfigurable, true);
    },

    // **************** PUBLIC METHODS **************** //

    /**
     * This function returns the relevant info
     * to the properties table
     * Implementing TableModel interface
     * @overrides
     */
    getInfo: function() {
        var info = new Hash();
        info.set('Title', this.getTitle());
        info.set('Uri', this._buildingBlockDescription.uri);
        info.set('Type', this.getType());
        if (this._buildingBlockDescription.properties) {
            info.set('EzWeb Binding', this._buildingBlockDescription.properties.ezweb.binding);
            info.set('Friendcode', this._buildingBlockDescription.properties.ezweb.friendcode);
            info.set('Variable Name',this._buildingBlockDescription.properties.ezweb.variableName);
        }
        return info;
    },

    /**
     * Returning the type in {pre|post}
     */
    getType: function() {
        return this._buildingBlockDescription.type;
    },


    /**
     * Returns an object representing
     * the fact
     * @type Object
     */
    toJSONForScreen: function() {
        return {
                'label': this._buildingBlockDescription.label,
                'pattern': this._buildingBlockDescription.pattern,
                'positive': true,
                'uri': this._buildingBlockDescription.uri,
                'id': this.getId(),
                'type': this._buildingBlockDescription.type
            };
    },


    /**
     * Returns an object representing
     * the fact
     * @type Object
     */
    toJSONForScreenflow: function() {
        return {
            'conditions': [this._getCondition()],
            'id': this.getId(),
            'catalogueUri': this._buildingBlockDescription.catalogueUri,
            'semantics': this._buildingBlockDescription.uri,
            'binding': this._buildingBlockDescription.properties.ezweb.binding,
            'friendcode': this._buildingBlockDescription.properties.ezweb.friendcode,
            'variableName': this._buildingBlockDescription.properties.ezweb.variableName,
            'label': this.getTitle(),
            'type': this._buildingBlockDescription.type,
            'uri': this._buildingBlockDescription.uri
        };
    },

    /**
     * @override
     */
    getUri: function() {
        return this._buildingBlockDescription.catalogueUri;
    },

    /**
     * Set the type in pre | post
     */
    setType: function(/** String */ type) {
        this._buildingBlockDescription.type = type;
        if (this._isConfigurable) {
            var data = {
                'label': this.getTitle()
            };
            if (this._buildingBlockDescription.properties) {
                data = Object.extend(data, this._buildingBlockDescription.properties.ezweb)
            } else {
                if (this._buildingBlockDescription.binding) {
                    data = Object.extend (data, {
                        'binding': this._buildingBlockDescription.binding,
                        'variableName': this._buildingBlockDescription.variableName,
                        'friendcode': this._buildingBlockDescription.friendcode
                    });
                } else {
                     data = Object.extend(data, {
                        'binding': this._buildingBlockDescription.type == 'pre' ? 'slot' : 'event',
                        'variableName': this.getTitle().replace(" ",""),
                        'friendcode': this.getTitle().replace(" ", "")
                    });
                }

            }
            this._onChange(data);
        } else {
            this._onClick();
        }
    },

    /**
     * Sets the configurable status
     */
    setConfigurable: function(/** Boolean */ configurable) {
        this._isConfigurable = configurable;
    },

    /**
     * Due to the slopy catalogue implementation, uri changes can
     * be notified via handler.
     * @public
     */
    setChangeHandler: function(/** Function */ handler) {
        this._changeHandler = handler;
    },

    /**
     * This function shows the dialog to change
     * the instance properties
     */
    showPreviewDialog: function () {
        if (this._isConfigurable) {
            if (!this._dialog) {
                this._dialog = new PrePostDialog(this._onChange.bind(this),
                                                 this.getTitle(),
                                                 this._buildingBlockDescription.type);
            }
            this._dialog.show();
        }
    },

    /**
     * Returns a list the
     * information about the instance
     * ready to be set in the FactPane
     * @type Array
     */
    getConditionTable: function(/** Boolean */ reachabilityInfo) {
        var fact = FactFactory.getFactIcon(this._getCondition(), "embedded").getNode();
        var reachable;
        if (reachabilityInfo !== undefined) {
            reachable = reachabilityInfo;
        } else {
            reachable = this._view.getNode().hasClassName("satisfeable");
        }
        Utils.setSatisfeabilityClass(fact, reachable);

        return [fact, this.getTitle(), this._buildingBlockDescription.uri];
    },

    /**
     * Creates the terminal
     */
    createTerminal: function(/** Function (Optional) */ _handler) {
        var options = {
            'direction':[],
            'offsetPosition': {},
            'wireConfig': {
                'drawingMethod': 'arrows'
            }
        };
        if (this._buildingBlockDescription.type == 'pre') {
            options.alwaysSrc = true;
            options.direction = [1,0];
            options.offsetPosition = {
                'top': 2,
                'left': 15
            };
            options.ddConfig = {// A precondition in screen design is an output
                                // (data to be consumed inside the screen)
                'type': 'output',
                'allowedTypes': ['input']
            };
        } else {
            options.direction = [-1,0];
            options.offsetPosition = {
                'top': 2,
                'left': -8
            };
            options.ddConfig = { // Viceversa
                'type': 'input',
                'allowedTypes': ['output']
            };
        }

        this._terminal = new Terminal(this._view.getNode(), options, this,
                                        this.getId());
        if (this._buildingBlockDescription.type == 'pre') {
            this._terminal.onWireHandler(_handler);
        }
    },

    /**
     * Gets the terminal
     * @type Terminal
     */
    getTerminal: function() {
        return this._terminal;
    },

    /**
     * Destroy the instance
     * @override
     */
    destroy: function($super, /** Boolean */ removeFromServer) {
        if (this._buildingBlockDescription.catalogueUri && removeFromServer) {
            var catalogueResource = (this._buildingBlockDescription.type == 'pre') ?
                                    URIs.pre : URIs.post;
            this._removeFromServer(catalogueResource + this.getId());
        }
        if (this._terminal) {
            this._terminal.destroy();
            this._terminal = null;
        }
        $super();
    },

    /**
     * On position update
     * @override
     */
    onUpdate: function(/** Number */ x, /** Number */ y) {
        if (this._terminal) {
            this._terminal.updatePosition();
        }
    },

    // **************** PRIVATE METHODS **************** //
    /**
     * Creates a new View instance for the component
     * @type BuildingBlockView
     * @override
     */
    _createView: function () {
        return new DomainConceptView(this._buildingBlockDescription);
    },

    /**
     * This function is called when the attached view is dbl-clicked
     * @private
     * @override
     */
    _onDoubleClick: function (/** Event */ event) {
        this.showPreviewDialog();
    },

    /**
     * Returns an object representing
     * a single fact
     * @type Object
     * @private
     */
    _getCondition: function() {
        return {
                'label': {
                    'en-gb': this.getTitle()
                },
                'pattern': this._buildingBlockDescription.pattern,
                'positive': true,
                'uri': this._buildingBlockDescription.uri
            };
    },

    /**
     * Returns an object representing
     * the fact
     * @type Object
     * @private
     */
    _toJSONForCatalogue: function() {
        return {
            'conditions': [this._getCondition()],
            'id': this.getId(),
            'name': this.getTitle()
        };
    },

    /**
     * This function is called when the dialog is saved
     * @private
     */
    _onChange: function (/** Object */ data) {
        this._buildingBlockDescription.title = data.label;
        if (data.binding) {
            this._buildingBlockDescription.properties = {
                'ezweb': {
                    'binding': data.binding,
                    'variableName': data.variableName,
                    'friendcode': data.friendcode
                }
            }
        }

        if (!this._buildingBlockDescription.catalogueUri) {
            // Calling the server to add the pre/post
            var catalogueResource = (this._buildingBlockDescription.type == 'pre') ? URIs.pre : URIs.post;
            this._id = new Date().valueOf();
            PersistenceEngine.sendPost(catalogueResource,
                            null, Object.toJSON(this._toJSONForCatalogue()), this,
                            this._onPostSuccess, Utils.onAJAXError);
        } else {
            this._onClick();
        }
    },
    /**
     * onSuccess callback
     * @private
     */
    _onPostSuccess: function (/** XMLHttpRequest */ transport) {
        var result = JSON.parse(transport.responseText);
        this._buildingBlockDescription.catalogueUri = result.uri;


        this._inferenceEngine.addReachabilityListener(result.uri, this._view);

        // Notify change
        this._changeHandler(this);

    },

    /**
     * onDeleteSucces
     * @private
     */
    _onDeleteSuccess: function(/** XMLHttpRequest */ transport){
        console.log('deleted');
    },


    /**
     * This function removes a pre/post from the server
     * @private
     */
    _removeFromServer: function(/** String */ uri) {
        PersistenceEngine.sendDelete(uri,
            this,
            this._onDeleteSuccess, Utils.onAJAXError);
    }

});

// vim:ts=4:sw=4:et:

var ScreenComponentInstance = Class.create(ComponentInstance,
/** @lends ScreenComponentInstance.prototype */ {

    /**
     * Destroy the instance
     * @override
     */
    destroy: function($super, /** Boolean */ removeFromServer) {
        $super();
        this._destroyTerminals();
    },

    /**
     * Create the terminals
     */
    createTerminals: function(handlers) {
        this._destroyTerminals();
        this._terminals = new Hash();
        this._buildPreConditionsTerminals(handlers, this);
        this._buildPostConditionsTerminals(handlers, this);
    },

    /**
     * Update position of the terminals
     * @override
     */
    updateTerminals: function() {
        if (this._terminals) {
            this._terminals.values().each(function(terminalGroup) {
                terminalGroup.values().each(function(terminal) {
                    terminal.updatePosition();
                });
            });
        }
    },

    /**
     * Gets a terminal from an id
     * @type Terminal
     */
    getTerminal: function(/** String */ id, /** String (Optional) */ _action) {
        var terminal = null;
        if (this._terminals) {
            if (_action) {
                var actionTerminals = this._terminals.get(_action);
                if (actionTerminals) {
                    terminal = actionTerminals.get(id);
                }
            } else {
                terminal = this._terminals.get("postconditions").get(id);
            }
        }
        return terminal;
    },

    /**
     * On position update
     * @override
     */
    onUpdate: function($super, /** Number */ x, /** Number */ y) {
        $super();
        this.updateTerminals();
    },

    // **************** PRIVATE METHODS **************** //

    /**
     * Destroy the terminals
     */
    _destroyTerminals: function() {
        if (this._terminals) {
            this._terminals.values().each(function(terminalGroup){
                terminalGroup.values().each(function(terminal){
                    terminal.destroy();
                });
            });
            this._terminals = null;
        }
    },

        /**
     * Creates the preconditions terminals
     */
    _buildPreConditionsTerminals: function(handlers, instance) {
        var options = {
            direction:[0,1],
            wireConfig: { 'drawingMethod': 'arrows' },
            ddConfig: {
                type: 'input',
                allowedTypes: ['output']
            }
        };

        if (this._preOffsetPosition) {
            options.offsetPosition = this._preOffsetPosition;
        }

        this._buildingBlockDescription.actions.each(function(action) {
            var preconditions = action.preconditions;
            var actionTerminals = this._buildTerminals(
                preconditions,
                instance,
                options,
                handlers,
                action.name
            );
            this._terminals.set(action.name, actionTerminals);
        }.bind(this));
    },

    /**
     * Creates the postconditions terminals
     */
    _buildPostConditionsTerminals: function(handlers, instance) {
        var options = {
            direction:[0,1],
            wireConfig: { 'drawingMethod': 'arrows' },
            alwaysSrc: true,
            ddConfig: {
                type: 'output',
                allowedTypes: ['input']
            }
        };

        if (this._postOffsetPosition) {
            options.offsetPosition = this._postOffsetPosition;
        }

        var posts = this._buildingBlockDescription.postconditions;
        if (posts && posts[0] instanceof Array) {
            posts = this._buildingBlockDescription.postconditions[0];
        }

        var terminals = this._buildTerminals(posts, instance, options, handlers);
        this._terminals.set("postconditions", terminals);
    },

    /**
     * Build terminals Object
     * @type Hash<ConditionId, Terminal>
     */
    _buildTerminals: function(conditions, instance, options, handlers, _name) {
        var conditionTerminals = new Hash();
        conditions.each(function(condition) {
            var node = this._view.getConditionNode(condition.id, _name);
            var terminal = new Terminal(node, options, instance, condition.id, _name);
            terminal.onWireHandler(handlers);
            conditionTerminals.set(condition.id, terminal);
        }.bind(this));
        return conditionTerminals;
    }
});

var ResourceInstance = Class.create(ScreenComponentInstance,
    /** @lends ResourceInstance.prototype */ {

    _preOffsetPosition:  {top:-6, left:4},
    _postOffsetPosition: {top:-6, left:4},

    // **************** PRIVATE METHODS **************** //

    /**
     * Creates a new View instance for the component
     * @type BuildingBlockView
     * @override
     */
    _createView: function () {
        return new ResourceView(this._buildingBlockDescription);
    }

});

// vim:ts=4:sw=4:et:

var OperatorInstance = Class.create(ScreenComponentInstance,
    /** @lends OperatorInstance.prototype */ {

    _preOffsetPosition:  {top:6, left:0},
    _postOffsetPosition: {top:-10, left:2},

    initialize:function($super, buildingBlockDescription, inferenceEngine) {
        $super(buildingBlockDescription, inferenceEngine);
        this._menu.addOption('Rotate', function() {
            this.document.rotateInstance(this);
        }.bind(this));
    },

    // **************** PUBLIC METHODS **************** //

    /**
     * On rotate
     * @override
     */
    onRotate: function(/** Number */ orientation) {
        this.updateTerminals();
    },

    // **************** PRIVATE METHODS **************** //

    /**
     * Creates a new View instance for the component
     * @type BuildingBlockView
     * @override
     */
    _createView: function () {
        return new OperatorView(this._buildingBlockDescription, this._orientation);
    }

});

// vim:ts=4:sw=4:et:

var FormInstance = Class.create(ScreenComponentInstance,
    /** @lends FormInstance.prototype */ {

    _preOffsetPosition:  {top:6, left:2},
    _postOffsetPosition: {top:9, left:2},

    initialize:function($super, buildingBlockDescription, inferenceEngine) {
        $super(buildingBlockDescription, inferenceEngine);
        this._menu.addOption('Preview', this.showPreviewDialog.bind(this));
    },

    // **************** PUBLIC METHODS **************** //

    /**
     * This function shows the dialog to change
     * the instance properties
     */
    showPreviewDialog: function () {
        if (! this._dialog) {
            var title = this.getTitle();
            var preview = this._buildingBlockDescription.getPreview();
            this._dialog = new PreviewDialog(title, preview);
        }
        this._dialog.show();
    },

    // **************** PRIVATE METHODS **************** //
    /**
     * Creates a new View instance for the component
     * @type BuildingBlockView
     * @override
     */
    _createView: function () {
        return new FormView(this._buildingBlockDescription);
    },

    /**
     * This function is called when the attached view is dbl-clicked
     * @private
     * @override
     */
    _onDoubleClick: function (/** Event */ event){
        this.showPreviewDialog();
    }

});

// vim:ts=4:sw=4:et:

var Palette = Class.create(SetListener, /** @lends Palette.prototype */ {

    /**
     * Represents a palette of droppable components of a given type.
     *
     * @constructs
     * @extends SetListener
     */
    initialize: function(/** BuildingBlockSet */ set, /** Array */ dropZones,
            /** InferenceEngine */ inferenceEngine) {
        /**
         * @private @member
         * @type InferenceEngine
         */
        this._inferenceEngine = inferenceEngine;

        /**
         * Building block set
         * @type BuildingBlockSet
         * @private @member
         */
        this._set = set;

        /**
         * Zones to drop components
         * @type Array
         * @private @member
         */
        this._dropZones = dropZones;

        /**
         * Collection of components the palette offers.
         * @type Hash   Hash of URI to PaletteComponent
         * @private @member
         */
        this._components = new Hash();

        /**
         * Accordion pane node.
         * @type DOMNode
         * @private @member
         */
        this._node = null;

        /**
         * Palette content
         * @type DOMNode
         * @private @member
         */
        this._contentNode = null;

        this._renderUI();
        this._set.setListener(this);
    },

    // **************** PUBLIC METHODS **************** //

    /**
     * Gets the node of the accordion pane
     * @type DOMNode
     * @public
     */
    getNode: function() {
        return this._node;
    },

    /**
     * Gets the node of the contents
     * @type DOMNode
     * @public
     */
    getContentNode: function() {
        return this._contentNode;
    },

    /**
     * This function will be called whenever
     * the set of building blocks changes
     * @overrides
     */
    setChanged: function () {
        this._updateComponents();
    },

    getBuildingBlockSet: function() {
        return this._set;
    },

    /**
     * All uris of all the components
     */
    getComponentUris: function() {
        var uris = [];
        this._set.getBuildingBlocks().each(function(buildingBlock) {
            uris.push({
                uri: buildingBlock.uri
            });
        });
        return uris;
    },

    // **************** PRIVATE METHODS **************** //

    /**
     * Creates the GUI stuff that shows the content: components and separators.
     * @type DOMNode
     * @private
     */
    _renderUI: function() {
        this._node = new dijit.layout.AccordionPane({
            'title':this._set.getBuildingBlockName(),
            'class':'paletteElement'
        });

        this._contentNode = new Element('div', {
            'class':'paletteContent'
        });

        this._searchBox = new PaletteSearchBox();
        this._searchBox.addEventListener(this._filterComponents.bind(this));
        this._node.setContent(this._searchBox.getDOMNode());

        this._searchBox.getDOMNode().insert({after:this._contentNode});
    },

    /**
     * Updates the palette components from building blocks by querying its building block factory.
     * @private
     */
    _updateComponents: function() {
        var descs = $A(this._set.getBuildingBlocks());
        var sortDescs = descs.sortBy(function(desc){ return desc.getTitle() });

        var component;
        var lastComponent;
        for (var i=0, desc; desc = sortDescs[i]; i++) {
            component = this._components.get(desc.uri);
            if (!component) {
                component = this._buildComponentFor(desc);
                if (lastComponent) {
                    lastComponent.insert({after: component.getNode()});
                } else {
                    this._contentNode.appendChild(component.getNode())
                }
                component.getNode().insert({after: new Element("div", {"class": "paletteSeparator"})});
            }
            lastComponent = component.getNode().next();
        }

        this._filterComponents();

        if (this._set.getBuildingBlockType() == Constants.BuildingBlock.SCREEN ||
            this._set.getBuildingBlockType() == Constants.BuildingBlock.FORM) {
            Utils.showMessage("Building blocks loaded", {'hide': true});
        }
    },

    /**
     * Hiden component if not match filter
     */
    _filterComponents: (function() {
        function matchFacts(svalue, facts){
            if (!facts) { return false }
            return facts.any(function(fact){
                return fact.textContent.toLowerCase().match(svalue)
            });
        }

        return function(input) {
            var svalue = this._searchBox.getValue().toLowerCase();
            var slots = this._contentNode.select('.slot');
            for(var i = 0; i < slots.length; i++) {
                var slot = slots[i];
                if (svalue.blank() ||
                    slot.select('.slotTitle').first().textContent.toLowerCase().match(svalue)||
                    matchFacts(svalue, slot.select('.contentLayer'))
                ) {
                    slot.show();
                } else {
                    slot.hide();
                }
            }
        }
    })(),

    /**
     * Build a new component
     */
    _buildComponentFor: function(/** BuildingBlockDescription */ desc) {
        var component = null;

        switch(this._set.getBuildingBlockType()) {
            case Constants.BuildingBlock.SCREEN:
                component = new ScreenComponent(desc, this._dropZones, this._inferenceEngine);
                break;

            case Constants.BuildingBlock.DOMAIN_CONCEPT:
                component = new DomainConceptComponent(desc, this._dropZones, this._inferenceEngine);
                break;

            case Constants.BuildingBlock.FORM:
                component = new FormComponent(desc, this._dropZones, this._inferenceEngine);
                break;

            case Constants.BuildingBlock.RESOURCE:
                component = new ResourceComponent(desc, this._dropZones, this._inferenceEngine);
                break;

            case Constants.BuildingBlock.OPERATOR:
                component = new OperatorComponent(desc, this._dropZones, this._inferenceEngine);
                break;

            default:
                throw "Unsupported building block type";
        }
        this._components.set(desc.uri, component);

        return component;
    }
});

// vim:ts=4:sw=4:et:

var PaletteComponent = Class.create(DragSource,
    /** @lends PaletteComponent.prototype */ {

    /**
     * GUI element that represents a palette element.
     * @constructs
     * @extends DragSource
     */
    initialize: function($super,/** BuildingBlockDescription */ buildingBlockDescription,
            /** Array */ dropZones, /** InferenceEngine */ inferenceEngine) {
        $super();

        /**
         * Component and instance Drop zone
         * @type Array
         * @private
         */
        this._dropZones = dropZones;

        /**
         * BuildingBlock in which this component is based.
         * @type BuildingBlockDescription
         * @private
         */
        this._buildingBlockDescription = buildingBlockDescription;

        /**
         * @type InferenceEngine
         * @private @member
         */
        this._inferenceEngine = inferenceEngine;

        /**
         * BuildingBlock view
         * @type BuildingBlockView
         * @private
         */
        this._view = this._createView();

        /**
         * Node of the component.
         * @type DOMNode
         * @private
         */
        this._node = this._createSlot();
    },

    // **************** PUBLIC METHODS **************** //

    /**
     * Gets the component root node.
     * @type DOMNode
     * @public
     */
    getNode: function() {
        return this._node;
    },


    /**
     * Returns the node that can be clicked to start a drag-n-drop operation.
     * @type DOMNode
     * @override
     */
    getHandlerNode: function() {
        return this._view.getNode();
    },

    /**
     * Creates a new palette component to be dragged.
     * Returned object must have a getNode() method.
     * @type Object
     * @override
     */
    getDraggableObject: function() {
        var instance = this._createInstance();
        var node = instance.getHandlerNode();
        document.body.appendChild(node);
        node.setStyle({
            'top': this._getContentOffsetTop() + 'px',
            'left':  this._getContentOffsetLeft() + 'px',
            'position': 'absolute'
        });
        return instance;
    },

    getBuildingBlockDescription: function() {
        return this._buildingBlockDescription;
    },

    /**
     * Returns the root node
     * @type DOMNode
     * @public
     */
    getView: function() {
        return this._view;
    },


    // **************** PRIVATE METHODS **************** //
    /**
     * Creates an slot (GUI frame around a component) with a given title.
     *
     * @private
     */
    _createSlot: function () {
        var node = new Element("div", {"class": "slot"});
        node.appendChild(this._view.getNode());
        var titleNode = new Element("div", {"class": "slotTitle"}).update(this._getTitle());
        node.appendChild(titleNode);
        this.enableDragNDrop(null, this._dropZones);

        return node;
    },

    /**
     * Gets the title of the palette component
     * @type String
     * @abstract
     */
    _getTitle: function () {
        throw "Abstract Method invocation: PaletteComponent::_getTitle"
    },

    /**
     * Creates a new View instance for the component
     * @type BuildingBlockView
     * @abstract
     */
    _createView: function () {
        throw "Abstract Method invocation: PaletteComponent::_createView"
    },


    /**
     * Creates a new component to be dragged.
     * @type ComponentInstance
     * @abstract
     */
    _createInstance: function () {
        throw "Abstract Method invocation: PaletteComponent::_createInstance"
    },

    /**
     * Calculates the distance from the window top to the palette component.
     * @type Integer
     * @private
     */
    _getContentOffsetTop: function() {

        return this.getView().getNode().cumulativeOffset().top -
                this.getView().getNode().cumulativeScrollOffset().top;
    },

    /**
     * Calculates the distance from the window left border to the palette
     * component.
     * @type Integer
     * @private
     */
    _getContentOffsetLeft: function() {

       return this.getView().getNode().cumulativeOffset().left -
                this.getView().getNode().cumulativeScrollOffset().left;
    },

    /**
     * Creates a new Tooltip for the component view
     * @type BuildingBlockView
     * @private
     */
    _createTooltip: function (/*DomNode View*/ node) {
        var screenName =this._buildingBlockDescription.getTitle();
        var screenVersion =  this._buildingBlockDescription.version;
        var screenDescription =  this._buildingBlockDescription.description['en-gb'];

        var pres =  this._getPreConditions();
        var posts =  this._getPostConditions();

        var content = document.createElement('div');
        var title = document.createElement('h3');
        title.appendChild(document.createTextNode(screenName+' '));
        var version = document.createElement('span');
        version.style.color = '#444';
        version.appendChild(document.createTextNode(screenVersion));
        title.appendChild(version);
        content.appendChild(title);

        var description = document.createElement('p');
        description.appendChild(document.createTextNode(screenDescription));
        content.appendChild(description);

        function buildTableConditions(conditions) {
            var table = document.createElement('table');
            for (var i=0;conditions && i < conditions.length; i++) {
                var condition = conditions[i];
                var label = condition.label['en-gb'];
                var preFact = FactFactory.getFactIcon(condition, "embedded");

                var td1 = document.createElement('td');
                td1.style.border = 'none';
                td1.style.width = '10%';
                td1.appendChild(preFact.getNode());

                var td2 = document.createElement('td');
                td2.style.border = 'none';
                td2.appendChild(document.createTextNode(label));

                var tr = document.createElement('tr');
                tr.appendChild(td1);
                tr.appendChild(td2);

                table.appendChild(tr);
            }
            return table;
        }

        if (pres && pres.length > 0) {
            var inputFacts = document.createElement('h4');
            inputFacts.appendChild(document.createTextNode('Input Facts:'));
            content.appendChild(inputFacts);
            content.appendChild(buildTableConditions(pres));
        }
        if (posts && posts.length > 0) {
            var inputFacts = document.createElement('h4');
            inputFacts.appendChild(document.createTextNode('Output Facts:'));
            content.appendChild(inputFacts);
            content.appendChild(buildTableConditions(posts));
        }

        var tip = new dijit.Tooltip({connectId:[node],
            label:'<div style="max-width:300px">'+content.innerHTML+'</div>'});
        tip.startup();
    },

    /**
     * This function returns a list with all the
     * preconditions of the component.
     * @private
     * @type Array
     */
    _getPreConditions: function() {
        return this._getConditions("preconditions")
    },

    /**
     * This function returns a list with all the
     * postconditions of the component.
     * @private
     * @type Array
     */
    _getPostConditions: function() {
        return this._getConditions("postconditions")
    },

    /**
     * This function returns a list with all the
     * conditions of the component.
     * @private
     * @type Array
     */
    _getConditions: function(/*String*/type) {
        var result = [];
        var conditions = this._buildingBlockDescription[type][0];
        for (var i=0; conditions && i < conditions.length; i++) {
            result.push(conditions[i]);
        }
        return result;
    }

});

// vim:ts=4:sw=4:et:

var PaletteController = Class.create(
    /** @lends PaletteController.prototype */ {

    /**
     * Manages a set of palettes.
     * @constructs
     * @param buildingBlocks
     *      Is an array of objects.
     *      Each objects contains the set for the building block
     *      and its associated drop zone
     */
    initialize: function(/** Array */ buildingBlockSets, /** Array */ dropZones,
        /** InferenceEngine */ inferenceEngine) {


        /**
         * List of available palettes
         * @type {Hash}
         * @private @member
         */
        this._palettes = new Hash();

        /**
         * AccordionContainer which contains the different palettes
         * @type AccordionContainer
         * @private @member
         */
        this._node = new dijit.layout.AccordionContainer({
                "class":"palettePane",
                "region":"left",
                "minSize":"170",
                "maxSize":"300",
                "splitter":"true",
                "livesplitters":"false",
                "style":"width:260px;"
                });

        //Create all the document necessary palettes
        $A(buildingBlockSets).each (function(set) {
            var validDropZones = new Array();
            dropZones.each(function(dropZone) {
                if (dropZone.accepts().include(set.getBuildingBlockType())) {
                    validDropZones.push(dropZone);
                }
            });
            var palette = new Palette (set, validDropZones, inferenceEngine);
            this._palettes.set(set.getBuildingBlockType(), palette);
            this._node.addChild(palette.getNode());
        }.bind(this));
    },

    // **************** PUBLIC METHODS **************** //
    getPalette: function (/** String */ type) {
        return this._palettes.get(type);
    },

    getNode: function() {
        return this._node;
    },

    /**
     * All uris of all the components (of all the palettes)
     */
    getComponentUris: function(/** String */ palette) {
        return this._palettes.get(palette).getComponentUris();
    }

    // **************** PRIVATE METHODS **************** //

});

// vim:ts=4:sw=4:et:

var PaletteSearchBox = Class.create(
    /** @lends PaletteSearchBox.prototype */ {

     /**
     * Represents a search box.
     *
     * @constructs
     */
    initialize: function(/* String */ defaultValue) {

        /**
         * @public @member
         * @type String
         */
        this.defaultValue = defaultValue || "Search...";

        /**
         * @private @member
         * @type Array
         */
        this._listeners = [];

        /**
         * @private @member
         * @type String
         */
        this._textSearch = "";

        /**
         * @private @member
         * @type Input Html Element of prototypejs.org
         */
        this._inputElement = new Element('input', {
            'type':'text',
            'class':'defaultValue',
            'value':this.defaultValue
        });
        this._inputElement.observe('blur', this._lostFocus.bind(this));
        this._inputElement.observe('focus', this._getFocus.bind(this));
        new Form.Element.Observer(this._inputElement, 1, this._valueChange.bind(this));

        /**
         * @private @member
         * @type Div Html Element of prototypejs.org
         */
        this._rootNode = new Element('div', {'class':'searchBox'}).insert(this._inputElement);
    },

     /**
     * Gets the value of the textbox
     * @type String
     * @public
     */
    getValue: function() {
        if (this._inputElement.hasClassName('defaultValue')) {
            return "";
        }
        return String.interpret(this._inputElement.value);
    },

    /**
     * Sets the value of the textbox
     * @public
     */
    setValue: function(/* String */ value) {
        this._inputElement.value = value
    },

    /**
     * Gets the node of the accordion pane
     * @type DOMNode
     * @public
     */
    getDOMNode: function() {
        return this._rootNode;
    },

    /**
     * Add a new listener
     * @public
     */
    addEventListener: function(/* Object (Listener)*/ listener) {
        this._listeners.push(listener);
    },

    /**
     * Text box set focus. event handler
     * @private
     */
    _getFocus: function() {
        if (this._inputElement.hasClassName('defaultValue')) {
            this._inputElement.value = "";
            this._inputElement.removeClassName('defaultValue');
        } else {
            this._inputElement.select();
        }
    },

    /**
     * Text box lost focus. event handler
     * @private
     */
    _lostFocus: function() {
        if (!this.getValue()) {
            this._inputElement.value = this.defaultValue;
            this._inputElement.addClassName('defaultValue');
        }
    },

    /**
     * Value change. event handler
     * @private
     */
    _valueChange: function() {
        this._textSearch = this.getValue();

        for (var i = 0; i < this._listeners.length; i++) {
            this._listeners[i](this, this._textSearch);
        }
    }
});

var ScreenComponent = Class.create(PaletteComponent,
    /** @lends ScreenComponent.prototype */ {

    /**
     * Palette component of a screen building block.
     * @param BuildingBlockDescription screenBuildingBlockDescription
     * @constructs
     * @extends PaletteComponent
     */
    initialize: function($super, description, dropZones, inferenceEngine) {
        $super(description, dropZones, inferenceEngine);
        this._inferenceEngine.addReachabilityListener(this._buildingBlockDescription.uri, this._view);
    },

    // **************** PUBLIC METHODS **************** //


    // **************** PRIVATE METHODS **************** //

    /**
     * Creates a new View instance for the component
     * @type BuildingBlockView
     * @private
     * @override
     */
    _createView: function () {
        var view = new ScreenView(this._buildingBlockDescription);
        this._createTooltip(view.getNode(), this._buildingBlockDescription);
        return view;
    },

    /**
     * Creates a new screen to be dragged.
     * @type ScreenInstance
     * @private
     * @override
     */
    _createInstance: function () {
        return new ScreenInstance(this._buildingBlockDescription, this._inferenceEngine);
    },

    /**
     * Gets the title of the palette component
     * @type String
     * @private
     */
    _getTitle: function() {
        return this._buildingBlockDescription.label['en-gb'];
    }
});

// vim:ts=4:sw=4:et:

var DomainConceptComponent = Class.create(PaletteComponent,
    /** @lends DomainConceptComponent.prototype */ {

    /**
     * Palette component of a domain concept building block.
     * @param BuildingBlockDescription domainConceptBuildingBlockDescription
     * @constructs
     * @extends PaletteComponent
     */
    initialize: function($super, description, dropZones, inferenceEngine) {
        $super(description, dropZones, inferenceEngine);
    },


    // **************** PUBLIC METHODS **************** //


    // **************** PRIVATE METHODS **************** //

    /**
     * Creates a new View instance for the component
     * @type BuildingBlockView
     * @override
     */
    _createView: function () {
        var view = new DomainConceptView(this._buildingBlockDescription);
        this._createTooltip(view.getNode(), this._buildingBlockDescription);
        return view;
    },

    /**
     * Creates a new Tooltip for the component view
     * @type BuildingBlockView
     * @override
     */
    _createTooltip: function (/*DomNode View*/ node) {
        var conceptName = this._buildingBlockDescription.getTitle();

        var content = document.createElement('div');
        var title = document.createElement('h3');
        title.appendChild(document.createTextNode(conceptName+' '));
        content.appendChild(title);

        if (this._buildingBlockDescription['description']) {
            var languages = $H(this._buildingBlockDescription['description']).keys();
            if (languages.size() > 0) {
                var description = this._buildingBlockDescription['description'][languages[0]];
            } else {
                var description = this._buildingBlockDescription['description'];
            }
            var descriptionElement = document.createElement('p');
            descriptionElement.appendChild(document.createTextNode(description));
            content.appendChild(descriptionElement);
        }

        if (this._buildingBlockDescription['subClassOf']) {
            var subClassOf = document.createElement('h4');
            subClassOf.appendChild(document.createTextNode('Subclass of:'));
            content.appendChild(subClassOf);
            content.appendChild(document.createTextNode(this._buildingBlockDescription['subClassOf']));
        }

        if (this._buildingBlockDescription['uri']) {
            var subClassOf = document.createElement('h4');
            subClassOf.appendChild(document.createTextNode('URI:'));
            content.appendChild(subClassOf);
            content.appendChild(document.createTextNode(this._buildingBlockDescription['uri']));
        }

        var tip = new dijit.Tooltip({connectId:[node],
            label:'<div style="max-width:300px">'+content.innerHTML+'</div>'});
        tip.startup();
    },

    /**
     * Creates a new domain concept to be dragged.
     * @type DomainConceptInstance
     * @override
     */
    _createInstance: function () {
        return new PrePostInstance(this._buildingBlockDescription, this._inferenceEngine);
    },

    /**
     * @type String
     * @override
     */
    _getTitle: function () {
        return this._buildingBlockDescription.getTitle();
    }
});

// vim:ts=4:sw=4:et:

var ResourceComponent = Class.create(PaletteComponent,
    /** @lends ResourceComponent.prototype */ {

    /**
     * Palette component of a domain concept building block.
     * @param BuildingBlockDescription ResourceBuildingBlockDescription
     * @constructs
     * @extends PaletteComponent
     */
    initialize: function($super, description, dropZones, inferenceEngine) {
        $super(description, dropZones, inferenceEngine);
    },


    // **************** PUBLIC METHODS **************** //


    // **************** PRIVATE METHODS **************** //

    /**
     * Creates a new View instance for the component
     * @type BuildingBlockView
     * @override
     */
    _createView: function () {
        var view = new ResourceView(this._buildingBlockDescription);
        this._createTooltip(view.getNode(), this._buildingBlockDescription);
        return view;
    },

    /**
     * Creates a new resource to be dragged.
     * @type ResourceInstance
     * @override
     */
    _createInstance: function () {
        return new ResourceInstance(this._buildingBlockDescription, this._inferenceEngine);
    },

    /**
     * @type String
     * @override
     */
    _getTitle: function () {
        return this._buildingBlockDescription.label['en-gb'];
    },

    /**
     * This function returns a list with all the
     * preconditions of the component.
     * @type Array
     * @override
     */
    _getPreConditions: function() {
        var result = [];
        var actions = this._buildingBlockDescription.actions;
        for (var i=0; actions && i < actions.length; i++) {
            var preconditions = actions[i].preconditions;
            for (var j=0; preconditions && j < preconditions.length; j++) {
                result.push(preconditions[j]);
            }
        }
        return result;
    }

});

// vim:ts=4:sw=4:et:

var OperatorComponent = Class.create(PaletteComponent,
    /** @lends OperatorComponent.prototype */ {

    /**
     * Palette component of a domain concept building block.
     * @param BuildingBlockDescription OperatorBuildingBlockDescription
     * @constructs
     * @extends PaletteComponent
     */
    initialize: function($super, description, dropZones, inferenceEngine) {
        $super(description, dropZones, inferenceEngine);
    },


    // **************** PUBLIC METHODS **************** //


    // **************** PRIVATE METHODS **************** //

    /**
     * Creates a new View instance for the component
     * @type BuildingBlockView
     * @override
     */
    _createView: function () {
        var view = new OperatorView(this._buildingBlockDescription);
        this._createTooltip(view.getNode(), this._buildingBlockDescription);
        return view;
    },

    /**
     * Creates a new Operator to be dragged.
     * @type OperatorInstance
     * @override
     */
    _createInstance: function () {
        return new OperatorInstance(this._buildingBlockDescription, this._inferenceEngine);
    },

    /**
     * @type String
     * @override
     */
    _getTitle: function () {
        return this._buildingBlockDescription.label['en-gb'];
    },

    /**
     * This function returns a list with all the
     * preconditions of the component.
     * @type Array
     * @override
     */
    _getPreConditions: function() {
        var result = [];
        var actions = this._buildingBlockDescription.actions;
        for (var i=0; actions && i < actions.length; i++) {
            var preconditions = actions[i].preconditions;
            for (var j=0; preconditions && j < preconditions.length; j++) {
                result.push(preconditions[j]);
            }
        }
        return result;
    }

});

// vim:ts=4:sw=4:et:

var FormComponent = Class.create(PaletteComponent,
    /** @lends FormComponent.prototype */ {

    /**
     * Palette component of a domain concept building block.
     * @param BuildingBlockDescription FormBuildingBlockDescription
     * @constructs
     * @extends PaletteComponent
     */
    initialize: function($super, description, dropZones, inferenceEngine) {
        $super(description, dropZones, inferenceEngine);
    },


    // **************** PUBLIC METHODS **************** //


    // **************** PRIVATE METHODS **************** //

    /**
     * Creates a new View instance for the component
     * @type BuildingBlockView
     * @override
     */
    _createView: function () {
        var view =  new FormSnapshotView(this._buildingBlockDescription);
        this._createTooltip(view.getNode(), this._buildingBlockDescription);
        return view;
    },

    /**
     * Creates a new Form to be dragged.
     * @type FormInstance
     * @override
     */
    _createInstance: function () {
        return new FormInstance(this._buildingBlockDescription, this._inferenceEngine);
    },

    /**
     * @type String
     * @override
     */
    _getTitle: function () {
        return this._buildingBlockDescription.label['en-gb'];
    },

    /**
     * This function returns a list with all the
     * preconditions of the component.
     * @type Array
     * @override
     */
    _getPreConditions: function() {
        var result = [];
        var actions = this._buildingBlockDescription.actions;
        for (var i=0; actions && i < actions.length; i++) {
            var preconditions = actions[i].preconditions;
            for (var j=0; preconditions && j < preconditions.length; j++) {
                result.push(preconditions[j]);
            }
        }
        return result;
    }
});

// vim:ts=4:sw=4:et:

var BuildingBlockView = Class.create( /** @lends BuildingBlockView.prototype */ {
    /**
     * This interface is met by all the building block graphical representations.
     * @abstract
     * @constructs
     */
    initialize: function() {
        /**
         * DOM Node
         * @type DOMNode
         * @private @member
         */
        this._node = null;

    },

    // **************** PUBLIC METHODS **************** //


    /**
     * getNode
     * @type DOMNode
     */
    getNode: function () {
        return this._node;
    },

    /**
     * Sets the title if possible
     */
    setTitle: function(title) {
        // Do nothing
    },


    /**
     * Colorize the component depending on the reachability
     * @public
     */
    setReachability: function( /** Hash */ reachabilityData) {
        throw 'Abstract Method invocation. ' +
            'BuildingBlockView :: setReachability';
    },

    setSelected: function(/** Boolean */ selected) {
        if (selected) {
            this._node.addClassName('selected');
        } else {
            this._node.removeClassName('selected');
        }
    },

    /**
     * Removes the DOM Elements and frees building blocks
     */
    destroy: function () {
    },

    /**
     * Adds an event listener
     */
    addEventListener: function (/** Function */ handler, /** String */ event){
        Element.observe(this._node, event, handler);
    },

    /**
     * Adds a new div layer on top of the view, covering it, in order
     * to handle onclick and onmousedown events, when
     * the view includes some terminals, as they consume
     * these events by default
     */
    addGhost: function() {
        var ghost = new Element('div', {
            'class': 'ghost ghostLayer'
        });
        this._node.appendChild(ghost);
    },

    // **************** PRIVATE METHODS **************** //

    _setViewReachability: function(/** Object */ reachability,
                            /** Hash */ preHash, /** Array */ postList,
                            /** DOMNode */ node) {

        var satisfeable = reachability.reachability;
        Utils.setSatisfeabilityClass(node, satisfeable);

        postList.each(function(post) {
            Utils.setSatisfeabilityClass(post.getNode(), satisfeable);
        });

        reachability.actions.each(function(action) {
            action.preconditions.each(function(pre) {
                var preNode = preHash.get(pre.id).getNode();
                Utils.setSatisfeabilityClass(preNode, pre.satisfied);
            }.bind(this));
        }.bind(this));
    }
});

// vim:ts=4:sw=4:et:

var ScreenView = Class.create(BuildingBlockView,
    /** @lends ScreenView.prototype */ {

    /**
     * Screens graphical representation
     * @constructs
     * @extends BuildingBlockView
     */
    initialize: function($super,/** ScreenDescription */ description) {

        $super();

        /**
         * Precondition Icons
         * @type Array
         * @private
         */
        this._preIcons = new Array();

        /**
         * Postcondition Icons
         * @type {FactIcon[]}
         * @private
         */
        this._postIcons = new Array();

        /**
         * Tooltip
         * @type dijit.Tooltip
         * @private
         */
        this._tooltip = null;

        /**
         * Title node
         * @type DOMNode
         * @private
         */
        this._titleNode = new Element("div", {"class":"title"});

        this._titleNode.update(description.label['en-gb']);

        var preArea = new Element("div", {"class": "preArea"});

        if (description.preconditions.length > 1){ //More than one set of preconditions
            console.log("OR precondition support not implemented yet");
        }
        else {
            var preconditions = description.preconditions[0];
        }


        $A(preconditions).each(
                function(pre) {
                    var preFact = FactFactory.getFactIcon(pre, "embedded");
                    this._preIcons.push(preFact);
                    preArea.appendChild(preFact.getNode());
                }.bind(this)
        );

        var postArea = new Element("div", {"class": "postArea"});

        if (description.postconditions.length > 1){ //More than one set of preconditions
            console.log("OR postcondition support not implemented yet");
        }
        else {
            var postconditions = description.postconditions[0];
        }

        $A(postconditions).each(
                function(post) {
                    if (post) {
                        var postFact = FactFactory.getFactIcon(post, "embedded");
                        this._postIcons.push(postFact);

                        if (!post.positive)
                        	postFact.getNode().addClassName('negative');

                        postArea.appendChild(postFact.getNode());
                    }
                }.bind(this)
        );

        var prePostSeparator = new Element("div",
                {"class": "prePostSeparator"});

        if (description.icon){
            var imageContainer = new Element ('div',
                    {'class': 'image' });
            var image = new Element ('img',{
                    'class': 'img',
                    'src': description.icon
                    //If we want an onerror image...
                    /*'onError': 'if (this.src != URIs.screenImageNotFound){'+
                                'this.src = URIs.screenImageNotFound;'+
                            '}'*/
                    });
            imageContainer.appendChild (image);
        }

        this._node = new Element("div", {
            "class": "view screen"
        });
        this._node.appendChild(this._titleNode);
        this._node.appendChild(preArea);
        this._node.appendChild(prePostSeparator);
        if (description.icon){
            this._node.appendChild(imageContainer);
        }
        this._node.appendChild(postArea);

        this._createTooltip(description);
    },

    // **************** PUBLIC METHODS **************** //

    /**
     * Colorize the component depending on the reachability
     * @public @override
     */
    setReachability: function( /** Hash */ reachabilityData) {

        var satisfeable = reachabilityData.reachability;

        // screen
        Utils.setSatisfeabilityClass(this.getNode(), satisfeable);

        // posts
        this._postIcons.each(function(postIcon) {
            Utils.setSatisfeabilityClass(postIcon.getNode(), satisfeable);
        });

        // pres
        var preconditionList = reachabilityData.preconditions;
        if (preconditionList.length > 1) {
            //More than one set of preconditions is NOT YET SUPPORTED
            console.log("OR precondition support not implemented yet");
            return;
        } else {
            var preconditionData = preconditionList[0];
        }

        //Setting precondition reachability
        var preReachability = new Hash();
        $A(preconditionData).each(function(precondition) {
            preReachability.set(FactFactory.getFactUri(precondition), precondition.satisfied);
        });

        this._preIcons.each(function(preIcon) {
            var factUri = preIcon.getFact().getUri();
            Utils.setSatisfeabilityClass(preIcon.getNode(), preReachability.get(factUri));
        });
    },

    /**
     * Removes the DOM Elements and frees building blocks
     * @override
     */
    destroy: function () {
        // Let the garbage collector to do its job
        this._preIcons = null;
        this._postIcons = null;
        this._node = null;
    },

    /**
     * @override
     */
    setTitle: function(title) {
        this._titleNode.update(title);
    },

    // **************** PRIVATE METHODS **************** //
    /**
     * This function creates the tooltip for the view
     * @private
     */
    _createTooltip: function (/** ScreenDescription */ description) {
        /*var content = new Element('div');

        var title = new Element('h3').update(description.label['en-gb']);
        content.appendChild(title);

        var description = new Element('div').update(description.description['en-gb']);
        content.appendChild(description);


        if (description.preconditions.length > 1){ //More than one set of preconditions
            console.log("OR precondition support not implemented yet");
        }
        else {
            var preconditions = description.preconditions[0];
        }
        if (preconditions.length > 0){
            var preTitle = new Element('h4').update('Preconditions');
            content.appendChild(preTitle);
            $A(preconditions).each(function(pre){
                //TODO
            });
        }*/
    }
});

// vim:ts=4:sw=4:et:

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
     * Removes the DOM Elements and frees building blocks
     * @override
     */
    destroy: function () {
        // Let the garbage collector to do its job
        this._node = null;
    },


    /**
     * @override
     */
    setReachability: function (/** Object */ reachabilityData) {
        var reachability = (reachabilityData.reachability !== undefined) ?
                            reachabilityData.reachability : reachabilityData.satisfied;
        Utils.setSatisfeabilityClass(this._factIcon, reachability);
    }

});

// vim:ts=4:sw=4:et:

var ResourceView = Class.create(BuildingBlockView,
    /** @lends ResourceView.prototype */ {

    /**
     * Resources graphical representation
     * @constructs
     * @extends BuildingBlockView
     */
    initialize: function($super,/** ResourceDescription */ description) {

        $super();

        /**
         * Fact Icons
         * @type Hash
         * @private
         */
        this._icons = new Hash();


        var preArea = new Element("div", {"class": "preArea"});
        var postArea = new Element("div", {"class": "postArea"});

        var actions = description.actions;
        var actionIcons;
        actions.each(function(action) {
            actionIcons = new Hash();
            action.preconditions.each(function(pre) {
                var fact = FactFactory.getFactIcon(pre, "embedded");
                actionIcons.set(pre.id, fact);
                preArea.appendChild(fact.getNode());
            }.bind(this));
            this._icons.set(action.name, actionIcons)
        }.bind(this));

        var posts;
        if (description.postconditions && description.postconditions[0] instanceof Array) {
            posts = description.postconditions[0];
        } else {
            posts = description.postconditions;
        }

        actionIcons = new Hash();
        posts.each(function(post) {
                var fact = FactFactory.getFactIcon(post, "embedded");
                actionIcons.set(post.id, fact);
                postArea.appendChild(fact.getNode());
            }.bind(this));
        this._icons.set("postconditions", actionIcons);

        var prePostSeparator = new Element("div",
                {"class": "prePostSeparator"});

        /*if (description.icon){
            var imageContainer = new Element ('div',
                    {'class': 'screenImage' });
            var image = new Element ('img',{
                    'class': 'img',
                    'src': description.icon
            imageContainer.appendChild (image);
        }*/

        this._node = new Element("div", {
            "class": "view resource",
            "title": description.name
        });

        this._node.appendChild(preArea);
        this._node.appendChild(prePostSeparator);

        /*if (description.icon){
            this._node.appendChild(imageContainer);
        }*/
        this._node.appendChild(postArea);

        var titleNode = new Element("div", {"class":"title"});
        titleNode.update(description.label['en-gb']);
        this._node.appendChild(titleNode);

    },

    // **************** PUBLIC METHODS **************** //
    /**
     * This function returns the domNode of the precondition that has
     * the identification passed as parameter
     */
    getConditionNode: function(/** String */ id, /** String */ action) {
        action = Utils.variableOrDefault(action, "postconditions");
        var actionIcons = this._icons.get(action);
        if (actionIcons) {
            var icon = actionIcons.get(id);
            if (icon) {
                return icon.getNode();
            }
        }

        return null;
    },

    /**
     * Colorize the component depending on the reachability
     * @public @override
     */
    setReachability: function( /** Hash */ reachabilityData) {
        var satisfeable = reachabilityData.reachability;
        Utils.setSatisfeabilityClass(this._node, satisfeable);

        this._icons.get("postconditions").each(function(post) {
            Utils.setSatisfeabilityClass(post.value.getNode(), satisfeable);
        });

        reachabilityData.actions.each(function(actionData) {
            var actionIcons = this._icons.get(actionData.name);

            actionData.preconditions.each(function(preData) {
                var factNode = this.get(preData.id).getNode();
                Utils.setSatisfeabilityClass(factNode, preData.satisfied);
            }.bind(actionIcons));
        }.bind(this));
    },

    /**
     * Removes the DOM Elements and frees building blocks
     * @override
     */
    destroy: function () {
        // Let the garbage collector to do its job
        this._icons = null;
        this._node = null;
    }

    // **************** PRIVATE METHODS **************** //
});

// vim:ts=4:sw=4:et:

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
    destroy: function () {
        // Let the garbage collector to do its job
        this._preIcons = null;
        this._postIcons = null;
        this._node = null;
    }

    // **************** PRIVATE METHODS **************** //
});

// vim:ts=4:sw=4:et:

var FormView = Class.create(BuildingBlockView,
    /** @lends FormView.prototype */ {

    /**
     * Forms graphical representation
     * @constructs
     * @extends BuildingBlockView
     */
    initialize: function($super, /** FormDescription */ description) {

        $super();

        /**
         * Actions
         * @type Hash
         * @private
         */
        this._actions = new Hash();

        /**
         * Postcondition Icons
         * @type Hash
         * @private
         */
        this._postIcons = new Hash();

        /**
         * Trigger icons
         * @type Hash
         * @private
         */
        this._triggerIcons = new Hash();


        this._node = new Element("div", {
            "class": "view form",
            "title": description.name
        });

        var title = new Element("div", {
            "class": "title"
        }).update(description.label['en-gb']);

        this._node.appendChild(title);

        var actionsNode = new Element("div", {
            "class": "actions"
        });
        var actionsTitle = new Element("div", {
            "class": "title"
        }).update("Actions");
        this._node.appendChild(actionsNode);
        actionsNode.appendChild(actionsTitle);

        var actions = description.actions;
        actions.each( function(action) {
            var actionView = new ActionView(action);
            this._actions.set(action.name, actionView);
            actionsNode.appendChild(actionView.getNode());
        }.bind(this));

        var triggerPostContainer = new Element("div", {
            "class": "postTriggerContainer"
        });

        var containerTitle = new Element("div", {
            "class": "title"
        }).update("Postconditions");
        triggerPostContainer.appendChild(containerTitle);

        var triggerArea = new Element("div", {
            "class": "triggerArea"
        });
        triggerPostContainer.appendChild(triggerArea);

        var posts;
        if (description.postconditions && description.postconditions[0] instanceof Array) {
            posts =  description.postconditions[0];
        } else {
            posts = description.postconditions;
        }

        var postArea = new Element("div", {
            "class": "postArea"
        });



        posts.each (function(post) {
            var fact = FactFactory.getFactIcon(post, "embedded");
            this._postIcons.set(post.id, fact);
            postArea.appendChild(fact.getNode());
        }.bind(this));
        triggerPostContainer.appendChild(postArea);

        this._node.appendChild(triggerPostContainer);

    },

    // **************** PUBLIC METHODS **************** //
    /**
     * This function returns the domNode of the condition that has
     * the id passed as parameter
     * @type DOMNode
     */
    getConditionNode: function(/** String */ id,
                            /** String (Optional) */ _action) {
        if (_action) {
            return this._actions.get(_action).getConditionNode(id);
        } else {
            return this._postIcons.get(id).getNode();
        }
    },

    /**
     * Colorize the component depending on the reachability
     * @public @override
     */
    setReachability: function( /** Hash */ reachabilityData) {
        var satisfeable = reachabilityData.reachability;
        Utils.setSatisfeabilityClass(this._node, satisfeable);
        reachabilityData.actions.each(function(actionData) {
            this._actions.get(actionData.name).setReachability(actionData);
        }.bind(this));

        this._postIcons.values().each(function(post) {
            Utils.setSatisfeabilityClass(post.getNode(), satisfeable);
        });
    },

    /**
     * Removes the DOM Elements and frees building blocks
     * @override
     */
    destroy: function () {
        // Let the garbage collector to do its job

        this._actions.each(function(pair) {
            pair.value.destroy();
        });
        this._postIcons = null;
        this._triggerIcons.each(function(pair) {
            pair.value.destroy();
        });
    }

    // **************** PRIVATE METHODS **************** //
});

// vim:ts=4:sw=4:et:

var FormSnapshotView = Class.create(BuildingBlockView,
    /** @lends FormSnapshotView.prototype */ {

    /**
     * Forms graphical representation for the palette
     * @constructs
     * @extends BuildingBlockView
     */
    initialize: function($super, /** FormDescription */ description) {

        $super();


        this._node = new Element("div", {
            "class": "view form snapshot",
            "title": description.name
        });

        var image = new Element ('img',{
                'class': 'image',
                'src': description.icon
        });
        this._node.appendChild(image);

    },

    // **************** PUBLIC METHODS **************** //

    /**
     * Colorize the component depending on the reachability
     * @public @override
     */
    setReachability: function( /** Hash */ reachabilityData) {

        // TODO
    }

    // **************** PRIVATE METHODS **************** //
});

// vim:ts=4:sw=4:et:

var ActionView = Class.create(
    /** @lends ActionView.prototype */ {

    /**
     * Actions graphical representation
     * @constructs
     */
    initialize: function(/** Object */ description) {

        /**
         * @type DOMNode
         * @private
         */
        this._node = null;

        /**
         * Condition Icons
         * @type Hash
         * @private
         */
        this._preIcons = new Hash();

        this._node = new Element("div", {
            "class": "action"
        });

        var title = new Element("div", {
            "class": "title"
        }).update(description.name);
        this._node.appendChild(title);

        var preArea = new Element("div",{
            "class": "preArea"
        });
        description.preconditions.each(function(pre) {
            var fact = FactFactory.getFactIcon(pre, "embedded");
            this._preIcons.set(pre.id, fact);
            preArea.appendChild(fact.getNode());
        }.bind(this));
        this._node.appendChild(preArea);

    },

    // **************** PUBLIC METHODS **************** //

    getNode: function() {
        return this._node;
    },

    /**
     * This function returns the domNode of the condition that has
     * the id passed as parameter
     * @type DOMNode
     */
    getConditionNode: function(/** String */ id) {
        return this._preIcons.get(id).getNode();
    },

    /**
     * Destroys the action node
     */
    destroy: function () {
        // Let the garbage collector to do its job
        this._preIcons = null;
        this._node = null;
    },

    setReachability: function(/** Object */ actionData) {
        var satisfeable = actionData.satisfied;
        Utils.setSatisfeabilityClass(this._node, satisfeable);
        actionData.preconditions.each(function(preData){
            Utils.setSatisfeabilityClass(this._preIcons.get(preData.id).getNode(),
                                        preData.satisfied);
        }.bind(this));
    }

    // **************** PRIVATE METHODS **************** //
});

// vim:ts=4:sw=4:et:

/**
 * This class handles the creation of pipes based on WireIt.Terminal
 * and WireIt.Wire classes. Due to the use of these classes, which are
 * not Prototype compliant classes, the syntax of the class is quite
 * different than usual
 * The terminal object will be attached to each pre or post condition
 * of the instances (specifically, to the condition nodes of their
 * respective view)
 *
 * @constructs
 */
var Terminal = function(/** DOMNode */ conditionNode, /** Object */ options,
                        /** ComponentInstance */ instance,
                        /** String */ conditionId, /** String(optional) */ action) {

    /**
     * @private
     * @type DOMNode
     */
    this._conditionNode = conditionNode;

    /**
     * @private
     * @type DOMNode
     */
    this._terminalNode = new Element('div',
    {
        'title': this._conditionNode.title
    });

    var style = {
        'position':'absolute',
        'width': '1px',
        'height': '1px',
        'z-index': '50'
    };
    this._terminalNode.setStyle(style);
    this._recalculatePosition();
    document.body.appendChild(this._terminalNode);

    var wireConfig = {
            'width': 2,
            'borderwidth': 2,
            'color': '#EAEAEA',
            'bordercolor': '#808080'
    }
    var extendedOptions = {};
    extendedOptions = Object.extend(extendedOptions, options);
    extendedOptions.wireConfig = Object.extend(wireConfig, options.wireConfig);

    WireIt.Terminal.call(this, this._terminalNode, extendedOptions);

    /**
     * Instance in where the terminal is
     * @type ComponentInstance
     * @private
     */
    this._instance = instance;

    /**
     * This is the id of the condition inside the
     * resource that contains the terminal
     * @private
     * @type String
     */
    this._conditionId = conditionId;

    /**
     * This is the action
     * @private
     * @type String
     */
    this._action = action ? action: "";
}

// Inheriting all methods
Object.extend(Terminal.prototype, WireIt.Terminal.prototype);

Object.extend(Terminal.prototype, /** @lends Terminal.prototype */ {


    // **************** PUBLIC METHODS **************** //

    /**
     * Returns the resourceUri
     * @type String
     */
    getBuildingBlockUri: function() {
        // FIXME: extrange situation for prepost instances,
        // when building
        var uri;
        if (this._instance.constructor == PrePostInstance) {
            uri = null;
        } else {
            uri = this._instance.getUri();
        }
        return uri;
    },

    /**
     * Returns the resourceId
     * @type String
     */
    getBuildingBlockId: function() {
        // FIXME: extrange situation for prepost instances,
        // when building
        var id;
        if (this._instance.constructor == PrePostInstance) {
            id = "";
        } else {
            id = this._instance.getId();
        }
        return id;
    },

    /**
     * Returns the conditionId
     * @type String
     */
    getConditionId: function() {
        return this._conditionId;
    },

    /**
     * Returns the action
     * @type String
     */
    getActionId: function() {
        return this._action;
    },

    /**
     * Returns the instance
     * @type ComponentInstance
     */
    getInstance: function() {
        return this._instance;
    },

    /**
     * Destroy the terminal
     */
    destroy: function() {
        this.removeAllWires();
        this.remove();
        this._terminalNode.parentNode.removeChild(this._terminalNode);
    },

    /**
     * Updates the position when the container is moving
     */
    updatePosition: function() {
        this._recalculatePosition();
        this.redrawAllWires();
    },

    /**
     * Adds a handler listening for the connection or deconnection of wires
     */
    onWireHandler: function(/** Hash */ handlers) {
    	var context = {};
    	context = Object.extend(context, handlers);
    	context['refTerminal'] = this;

        this.eventAddWire.subscribe(this._wireAddHandler.bind(context));
        this.eventRemoveWire.subscribe(this._wireRemoveHandler.bind(context));
    },

    /**
     * Sets the visibility of the terminal
     */
    setVisible: function(/** Boolean */ visible) {
        var style = {
            'visibility': visible ? 'visible': 'hidden'
        };
        this.el.setStyle(style);
    },

     // **************** PRIVATE METHODS **************** //


     /**
      * Recalculates the position of the terminal
      * @private
      */
    _recalculatePosition: function() {
        var position = Utils.getPosition(this._conditionNode);
        var style = {
            'top': position.top + 'px',
            'left':  position.left + 'px'
        }
        this._terminalNode.setStyle(style);
    },


    /**
     * Handler called whenever a new wire is added to the terminal
     * @private
     */
    _wireAddHandler: function(/** Event */ event, /** Array */ params) {
    	var wire = params[0];
    	if (wire.terminal1.parentEl && wire.terminal2.parentEl) {
    		if (wire.terminal1 == this.refTerminal) {
    			this.onPipeCreation(wire);
    		}
    	} else if (wire.terminal1 == this.refTerminal) {
    		this.onPipeCreationStart(wire, wire.terminal1);
    	} else if (wire.terminal2 == this.refTerminal) {
    		this.onPipeCreationStart(wire, wire.terminal2);
    	}
    },


    /**
     * Handler called whenever a wire is removed from the terminal
     * @private
     */
    _wireRemoveHandler: function(/** Event */ event, /** Array */ params) {
    	var wire = params[0];
    	if (wire.terminal1.parentEl && wire.terminal2.parentEl) {
    		if (wire.terminal1 == this.refTerminal) {
    			this.onPipeDeletion(wire);
    		}
    	} else if (wire.terminal1 == this.refTerminal || wire.terminal2 == this.refTerminal) {
    		this.onPipeCreationCancel(wire);
    	}
    }
});

var Pipe = Class.create(
    /** @lends Pipe.prototype */ {

    /**
     * Pipes graphical representation
     * @constructs
     */
    initialize: function (/** WireIt.Wire */ wire, /** String */ id) {

        /**
         * Pipe wire
         * @private
         * @type WireIt.Wire
         */
        this._wire = wire;

        /**
        * Pipe id
        * @private
        * @type String
        */
        this._id = id;

        /**
         * Valid pipe
         * @type Boolean
         * @private
         */
        this._isValid = true;
    },

    /**
     * Returns the WireIt wire object
     * @type WireIt.Wire
     */
    getWire: function() {
        return this._wire;
    },

    /**
     * Returns the pipe id
     * @type String
     */
    getId: function() {
        return this._id;
    },

    /**
     * Returns the source terminal of the pipe
     * @type Terminal
     */
    getSource: function() {
        return this._wire.terminal1;
    },


    /**
     * Returns the destination terminal of the pipe
     * @type Terminal
     */
    getDestination: function() {
        return this._wire.terminal2;
    },

    /**
     * Gets the JSON object representing the pipe for screen definition
     * @type Object
     */
    getJSONforScreen: function() {
        return {'from': {
                    'buildingblock': this.getSource().getBuildingBlockId(),
                    'condition': this.getSource().getConditionId()
                },
                'to': {
                    'buildingblock': this.getDestination().getBuildingBlockId(),
                    'action': this.getDestination().getActionId(),
                    'condition': this.getDestination().getConditionId()
                }
            };
    },

    /**
     * Gets the JSON object representing the pipe for catalogue check
     * @type Object
     */
    getJSONforCheck: function() {
        return {
                'from': {
                    'buildingblock': this.getSource().getBuildingBlockUri(),
                    'condition': this.getSource().getConditionId()
                },
                'to': {
                    'buildingblock': this.getDestination().getBuildingBlockUri(),
                    'action': this.getDestination().getActionId(),
                    'condition': this.getDestination().getConditionId()
                }
            };
    },

    /**
     * Sets the reachability coloring information of the pipe
     */
    setReachability: function(/** Object */ reachabilityData) {
        var options = this._wire.options;
        var satisfied = reachabilityData.satisfied;
        if (!reachabilityData.correct) {
            options = Object.extend(options, {
                'color': '#EAEAEA',
                'bordercolor': '#808080'
            });
        } else {
            if (satisfied) {
                options = Object.extend(options, {
                    'color': '#DDF7DD',
                    'bordercolor': '#008000'
                });
            } else {
                options = Object.extend(options, {
                    'color': '#F5D9D9',
                    'bordercolor': '#B90000'
                });
            }
        }
        this._wire.setOptions(options);
        this._wire.redraw();

        if (!reachabilityData.correct) {
             this._wire.element.setStyle({'opacity': '0.5'});
             if (this._isValid) {
                 Utils.showMessage("The elements you have connected are not compatible." +
                            " It may not work", {
                            'hide': true,
                            'error': true
                            });
                 this._isValid = false;
             }

        }
    },

    /**
     * Is the pipe semantically correct
     * @type Boolean
     */
    isValid: function() {
        // TODO: check if there are more conditions
        return (this.getSource().getBuildingBlockId() != this.getDestination().getBuildingBlockId())
                && this._isValid;
    },


    /**
     * Destroys the wire
     */
    destroy: function() {
        this.getSource().removeWire(this._wire);
        this.getDestination().removeWire(this._wire);
    },


    /**
     * Sets the pipe visible or hidden. To be called whenever a document
     * is selected or deselected
     */
    setVisible: function(/** Boolean */ visible) {
        if (visible) {
            this.getSource().updatePosition();
            this.getDestination().updatePosition();
        }
        var style = {
            'visibility': visible ? 'visible': 'hidden'
        }
        this._wire.element.setStyle(style);
    }

    // **************** PRIVATE METHODS **************** //

});

// vim:ts=4:sw=4:et:

var PipeFactory = Class.create(
    /** @lends PipeFactory.prototype */ {

    /**
     * Handles all pipes for a given screenflow
     * @constructs
     */
    initialize: function () {
        /**
         * Hash containing all the pipes for the screen
         */
        this._pipes = new Hash();
    },

    /**
     * Returns a pipe instance from the wire element
     */
    getPipe: function (/** Variable Arguments */) {
        var pipe = null;
        var wire;
        var source;
        var destination;
        if (arguments.length == 1) {
            wire = arguments[0];
            source = wire.terminal1;
            destination = wire.terminal2;

        } else {
            // Get pipe by the terminals
            source = arguments[0];
            destination = arguments[1];
            wire = new WireIt.Wire(source, destination, document.body, source.options.wireConfig);
            wire.redraw();
        }
        var id = this._getPipeId(source, destination);
        pipe = new Pipe(wire, id);
        if (pipe.isValid()) {
            if (!this._pipes.get(id)) {
                this._pipes.set(id, pipe);
            }
        } else {
            pipe.destroy();
            pipe = null;
        }
        return pipe;
    },

    /**
     * Removes a pipe
     */
    removePipe: function(/** Pipe */ pipe) {
        this._pipes.unset(pipe.getId());
    },

    /**
     * Returns a pipe given its source and destination terminals
     * @type Pipe
     */
    getPipeFromTerminals: function(/** Terminal */ src, /** Terminal */ dst) {
        var values = this._pipes.values();

        for (var i = 0; i < values.size(); i++) {
            var pipe = values[i];
            var found = pipe.getSource() == src;
            found = found && pipe.getDestination() == dst;
            if (found) {
                return pipe;
            }
        }
        return null;
    },

    /**
     * Returns the list of pipes in which an instance is involved
     * (as the source or the destination)
     * @type Array
     */
    getPipes: function(/** ComponentInstance */ instance) {
        var result = new Array();
        this._pipes.values().each(function(pipe) {
            var found = pipe.getSource().getBuildingBlockId() == instance.getId();
            found = found || pipe.getDestination().getBuildingBlockId() == instance.getId();
            if (found) {
                result.push(pipe);
            }
        });
        return result;
    },

    /**
     * Hides all the pipes contained in the factory
     */
    hidePipes: function() {
        this._pipes.values().each(function(pipe) {
           pipe.setVisible(false);
        });
    },

    /**
     * Shows all the pipes contained in the screenflow
     */
    showPipes: function() {
         this._pipes.values().each(function(pipe) {
           pipe.setVisible(true);
        });
    },

    // **************** PRIVATE METHODS **************** //

    /**
     * Gets a pipe unique id from its endpoints
     * @private
     * @type String
     */
    _getPipeId: function(/** Terminal */ source, /** Terminal */ destination) {
        return source.getBuildingBlockId() + source.getConditionId() +
            destination.getBuildingBlockId() + destination.getActionId() +
            destination.getConditionId();
    }
});

var TriggerMappingFactory = Class.create(
    /** @lends TriggerMappingFactory.prototype */ {

    /**
     * It handles the connection and deconnection of actions and triggers
     * for a screen
     * @constructs
     */
    initialize: function () {
        /**
         * This contains all the triggers in the screen
         * @type Hash
         * @private
         */
        this._triggers = new Hash();
    },
    // **************** PUBLIC METHODS ***************** //

    /**
     * Creates a new trigger mapping coming from a created pipe.
     * @type Trigger
     */
    createTrigger: function (/** Object */ element) {
        var trigger = this._createFromJSON(element);
        this._triggers.set(trigger.getId(), trigger);
        return trigger;
    },

    /**
     * Removes a trigger from the list. The trigger can be passed as
     * parameter
     * @type Trigger
     */
    removeTrigger: function(/** Object */ element) {
        var trigger;
        if (element.constructor != Trigger && element.constructor != ScreenTrigger) {
            trigger = this._createFromJSON(element);
        } else {
            trigger = element;
        }
        this._triggers.unset(trigger.getId());
        return trigger;
    },

    /**
     * Returns a list of triggers that the instance has connected to each of its
     * actions
     * @type Hash
     */
    getTriggerList: function(/** ComponentInstance */ instance) {
        var result = new Hash();
        this._triggers.values().each(function(trigger) {
           if (trigger.getDestinationId() == instance.getId()) {
               var array = result.get(trigger.getDestinationAction());
               if (!array) {
                   array = new Array();
               }
               array.push(trigger);
               result.set(trigger.getDestinationAction(), array);
           }
        });
        return result;
    },

    /**
     * Returns a list with triggers related to a given instance
     */
    getRelatedTriggers: function(/** ComponentInstance */ instance) {
        var result = new Array();
        this._triggers.values().each(function(trigger) {
            if (trigger.getSourceId() == instance.getId() ||
                trigger.getDestinationId() == instance.getId()) {
                    result.push(trigger);
                }
        });
        return result;
    },

    // **************** PRIVATE METHODS **************** //

    /**
     * @private
     */
    _createFromJSON: function(element) {
        var trigger;
        if (element.from.instance == ScreenTrigger.INSTANCE_NAME) {
            trigger = new ScreenTrigger(element.to);
        } else {
            trigger = new Trigger(element.from, element.to);
        }
        return trigger;
    }
});

var Trigger = Class.create(
    /** @lends Trigger.prototype */ {

    /**
     * Triggers representation
     * @constructs
     */
    initialize: function (/** Object */ from, /** Object */ to) {

        /**
         * Trigger source
         * @private
         * @type Object
         */
        this._from = from;

        /**
         * Trigger destination
         * @prvate
         * @type Object
         */
        this._to = to;

        /**
         * Trigger id
         * @private
         * @type String
         */
        this._id = this._createId(from, to);
    },

    /**
     * Returns the trigger id
     * @type String
     */
    getId: function() {
        return this._id;
    },

    getDestinationId: function() {
        return this._to.instance.getId();
    },

    getDestinationAction: function() {
        return this._to.action;
    },

    getTriggerName: function() {
        return this._from.name;
    },

    getSourceId: function() {
        return this._from.instance.getId();
    },

    getSourceInstance: function() {
        return this._from.instance;
    },

    /**
     * Returns the JSON object representing the Trigger
     * @type Object
     */
    toJSON: function() {
        return {
            'from': {
                'buildingblock': this.getSourceId(),
                'name': this.getTriggerName()
            },
            'to': {
                'buildingblock': this.getDestinationId(),
                'action': this.getDestinationAction()
            }
        };
    },

    // **************** PRIVATE METHODS **************** //

    /**
     * Creates the trigger id
     * @private
     * @type String
     */
    _createId: function (/** Object */ from, /** Object */ to) {
        return from.instance.getId() + from.name +
                to.instance.getId() + to.action;
    }

});


// vim:ts=4:sw=4:et:

var ScreenTrigger = Class.create(Trigger,
    /** @lends ScreenTrigger.prototype */ {

    /**
     * Screen onload Triggers representation
     * @constructs
     * @extends Trigger
     */
    initialize: function ($super, /** Object */ to) {
        var from = {
            'instance': ScreenTrigger.INSTANCE_NAME,
            'name': ScreenTrigger.ONLOAD
        };
        $super(from, to);
    },

    /**
     * @override
     */
    getSourceId: function() {
        return this._from.instance;
    },

    /**
     * @override
     */
    getSourceInstance: function() {
        var fakeInstance = {
            getTitle: function() {
                return ScreenTrigger.INSTANCE_NAME;
            },
            getId: function() {
                return ScreenTrigger.INSTANCE_NAME;
            }
        };
        return fakeInstance;
    },


    /**
     * Returns the JSON object representing the Trigger
     * @type Object
     * @override
     */
    toJSON: function() {
        return {
            'from': {
                'buildingblock': "",
                'name': "_onload"
            },
            'to': {
                'buildingblock': this.getDestinationId(),
                'action': this.getDestinationAction()
            }
        };
    },

    // **************** PRIVATE METHODS **************** //

    /**
     * Creates the trigger id
     * @private
     * @override
     * @type String
     */
    _createId: function (/** Object */ from, /** Object */ to) {
        return from.instance + from.name + to.instance.getId() + to.action;
    }
});

// Class attributes
ScreenTrigger.INSTANCE_NAME = "Screen";
ScreenTrigger.ONLOAD = "onload";
// vim:ts=4:sw=4:et:

/*
*     (C) Copyright 2008 Telefonica Investigacion y Desarrollo
*     S.A.Unipersonal (Telefonica I+D)
*
*     This file is part of Morfeo EzWeb Platform.
*
*     Morfeo EzWeb Platform is free software: you can redistribute it and/or modify
*     it under the terms of the GNU Affero General Public License as published by
*     the Free Software Foundation, either version 3 of the License, or
*     (at your option) any later version.
*
*     Morfeo EzWeb Platform is distributed in the hope that it will be useful,
*     but WITHOUT ANY WARRANTY; without even the implied warranty of
*     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*     GNU Affero General Public License for more details.
*
*     You should have received a copy of the GNU Affero General Public License
*     along with Morfeo EzWeb Platform.  If not, see <http://www.gnu.org/licenses/>.
*
*     Info about members and contributors of the MORFEO project
*     is available at
*
*     http://morfeo-project.org
 */

var PersistenceEngine = Class.create();

// **************** STATIC METHODS **************** //

Object.extend(PersistenceEngine, {

    sendGet: function (url, context, successHandler, errorHandler, requestHeaders) {
        new Ajax.Request(url, {
            method: 'get',
            parameters: arguments[4],
            onSuccess: successHandler.bind(context),
            onFailure: errorHandler.bind(context),
            onException: errorHandler.bind(context),
            requestHeaders: requestHeaders
        });
    },

    sendPost: function (url, params, body, context, successHandler, errorHandler, requestHeaders) {
        new Ajax.Request(url, {
            method: 'post',
            parameters: params,
            postBody: body,
            onSuccess: successHandler.bind(context),
            onFailure: errorHandler.bind(context),
            onException: errorHandler.bind(context),
                            requestHeaders: requestHeaders
        });
    },

    sendDelete: function (url, context, successHandler, errorHandler, requestHeaders){
        new Ajax.Request(url, {
            method: 'delete',
            onSuccess: successHandler.bind(context),
            onFailure: errorHandler.bind(context),
            onException: errorHandler.bind(context),
                            requestHeaders: requestHeaders
        });
    },

    sendUpdate: function (url, params, body, context, successHandler, errorHandler, requestHeaders){
        //FIXME: If body -> it sends post
        new Ajax.Request(url, {
            method: 'put',
            parameters: params,
            postBody: body,
            onSuccess: successHandler.bind(context),
            onFailure: errorHandler.bind(context),
            onException: errorHandler.bind(context),
                            requestHeaders: requestHeaders
        });
    }
});

var FormDialog = Class.create( /** @lends FormDialog.prototype */ {

    /**
     * Dialog class
     * This creates a modal dialog with three zones:
     *     * headerNode: containing the title
     *     * contentNode: containing all the fields of the form
     *     * buttonsNode: containing the different buttons: handled by this class
     * @constructs
     * @param properties Hash
     * @param _options Hash(Optional)
     *         * (String) buttonPosition: Sets the layout of the dialog,
     *         stablishing the position of the button zone (top, bottom, left,
     *         right). Default: FormDialog.POSITION_BOTTOM
     *         * (Boolean) createMessageZone: Adds a new zone "messageNode" that
     *         can be used to show dinamic messages. Default: false
     *         * (Numeric) minMessageLines: This option allows you to define a
     *         minimum number of lines to reserve for the messageNode zone. This
     *         option is ignored if createMessageZone == false. Default: 1
     * @abstract
     */
    initialize: function(properties, _options) {
        _options = Utils.variableOrDefault(_options, {});
        this._options = Object.extend ({
            'buttonPosition': FormDialog.POSITION_BOTTOM,
            'createMessageZone': false,
            'minMessageLines': 1,
            'closable': true
        }, _options);


        var position = this._options.buttonPosition;
        this._dialog = new dijit.Dialog(properties);

        if (!this._options.closable) {
            this._dialog.closeButtonNode.style.display = 'none';
        }

        this._headerNode = new Element ('div',{
            'class': 'dialogHeader'
        });

        this._contentNode = new Element ('div',{
            'class': 'dialogContent'
        });
        this._messageNode = new Element ('div',{
            'class': 'dialogMessageZone hidden'
        });
        var messageWrapper = new Element ('div',{
            'class': 'dialogMessageWrapper'
        });
        messageWrapper.appendChild(this._messageNode);
        this._buttonNode = new Element ('div',{
            'class': 'dialogButtonZone'
        });
        this._formWidget = null;

        var containerDiv = new Element ('div', {
            'class': position
        });

        containerDiv.appendChild (this._headerNode);
        switch (position) {
            case FormDialog.POSITION_TOP:
                containerDiv.appendChild (this._buttonNode);

                if (this._options.createMessageZone)
                    containerDiv.appendChild (messageWrapper);

                containerDiv.appendChild (this._contentNode);
                break;
            default:
                containerDiv.appendChild (this._contentNode);

                if (this._options.createMessageZone)
                    containerDiv.appendChild (messageWrapper);

                containerDiv.appendChild (this._buttonNode);
                break;
        }
        messageWrapper.style.minHeight = ((this._options.minMessageLines * 18) + 2) + 'px';

        this._dialog.attr ('content', containerDiv);

        this._initialized = false;
        dojo.connect(this._dialog,"hide", this._hide.bind(this));

    },


    // **************** PUBLIC METHODS **************** //

    /**
     * Shows the dialog
     * @public
     */
    show: function() {
        if (!this._initialized) {
            this._initDialogInterface();
            this._initialized = true;
        } else {
            this._reset();
        }
        GVS.setEnabled(false);
        this._dialog.show();
    },

    /**
     * Returns true if the dialog is visible
     */
    isVisible: function() {
        return this._dialog.attr("open");
    },

    // **************** PRIVATE METHODS **************** //
    /**
     * initDialogInterface
     * This function creates the dom structure
     * @private
     * @abstract
     */
    _initDialogInterface: function(){
        throw "Abstract method invocation FormDialog :: _initDialogInterface"
    },

    _hide: function() {
        GVS.setEnabled(true);

        // Dojo lets you move the dialog anywhere you like
        // but does not restore the window scroll when the dialog is closed.
        // Force window scroll restore.
        document.documentElement.scrollTop = 0;
    },

    /**
     * Gets the form node.
     * @type DOMNode
     * @private
     */
    _getForm: function() {
        return this._formWidget.domNode;
    },

    /**
     * Gets the form Widget
     * @type dijit.form.Form
     * @private
     */
    _getFormWidget: function() {
        return this._formWidget;
    },

    /**
     * This function adds a button with an onclick handler
     * @type dijit.form.Button
     * @private
     */
    _addButton: function (/** String */ label, /** Function */ handler) {
        var button = new dijit.form.Button({
            'label': label,
            onClick: handler
        });


        this._buttonNode.appendChild(button.domNode);
        return button;
    },

    /**
     * Remove all buttons
     * @private
     */
    _removeButtons: function() {
        this._buttonNode.update("");
    },

    /**
     * This function sets the header and a subtitle if passed
     * @private
     */
    _setHeader: function (/** String */ title, /** String */ subtitle){

        this._headerNode.update("");
        var titleNode = new Element("h2").update(title);
        this._headerNode.appendChild(titleNode);

        if (subtitle && subtitle != ""){
            var subtitleNode = new Element("div", {
                "class": "line"
            }).update(subtitle);
            this._headerNode.appendChild(subtitleNode);
        }
    },

    /**
     * This function sets the dialog title
     * @private
     */
    _setTitle: function (/** String */ title){
        this._dialog.setAttribute('title', title);
    },

    /**
     * This function set the form content based on a array-like
     * structure, containing the different elements of the form,
     * and, optionally, form parameters
     * @private
     */
    _setContent: function (/** Array | DOMNode */ data, /** Hash */ formParams){
        if (data instanceof Array) {
            // Form
            if (formParams){
                this._formWidget = new dijit.form.Form(formParams);
            } else {
                this._formWidget = new dijit.form.Form ({
                    'method': 'post'
                });
            }

            // Instantiate form elements
            $A(data).each (function(line){
                var lineNode;
                var inputNode;

                switch (line.type) {
                    case 'title':
                        lineNode = new Element ('h3').update(line.value);
                        break;

                    case 'input':
                        if (line.regExp || line.required) {
                            var input = new dijit.form.ValidationTextBox({
                                            'name' : line.name,
                                            'value': line.value,
                                            'regExp': (line.regExp) ? line.regExp : '.*',
                                            'required': (line.required) ? line.required : false,
                                            'invalidMessage': (line.message) ? line.message : 'This field cannot be blank'
                                        });
                        } else {
                            var input = new dijit.form.TextBox({
                                            'name' : line.name,
                                            'value': line.value
                                        });
                        }
                        if (line.disabled) {
                            input.attr('disabled', line.disabled);
                        }
                        inputNode = input.textbox;
                        lineNode = this._createLine(line.label, input.domNode);
                        break;

                    case 'checkbox':

                        var checkbox = new dijit.form.CheckBox({
                                    'name' : line.name,
                                    'value': line.value
                                });
                        if (line.disabled) {
                            checkbox.attr('disabled', line.disabled);
                        }

                        if (line.checked) {
                            checkbox.attr('checked', line.checked);
                        }

                        inputNode = checkbox.domNode;
                        lineNode = this._createLine(line.label, checkbox.domNode);
                        break;

                    case 'label':
                        lineNode = new Element('div', {
                                        'class': 'line',
                                        'style': line.style
                                    }).update(line.value);
                        break;

                    case 'pre':
                        lineNode = new Element('pre', {
                                        'class': 'line',
                                        'style': line.style
                                    }).update(line.value);
                        break;

                    case 'hidden':
                        lineNode = new Element('input',{
                                        'type': 'hidden',
                                        'name': line.name,
                                        'value': line.value
                                    });
                        break;

                    case 'comboBox':
                        inputNode = new Element('select', {
                            'name': line.name
                        });

                        $A(line.options).each(function(option) {
                            var optionNode = new Element('option', {
                                 'value': option.value
                            }).update(option.label);

                            if (option.value == line.value) {
                                optionNode.selected = "selected";
                            }

                            inputNode.appendChild(optionNode);
                        });

                        lineNode = this._createLine(line.label, inputNode);
                        break;

                    case 'textarea':
                        var textArea = new dijit.form.SimpleTextarea({
                            'name': line.name
                        });
                        textArea.attr("value", line.value);

                        inputNode = textArea.domNode;
                        lineNode = this._createLine(line.label, inputNode);
                        break;

                    default:
                        throw "Unimplemented form field type";
                }

                this._formWidget.domNode.appendChild(lineNode);
                if (inputNode) {
                    this._armEvents(inputNode, line.events);
                }
            }.bind(this));

            this._contentNode.update(this._formWidget.domNode);

        } else {
            // Data is a DOMNode
            this._contentNode.update(data);
        }

        // Just in case
        dojo.parser.parse(this._contentNode);
    },

    /**
     * Sets the message area content.
     *
     * @private
     */
    _setMessage: function(/** String */ message, type) {
        if (arguments.length == 0) {
            this._messageNode.className = 'dialogMessageZone hidden';
            this._messageNode.update('&nbsp;');
            return;
        }

        this._messageNode.className = 'dialogMessageZone';
        switch (type) {
            case FormDialog.MESSAGE_WARNING:
                this._messageNode.addClassName('warning');
                break;
            case FormDialog.MESSAGE_ERROR:
                this._messageNode.addClassName('error');
                break;
            default:
        }

        this._messageNode.innerHTML = message;
    },

    /**
     * Construct a form line provided the label text and the input node.
     * @type DOMNode
     * @private
     */
    _createLine: function(/** String */ label, /** DOMNode */ inputNode) {
        var lineNode = new Element('div', {
            'class' : 'line'
        });
        if (label) {
            var labelNode = new Element ('label').update(label);
            lineNode.appendChild(labelNode);
        }
        lineNode.appendChild(inputNode);
        return lineNode;
    },


    /**
     * Attach the event handlers to the input DOM node
     * @private
     */
    _armEvents: function(/** DOMNode */ input, /** Hash */ events) {
        $H(events).each(function(pair) {
            Element.observe(input, pair.key, pair.value);
        });
    },

    /**
     * This method is called to validate user input
     * Overwrite when necessary.
     * @private
     */
    _validate: function() {
        return this._getFormWidget().validate();
    },

    /**
     * This method is called for reseting the dialog fields.
     * Overload when necessary.
     * @private
     */
    _reset: function() {
        if (this._getFormWidget()) {
            this._getFormWidget().validate();
        }
    }

});

// STATIC ATTRIBUTES
FormDialog.POSITION_LEFT = "left";
FormDialog.POSITION_RIGHT = "right";
FormDialog.POSITION_BOTTOM = "bottom";
FormDialog.POSITION_TOP = "top";

FormDialog.POSITIVE_VALIDATION = '[1-9][0-9]*';
FormDialog.EMAIL_VALIDATION = '[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}';
FormDialog.URL_VALIDATION = '([hH][tT][tT][pP][sS]?)://[A-Za-z0-9-_]+(\.[A-Za-z0-9-_]+)*(:\d+)?(/[a-zA-Z0-9\.\?=/#%&\+-]*)*';

FormDialog.INVALID_POSITIVE_MESSAGE = 'Invalid number';
FormDialog.INVALID_EMAIL_MESSAGE = 'Invalid email address';
FormDialog.INVALID_URL_MESSAGE = 'Invalid URL';

FormDialog.MESSAGE_INFO = "info";
FormDialog.MESSAGE_WARNING = "warning";
FormDialog.MESSAGE_ERROR = "error";

// vim:ts=4:sw=4:et:

var ConfirmDialog = Class.create(FormDialog, /** @lends ConfirmDialog.prototype */ {
    /**
     * This class handles dialogs
     * @abstract
     * @extends FormDialog
     * @constructs
     * @param buttons
     *     ['ok_cancel' (default) | 'ok']
     * @param _options
     */
    initialize: function($super, /** String */ title, /** String */ buttons, /** Hash */_options) {
        $super({
            'title': title,
            'style': 'display:none;'
        }, _options);

        //Initializing buttons
        switch(buttons) {
            case ConfirmDialog.OK:
                this._okButton = this._addButton ('Ok',     this._onOk.bind(this));
                break;

            case ConfirmDialog.SAVE_DISCARD_CANCEL:
                if (_options && _options.callback) {

                    this._addButton('Save', this._onButtonPressed.bind({
                        'mine': this,
                        'pressedButton': ConfirmDialog.SAVE,
                        'callback': _options.callback
                    }));
                    this._addButton('Discard changes', this._onButtonPressed.bind({
                        'mine': this,
                        'pressedButton': ConfirmDialog.DISCARD,
                        'callback': _options.callback
                    }));
                    this._addButton('Cancel', this._onButtonPressed.bind({
                        'mine': this,
                        'pressedButton': ConfirmDialog.CANCEL,
                        'callback': _options.callback
                    }));
                } else {
                    throw "Cannot create a confirm dialog with that configuration. " +
                          "ConfirmDialog::initialize";
                }
                break;
            case ConfirmDialog.NONE:
                break;
            case ConfirmDialog.CUSTOM:
                 if (_options && _options.callback && _options.buttons) {
                    $H(_options.buttons).each(function(pair) {
                        this._addButton(pair.value, this._onButtonPressed.bind({
                            'mine': this,
                            'pressedButton': pair.key,
                            'callback': _options.callback
                        }));
                    }.bind(this));
                 } else {
                    throw "Cannot create a confirm dialog with that configuration. " +
                          "ConfirmDialog::initialize";
                 }
                 break;
            case ConfirmDialog.OK_CANCEL:
            default:
                this._okButton = this._addButton ('Ok', this._onOk.bind(this));
                this._addButton ('Cancel', this._onCancel.bind(this));
                break;
        }
    },


    // **************** PUBLIC METHODS **************** //



    // **************** PRIVATE METHODS **************** //

    /**
     * Inits the user interface
     * It may be overriden
     * @private
     */
    _initDialogInterface: function() {
        if (this._options.contents) {
            this._setContent(this._options.contents);
        }
    },

    /**
     * Enables/disables the ok button allowing/disallowing users to continue.
     *
     * @private
     */
    _setDisabled: function(disabled) {
        this._okButton.setDisabled(disabled);
    },

    /**
     * onOK
     * This function is called when ok button is pressed (if any)
     * @private
     */
    _onOk: function(){
        this._dialog.hide();
    },

    /**
     * onCancel
     * This function is called when ok button is pressed (if any)
     * @private
     */
    _onCancel: function(){
        this._dialog.hide();
    },

    /**
     * On button pressed
     * @private
     */
    _onButtonPressed: function() {
        this.mine._dialog.hide();
        this.callback(this.pressedButton);
    },

    /**
     * Reset method to leave the form as initially
     * @private
     */
    _reset: function ($super) {
        this._setDisabled(false);
        $super();
    }
});


// Static attributes
ConfirmDialog.OK = 'ok';
ConfirmDialog.OK_CANCEL = 'ok_cancel';
ConfirmDialog.SAVE_DISCARD_CANCEL = 'save_discard_cancel';
ConfirmDialog.CUSTOM = 'custom';
ConfirmDialog.NONE = 'none';
ConfirmDialog.SAVE = 'save';
ConfirmDialog.DISCARD = 'discard';
ConfirmDialog.CANCEL = 'cancel';

// vim:ts=4:sw=4:et:

var PrePostDialog = Class.create(ConfirmDialog /** @lends PrePostDialog.prototype */, {
    /**
     * This class handles the dialog
     * to update the *-condition properties
     * @constructs
     * @extends ConfirmDialog
     */
    initialize: function($super,
            /** Function */ onChangeCallback, /** String */ label, /** String */ type) {
        $super("Pre/Post Condition");

        /**
         * @type String
         * @private @member
         */
        this._label = label;

        /**
         * Type in pre/post
         * @type String
         * @private
         */
        this._type = type;


        this._onChangeCallback = onChangeCallback;
    },


    // **************** PUBLIC METHODS **************** //

    // **************** PRIVATE METHODS **************** //


    /**
     * initDialogInterface
     * This function creates the dom structure and
     * @private
     * @overrides
     */
    _initDialogInterface: function (){

        this._setHeader("Check domain concept details",
                             "Please fulfill the required information in order to" +
                             " set up the Domain Concept");

        var formData = [
            {
                'type':'input',
                'label': 'Type:',
                'name': 'type',
                'value': this._type,
                'disabled': true
            },
            {
                'type': 'input',
                'label': 'Label:',
                'name': 'label',
                'value': this._label,
                'required': true
            },
            {
                'type': 'title',
                'value': 'EzWeb properties'
            },
            {
                'type': 'comboBox',
                'label': 'Binding:',
                'name': 'binding',
                'value': 'undefined',
                'options': []
            },
            {
                'type': 'input',
                'label': 'Variable name:',
                'name': 'variableName',
                'value': this._label.replace(" ",""),
                'required': true
            },
            {
                'type': 'input',
                'label': 'Friendcode:',
                'name': 'friendcode',
                'value': this._label.replace(" ",""),
                'required': true
            }
        ];

        this._setContent(formData);
        this._onTypeChange();
    },
    /**
     * Overriding onOk handler
     * @override
     * @private
     */
    _onOk: function($super){
        this._onChangeCallback(this._getForm().serialize({'hash':true}));
        $super();
    },

    /**
     * Function called when the type of domain concept changes
     * @private
     */
    _onTypeChange: function() {

        var bindings = new Array();
        switch ($F(this._getForm().type)) {
            case 'pre':
                bindings.push({'value':'slot','label':'Slot'});
                bindings.push({'value':'pref','label':'User Preference'});
                bindings.push({'value':'context','label':'Platform Context'});
                break;
            case 'post':
                bindings.push({'value':'event','label':'Event'});
                break;
            default:
                break;
        }
        var bindingNode = $(this._getForm().binding);
        bindingNode.update("");
        bindings.each(function(binding) {
           var optionNode = new Element('option', {
                             'value': binding.value
                        }).update(binding.label);
           bindingNode.appendChild(optionNode);
        });
    }
});

// vim:ts=4:sw=4:et:

var PreferencesDialog = Class.create(ConfirmDialog /** @lends PreferencesDialog.prototype */, {
    /**
     * This class handles the dialog
     * that shows the user preferences
     * @constructs
     * @extends ConfirmDialog
     */
    initialize: function($super) {

        $super("User Preferences");
    },


    // **************** PUBLIC METHODS **************** //


    // **************** PRIVATE METHODS **************** //


    /**
     * initDialogInterface
     * This function creates the dom structure and
     * @private
     * @override
     */
    _initDialogInterface: function () {

        this._setHeader("User preferences");

        var user = GVS.getUser();

        var formData = [
            {'type':'input', 'label': 'First Name:','name': 'firstName',
                    'value': user.getFirstName()},
            {'type':'input', 'label': 'Last Name:','name': 'lastName',
                    'value': user.getLastName()},
            {'type':'input', 'label': 'Email:','name': 'email', 'value': user.getEmail(),
                    'regExp': FormDialog.EMAIL_VALIDATION,
                    'message': FormDialog.INVALID_EMAIL_MESSAGE,
                    'required': true},
            {'type':'input', 'label': 'EzWeb URL:','name': 'ezWebURL',
                    'value': user.getEzWebURL(),
                    'regExp': FormDialog.URL_VALIDATION,
                    'message': FormDialog.INVALID_URL_MESSAGE}
        ];

        this._setContent(formData);

    },
    /**
     * Overriding onOk handler
     * @override
     * @private
     */
    _onOk: function($super){

        if (!this._getFormWidget().validate()) {
            return;
        }
        else {
            var user = GVS.getUser();
            user.update(this._getForm().serialize(true));
            $super();
        }
    },

    /**
     * Reset method to leave the form as initially
     * @override
     * @private
     */
    _reset: function ($super){
        var user = GVS.getUser();
        this._getForm().firstName.value = user.getFirstName();
        this._getForm().lastName.value = user.getLastName();
        this._getForm().email.value = user.getEmail();
        this._getForm().ezWebURL.value = user.getEzWebURL();
        $super();
    }
});

// vim:ts=4:sw=4:et:

var ExternalContentDialog = Class.create(ConfirmDialog /** @lends ExternalContentDialog.prototype */, {
    /**
     * This class handles a dialog
     * whose content is an external content,
     * normally coming from an AJAX call
     * @constructs
     * @extends ConfirmDialog
     */
    initialize: function($super, title) {
        $super(title, ConfirmDialog.NONE);
    },

    // **************** PUBLIC METHODS **************** //


    /**
     * show
     * @override
     */
    show: function ($super, /** DOMNode */ content) {
        $super();
        this._setContent(content);
    },

    // **************** PRIVATE METHODS **************** //


    /**
     * initDialogInterface
     * This function creates the dom structure
     * @private
     * @override
     */
    _initDialogInterface: function () {
        //Do nothing
    }
});

// vim:ts=4:sw=4:et:

var BuildGadgetDialog = Class.create(ConfirmDialog /** @lends BuildGadgetDialog.prototype */, {
    /**
     * This class handles the dialog
     * to store a gadget
     * @constructs
     * @extends ConfirmDialog
     */
    initialize: function($super, /** Function */ onDeployCallback) {

        $super("Build Gadget");

        /**
         * @type Function
         * @private @member
         */
        this._onDeployCallback = onDeployCallback;
    },


    // **************** PUBLIC METHODS **************** //


    /**
     * show
     * @override
     */
    show: function ($super, /** Object */ properties) {
        $super();
        $H(properties).each(function(pair) {
            this._getForm()[pair.key].setValue(pair.value);
        }.bind(this));
    },

    // **************** PRIVATE METHODS **************** //


    /**
     * initDialogInterface
     * This function creates the dom structure
     * @private
     * @override
     */
    _initDialogInterface: function (){

        var user = GVS.getUser();

        this._setHeader("Fulfill Gadget Information",
                             "Please fulfill the required information in order to" +
                             " deploy a gadget.");

        var formData = [
            {'type':'title', 'value': 'Gadget information'},
            {'type':'input', 'label': 'Gadget Name:','name': 'name', 'value': '', 'required': true},
            {'type':'input', 'label': 'Gadget Short Name:', 'name': 'shortname', 'value': ''},
            {'type':'input', 'label': 'Owner:','name': 'owner', 'value': '', 'required': true},
            {'type':'input', 'label': 'Version:','name': 'version', 'value': '1.0', 'required': true},
            {'type':'input', 'label': 'Vendor:','name': 'vendor', 'value': 'Morfeo'},
            {'type':'input', 'label': 'Gadget Description:','name': 'desc', 'value': ''},
            {'type':'input', 'label': 'Image URL:','name': 'imageURI',
                'value': '',
                'regExp': FormDialog.URL_VALIDATION,
                'message': FormDialog.INVALID_URL_MESSAGE},
            {'type':'input', 'label': 'Homepage:','name': 'gadgetHomepage',
                'value': '',
                'regExp': FormDialog.URL_VALIDATION,
                'message': FormDialog.INVALID_URL_MESSAGE},
            {'type':'input', 'label': 'Default Height:', 'name': 'height', 'value': '',
                'regExp': FormDialog.POSITIVE_VALIDATION,
                'message': FormDialog.INVALID_POSITIVE_MESSAGE},
            {'type':'input', 'label': 'Default Width:', 'name': 'width', 'value': '',
                'regExp': FormDialog.POSITIVE_VALIDATION,
                'message': FormDialog.INVALID_POSITIVE_MESSAGE},
            {'type':'checkbox', 'label': 'Persistent Data', 'name': 'persistent',
                'value': 'true',
                'checked': false},
            {'type':'title', 'value': 'Author information'},
            {'type':'input', 'label': 'Author Name:','name': 'authorName', 'value': user.getRealName()},
            {'type':'input', 'label': 'E-Mail:','name': 'email', 'value': user.getEmail(),
                'regExp': FormDialog.EMAIL_VALIDATION,
                'message': FormDialog.INVALID_EMAIL_MESSAGE},
            {'type':'input', 'label': 'Homepage:','name': 'authorHomepage',
                'value': '',
                'regExp': FormDialog.URL_VALIDATION,
                'message': FormDialog.INVALID_URL_MESSAGE},
            {'type':'title', 'value': 'Destination Gadgets'},
            {'type':'checkbox', 'label': 'EzWeb:','name': 'platforms',
                'value': 'ezweb',
                'checked': true},
            {'type':'checkbox', 'label': 'Google:','name': 'platforms',
                'value': 'google',
                'checked': true}
            ];
            if (GlobalOptions.isLocalStorage == false) {
                formData.push(
                {
                    'type':'checkbox', 'label': 'BeemBoard:','name': 'platforms',
                    'value': 'beemboard',
                    'checked': true
                });
            }
            formData.push({'type':'checkbox', 'label': 'Standalone:','name': 'platforms',
                'value': 'player',
                'checked': true});
        this._setContent(formData);
    },
    /**
     * Overriding onOk handler
     * @private
     * @override
     */
    _onOk: function($super){
        if (this._getFormWidget().validate()) {
            var form = this._getForm().serialize({'hash':true});
            if (form.platforms){
                $super();
                this._onDeployCallback(form);
            }
        }
    },
    /**
     * Reset form
     * @private
     * @override
     */
    _reset: function($super){
        var user = GVS.getUser();

        this._getForm().authorName.value = user.getRealName();
        this._getForm().email.value = user.getEmail();
        $super();
    }
});

// vim:ts=4:sw=4:et:

var PublishGadgetDialog = Class.create(ConfirmDialog /** @lends PublishGadgetDialog.prototype */, {
    /**
     * This class handles a dialog
     * able to publish a created gadget into a mashup platform
     * @constructs
     * @extends ConfirmDialog
     */
    initialize: function($super) {
        $super("Publish Gadget", ConfirmDialog.OK);

        /**
         * Publication Info
         * @private
         * @type Object
         */
        this._publication = null;

        /**
         * Hash containing the references to all the buttons
         * @type Hash
         * @private
         */
        this._buttons = new Hash();

        /**
         * Standalone Dialog
         * @type StandaloneEmbeddingDialog
         * @private
         */
        this._standaloneDialog = null;
    },

    // **************** PUBLIC METHODS **************** //


    /**
     * show
     * @override
     */
    show: function ($super, /** Object */ publication) {
        this._publication = publication;
        this._initDialogInterface();
        $super();
    },

    // **************** PRIVATE METHODS **************** //

    /**
     * Publishes the created gadget
     * @private
     */
    _publishGadget: function(/** dijit.form.Button */ button, /** Hash */ options) {
        var publicationUrl = options.url;
        if (options.mashupPlatform == 'ezweb') {
            publicationUrl = URIs.ezweb + "interfaces/gadget?template_uri=" + options.url;
        } else if (options.mashupPlatform == 'igoogle') {
            if (options.destination=='directory') {
                publicationUrl = "http://www.google.com/ig/submit?url=" + options.url;
            } else if (options.destination=='personal'){
                publicationUrl = "http://www.google.com/ig/adde?moduleurl=" + options.url;
            }
        } else if (options.mashupPlatform == 'orkut') {
            publicationUrl = "http://sandbox.orkut.com/Main#MyApps?appUrl=" + options.url;
        }
        this._deploy(button, options, publicationUrl);
    },

    /**
     * This function deploy a gadget to EzWeb
     * @private
     */
    _deploy: function(/** domNode */ buttonNode, /** Hash */ options, /**String*/ url) {
        var button = dijit.byId(buttonNode.id);
        if (options.disableAfterPublishing){
            button.attr("label", options.doneButtonLabel);
            button.attr("disabled", true);
        }
        if (options.mashupPlatform == 'standalone'){
            if (!this._standaloneDialog){
                this._standaloneDialog = new StandaloneEmbeddingDialog(this._publication, url);
            } else {
                this._standaloneDialog.updateDialog(this._publication, url);
            }
            this._standaloneDialog.show();
        } else {
            window.open(url);
        }
        console.log(url);
    },

    /**
     * initDialogInterface
     * This function creates the dom structure
     * @private
     * @override
     */
    _initDialogInterface: function () {
        var dom = new Element('div');

        var title = new Element('h2', {
            'class': 'detailsTitle'
        }).update("Publish Gadget");
        dom.appendChild(title);

        var contents = new Element('div', {
            'class': 'deployment'
        });

        var table = new Element('table');
        contents.appendChild(table);
        dom.appendChild(contents);

        var tableData = [
            {'className': 'tableHeader',
             'fields': [{
                    'className': 'left',
                    'node': 'Mashup platform'
                 },{
                    'className': 'left',
                    'node': ''
                 }]
            }
        ];

        var gadgets = new Hash(this._publication.gadgets);
        gadgets.each(function(gadget) {
                var destinations = PublishGadgetDialog.GADGET_DESTINATIONS.get(gadget.key);
                destinations.each(function(destination) {
                    destination.url = gadget.value;
                    tableData.push(this._createPlatformRow(destination));
                }.bind(this));
            }.bind(this));

        this._fillTable(table, tableData);
        this._setContent(dom);
    },

    /**
     * This function create a row for a destination platform
     * @private
     */
    _createPlatformRow: function (/** Hash */ options) {
        return {'className': '',
            'fields': [{
                'className': 'mashup',
                'node': options.title + ' [<a href="' + options.url + '" target="blank">' + options.urlLabel + '</a>]'
             },{
                'className': '',
                'node': this._buttons.set(options.id, new dijit.form.Button({
                    'label': options.buttonLabel,
                    'onClick': function(e) {
                                this._publishGadget(e.element(), options);
                            }.bind(this)
                })).domNode
             }]
         };
    },

    /**
     * This function fills a table with data
     * @private
     */
    _fillTable: function(/** DOMNode */ tableNode, /** Array */ data) {
        data.each(function(row) {
            var tr = new Element('tr', {
                'class': row.className
            });
            row.fields.each(function(field) {
                var td = new Element('td', {
                    'class': field.className
                }).update(field.node);
                tr.appendChild(td);
            });
            tableNode.appendChild(tr);
        });
    }
});

//STATIC ATTRIBUTES
PublishGadgetDialog.GADGET_DESTINATIONS = new Hash();
PublishGadgetDialog.GADGET_DESTINATIONS.set('ezweb',
        [
             {	id: 'ezweb',
                 mashupPlatform: 'ezweb',
                title: 'EzWeb',
                urlLabel: 'Template',
                buttonLabel: 'Publish it!',
                disableAfterPublishing: true,
                doneButtonLabel: 'Done'
            }
        ]);
PublishGadgetDialog.GADGET_DESTINATIONS.set('google',
        [
             {	id: 'igoogleDirectory',
                mashupPlatform: 'igoogle',
                destination: 'directory',
                title: 'iGoogle Directory',
                urlLabel: 'Template',
                buttonLabel: 'Publish it!',
                disableAfterPublishing: true,
                doneButtonLabel: 'Done'
            },
            {	id: 'igooglePersonal',
                mashupPlatform: 'igoogle',
                destination: 'personal',
                title: 'iGoogle Personal Page',
                urlLabel: 'Template',
                buttonLabel: 'Publish it!',
                disableAfterPublishing: true,
                doneButtonLabel: 'Done'
            },
            {	id: 'orkut',
                mashupPlatform: 'orkut',
                title: 'Orkut',
                urlLabel: 'Template',
                buttonLabel: 'Publish it!',
                disableAfterPublishing: true,
                doneButtonLabel: 'Done'
            }
        ]);
PublishGadgetDialog.GADGET_DESTINATIONS.set('player',
        [
            {	id: 'standalone',
                mashupPlatform: 'standalone',
                title: 'Standalone',
                urlLabel: 'HTML',
                buttonLabel: 'Embed it!',
                disableAfterPublishing: false
            }
        ]);

// vim:ts=4:sw=4:et:

var AddScreenDialog = Class.create(ConfirmDialog /** @lends AddScreenDialog.prototype */, {
    /**
     * This class handles the dialog to add a new screen
     * TODO: redesign
     * @constructs
     * @extends ConfirmDialog
     */
    initialize: function($super) {
        $super("Add Screen");
    },
    // **************** PUBLIC METHODS **************** //


    // **************** PRIVATE METHODS **************** //
    /**
     * initDialogInterface
     * This function creates the dom structure and
     * @private
     * @overrides
     */
    _initDialogInterface: function (){

        this._setHeader("Fulfill Screen Information",
                             "Please fulfill the required information in order to" +
                             " add a new screen to the catalogue.");

        var formData = [
            {'type':'title', 'value': 'Screen information'},
            {'type':'input', 'label': 'Label:','name': 'label', 'value': 'Label of the screen...'},
            {'type':'input', 'label': 'Description:','name': 'description', 'value': 'Short description of the screen...'},
            {'type':'input', 'label': 'Creator URL (*):','name': 'creator', 'value': 'Creator URL...'}, //TODO: validation
            {'type':'input', 'label': 'Rights URL (*):','name': 'rights', 'value': 'Rights URL...'},
            {'type':'input', 'label': 'Version:','name': 'version', 'value': '1.0'},
            {'type':'input', 'label': 'Icon URL (*):','name': 'icon', 'value': 'icon URL...'},
            {'type':'input', 'label': 'Screenshot URL (*):','name': 'screenshot', 'value': 'Screenshot URL...'},
            {'type':'input', 'label': 'Domain Context:','name': 'tags', 'value': 'Write domain context as tags separated by ","...'},
            {'type':'input', 'label': 'Homepage (*):','name': 'homepage', 'value': 'Homepage URL...'},
            {'type':'input', 'label': 'Preconditions:','name': 'preconditions', 'value': 'If any, write preconditions separated by ","...'},
            {'type':'input', 'label': 'Postconditions:','name': 'postconditions', 'value': 'If any, write postconditions separated by ","...'},
            {'type':'input', 'label': 'Screen code URL (*):','name': 'code', 'value': 'Screencode URL...'},
            {'type':'hidden', 'name': 'creationDate', 'value': ''},
            {'type':'label', 'value': '(*): Required Field'}
        ];

        this._setContent(formData);

    },

    /**
     * Overriding onOk handler
     * @overrides
     * @private
     */
    _onOk: function($super){
        $super();
        var creationDate = new Date();
        var form = this._getForm();


        form.creationDate.setValue(Utils.getIsoDateNow(creationDate));

        var formToSend = form.serialize(true);
        formToSend.label = {
            "en-GB": form.label.getValue()
        };
        formToSend.description = {
            "en-GB": form.description.getValue()
        };

        // TODO: Review this
        var tagsArray = form.tags.getValue().split(',');
        for (var i = 0; i < tagsArray.length; i++) {
            var aux = tagsArray[i].strip();
            if (aux && aux != "") {
                tagsArray[i] = aux;
            }
            else {
                tagsArray[i] = null;
            }
        }
        tagsArray = tagsArray.compact();
        formToSend.tags = Utils.getCatalogueTags(tagsArray, null);

        var preconditionsArray = form.preconditions.getValue().split(',');
        for (var i = 0; i < preconditionsArray.length; i++) {
            var aux = preconditionsArray[i].strip();
            if (aux && aux != "") {
                preconditionsArray[i] = aux;
            }
            else {
                preconditionsArray[i] = null;
            }
        }
        preconditionsArray = preconditionsArray.compact();
        formToSend.preconditions = preconditionsArray;

        var postconditionsArray = form.postconditions.getValue().split(',');
        for (var i = 0; i < postconditionsArray.length; i++) {
            var aux = postconditionsArray[i].strip();
            if (aux && aux != "") {
                postconditionsArray[i] = aux;
            }
            else {
                postconditionsArray[i] = null;
            }
        }
        postconditionsArray = postconditionsArray.compact();
        formToSend.postconditions = postconditionsArray;

        console.log("Before json");
        console.log(formToSend);
        console.log("After json");
        console.log(Object.toJSON(formToSend));

        Catalogue.createScreen(Object.toJSON(formToSend));

    }
});

// vim:ts=4:sw=4:et:

var NewBuildingBlockDialog = Class.create(ConfirmDialog /** @lends NewBuildingBlockDialog.prototype */, {

    /**
     * This class handles building block creation dialogs
     * @abstract
     * @constructs
     * @extends ConfirmDialog
     */
    initialize: function($super, buildingblockName) {


        /**
         * Name of the Building Block this Dialog handles
         * @private
         * @type String
         */
        this._buildingblockName = buildingblockName;

        /**
         * URI used for asking buildingblock availability
         * @private
         * @type String
         */
        this._searchURI = URIs[this._buildingblockName.toLowerCase() + 'Search'];

        /**
         * Current building block availability
         * @private
         * @type Boolean
         */
        this._available = true;

        $super("New " + this._buildingblockName, ConfirmDialog.OK_CANCEL, {'createMessageZone': true});
    },


    // **************** PUBLIC METHODS **************** //


    // **************** PRIVATE METHODS **************** //


    /**
     * initDialogInterface
     * This function creates the dom structure and
     * @private
     * @override
     */
    _initDialogInterface: function () {

        this._setHeader(
                "Fulfill " + this._buildingblockName + " Information",
                "Please fulfill the required information in order to " +
                "create a new " + this._buildingblockName + "."
        );

        var callback = this._scheduleAvailabilityCheck.bind(this);
        var formData = [
            {
                'type':'input',
                'label': this._buildingblockName + ' Name:',
                'name': 'name',
                'value': '',
                'message': this._buildingblockName + 'Name cannot be blank',
                'required': true,
                'events': {
                    'keypress': callback,
                    'blur': function() {
                                this._getForm().name.value = Utils.sanitize($F(this._getForm().name));
                            }.bind(this)
                }
            },
            {
                'type':'input',
                'label': 'Version:',
                'name': 'version',
                'value': '',
                'message': 'Version cannot be blank',
                'events': {
                    'keypress': callback
                }
            },
            {
                'type':'input',
                'label': 'Tags:',
                'name': 'tags',
                'value': ''
            }
        ];

        this._setContent(formData);
    },

    /**
     * This function updates this dialog taking into account the availability
     * status. For example, if current building block name/version is not available, this
     * dialog will be disabled.
     *
     * @private
     */
    _updateAvailabilityStatus: function() {
        if (this._available) {
            this._setMessage();
        } else {
            this._setMessage('Please, use a diferent Version or ' + this._buildingblockName + ' Name.',
                             FormDialog.MESSAGE_ERROR);
        }
        this._setDisabled(!this._available);
    },

    /**
     * Callback function
     *
     * @private
     */
    _onAvailabilityCheckSuccess: function(/**XMLHttpRequest*/ transport) {
        var metadata = transport.responseText.evalJSON();
        this._available = metadata.length == 0
        this._updateAvailabilityStatus();
    },

    /**
     * Updates the availability status. This is an asynchronous operation.
     *
     * @private
     */
    _availabilityCheck: function() {
        var name = Utils.sanitize($F(this._getForm().name));
        var version = $F(this._getForm().version);

        if (name == "" || version == "") {
            this._available = name != "";
            this._updateAvailabilityStatus();
            return;
        }

        var query = {
            "query": {
                "type": "and",
                "operands": [
                    {
                        "type": "field",
                        "condition": "is",
                        "field": "name",
                        "value": name
                    },
                    {
                        "type": "field",
                        "condition": "is",
                        "field": "version",
                        "value": version
                    }
                ]
            },
            "fields": ["version"],
            "limit": 1
        }
        PersistenceEngine.sendPost(this._searchURI, null,
                Object.toJSON(query), this, this._onAvailabilityCheckSuccess,
                Utils.onAJAXError);
    },

    /**
     * Callback function.
     *
     * Invalidates current availability info and schedules the retreiving of the
     * availability status.
     *
     * @private
     */
    _scheduleAvailabilityCheck: function(e) {
        // Ignore "control" keys, except "backspace" and "delete"
        if ((e.charCode == 0) && (e.keyCode != 8 && e.keyCode != 46))
            return;

        this._available = false;
        try {
            clearTimeout(this._timeout);
        } catch (e) {}

        this._setMessage('Checking if the ' + this._buildingblockName + ' already exists...');
        this._timeout = setTimeout(this._availabilityCheck.bind(this), 1000);
        this._setDisabled(true);
    },

    /**
     * Overriding onOk handler
     * @override
     * @private
     */
    _onOk: function($super) {
        if (this._validate()) {
            $super();

            var name = Utils.sanitize($F(this._getForm().name));
            var tags = $F(this._getForm().tags).split(/[\s,]+/).without("");
            var version = $F(this._getForm().version);

            var processedTags = Utils.getCatalogueTags($A(tags), null);

            this._create(name, processedTags, version);
        }
    },

    /**
     * Creates the building block
     * @override
     * @private
     */
    _create: function(name, processedTags, version) {
        var documentController = GVS.getDocumentController();
        documentController['create' + this._buildingblockName](name, processedTags, version);
    },

     /**
     * Overriding onCancel handler
     * @override
     * @private
     */
    _onCancel: function($super) {
        try {
            clearTimeout(this._timeout);
        } catch (e) {}

        $super();
    },

    /**
     * Reset method to leave the form as initially
     * @private
     */
    _reset: function ($super) {
        $super();

        this._getForm().name.value = "";
        this._getForm().tags.value = "";
        this._getForm().version.value = "";
        this._available = false;
        this._setDisabled(true);
        this._setMessage();
    }
});

// vim:ts=4:sw=4:et:

var NewBuildingBlockCodeDialog = Class.create(ConfirmDialog /** @lends NewBuildingBlockDialog.prototype */, {

    /**
     * This class handles building block creation dialogs
     * @abstract
     * @constructs
     * @extends ConfirmDialog
     */
    initialize: function($super, buildingblockName) {
        /**
         * Current building block availability
         * @private
         * @type Boolean
         */
        this._available = true;

        $super("New Building Block", ConfirmDialog.OK_CANCEL, {'createMessageZone': true});
    },


    // **************** PUBLIC METHODS **************** //


    // **************** PRIVATE METHODS **************** //


    /**
     * initDialogInterface
     * This function creates the dom structure and
     * @private
     * @override
     */
    _initDialogInterface: function () {

        this._setHeader(
                "Fulfill Building Block Information",
                "Please fulfill the required information in order to " +
                "create a new building block."
        );

        var callback = this._scheduleAvailabilityCheck.bind(this);
        var formData = [
            {
                'type':'comboBox',
                'label': 'Type',
                'name':'bBType',
                'required': true,
                'options': [
                    {
                        'label':'Form',
                        'value':BuildingBlockDocument.FORM
                    },
                    {
                        'label':'Operator',
                        'value':BuildingBlockDocument.OPERATOR
                    },
                    {
                        'label':'Resource',
                        'value':BuildingBlockDocument.RESOURCE
                    }
                ]
            },
            {
                'type':'input',
                'label': 'Name:',
                'name': 'name',
                'value': '',
                'message': this._buildingblockName + 'Name cannot be blank',
                'required': true,
                'events': {
                    'keypress': callback,
                    'blur': function() {
                                this._getForm().name.value = Utils.sanitize($F(this._getForm().name));
                            }.bind(this)
                }
            },
            {
                'type':'input',
                'label': 'Version:',
                'name': 'version',
                'value': '',
                'message': 'Version cannot be blank',
                'events': {
                    'keypress': callback
                }
            },
            {
                'type':'input',
                'label': 'Tags:',
                'name': 'tags',
                'value': ''
            }
        ];

        this._setContent(formData);
    },

    /**
     * This function updates this dialog taking into account the availability
     * status. For example, if current building block name/version is not available, this
     * dialog will be disabled.
     *
     * @private
     */
    _updateAvailabilityStatus: function() {
        if (this._available) {
            this._setMessage();
        } else {
            this._setMessage('Please, use a diferent Version or ' + this._buildingblockName + ' Name.',
                             FormDialog.MESSAGE_ERROR);
        }
        this._setDisabled(!this._available);
    },

    /**
     * Callback function
     *
     * @private
     */
    _onAvailabilityCheckSuccess: function(/**XMLHttpRequest*/ transport) {
        var metadata = transport.responseText.evalJSON();
        this._available = metadata.length == 0
        this._updateAvailabilityStatus();
    },

    /**
     * Updates the availability status. This is an asynchronous operation.
     *
     * @private
     */
    _availabilityCheck: function() {
        var type = $F(this._getForm().bBType)
        var name = Utils.sanitize($F(this._getForm().name));
        var version = $F(this._getForm().version);

        if (type == "" || name == "" || version == "") {
            this._available = name != "";
            this._updateAvailabilityStatus();
            return;
        }

        var query = {
            "query": {
                "type": "and",
                "operands": [
                    {
                        "type": "field",
                        "condition": "is",
                        "field": "name",
                        "value": name
                    },
                    {
                        "type": "field",
                        "condition": "is",
                        "field": "version",
                        "value": version
                    }
                ]
            },
            "fields": ["version"],
            "limit": 1
        }

        var searchURI = URIs[type.toLowerCase() + 'Search'];
        PersistenceEngine.sendPost(searchURI, null,
                Object.toJSON(query), this, this._onAvailabilityCheckSuccess,
                Utils.onAJAXError);
    },

    /**
     * Callback function.
     *
     * Invalidates current availability info and schedules the retreiving of the
     * availability status.
     *
     * @private
     */
    _scheduleAvailabilityCheck: function(e) {
        // Ignore "control" keys, except "backspace" and "delete"
        if ((e.charCode == 0) && (e.keyCode != 8 && e.keyCode != 46))
            return;

        this._available = false;
        try {
            clearTimeout(this._timeout);
        } catch (e) {}

        this._setMessage('Checking if the ' + this._buildingblockName + ' already exists...');
        this._timeout = setTimeout(this._availabilityCheck.bind(this), 1000);
        this._setDisabled(true);
    },

    /**
     * Overriding onOk handler
     * @override
     * @private
     */
    _onOk: function($super) {
        if (this._validate()) {
            $super();

            var type = $F(this._getForm().bBType);
            var name = Utils.sanitize($F(this._getForm().name));
            var tags = $F(this._getForm().tags).split(/[\s,]+/).without("");
            var version = $F(this._getForm().version);

            var processedTags = Utils.getCatalogueTags($A(tags), null);

            this._create(name, processedTags, version, type);
        }
    },

    /**
     * Creates the building block
     * @override
     * @private
     */
    _create: function(name, processedTags, version, type) {
        var documentController = GVS.getDocumentController();
        var type = type.substr(0, 1).toUpperCase() + type.substr(1);
        documentController['create' + type](name, processedTags, version);
    },

     /**
     * Overriding onCancel handler
     * @override
     * @private
     */
    _onCancel: function($super) {
        try {
            clearTimeout(this._timeout);
        } catch (e) {}

        $super();
    },

    /**
     * Reset method to leave the form as initially
     * @private
     */
    _reset: function ($super) {
        $super();

        this._getForm().name.value = "";
        this._getForm().tags.value = "";
        this._getForm().version.value = "";
        this._available = false;
        this._setDisabled(true);
        this._setMessage();
    }
});

// vim:ts=4:sw=4:et:

var SaveAsDialog = Class.create(ConfirmDialog /** @lends SaveAsDialog.prototype */, {
    /**
     * This class handles the dialog
     * to save as a new document
     * @constructs
     * @extends ConfirmDialog
     */
    initialize: function($super, /** String */ buildingBlockType,
                        /** String */ name, /** String */ version,
                        /** Function */ onOkHandler, /** Boolean(optional) */ _cloned) {

        /**
         * Building block type of the element being saved
         * @private
         * @type String
         */
        this._type = buildingBlockType;

        /**
         * Current name/version availability
         * @private
         * @type Boolean
         */
        this._available = true;

        /**
         * Name of the document
         * @private
         * @type String
         */
        this._name = name;

        /**
         * Version of the document
         * @private
         * @type String
         */
        this._version = version;

        /**
         * On ok handler
         * @private
         * @type Function
         */
        this._onOkHandler = onOkHandler;

        var buttons = ConfirmDialog.OK_CANCEL;
        var options = {'createMessageZone': true};
        if(_cloned) {
            buttons = ConfirmDialog.OK;
            options.closable = false;
        }

        $super("Choose new name/version", buttons, options);
    },


    // **************** PUBLIC METHODS **************** //


    // **************** PRIVATE METHODS **************** //


    /**
     * initDialogInterface
     * This function creates the dom structure and
     * @private
     * @override
     */
    _initDialogInterface: function (){


        var callback = this._scheduleAvailabilityCheck.bind(this);
        var formData = [
            {
                'type':'input',
                'label': 'New Name:',
                'name': 'name',
                'value': this._name,
                'message': 'Name cannot be blank',
                'required': true,
                'events': {
                    'keypress': callback
                }
            },
            {
                'type':'input',
                'label': 'Version:',
                'name': 'version',
                'value': '',
                'message': 'Version cannot be blank',
                'events': {
                    'keypress': callback
                }
            },
            {
                'type': 'label',
                'value': '(Previous version was ' + this._version + ')',
                'style': 'font-size: 95%; color: #555; padding-left: 130px'
            }
        ];

        this._setContent(formData);
        this._setDisabled(true);
        this._availabilityCheck();
    },

    /**
     * This function updates this dialog taking into account the availability
     * status. For example, if the screen name/version is not available, this
     * dialog will be disabled.
     *
     * @private
     */
    _updateAvailabilityStatus: function() {
        if (this._available) {
            this._setMessage();
        } else {
            this._setMessage('Please, use a different ' +  this._type +
                            ' Version or Name.',
                             FormDialog.MESSAGE_ERROR);
        }
        this._setDisabled(!this._available);
    },

    /**
     * Callback function
     *
     * @private
     */
    _onAvailabilityCheckSuccess: function(/**XMLHttpRequest*/ transport) {
        var metadata = transport.responseText.evalJSON();
        this._available = metadata.length == 0
        this._updateAvailabilityStatus();
    },

    /**
     * Updates the availability status. This is an asynchronous operation.
     *
     * @private
     */
    _availabilityCheck: function() {
        var name = $F(this._getForm().name);
        var version = $F(this._getForm().version);

        if (name == "" || version == "") {
            this._available = name != "";
            this._updateAvailabilityStatus();
            return;
        }

        var query = {
            "query": {
                "type": "and",
                "operands": [
                    {
                        "type": "field",
                        "condition": "is",
                        "field": "name",
                        "value": name
                    },
                    {
                        "type": "field",
                        "condition": "is",
                        "field": "version",
                        "value": version
                    }
                ]
            },
            "fields": ["version"],
            "limit": 1
        }
        PersistenceEngine.sendPost(URIs[this._type + "Search"], null,
                Object.toJSON(query), this, this._onAvailabilityCheckSuccess,
                Utils.onAJAXError);
    },

    /**
     * Callback function.
     *
     * Invalidates current availability info and schedules the retreiving of the
     * availability status.
     *
     * @private
     */
    _scheduleAvailabilityCheck: function(e) {
        // Ignore "control" keys, except "backspace" and "delete"
        if ((e.charCode == 0) && (e.keyCode != 8 && e.keyCode != 46))
            return;

        this._available = false;
        try {
            clearTimeout(this._timeout);
        } catch (e) {}

        this._setMessage('Checking if the name/version already exists...');
        this._timeout = setTimeout(this._availabilityCheck.bind(this), 1000);
        this._setDisabled(true);
    },

    /**
     * Overriding onOk handler
     * @override
     * @private
     */
    _onOk: function($super){
        if (this._getFormWidget().validate() && this._available) {
            var name = $F(this._getForm().name);

            var version = $F(this._getForm().version);

            this._onOkHandler(name, version);

            $super();
        }
    },

     /**
     * Overriding onCancel handler
     * @override
     * @private
     */
    _onCancel: function($super) {
        try {
            clearTimeout(this._timeout);
        } catch (e) {}

        $super();
    }
});

// vim:ts=4:sw=4:et:

var GalleryDialog = Class.create(FormDialog, /** @lends GalleryDialog.prototype */ {
    /**
     * This class handles dialogs with a gallery (a table) of elements
     * Any descendant must use this class as follows:
     *      It must call to _setFields, _setButtons and _addRows, before calling
     *      _render, which will be the method that builds the interface, using
     *      the information that has been stated in the previous methods.
     * TODO: Add pagination
     * @abstract
     * @extends FormDialog
     * @constructs
     */
    initialize: function($super, /** String */ title,
                        /** Object (Optional) */ _properties) {
        $super({
            'title': title,
            'style': 'display:none;'
        }, {
            'buttonPosition': FormDialog.POSITION_TOP
        });

        var properties = Utils.variableOrDefault(_properties, {});

        /**
         * Hash of properties of the gallery
         * @type Hash
         * @private
         */
        this._properties = new Hash();


        // Assigning the passed parameters, or defaults
        this._properties.set('showTitleRow', (properties.showTitleRow || false));
        this._properties.set('elementsPerPage', (properties.elementsPerPage || 10));
        this._properties.set('onDblClick', (properties.onDblClick || function(){}));
        // Disable all the events if the selected row is not valid
        this._properties.set('disableIfNotValid', (properties.disableIfNotValid || false));

        /**
         * Table fields
         * @type Array
         * @private
         */
        this._fields = null;

        /**
         * Buttons that will be shown when an element is clicked
         * @type Array
         * @private
         */
        this._buttons = null;

        /**
         * List of buttons that will be disabled if the selected row
         * is not valid
         * @type Array
         * @private
         */
        this._disabledButtons = new Array();

        /**
         * List of rows
         * @type Array
         * @private
         */
        this._rows = new Array();

        /**
         * Currently selected row
         * @type Object
         * @private
         */
        this._selectedRow = null;
    },


    // **************** PUBLIC METHODS **************** //

    /**
     * @override
     */
    show: function() {
        // Do nothing. To be overriden
    },

    // **************** PRIVATE METHODS **************** //
    /**
     * Set the field list
     * Each of the fields is an object with the following structure:
     *  * String title. Field human readable title
     *  * Boolean hidden. The field won't be shown in the interface
     *  * String className. CSS class that will be applied to the whole
     *                  column
     * @private
     */
    _setFields: function (/** Array */ fields) {
        this._fields = fields;
    },

    /**
     * Set the button list.
     * Each element is an object with the following structure:
     *  * String value: Text of the button
     *  * Function handler: function which will be called when the button
     *              is clicked. The function will receive the key value of
     *              the selected element
     * @private
     */
    _setButtons: function(/** Array */ buttons) {
        this._buttons = buttons;
    },

    /**
     * Adds a new row to the gallery.
     * It has to be an Object with this structure:
     *    * String key: key of the row
     *    * Array values: List with all the fields. Each of them must be
     *                    a String or a DOM node
     * @private
     */
    _addRow: function(/** Object */ row) {
        this._rows.push(row);
    },

    /**
     * Builds the user interface, using the gathered information
     * @private
     */
    _render: function(/** Boolean(Optional) */ _loadAll) {
        var loadAll = Utils.variableOrDefault(_loadAll, true);

        var content = new Element('div', {
            'class': 'gallery'
        });

        if (this._properties.get("showTitleRow")) {
            // TODO
        }

        var lastSelectedRowKey = this._selectedRow && this._selectedRow['key'];
        this._selectedRow = null;

        this._rows.each(function(row) {
            var rowNode = new Element('div', {
                'class': 'row'
            });

            for (var i=0, rValues = row.values; i < rValues.size(); i++) {
                if (!this._fields[i].hidden) {
                    var field = new Element('div',{
                        'class': "field " + this._fields[i].className
                    }).update(rValues[i]);
                    rowNode.appendChild(field);
                }
            }

            var selectRow = function() {
                this._unselectElements();
                this._selectedRow = row;
                rowNode.addClassName("selected");
                for (var i = 0; i < this._disabledButtons.length; i++) {
                    this._disabledButtons[i].attr('disabled', ! row.isValid);
                }
            }.bind(this);

            rowNode.observe('click', selectRow);

            if (this._properties.get('onDblClick') &&
               (! this._properties.get('disableIfNotValid') || row.isValid))
            {
                rowNode.observe('dblclick', function() {
                    this._properties.get('onDblClick')(row.key);
                }.bind(this));
            }

            if (lastSelectedRowKey == row.key) {
                selectRow();
            }

            content.appendChild(rowNode);
        }.bind(this));


        if (loadAll && this._rows.size() > 0) {
            this._removeButtons();
            this._buttons.each(function(button){
                var buttonWidget = this._addButton(button.value, function() {
                    button.handler(this._selectedRow.key);
                }.bind(this));
                if (button.disableIfNotValid) {
                    this._disabledButtons.push(buttonWidget);
                }
            }.bind(this));
        }

        if (this._rows.size() == 0) {
            var info = new Element("div", {
                'class': 'info'
            }).update("Uppss....Nothing here");
            content.appendChild(info);
            this._removeButtons();
            this._addButton("Close", this._dialog.hide.bind(this._dialog));
        } else if (! this._selectedRow &&
                   ! this._properties.get("showTitleRow") &&
                   content.firstChild)
        {
            content.firstChild.addClassName("selected");
            var row = this._selectedRow = this._rows[0];
            for (var i = 0; i < this._disabledButtons.length; i++) {
                this._disabledButtons[i].attr('disabled', ! row.isValid);
            };
        }

        this._setContent(content);
        this._contentNode.appendChild(this._createSearchBar());
    },

    /**
     * Unselect all elements
     * @private
     */
    _unselectElements: function() {
            $$('.gallery .row.selected').each(function(node) {
                node.removeClassName("selected");
            });
            this._disabledButtons.each(function(button) {
                button.attr('disabled', true);
            });
            this._selectedRow = null;
    },

    /**
     * Create the search bar
     * @private
     * @type HTMLNode
     */
    _createSearchBar: function() {
        var unselectElements = this._unselectElements.bind(this);
        var searchBar = new Element('div', {'class':'searchBar'});
        searchBar.style.marginTop = '3px';
        var searchBox = new PaletteSearchBox();
        searchBox.addEventListener(function(obj, value) {
            var searchValue = value.toLowerCase();
            var elements = $$('.gallery .row .field.name');
            elements.each(function(elem){
                var text = elem.textContent.toLowerCase();
                if (searchValue.blank() || text.match(searchValue)) {
                    elem.parentNode.show();
                } else {
                    var row =elem.parentNode;
                    row.hide();
                    if (row.hasClassName('selected')) {
                        unselectElements();
                    }
                }
            })
        });

        searchBar.appendChild(searchBox.getDOMNode());
        return searchBar;
    },

    /**
     * Empty the list of rows
     * @private
     */
    _emptyRows: function() {
        this._rows = new Array();
    },

    /**
     * Function called when the content is loaded
     * @private
     */
    _show: function() {
        this._initDialogInterface();
        GVS.setEnabled(false);
        this._dialog.show();
    }
});

// vim:ts=4:sw=4:et:

var ManageScreenflowsDialog = Class.create(GalleryDialog /** @lends ManageScreenflowsDialog.prototype */, {
    /**
     * This class handles the dialog
     * to open an existing screen
     * @constructs
     * @extends GalleryDialog
     */
    initialize: function($super) {
        $super("Screenflow browser", {'onDblClick': this._openScreenflow.bind(this),
                                      'disableIfNotValid': true });

        /**
         * List of screens
         * @type Array
         * @private
         */
        this._screenflows = null;
    },


    // **************** PUBLIC METHODS **************** //

    /**
     * @override
     */
    show: function() {
        PersistenceEngine.sendGet(URIs.screenflow, this, this._onLoadSuccess, Utils.onAJAXError);
    },


    // **************** PRIVATE METHODS **************** //


    /**
     * initDialogInterface
     * This function creates the dom structure
     * @private
     * @override
     */
    _initDialogInterface: function (){

        this._setHeader("Browse your screenflows",
                "These are the screenflows you have created. Here you can " +
                "continue editing them and share your work with the community");

        this._setFields([{
                'title': 'Screenflow Name',
                'className': 'name'
            }, {
                'title': 'Screenflow Version',
                'className': 'version'
            }, {
                'title': 'Tags',
                'className': 'tags'
            }, {
                'title': 'Description',
                'className': 'description'
            }, {
                'title': 'Sharing',
                'className': 'sharing'
            }
        ]);

        this._setButtons([{
                'value': 'Open screenflow',
                'handler': this._openScreenflow.bind(this),
                'disableIfNotValid': true
            }, {
                'value': 'Clone screenflow',
                'handler': this._cloneScreenflow.bind(this),
                'disableIfNotValid': true
            }, {
                'value': 'Share/Unshare screenflow',
                'handler': this._shareScreenflow.bind(this)
            }, {
                'value': 'Delete screenflow',
                'handler': this._deleteScreenflow.bind(this)
            }/*, {
                'value': 'Add external screenflow',
                'handler': this._addScreenflow.bind(this)
            }*/]);

        this._createScreenflowList();
        this._render();
    },

    /**
     * Creates the the screen list to be handled by its parent class
     * @private
     */
    _createScreenflowList: function() {
        this._emptyRows();
        this._screenflows.each(function(screenflow) {
            var valid = screenflow.definition ? true : false;
            valid = valid && (screenflow.uri) ? false : true;
            this._addRow({
                            'key': screenflow.id,
                            'values': [
                                       screenflow.name,
                                       '<span class="bold">Version: </span>' +
                                         screenflow.version,
                                       '<span class="bold">Tags: </span>' +
                                         screenflow.tags.collect(function(tag) {
                                           return tag.label['en-gb'];
                                         }).join(", "),
                                       '<span class="bold">Description </span><br />'+
                                	 screenflow.description['en-gb'],
                                       '<span class=' + (screenflow.uri ? '"shared"': '"unshared"') +
                                         '>&nbsp;</span>'
                                      ],
                            'isValid': valid
                        });
        }.bind(this));
    },

    /**
     * On Success handler
     * @private
     */
    _onLoadSuccess: function(/** XMLHttpRequest */ transport) {
        this._screenflows = JSON.parse(transport.responseText);
        this._show();
    },

    /**
     * On Success handler, when reload
     * @private
     */
    _onReLoadSuccess: function(/** XMLHttpRequest */ transport) {
        this._screenflows = JSON.parse(transport.responseText);
        this._createScreenflowList();
        this._render(false);
    },

    /**
     * Open a screen by its id
     * @private
     */
    _openScreenflow: function(/** String */ id) {
        var documentController = GVS.getDocumentController();
        documentController.loadScreenflow(id);
        this._dialog.hide();
    },

    /**
     * Clone a screen by its id
     * @private
     */
    _cloneScreenflow: function(/** String */ id) {
        var documentController = GVS.getDocumentController();
        documentController.cloneScreenflow(id);
        this._dialog.hide();
    },

    /**
     * Share or unshare a screen depending of its status
     * @private
     */
    _shareScreenflow: function(/** String */ id) {
        var uri = URIs.share.replace("<id>", id);

        var screen = this._screenflows.detect(function(element) {
            return element.id == id;
        });
        if (screen.uri) {
            // Unshare screen
            PersistenceEngine.sendDelete(uri, this, this._reload, Utils.onAJAXError);
        } else {
            // Share screen
            PersistenceEngine.sendPost(uri, null, null, this, this._reload,
                                        Utils.onAJAXError);
        }
    },

    /**
     * Starts the deletion of a screen
     * @private
     */
    _deleteScreenflow: function(/** String */ id) {
        confirm("Are you sure you want to delete the screenflow? This action cannot " +
        "be undone", this._confirmDelete.bind({'mine': this, 'id': id}));
    },

    /**
     * Execute the deletion of the screen
     * @private
     */
    _confirmDelete: function() {
        var uri = URIs.buildingblock + this.id;
        PersistenceEngine.sendDelete(uri, this.mine, this.mine._reload, Utils.onAJAXError);
    },

    /**
     * Starts the process of adding an external screen
     * @private
     */
    _addScreenflow: function() {
        this._dialog.hide();
        //GVS.action("addScreenflow");
    },

    /**
     * Reloads the screen list
     * @private
     */
    _reload: function() {
        PersistenceEngine.sendGet(URIs.screenflow, this, this._onReLoadSuccess, Utils.onAJAXError);
    }
});

// vim:ts=4:sw=4:et:

var ManageScreensDialog = Class.create(GalleryDialog /** @lends ManageScreensDialog.prototype */, {
    /**
     * This class handles the dialog
     * to open an existing screen
     * @constructs
     * @extends GalleryDialog
     */
    initialize: function($super) {
        $super("Screen browser", {'onDblClick': this._openScreen.bind(this),
                                  'disableIfNotValid': true });

        /**
         * List of screens
         * @type Array
         * @private
         */
        this._screens = null;
    },


    // **************** PUBLIC METHODS **************** //

    /**
     * @override
     */
    show: function() {
        PersistenceEngine.sendGet(URIs.screen, this, this._onLoadSuccess, Utils.onAJAXError);
    },


    // **************** PRIVATE METHODS **************** //


    /**
     * initDialogInterface
     * This function creates the dom structure
     * @private
     * @override
     */
    _initDialogInterface: function (){

        this._setHeader("Browse your screens",
                "These are the screens you have created. Here you can " +
                "continue editing them and share your work with the community");

        this._setFields([{
                'title': 'Icon',
                'className': 'icon'
            }, {
                'title': 'Screen Name',
                'className': 'name'
            }, {
                'title': 'Screen Version',
                'className': 'version'
            }, {
                'title': 'Tags',
                'className': 'tags'
            }, {
                'title': 'Description',
                'className': 'description'
            }, {
                'title': 'Sharing',
                'className': 'sharing'
            }
        ]);

        this._setButtons([{
                'value': 'Open screen',
                'handler': this._openScreen.bind(this),
                'disableIfNotValid': true
            }, {
                'value': 'Clone screen',
                'handler': this._cloneScreen.bind(this)
            }, {
                'value': 'Share/Unshare screen',
                'handler': this._shareScreen.bind(this)
            }, {
                'value': 'Delete screen',
                'handler': this._deleteScreen.bind(this)
            }
            /*, {
                'value': 'Add external screen',
                'handler': this._addScreen.bind(this)
            }*/]);

        this._createScreenList();
        this._render();
    },

    /**
     * Creates the the screen list to be handled by its parent class
     * @private
     */
    _createScreenList: function() {
        this._emptyRows();
        this._screens.each(function(screen) {
            var valid = screen.definition && ! screen.uri;
            this._addRow({
                            'key': screen.id,
                            'values': [
                                new Element('img', {'src': screen.icon}),
                                	screen.name,
                                '<span class="bold">Version: </span>' +
                                     screen.version,
                                '<span class="bold">Tags: </span>' +
                                	screen.tags.collect(function(tag) {
                                        return tag.label['en-gb'];
                                    }).join(", "),
                                '<span class="bold">Description </span><br />'+
                                	screen.description['en-gb'],
                                '<span class=' + (screen.uri ? '"shared"': '"unshared"') +
                                    '>&nbsp;</span>'
                             ],
                             'isValid': valid
                        });
        }.bind(this));
    },

    /**
     * On Success handler
     * @private
     */
    _onLoadSuccess: function(/** XMLHttpRequest */ transport) {
        this._screens = JSON.parse(transport.responseText);
        this._show();
    },

    /**
     * On Success handler, when reload
     * @private
     */
    _onReLoadSuccess: function(/** XMLHttpRequest */ transport) {
        this._screens = JSON.parse(transport.responseText);
        this._createScreenList();
        this._render(false);
    },

    /**
     * Open a screen by its id
     * @private
     */
    _openScreen: function(/** String */ id) {
        var documentController = GVS.getDocumentController();
        documentController.loadScreen(id);
        this._dialog.hide();
    },

    _cloneScreen: function(/** String */ id) {
        var documentController = GVS.getDocumentController();
        documentController.cloneScreen(id);
        this._dialog.hide();
    },

    /**
     * Share or unshare a screen depending of its status
     * @private
     */
    _shareScreen: function(/** String */ id) {
        var uri = URIs.share.replace("<id>", id);

        var screen = this._screens.detect(function(element) {
            return element.id == id;
        });
        if (screen.uri) {
            // Unshare screen
            PersistenceEngine.sendDelete(uri, this, this._reload, Utils.onAJAXError);
        } else {
            // Share screen
            PersistenceEngine.sendPost(uri, null, null, this, this._reload,
                                        Utils.onAJAXError);
        }
    },

    /**
     * Starts the deletion of a screen
     * @private
     */
    _deleteScreen: function(/** String */ id) {
        confirm("Are you sure you want to delete the screen? This action cannot " +
        "be undone", this._confirmDelete.bind({'mine': this, 'id': id}));
    },

    /**
     * Execute the deletion of the screen
     * @private
     */
    _confirmDelete: function(value) {
        var uri = URIs.buildingblock + this.id;
        if (value) {
            PersistenceEngine.sendDelete(uri, this.mine, this.mine._reload, Utils.onAJAXError);
        }
    },

    /**
     * Starts the process of adding an external screen
     * @private
     */
    _addScreen: function() {
        this._dialog.hide();
        //GVS.action("addScreen");
    },

    /**
     * Reloads the screen list
     * @private
     */
    _reload: function() {
        PersistenceEngine.sendGet(URIs.screen, this, this._onReLoadSuccess, Utils.onAJAXError);
    }
});

// vim:ts=4:sw=4:et:

var PreviewDialog = Class.create(ConfirmDialog /** @lends PreviewDialog.prototype */, {
    /**
     * This class handles the dialog
     * to preview a component
     * @constructs
     * @extends ConfirmDialog
     */
    initialize: function($super, /** String */ title, /** DOMNode */ content) {
        $super("Preview of " + title, ConfirmDialog.OK);
        this._setContent(content);
    },


    // **************** PUBLIC METHODS **************** //

    /**
     * This function set the form content based on a array-like
     * structure, containing the different elements of the form,
     * and, optionally, form parameters
     * @private
     */
    setContent: function (/** Array | DOMNode */ data, /** Hash */ formParams){
        this._setContent(data, formParams);
    }

    // **************** PRIVATE METHODS **************** //

});

// vim:ts=4:sw=4:et:

var TriggerDialog = Class.create(ConfirmDialog /** @lends TriggerDialog.prototype */, {
    /**
     * This class handles the dialog
     * to assign triggers to actions
     * @constructs
     * @extends ConfirmDialog
     */
    initialize: function($super,
                        /** String */ actionName, /** Array */ initialTriggerList,
                        /** Array */  canvasInstances, /** Function */ onChangeCallback) {

        $super("Assign triggers to " + actionName);

        /**
         * Action name
         * @type String
         * @private
         */
        this._actionName = actionName;

        /**
         * List of triggers that were initially assigned to the action
         * @type Array
         * @private
         */
        this._initialTriggerList = initialTriggerList;


        /**
         * List of canvas instances, to extract the available triggers
         * @type Hash
         * @private
         */
        this._canvasInstances = canvasInstances;


        /**
         * @type Function
         * @private
         */
        this._onChangeCallback = onChangeCallback;

        /**
         * Button that shows the dialog
         * @type dijit.form.Button
         * @private
         */
        this._button = new dijit.form.Button({
            'label': '...',
            'onClick': this.show.bind(this)
        });

        /**
         * Node of the selection list that contains the
         * unselected triggers
         * @type DOMNode
         * @private
         */
        this._unselectedTriggerListNode = null;


        /**
         * Node of the selection list that contains the
         * selected triggers
         * @type DOMNode
         * @private
         */
        this._selectedTriggerListNode = null;


        this._addTriggerButton = null;

        this._removeTriggerButton = null;
    },

    // **************** PUBLIC METHODS **************** //

    /**
     * This function returns the DOMNode of the button that shows the
     * dialog
     * @type DOMNode
     */
    getButtonNode: function() {
        return new Element('div', {
            'class': 'triggerButton'
        }).update(this._button.domNode);
    },

    // **************** PRIVATE METHODS **************** //


    /**
     * initDialogInterface
     * This function creates the dom structure
     * @private
     * @override
     */
    _initDialogInterface: function () {


        var content = new Element('div', {
            'class': 'triggerDialog'
        });
        var title = new Element('h2').update("Choose triggers for action: " +
                                            this._actionName);
        content.appendChild(title);

        var subtitleZone = new Element('div', {
            'class': 'subtitle'
        });

        var selectedNode = new Element('div', {
            'style': 'float:left'
        }).update("Selected triggers");
        subtitleZone.appendChild(selectedNode);

        var unselectedNode = new Element('div', {
            'style': 'float:right'
        }).update("Unselected triggers");
        subtitleZone.appendChild(unselectedNode);

        content.appendChild(subtitleZone);

        this._selectedTriggerListNode = new Element('select', {
           'multiple': 'multiple'
        });
        this._selectedTriggerListNode.observe('change', this._onListChange.bind(this));
        var onLoadFound = false;
        if (this._initialTriggerList) {
             this._initialTriggerList.each(function(trigger) {
                var option = new Element('option', {
                    'value': trigger.getSourceInstance().getId() + "#" + trigger.getTriggerName()
                }).update(trigger.getSourceInstance().getTitle() + ": " + trigger.getTriggerName());
                this._selectedTriggerListNode.appendChild(option);
                if (trigger.constructor == ScreenTrigger) {
                    onLoadFound = true;
                }
            }.bind(this));
        }

        content.appendChild(this._selectedTriggerListNode);

        var addRemoveZone = new Element('div', {
            'class': 'addRemoveZone'
        });
        this._addTriggerButton = new dijit.form.Button({
            'iconClass': 'plusIcon',
            'showLabel': true,
            'label': '<',
            'style': 'width:25px',
            'onClick': this._onAddTrigger.bind(this)
        });
        addRemoveZone.appendChild(this._addTriggerButton.domNode);

        this._removeTriggerButton = new dijit.form.Button({
            'iconClass': 'minusIcon',
            'showLabel': true,
            'label': '>',
            'style': 'width:25px',
            'onClick': this._onRemoveTrigger.bind(this)
        });
        addRemoveZone.appendChild(this._removeTriggerButton.domNode);

        content.appendChild(addRemoveZone);

        this._unselectedTriggerListNode = new Element('select', {
           'multiple': 'multiple'
        });
        this._unselectedTriggerListNode.observe('change', this._onListChange.bind(this));

        if (!onLoadFound) {
            var option = new Element('option', {
                'value': ScreenTrigger.INSTANCE_NAME + "#" + ScreenTrigger.ONLOAD
            }).update(ScreenTrigger.INSTANCE_NAME + ": " + ScreenTrigger.ONLOAD);
            this._unselectedTriggerListNode.appendChild(option);
        }
        this._canvasInstances.each(function(instance){
            instance.getBuildingBlockDescription().triggers.each(function(trigger) {
                var triggerFound = false;
                if (this._initialTriggerList) {
                        triggerFound = this._initialTriggerList.detect(function(element) {
                        return (instance.getId() + trigger) == (element.getSourceId() +
                                                                element.getTriggerName());
                    });
                }
                if (!triggerFound) {
                    var option = new Element('option', {
                        'value': instance.getId() + "#" + trigger
                    }).update(instance.getTitle() + ": " + trigger);
                    this._unselectedTriggerListNode.appendChild(option);
                }
            }.bind(this));
        }.bind(this));

        content.appendChild(this._unselectedTriggerListNode);

        this._setContent(content);

        this._onListChange();
    },

    /**
     * Called when the add trigger button is clicked
     * @private
     */
    _onAddTrigger: function() {
        var selectionList = this._getSelectionItems(this._unselectedTriggerListNode);
        selectionList.each(function(option) {
            option.parentNode.removeChild(option);
            this._selectedTriggerListNode.appendChild(option);
        }.bind(this));
        this._onListChange();
    },

    /**
     * Called when the remove trigger button is clicked
     */
    _onRemoveTrigger: function() {
       var selectionList = this._getSelectionItems(this._selectedTriggerListNode);
        selectionList.each(function(option) {
            option.parentNode.removeChild(option);
            this._unselectedTriggerListNode.appendChild(option);
        }.bind(this));
        this._onListChange();
    },


    /**
     * Overriding onOk handler
     * @private
     * @override
     */
    _onOk: function($super){
    	$super();
        var triggersAdded = new Array();
        $A(this._selectedTriggerListNode.options).each(function(option) {
            if (this._initialTriggerList) {
                var triggerFound = this._initialTriggerList.detect(function(element) {
                    return (option.value) == (element.getSourceId() + '#' +
                                                            element.getTriggerName());
                });
                if (triggerFound == null) {
                    triggersAdded.push(option.value);
                }
            } else {
                triggersAdded.push(option.value);
            }
        }.bind(this));
        var triggersRemoved = new Array();
        $A(this._unselectedTriggerListNode.options).each(function(option) {
            if (this._initialTriggerList) {
                var triggerFound = this._initialTriggerList.detect(function(element) {
                    return (option.value) == (element.getSourceId() + '#' +
                                                            element.getTriggerName());
                });
                if (triggerFound) {
                    triggersRemoved.push(option.value);
                }
            }
        }.bind(this));
        this._onChangeCallback(this._actionName, triggersAdded, triggersRemoved);
    },

    /**
     * Called whenever a list is changed
     * @private
     */
    _onListChange: function(/** Event */ event) {
        var clickedList = null;
        if (event) {
            clickedList = event.element();
        }
        if (this._unselectedTriggerListNode == clickedList) {
            this._unselectAll(this._selectedTriggerListNode);
        }
        if (this._selectedTriggerListNode == clickedList) {
            this._unselectAll(this._unselectedTriggerListNode);
        }
        if (this._selectedTriggerListNode.selectedIndex == -1) {
            this._removeTriggerButton.attr("disabled", true);
        } else {
            this._removeTriggerButton.attr("disabled", false);
        }
        if (this._unselectedTriggerListNode.selectedIndex == -1) {
            this._addTriggerButton.attr("disabled", true);
        } else {
            this._addTriggerButton.attr("disabled", false);
        }
    },

    /**
     * Returns the list of selected elements from a selectionList
     * @type Array
     * @private
     */
    _getSelectionItems: function(/** DOMNode */ selectNode) {
        var selectionList = new Array();
        while (selectNode.selectedIndex != -1) {
            selectionList.push(selectNode.
                    options[selectNode.selectedIndex]);
            selectNode.options[selectNode.selectedIndex].selected = false;
        }
        return selectionList;
    },

    /**
     * Unselect all the elements from a list
     * @private
     */
    _unselectAll: function(/** DOMNode */ selectNode) {
        while (selectNode.selectedIndex != -1) {
            selectNode.options[selectNode.selectedIndex].selected = false;
        }
    }
});

// vim:ts=4:sw=4:et:

var ParamsDialog = Class.create(ConfirmDialog /** @lends ParamsDialog.prototype */, {
    /**
     * This class handles the dialog
     * to assign triggers to actions
     * @constructs
     * @extends ConfirmDialog
     */
    initialize: function($super, /** String */ buildingblockName,
                            /** String */ initialParameter,
                            /** String */ templateParameter,
                            /** Function */ onChangeCallback) {

        $super(buildingblockName + " Parameters");

        /**
         * Building block name
         * @type String
         * @private
         */
        this._buildingblockName = buildingblockName;

        /**
         * Params initially assigned to the buildingblock
         * @type String
         * @private
         */
        this._initialParameter = initialParameter;

        /**
         * Template parameters
         * @type String
         * @private
         */
        this._templateParameter = templateParameter;

        /**
         * Textarea to edit the buildingblock params
         * @type Array
         * @private
         */
        this._textarea = new dijit.form.SimpleTextarea();
        this._textarea.domNode.addClassName('parameterArea');
        this._textarea.setValue(this._initialParameter);

        this._tooltipButton = new Element('div', {
            'class': 'initialParameterButton'
        }).update("&nbsp;");

        this._tooltipButton.observe('click', function() {
            var dialog = new ExternalContentDialog("Example parameter configuration");
            dialog.show(new Element('pre').update(this._templateParameter));
        }.bind(this));

        /**
         * Example parameter configuration, in a tooltip
         * @type dijit.Tooltip
         * @private
         */
        this._templateParameterTooltip = new dijit.Tooltip({
            'connectId': [this._tooltipButton],
            'label': "<h4> Example parameter configuration </h4>" +
                "<pre>" + this._templateParameter + "</pre>"
        });

        /**
         * @type Function
         * @private
         */
        this._onChangeCallback = onChangeCallback;
    },

    // **************** PUBLIC METHODS **************** //

    /**
     * This function returns the DOMNode of the button that shows the
     * dialog
     * @type DOMNode
     */
    getButtonNode: function() {

    	var button = new dijit.form.Button({
            'label': '...',
            'onClick': this.show.bind(this)
        });

        return new Element('div', {
            'class': 'triggerButton'
        }).update(button.domNode);
    },

    // **************** PRIVATE METHODS **************** //


    /**
     * initDialogInterface
     * This function creates the dom structure
     * @private
     * @override
     */
    _initDialogInterface: function () {

        var content = new Element('div', {
            'class': 'paramsDialog'
        });
        var title = new Element('h2').update("Edit " +
        		this._buildingblockName + " parameters:");
        content.appendChild(title);

        content.appendChild(this._textarea.domNode);

        if (this._templateParameter) {
            content.appendChild(this._tooltipButton);
        }
        this._setContent(content);
    },

    /**
     * Overriding onOk handler
     * @private
     * @override
     */
    _onOk: function($super) {
    	$super();
        this._onChangeCallback(this._textarea.getValue());
    }
});

// vim:ts=4:sw=4:et:

var TitleDialog = Class.create(ConfirmDialog /** @lends ParamsDialog.prototype */, {
    /**
     * This class handles the dialog
     * to assign triggers to actions
     * @constructs
     * @extends ConfirmDialog
     */
    initialize: function($super, /** String */ title,
                            /** Function */ onChangeCallback) {

        $super("Change Screen title");

        this._title = title;


        this._onChangeCallback = onChangeCallback;

    },

    // **************** PUBLIC METHODS **************** //

    /**
     * This function returns the DOMNode of the button that shows the
     * dialog
     * @type DOMNode
     */
    getButtonNode: function() {

    	var button = new dijit.form.Button({
            'label': '...',
            'onClick': this.show.bind(this)
        });

        return new Element('div', {
            'class': 'triggerButton'
        }).update(button.domNode);
    },

    // **************** PRIVATE METHODS **************** //


    /**
     * initDialogInterface
     * This function creates the dom structure
     * @private
     * @override
     */
    _initDialogInterface: function () {
        this._setHeader(
                "Change Screen title",
                "This title will be shown when executing the gadget"
        );

        var formData = [
            {
                'type':'input',
                'label': 'Screen Title:',
                'name': 'title',
                'value': this._title,
                'message': 'Title cannot be blank',
                'required': true
            }
        ];

        this._setContent(formData);
    },

    /**
     * Overriding onOk handler
     * @private
     * @override
     */
    _onOk: function($super) {
    	$super();
        this._onChangeCallback(this._getForm().title.value);
    }
});

// vim:ts=4:sw=4:et:

var PropertiesDialog = Class.create(ConfirmDialog /** @lends PropertiesDialog.prototype */, {
    /**
     * This class handles the dialog
     * that shows the screen/screenflow properties
     * @constructs
     * @extends ConfirmDialog
     */
    initialize: function($super, /** String */ type,
                        /** BuildingBlockDescription */ description,
                        /** Function */ onChangeHandler) {

        /**
         * Title of the dialog
         * @private
         * @type String
         */
        this._title = type + " Properties";

        /**
         * Building block description
         * @private
         * @type String
         */
        this._description = description;

        /**
         * Handler to be called when the dialog finishes
         * @private
         * @type Function
         */
        this._onFinishHandler = null;

        /**
         * Handler to be called when the dialog finishes with changes
         * @private
         * @type Function
         */
        this._onChangeHandler = onChangeHandler;

        $super(this._title);

    },


    // **************** PUBLIC METHODS **************** //

    /**
     * @override
     */
    show: function($super, /** Function(Optional) */ _handler) {
        var handler = Utils.variableOrDefault(_handler, null);
        this._onFinishHandler = handler;
        $super();
    },

    // **************** PRIVATE METHODS **************** //


    /**
     * initDialogInterface
     * This function creates the dom structure and
     * @private
     * @override
     */
    _initDialogInterface: function () {

        this._setHeader(this._title);

        var formData = [
            {'type': 'title', 'value': 'Basic information'},
            {'type':'input', 'label': 'Building block name:','name': 'name',
                    'value': this._description.name,
                    'required': true,
                    'events': {
                        'blur': function() {
                            this._getForm().name.value = Utils.sanitize($F(this._getForm().name));
                        }.bind(this)
                    }
            },
            {'type':'input', 'label': 'Version:','name': 'version',
                    'value': this._description.version},
            {'type':'input', 'label': 'Tags:','name': 'tags',
                    'value': this._description.tags.collect(function(tag) {
                                    return tag.label['en-gb'];
                               }).join(", ")},
            {'type': 'title', 'value': 'Sharing information'},
            {'type':'textarea', 'label': 'Description:','name': 'description',
                    'value': this._description.description['en-gb'],
                    'required': true},
            {'type':'input', 'label': 'Creator:','name': 'creator',
                    'value': this._description.creator,
                    'required': true,
                    'disabled': true},
            {'type':'input', 'label': 'Licence information:','name': 'rights',
                    'value': this._description.rights,
                    'required': true},
            {'type':'input', 'label': 'Icon:','name': 'icon',
                    'value': this._description.icon,
                    'regExp': '([hH][tT][tT][pP][sS]?)://[A-Za-z0-9-_]+(\.[A-Za-z0-9-_]+)*(:\d+)?(/[a-zA-Z0-9\.\?=/#%&\+-]*)*',
                    'message': 'Invalid URL'},
            {'type':'input', 'label': 'Screenshot:','name': 'screenshot',
                    'value': this._description.screenshot,
                    'regExp': '([hH][tT][tT][pP][sS]?)://[A-Za-z0-9-_]+(\.[A-Za-z0-9-_]+)*(:\d+)?(/[a-zA-Z0-9\.\?=/#%&\+-]*)*',
                    'message': 'Invalid URL'},
            {'type':'input', 'label': 'Homepage:','name': 'homepage',
                    'value': this._description.homepage,
                    'regExp': '([hH][tT][tT][pP][sS]?)://[A-Za-z0-9-_]+(\.[A-Za-z0-9-_]+)*(:\d+)?(/[a-zA-Z0-9\.\?=/#%&\+-]*)*',
                    'message': 'Invalid URL'}
        ];

        this._setContent(formData);

    },
    /**
     * Overriding onOk handler
     * @override
     * @private
     */
    _onOk: function($super){
        if (this._getFormWidget().validate()) {

            var tags = $F(this._getForm().tags).split(/[\s,]+/).without("");
            var description = {
                'tags': Utils.getCatalogueTags(tags, null),
                'description': {
                    'en-gb': $F(this._getForm().description)
                },
                'label': {
                    'en-gb': Utils.sanitize($F(this._getForm().name))
                },
                'name': Utils.sanitize($F(this._getForm().name))
            };
            var form = this._getForm();
            var elements = [form.version, form.creator, form.rights,
                form.icon, form.screenshot, form.homepage];
            Object.extend(description, Form.serializeElements(elements, {'hash': true}));
            var changed = false;
            $H(description).each(function(pair) {
                if (this._description[pair.key] != pair.value) {
                    changed = true;
                }
            }.bind(this));

            this._description.addProperties(description);
            $super();
            if (changed) {
                this._onChangeHandler();
            }
            if (this._onFinishHandler && this._onFinishHandler instanceof Function) {
                this._onFinishHandler();
                this._onFinishHandler = null;
            }
        }
    },

    /**
     * Reset method to leave the form as initially
     * @override
     * @private
     */
    _reset: function ($super){
        this._handler = null;
        this._initDialogInterface();
        $super();
    }
});

// vim:ts=4:sw=4:et:

/**
 * <p>This class implements the Singleton Design Pattern to make sure there is
 * only one instance of the class Preferences.
 *
 * <p> It should be accessed as follows.
 *
 * @constructor
 * @example
 * var alert = AlertSingleton.getInstance();
 */
var AlertSingleton = function() {

    /**
     * Singleton instance
     * @private @member
     */
    var _instance = null;


    var Alert = Class.create(FormDialog,
        /** @lends AlertSingleton-Alert.prototype */ {

        /**
         * Alert dialog
         * @constructs
         * @extends FormDialog
         */
        initialize: function($super) {
            $super({
               'title': 'Warning',
               'style': 'display:none'
            });
            this._contentNode.addClassName("systemDialog");

            this._addButton ('Ok', function(){
                this._dialog.hide();
            }.bind(this));
        },
        /**
         * This function shows a message
         */
        show: function  ($super, /** String */ message){
            this._contentNode.update(message);

            $super();
        },
        /**
         * @override
         * @private
         */
        _initDialogInterface: function() {
            // Do nothing
        }
    });

    return new function(){
        /**
         * Returns the singleton instance
         * @type Preferences
         */
        this.getInstance = function(){
            if (_instance == null) {
                _instance = new Alert();
            }
            return _instance;
        }
    }
}();

// Browser alert dialog override
if (document.getElementById) {
    window.alert = function(msg) {
        AlertSingleton.getInstance().show(msg);
        console.log(msg);
    }
}


// vim:ts=4:sw=4:et:

/**
 * <p>This class implements the Singleton Design Pattern to make sure there is
 * only one instance of the class Preferences.
 *
 * <p> It should be accessed as follows.
 *
 * @constructor
 * @example
 * var confirm = ConfirmSingleton.getInstance();
 */
var ConfirmSingleton = function() {

    /**
     * Singleton instance
     * @private @member
     */
    var _instance = null;


    var Confirm = Class.create(ConfirmDialog,
        /** @lends ConfirmSingleton-Confirm.prototype */ {

        /**
         * Confirm dialog
         * @constructs
         * @extends ConfirmDialog
         */
        initialize: function($super) {
            $super('Warning');

            /**
             * Callback function to be called
             * @type Function
             * @private @member
             */
            this._callback = null;

            this._contentNode.addClassName("systemDialog");
        },

        /**
         * This function shows a message
         */
        show: function  ($super, /** String */ message, /**Function*/ callback){
            this._contentNode.update(message);
            $super();
            this._callback = callback;
        },
        // *********************** PRIVATE METHODS ******************//
        /**
         * @override
         * @private
         */
        _onOk: function ($super) {
            this._callback(true);
            this._callback = null;
            $super();
        },
        /**
         * @override
         * @private
         */
        _onCancel: function ($super){
            this._callback(false);
            this._callback = null;
            $super();
        },
        /**
         * @override
         * @private
         */
        _initDialogInterface: function () {
            // Do Nothing
        },
        /**
         * @private
         * @override
         */
        _hide: function($super) {
            $super();
            if (this._callback) {
                this._callback(false);
                this._callback = null;
            }
        }
    });

    return new function(){
        /**
         * Returns the singleton instance
         * @type Preferences
         */
        this.getInstance = function(){
            if (_instance == null) {
                _instance = new Confirm();
            }
            return _instance;
        }
    }
}();

// Browser confirm dialog override
if (document.getElementById) {
    //Note that confirm is not blocking anymore
    //so a callback function is needed
    var browserConfirm = window.confirm;
    window.confirm = function(msg, _callback) {
        if (_callback) {
            ConfirmSingleton.getInstance().show(msg,_callback);
        } else{ //In case you don't use the modified version
            browserConfirm(msg);
        }
    }
}


// vim:ts=4:sw=4:et:

var StandaloneEmbeddingDialog = Class.create(ConfirmDialog /** @lends PreviewDialog.prototype */, {
    /**
     * This class handles the dialog
     * to preview a component
     * @constructs
     * @extends ConfirmDialog
     */
    initialize: function($super, /** Object */ publication, /** String */ url) {

        /**
         * URL to embed
         * @private
         * @type String
         */
        this._url = url;

        /**
         * Publication info
         * @private
         * @type Object
         */
        this._publication = publication;

        $super(this._getDialogTitle(this._publication.name), ConfirmDialog.OK);
        this._setContent(content);
    },


    // **************** PUBLIC METHODS **************** //

    /**
     * updateDialog
     * Updates dialog header and content
     * @public
     */
    updateDialog: function (/** Object */ publication, /** String */ url) {
        this._url = url;
        this._publication = publication;
        this._initDialogInterface();
        this._setTitle(this._getDialogTitle(this._publication.name), null);
    },

    // **************** PRIVATE METHODS **************** //

    /**
     * initDialogInterface
     * This function creates the dom structure and
     * @private
     * @override
     */
    _initDialogInterface: function () {

        var formData = [
            {'type':'title', 'value': 'Please, embed this HTML code into your web page:'},
            {'type':'pre', 'value': this._getEmbedding()}
        ];

        this._setContent(formData);

    },

    /**
     * getEmbedding
     * This function creates the dom structure and
     * @private
     * @override
     */
    _getEmbedding: function () {
        var height = this._publication.height;
        if (!height || height == ''){
            height = '600';
        }
        var width = this._publication.width;
        if (!width || width == ''){
            width = '400';
        }
        return ('<object data="' + this._url + '" height="'+ height
                + '" width="' + width + '" class="embed"></object>').escapeHTML();
    },

    /**
     * getDialogTitle
     * This function returns the dialog title
     * @private
     * @override
     */
    _getDialogTitle: function (/** String */ name) {
        return 'Embedding of ' + name + ' Standalone Gadget';
    }

});

// vim:ts=4:sw=4:et:
var ButtonArrayDialog = Class.create(FormDialog, /** @lends ButtonArrayDialog.prototype */ {
    /**
     * This class handles dialogs with sets of buttons
     * @extends FormDialog
     * @constructs
     */
    initialize: function($super, /** Array */ handlers, /** Object  */ _options) {
        $super({
            'title': "Choose Building Block",
            'style': 'display:none;'
        }, _options);

        /**
         * Object that stores the handler (i.e. functions that will be called
         * when the associated button is clicked)
         * @private
         * @type Array
         */
        this._handlers = handlers;

    },


    // **************** PUBLIC METHODS **************** //



    // **************** PRIVATE METHODS **************** //

    /**
     * Inits the user interface
     * @private
     * @override
     */
    _initDialogInterface: function() {
        var content = new Element('div', {
            'class': 'buttonArray'
        });
        this._handlers.each(function(pair) {
            var button = new dijit.form.Button({
                'label': pair.label,
                'onClick': function(){
                    this._dialog.hide();
                    pair.handler();
                }.bind(this)
            });
            content.appendChild(button.domNode);
            content.appendChild(new Element('br'));
        }.bind(this));
        this._setContent(content);
    }
});


// vim:ts=4:sw=4:et:

var ManageBuildingBlocksDialog = Class.create(GalleryDialog /** @lends ManageScreensDialog.prototype */, {
    /**
     * This class handles the dialog
     * to open an existing screen
     * @constructs
     * @extends GalleryDialog
     */
    initialize: function($super) {
        $super("Building blocks browser", {
            'onDblClick': this._openBuildingBlock.bind(this),
            'disableIfNotValid': true
        });

        /**
         * List of building blocks
         * @type Array
         * @private
         */
        this._buildingBlocks = null;

        this._showForms = true;
        this._showOperators = true;
        this._showResources = true;
    },


    // **************** PUBLIC METHODS **************** //

    /**
     * @override
     */
    show: function() {
        this._loadBuildinBlocks(this._show.bind(this));
    },


    // **************** PRIVATE METHODS **************** //


    /**
     * Create the search bar
     * @private
     * @type HTMLNode
     */
    _createSearchBar: function($super) {
        var searchBar = $super();

        var content = document.createElement('div')
        content.style.textAlign = 'right';
        searchBar.appendChild(content);

        var checkBox = new dijit.form.CheckBox({
            name: 'Forms',
            checked: this._showForms,
            onChange: function(b) {
                this._showForms = !(this._showForms && (this._showOperators || this._showResources))
                this._reload();
            }.bind(this)
        });
        content.appendChild(checkBox.domNode);

        var label = document.createElement('span');
        label.innerHTML = 'Forms '
        content.appendChild(label);

        var checkBox = new dijit.form.CheckBox({
            name: 'Operators',
            checked: this._showOperators,
            onChange: function(b) {
                this._showOperators = !(this._showOperators && (this._showForms || this._showResources))
                this._reload();
            }.bind(this)
        });
        content.appendChild(checkBox.domNode);

        var label = document.createElement('span');
        label.innerHTML = 'Operators '
        content.appendChild(label);

        var checkBox = new dijit.form.CheckBox({
            name: 'Resources',
            checked: this._showResources,
            onChange: function(b) {
                this._showResources = !(this._showResources && (this._showForms || this._showOperators));
                this._reload();
            }.bind(this)
        });
        content.appendChild(checkBox.domNode);

        var label = document.createElement('span');
        label.innerHTML = 'Resources'
        content.appendChild(label);

        return searchBar;
    },

    /**
     * initDialogInterface
     * This function creates the dom structure
     * @private
     * @override
     */
    _initDialogInterface: function (){

        this._setHeader("Browse your building blocks",
                "These are the building blocks you have created. Here you can " +
                "continue editing them and share your work with the community");

        this._setFields([{
                'title': 'Icon',
                'className': 'icon'
            }, {
                'title': 'Screen Name',
                'className': 'name'
            }, {
                'title': 'Screen Version',
                'className': 'version'
            }, {
                'title': 'Tags',
                'className': 'tags'
            }, {
                'title': 'Description',
                'className': 'description'
            }, {
                'title': 'Sharing',
                'className': 'sharing'
            }
        ]);

        this._setButtons([{
                'value': 'Open building block',
                'handler': this._openBuildingBlock.bind(this),
                'disableIfNotValid': true
            }, {
                'value': 'Share/Unshare building block',
                'handler': this._shareBuildingBlock.bind(this)
            }, {
                'value': 'Delete building block',
                'handler': this._deleteBuildingBlock.bind(this)
            }
        ]);

        this._createBuildingBlockList();
        this._render();
    },

    /**
     * Creates the building block list to be handled by its parent class
     * @private
     */
    _createBuildingBlockList: function() {
        this._emptyRows();
        this._buildingBlocks.each(function(screen) {
            var valid = ! screen.uri;
            this._addRow({
                            'key': screen.id,
                            'values': [
                                new Element('img', {'src': screen.icon}),
                                    screen.name,
                                '<span class="bold">Version: </span>' +
                                     screen.version,
                                '<span class="bold">Tags: </span>' +
                                    screen.tags.collect(function(tag) {
                                        return tag.label['en-gb'];
                                    }).join(", "),
                                '<span class="bold">Description </span><br />'+
                                    screen.description['en-gb'],
                                '<span class=' + (screen.uri ? '"shared"': '"unshared"') +
                                    '>&nbsp;</span>'
                             ],
                             'isValid': valid
                        });
        }.bind(this));
    },

    /**
     * Open a building block by its id
     * @private
     */
    _openBuildingBlock: function(/** String */ id) {
        var documentController = GVS.getDocumentController();
        documentController.loadBuildingBlock(id);
        this._dialog.hide();
    },

    /**
     * Share or unshare a screen depending of its status
     * @private
     */
    _shareBuildingBlock: function(/** String */ id) {
        var uri = URIs.share.replace("<id>", id);

        var screen = this._buildingBlocks.detect(function(element) {
            return element.id == id;
        });
        if (screen.uri) {
            // Unshare screen
            PersistenceEngine.sendDelete(uri, this, this._reload, Utils.onAJAXError);
        } else {
            // Share screen
            PersistenceEngine.sendPost(uri, null, null, this, this._reload,
                                        Utils.onAJAXError);
        }
    },

    /**
     * Starts the deletion of a building block
     * @private
     */
    _deleteBuildingBlock: function(/** String */ id) {
        confirm("Are you sure you want to delete the building block? " +
            "This action cannot be undone",
            this._confirmDelete.bind({'mine': this, 'id': id}));
    },

    /**
     * Execute the deletion of the building block
     * @private
     */
    _confirmDelete: function(value) {
        var uri = URIs.buildingblock + this.id;
        if (value) {
            PersistenceEngine.sendDelete(uri, this.mine, this.mine._reload, Utils.onAJAXError);
        }
    },

    /**
     * Reloads the building block list
     * @private
     */
    _reload: function() {
        this._loadBuildinBlocks(function(){
            this._createBuildingBlockList();
            this._render(false);
        }.bind(this));
    },

    /**
     * Load selected building blocks
     * @private
     */
    _loadBuildinBlocks: function(onSucess) {
        var types = [];
        this._buildingBlocks = [];

        if (this._showForms) {
            types.push('form');
        }
        if (this._showOperators) {
            types.push('operator');
        }
        if (this._showResources) {
            types.push('resource');
        }
        this._getBuildingBlocks(types, this, onSucess);
    },

    /**
     * Get selected building blocks
     * @private
     */
    _getBuildingBlocks: function(/*Array<String>*/types, /*Object*/context, /*Function*/onSucess) {
        var type = types.pop()
        if (!type && onSucess instanceof Function) {
            onSucess.call(context);
        } else {
            PersistenceEngine.sendGet(URIs[type], context, function(transport) {
                this._buildingBlocks = this._buildingBlocks.concat(JSON.parse(transport.responseText));
                this._getBuildingBlocks(types, context, onSucess)
            }, Utils.onAJAXError);
        }
    },

});

// vim:ts=4:sw=4:et:

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

var PlanSet = Class.create(BuildingBlockSet, /** @lends PlanSet.prototype */ {
    /**
     * This class handles a set of building blocks for a given context.
     * This list will be updated.
     * @constructs
     * @extends BuildingBlockSet
     */
    initialize: function($super) {
        $super([]);

        /**
         * List of Plans
         * @type Array
         * @private @member
         */
        this._plans = new Array();


        this._factory = Catalogue.
            getBuildingBlockFactory(Constants.BuildingBlock.SCREEN);
    },


    // **************** PUBLIC METHODS **************** //


    /**
     * Returns all the building blocks ordered by plan from the set
     * @type Array
     * @override
     */
    getBuildingBlocks: function () {
        var result = new Array();
        this._plans.each(function(plan) {
            result.push(this._factory.getBuildingBlocks(plan));
        }.bind(this));
        return result;
    },

    /**
     * Add new building blocks to the set by uri
     */
    setPlans: function (/** Array */ plans) {
        this._plans = plans.splice(0,10); //Just in case
        var uris = this._plans.flatten().uniq();
        this._factory.cacheBuildingBlocks(uris, this._cachedElements.bind(this));
    },

    // **************** PRIVATE METHODS **************** //

    /**
     * This is the callback called when returning from the
     * building block factory
     */
    _cachedElements: function () {
        this._listener.setChanged();
    }

});

// vim:ts=4:sw=4:et:

var PlanComponent = Class.create(DragSource,
    /** @lends PlanComponent.prototype */ {

    /**
     * GUI element that represents a Plan element.
     * @constructs
     * @extends DragSource
     */
    initialize: function($super,/** Array */ plan, /** DropZone */ dropZone,
                        /** InferenceEngine */ inferenceEngine) {
        $super();

        /**
         * Component and instance Drop zone
         * @type DropZone
         * @private
         */
        this._dropZone = dropZone;

        /**
         * List of buildingBlock description of the plan
         * @type Array
         * @private
         */
        this._plan = plan;


        /**
         * Inference engine
         * @type InferenceEngine
         * @private
         */
        this._inferenceEngine = inferenceEngine;

        /**
         * Plan view
         * @type PlanView
         * @private
         */
        this._view = new PlanView(this._plan);

        /**
         * Node of the component.
         * @type DOMNode
         * @private
         */
        this._node = this._view.getNode();


        this.enableDragNDrop(null, [this._dropZone]);
    },

    // **************** PUBLIC METHODS **************** //

    /**
     * Gets the component root node.
     * @type DOMNode
     * @public
     */
    getNode: function() {
        return this._node;
    },


    /**
     * Returns the node that can be clicked to start a drag-n-drop operation.
     * @type DOMNode
     * @override
     */
    getHandlerNode: function() {
        return this._node;
    },

    /**
     * Creates a new Plan component to be dragged.
     * Returned object must have a getNode() method.
     * @type Object
     * @override
     */
    getDraggableObject: function() {
        var instance = new PlanInstance (this._plan, this._inferenceEngine);
        var node = instance.getHandlerNode();
        dijit.byId("main").domNode.appendChild(node);
        node.setStyle({
            'top': this._getContentOffsetTop() + 'px',
            'left':  this._getContentOffsetLeft() + 'px',
            'position': 'absolute'
        });
        return instance;
    },


    // **************** PRIVATE METHODS **************** //

    /**
     * Calculates the distance from the window top to the palette component.
     * @type Integer
     * @private
     */
    _getContentOffsetTop: function() {

        return this._node.cumulativeOffset().top -
                this._node.cumulativeScrollOffset().top;
    },

    /**
     * Calculates the distance from the window left border to the palette
     * component.
     * @type Integer
     * @private
     */
    _getContentOffsetLeft: function() {

       return this._node.cumulativeOffset().left -
                this._node.cumulativeScrollOffset().left;
    }

});

// vim:ts=4:sw=4:et:

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

var PlanInstance = Class.create(ComponentInstance,
    /** @lends PlanInstance.prototype */ {

    /**
     * Plan instance.
     * @constructs
     * @extends ComponentInstance
     */
    initialize: function($super, /** Array */ plan,
            /** Array */ dropZones, /** InferenceEngine */ inferenceEngine) {

        /**
         * The plan
         * @type Array
         * @private
         */
        this._plan = plan;

        $super([], dropZones, inferenceEngine);
    },

    // **************** PUBLIC METHODS **************** //

    /**
     * Somehow something the user can comprehend
     * @override
     */
    getTitle: function() {
        return "";
    },
    /**
     * @override
     */
    getInfo: function() {
        return new Hash();
    },

    /**
     * @override
     */
    getUri: function() {
        return "";
    },

    /**
     * Returns the plan
     * @type Array
     */
    getPlanElements: function() {
        return this._plan;
    },

    // **************** PRIVATE METHODS **************** //
    /**
     * Creates a new View instance for the component
     * @type BuildingBlockView
     * @override
     */
    _createView: function () {
        return new PlanView(this._plan);
    }
});

// vim:ts=4:sw=4:et:

var GadgetDialog = Class.create(GalleryDialog, /** @lends Builder.prototype */ {
    /**
     * On charge of building screenflows and showing the possibility to
     * Deploy the gadget into the mashup platrom
     * @constructs
     */
    initialize: function($super, /** ScreenflowDescription */ description) {
        $super("Available gadgets for the screenflow", {
            "onDblClick": this._showDeploymentInfo.bind(this)
        });

        /**
         * @type StoreGadgetDialog
         * @private @member
         */
        this._buildGadgetDialog = new BuildGadgetDialog(this._onBuildGadgetDialogCallback.bind(this));

        /**
         * @type PublishGadgetDialog
         * @private @member
         */
        this._publishGadgetDialog = new PublishGadgetDialog();


        /**
         * @type ScreenflowDescription
         * @private @member
         */
        this._description = description;

        /**
         * Array of stored gadgets
         * @private @member
         * @type Hash
         */
        this._storedGadgets = new Hash();
    },


    // **************** PUBLIC METHODS **************** //

    /**
     * Start the process of showing the Gadget dialog
     * @override
     */
    show: function() {
        var uri = URIs.getStore.replace("<screenflow_id>", this._description.id);
        PersistenceEngine.sendGet(uri, this, this._onLoadSuccess, Utils.onAJAXError);
    },


    // **************** PRIVATE METHODS **************** //

    /**
     * On storage list loaded
     * @private
     */
    _onLoadSuccess: function(/** XMLHttpRequest */ transport) {
        var gadgets = JSON.parse(transport.responseText);
        gadgets.each(function(gadget) {
            this._storedGadgets.set(gadget.id, gadget);
        }, this);
        if (this._storedGadgets.values().size() > 0) {
            this._show();
        } else {
            this._buildGadget();
        }
    },

    /**
     * initDialogInterface
     * This function creates the dom structure
     * @private
     * @override
     */
    _initDialogInterface: function (){

        this._setHeader("Stored Gadgets for this screenflow",
                "These are the gadgets you have created for the current screenflow." +
                "Here you can deploy them to several mashup platforms or create " +
                "new ones");

        this._setFields([{
                'title': 'Gadget Name',
                'className': 'name'
            }, {
                'title': 'Gadget Vendor',
                'className': 'vendor'
            }, {
                'title': 'Gadget Version',
                'className': 'version'
            }, {
                'title': 'Mashup Platforms',
                'className': 'platforms'
            }, {
                'title': 'Description',
                'className': 'description'
            }
        ]);

        this._setButtons([{
                'value': 'Create new gadget',
                'handler': this._buildGadget.bind(this),
                'disableIfNotValid': false
            }, {
                'value': 'Show Available platforms',
                'handler': this._showDeploymentInfo.bind(this),
                'disableIfNotValid': true
            }]);
        this._createGadgetList();
        this._render();
    },


    /**
     * Creates the gadget list to be handled by its parent class
     * @private
     */
    _createGadgetList: function() {
        this._emptyRows();
        this._storedGadgets.values().each(function(gadget) {
            this._addRow({
                            'key': gadget.id,
                            'values': [
                                       gadget.name,
                                       '<span class="bold">Vendor: </span>' +
                                         gadget.vendor,
                                       '<span class="bold">Version: </span>' +
                                         gadget.version,
                                       '<span class="bold">Mashup platforms: </span>' +
                                         gadget.platforms,
                                       '<span class="bold">Description </span><br />'+
                                	     gadget.description
                                      ],
                            'isValid': true
                        });
        }.bind(this));
    },

    /**
     * Creates a gadget deployment from the ScreenflowDescription
     * @private
     */
    _buildGadget: function () {
        this._hide();
        this._buildGadgetDialog.show({
            'name': this._description.name,
            'shortname': this._description.name,
            'desc': this._description.description['en-gb'],
            'owner': GVS.getUser().getUserName()
        });
    },

    _onBuildGadgetDialogCallback: function(/** Object */ data) {

       var gadgetInfo = Object.extend(data, {
                                            'description': {
                                                'en-gb': data.desc
                                             },
                                             'uri': 'buildingblock/' +
                                                    this._description.getId(),
                                             'label': {
                                                 'en-gb': data.name
                                                },
                                             'id': this._description.getId()
                                            });
       var storeParams = {
            'gadget': Object.toJSON(gadgetInfo),
            'screenflow': this._description.getId()
        };
       PersistenceEngine.sendPost(URIs.store, storeParams, null,
                this, this._onBuildSuccess, this._onError);
    },

    _onBuildSuccess: function(/** XMLHttpRequest */ transport) {
        var result = JSON.parse(transport.responseText);
        this._storedGadgets.set(result.id, result);
        this._createGadgetList();
        if (this.isVisible()) {
            this._render();
        }
        this._showDeploymentInfo(result.id);
    },

    _showDeploymentInfo: function(/** String */ gadget_id) {
        var result = this._storedGadgets.get(gadget_id);
        this._publishGadgetDialog.show(result);
    },

    _onError: function(/** XMLHttpRequest */ transport, /** Exception */ e) {
        Utils.showMessage("Cannot store the gadget", {
            "error": true,
            "hide": true
        });
    }

});

// vim:ts=4:sw=4:et:

var ScreenflowPlayer = Class.create( /** @lends ScreenflowPlayer.prototype */ {
    /**
     * On charge of playing screenflows
     * @constructs
     */
    initialize: function() {

        /**
         * @type ScreenflowDescription
         * @private @member
         */
        this._description = null;

        /**
         * @type PreviewDialog
         * @private @member
         */
        this._dialog = null;

        /**
         * Is the logging (debugging) enabled?
         * @private
         * @type Boolean
         */
        this._logEnabled = false;

        /**
         * DOM node of the player
         * @private
         * @type DOMNode
         */
        this._object = null;

    },


    // **************** PUBLIC METHODS **************** //

    /**
     * Shows the Screenflow execution
     * @public
     */
    playScreenflow: function (/** ScreenflowDescription */ description) {
        this._description = description;

        if (!this._dialog) {
            var title = this._description.name;

            this._dialog = new PreviewDialog(title, this._getPreview());
        } else {
            this._dialog.setContent(this._getPreview());
        }
        this._dialog.show();

    },

    /**
     * Debug screenflow in a new window
     */
    debugScreenflow: function(/** ScreenflowDescription*/ description) {
        this._description = description;
        GVS.getDocumentController().openExternalTool("Screenflow Debugger",
            this._getScreenflowURL("debug"));
    },

    // **************** PRIVATE METHODS **************** //

    /**
     * This method creates a DOM Node with the preview
     * of the Screenflow
     * @type DOMNode
     */
    _getPreview: function() {
        var node = new Element('div', {
            'class': 'player'
        });

        var errorField = new Element('div', {
            'class': 'error'
        });
        node.appendChild(errorField);

        this._object = new Element ('object', {
            'data': this._getScreenflowURL(),
            'class': 'embed'
        });

        node.appendChild(this._object);

        var bottomZone = new Element('div');
        var linkNode = new Element("a", {
            "href": this._getScreenflowURL("debug"),
            "target": "_blank"
        }).update("[Debug in new window]");
        bottomZone.appendChild(linkNode);
        bottomZone.appendChild(new Element("br"));

        var loggingCheckBox = new dijit.form.CheckBox({
            checked: this._logEnabled
        });
        bottomZone.appendChild(loggingCheckBox.domNode);
        loggingCheckBox.domNode.observe("change",
                this._toggleLogging.bind(this));

        var label = new Element('span')
                        .update("Logging enabled (better if you have Firebug)");
        bottomZone.appendChild(label);

        node.appendChild(bottomZone);
        return node;
    },
    /**
     * Toggle the logging
     * @private
     */
    _toggleLogging: function(/** Event*/ e) {
        var checkbox = Event.element(e);
        this._logEnabled = !this._logEnabled;
        checkbox.checked = this._logEnabled;
        this._object.contentDocument.location.href = this._getScreenflowURL();
    },

    /**
     * Gets the screenflow URL
     * @type String
     * @private
     */
    _getScreenflowURL: function(_debugLevel) {
        var debugLevel = _debugLevel || (this._logEnabled  ? "logging" : "");
        return URIs.storePlayScreenflow + "?screenflow=" +
            this._description.getId() + "&debugLevel=" + debugLevel;
    }
});
// vim:ts=4:sw=4:et:

var User = Class.create( /** @lends User.prototype */ {
    /**
     * This class handles the user account and properties
     * It is used directly by the GVS
     * @constructs
     */
    initialize: function() {
        /**
         * @type String
         * @private @member
         */
        this._userName = null;

        /**
         * @type String
         * @private @member
         */
        this._firstName = null;

        /**
         * @type String
         * @private @member
         */
        this._lastName = null;

        /**
         * @type String
         * @private @member
         */
        this._email = null;

        /**
         * @type String
         * @private @member
         */
        this._ezWebURL = null;

        //Bring the user from the server
        this._getUser();
    },


    // **************** PUBLIC METHODS **************** //

    /**
     * getUserName
     * @type String
     */
    getUserName: function () {
        return this._userName;
    },

    /**
     * getUserName
     * @type String
     */
    getFirstName: function () {
        return this._firstName;
    },

    /**
     * getUserName
     * @type String
     */
    getLastName: function () {
        return this._lastName;
    },

    /**
     * getEmail
     * @type String
     */
    getEmail: function () {
        return this._email;
    },

    /**
     * getEzWebURL
     * @type String
     */
    getEzWebURL: function () {
        return this._ezWebURL;
    },

    /**
     * getRealName
     * @type String
     */
    getRealName: function () {
        return this._firstName + " " + this._lastName;
    },
    /**
     * This function updates the user object
     * based on the data passed
     */
    update: function (/** Hash */ userData){
        //TODO empty data control
        this._firstName = userData.firstName;
        this._lastName = userData.lastName;
        this._email = userData.email;

        this._ezWebURL = userData.ezWebURL;

        if (this._ezWebURL[this._ezWebURL.length-1] != '/') {
            this._ezWebURL += '/';
        }

        URIs.ezweb = this._ezWebURL;

        //Send it to the server
        this._updateUser();
    },
    // **************** PRIVATE METHODS **************** //

    /**
     *  This function gets the user from the server
     *  @private
     */
    _getUser: function (){
        /**
         * onSuccess handler
         * @private
         */
        var onSuccess = function (/** XmlHttpRequest */ response){
            var remoteUser = JSON.parse(response.responseText);

            this._userName = remoteUser.user.username;
            this._firstName = remoteUser.user.first_name;
            this._lastName = remoteUser.user.last_name;
            this._email = remoteUser.user.email;
            this._ezWebURL = remoteUser.profile.ezweb_url;

            if (this._ezWebURL[this._ezWebURL.length-1] != '/') {
                this._ezWebURL += '/';
            }

            URIs.ezweb = this._ezWebURL;
        }
        /**
         * onError handler
         * @private
         */
        var onError = function (/** XmlHttpRequest */ response, /** Exception */ e){
            Logger.serverError (response, e);
        }

        PersistenceEngine.sendGet(URIs.userPreferences, this, onSuccess, onError);
    },
    /**
     *  This function updates the user to the server
     *  @private
     */
    _updateUser: function (){

        /**
         * onSuccess handler
         * @private
         */
        var onSuccess = function (/** XmlHttpRequest */ response){
        }

        /**
         * onError handler
         * @private
         */
        var onError = function (/** XmlHttpRequest */ response){
            Logger.serverError (response, e);
        }

        var object = {
            'first_name': this._firstName,
            'last_name': this._lastName,
            'email': this._email,
            'ezweb_url': this._ezWebURL
        };
        var preferences = {preferences :Object.toJSON(object)};

        PersistenceEngine.sendUpdate(URIs.userPreferences, preferences, null,
                                this, onSuccess, onError);
    }

});

// vim:ts=4:sw=4:et:

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

/**
 * Unique ID Generator
 * @constructs
 */
var UIDGenerator = Class.create();

// **************** STATIC ATTRIBUTES **************** //

Object.extend(UIDGenerator, {
    /**
     * Next available ids
     * @type Object
     * @private
     */
    _nextIds: new Object()
});

// **************** STATIC METHODS ******************* //

Object.extend(UIDGenerator, {

    /**
     * Returns a valid new DOM Id
     * @param String element  Type of element that needs the identifier
     * @type String
     */
    generate: function (/** String */ element) {
        var sanitized = element.replace(new RegExp('\\s', 'g'), "")
                                .replace("_","");
        var nextId = this._nextIds[sanitized];

        if (!nextId){
            nextId = 1;
        }

        this._nextIds[sanitized] = nextId + 1;

        return sanitized + "_" + nextId;
    },

    /**
     * Sets the initial id for a given name
     */
    setStartId: function(/** String */ id) {
        var pieces = id.split("_");
        var name = pieces[0];
        var lastId = parseInt(pieces[1]);
        if (!this._nextIds[name] || this._nextIds[name] <= lastId) {
            this._nextIds[name] = lastId + 1;
        }
    }
});


// vim:ts=4:sw=4:et:

var BrowserUtils = Class.create();

// **************** STATIC METHODS **************** //

Object.extend(BrowserUtils, {

    /**
     * Gets browser window height
     * @type Integer
     */
    getHeight : function () {
        var newHeight=window.innerHeight; //Non-IE (Firefox and Opera)

        if (document.documentElement &&
                document.documentElement.clientHeight) {
          //IE 6+ in 'standards compliant mode'
          newHeight = document.documentElement.clientHeight;

        } else if( document.body && document.body.clientHeight ) {
          //IE 4 compatible and IE 5-7 'quirk mode'
          newHeight = document.body.clientHeight;
        }

        return newHeight;
    },


    /**
     * Gets browser window width
     * @type Integer
     */
    getWidth : function(){
        var newWidth=window.innerWidth; //Non-IE (Firefox and Opera)

        if (document.documentElement &&
                (document.documentElement.clientWidth ||
                 document.documentElement.clientHeight)) {
            //IE 6+ in 'standards compliant mode'
            newWidth = document.documentElement.clientWidth;
        } else if (document.body &&
                (document.body.clientWidth || document.body.clientHeight)) {
            //IE 4 compatible and IE 5-7 'quirk mode'
            newWidth = document.body.clientWidth;
        }

        return newWidth;
    },


    /**
     * Determines if a button code is the left one
     * (right button for left-handed people).
     * @type Boolean
     */
    isLeftButton : function(button) {

        if (button == 0 || (this.isIE() && button == 1)) {
            return true;
        } else {
            return false;
        }
    },


    /**
     * Is the browser Internet Explorer?
     * @type Boolean
     */
    isIE : function(){
        if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)) { //test for MSIE x.x;
            return true;
        } else {
            return false;
        }
    }
});

// vim:ts=4:sw=4:et:

var Utils = Class.create();

// **************** STATIC METHODS **************** //

Object.extend(Utils, {

    getIsoDateNow: function(/**Date*/ dateObject) {
        var dateString = dateObject.toJSON();
        dateString = dateString.replace(/"/,'');
        if(dateString.endsWith('Z"')){
            dateString=dateString.truncate(-2,'');
            dateString=dateString+'+0000';
        }
        return dateString;
    },

    /**
     * Copy the properties of an object into another.
     */
    addProperties: function(/** Object */ to, /** Object */ properties) {
        if (properties) {
            $H(properties).clone().each(function(pair) {
                to[pair.key] = pair.value;
            });
        }
    },

    setSatisfeabilityClass: function (/** DOMNode */ node, /** Boolean */ satisfeable) {
        if (satisfeable === null || satisfeable === undefined) {
            //Unknown satisfeability
            node.removeClassName('satisfeable');
            node.removeClassName('unsatisfeable');
        } else {
            node.removeClassName(satisfeable ? 'unsatisfeable' : 'satisfeable');
            node.addClassName(satisfeable ? 'satisfeable' : 'unsatisfeable');
        }
    },

    /**
     * This function extracts an uri from a rdf pattern
     * @type String
     */
    extractURIfromPattern: function(/** String */ pattern) {
        if (pattern) {
            var pieces = pattern.split(" ");
            return pieces[2];
        } else {
            return "";
        }
    },

    /**
     * Logs an AJAX error
     */
    onAJAXError: function(transport, e){
        Logger.serverError(transport, e);
        Utils.showMessage("Ooops. Something unexpected happened. Try reloading",{
            "error": true,
            "hide": true
        });
    },

    /**
    * This function returns the position of a node
    * @type Object
    */
    getPosition: function (/** DOMNode */ node){
        var left = 0;
        var top  = 0;

        while (node.offsetParent){
            left += node.offsetLeft - node.scrollLeft;
            top  += node.offsetTop - node.scrollTop;
            node  = node.offsetParent;
        }

        left += node.offsetLeft;
        top  += node.offsetTop;

        return {'left':left, 'top':top};
    },

    /**
     * Shows a message on top of the GVS
     */
    showMessage: function(/** String */ text, /** Object(optional) */ options) {
        $("messages").removeClassName("error");
        $("messages").removeClassName("hidden");
        $("messages").update(text);

        var position = Math.floor(($("header").clientWidth / 2) -
                                    ($("messages").clientWidth / 2));
        $("messages").setStyle({'opacity': '1', 'left': position + 'px'});
        if (options) {
            if (options.error) {
                $("messages").addClassName("error");
            }
            if (options.hide) {
                 dojo.fadeOut({
                    'duration': 2500,
                    'node': $("messages")
                }).play(options.error ? 2500 : 1500);
            }
        }
    },

    /**
     * This function returns the value of a variable, or a default one if it
     * is undefined
     * @type Object
     */
    variableOrDefault: function(/** Object */ variable, /** Object */ defaultValue){
        var result = variable;
        if (result === undefined) {
            result = defaultValue;
        }
        return result;
    },

    /**
     * Converts an Array of strings into an array
     * of objects representing the tag structure of
     * the catalogue
     */
    getCatalogueTags: function(/** Array */ tags, /** String */ user) {
        var result = new Array();
        tags.each(function(tag) {
            result.push({
                'label': {
                    'en-gb': tag
                }
            });
        });
        return result;
    },

    /**
     * This function sanitizes a string, removing:
     *    - Heading and trailing white spaces, and extra white spaces
     *    - Tabs
     *    - Carrier return
     * @type String
     */
    sanitize: function(/** String */ text) {
        var result = text.replace(/^\s+|\n|\s+$/g,"");
        result = result.replace(/\s+/g, " ");
        return result;
    }
});

var Logger = Class.create();

Object.extend(Logger, {
    serverError: function(/** XmlHttpRequest */ transport, /** Exception */ e){
        var msg;
        if (e) {
            msg = "JavaScript exception on file #{errorFile} (line: #{errorLine}): #{errorDesc}".interpolate({errorFile: e.fileName, errorLine: e.lineNumber, errorDesc: e});
        } else if (transport.responseXML) {
            msg = transport.responseXML.documentElement.textContent;
        } else {
            try {
                m = JSON.parse(transport.responseText);
                msg = m.message;
            } catch (e) {}
            if(!msg){
                msg = "HTTP Error #{status} - #{text}".interpolate({status: transport.status, text: transport.statusText});
            }
        }
        console.log(msg);
    }

});

var KeyPressRegistry = Class.create( /** @lends KeyPressRegistry.prototype */ {
    /**
     * This class handles the different
     * onKeyPressed listeners, and the enabling and disabling of these events
     * @constructs
     */
    initialize: function() {
        /**
         * Hash of registered handlers
         * @type Hash
         * @private
         */
        this._handlers = new Hash();

        /**
         * The Keypress events are enabled
         */
        this._enabled = true;

        this.setEnabled(this._enabled);
    },


    // **************** PUBLIC METHODS **************** //


    /**
     * This function adds a listener to a specific key
     * or key combination.
     */
    addHandler: function (/** String  */ accelKey, /** Function */ handler) {
        var key = accelKey.toLowerCase();
        if (this._handlers.get(key)) {
            shortcut.remove(key);
        }
        this._handlers.set(key, handler);
        shortcut.add(key, this._executeHandler.bind(this), {'disable_in_input': true});
    },

    /**
     * Asks if a key stroke is being used
     * @type Boolean
     */
    isRegistered: function(/** String */ key) {
        return (this._handler.get(key) ? true : false);
    },

    /**
     * This function removes the handler for a key combination
     */
    removeHandler: function(/** String */ accelKey) {
        var key = accelKey.toLowerCase();
        this._handlers.unset(key);
        //shortcut.remove(key);
    },

    /**
     * This function enables or disables the onkeypress events
     */
    setEnabled: function(/** Boolean */ enabled) {
        this._enabled = enabled;
    },

    // ********************** PRIVATE METHODS ********************* //

    /**
     * This function actually receives the keypress events and calls
     * the handlers when necessary
     * @private
     */
    _executeHandler: function(/** Event */ e, /** String */ key) {
        if (this._enabled && this._handlers.get(key)) {
            this._handlers.get(key)(key);
        }
    }
});

// vim:ts=4:sw=4:et:

/**
 * Notation:
 *    Rectangles are represented as objects:
 *       rectangle.left
 *       rectangle.top
 *       rectangle.botttom
 *       rectangle.right
 */
var Geometry = Class.create();

// **************** STATIC METHODS **************** //

Object.extend(Geometry, {

    /**
     * Calculate the cumulative offLimit offset and the effective delta for
     * an axis given the axis range and the current offLimit offset.
     *
     * @param Object range
     *     range.min
     *     range.max
     * @param Object delta
     * @param Object offLimit
     * @type Object result
     *     result.delta
     *     result.offLimit
     */
    updateAxis: function(/** Object */ range, /** Number */ delta, /** Number */ offLimit) {

        function _positiveUpdateAxis(/** Number */ max, /** Number */ delta, /** Number */ offLimit) {
            var result = new Object();

            if (delta > max) {
                // Stop at the limit
                result.delta = max;
                result.offLimit = offLimit + (delta - max);
            } else if (offLimit < 0) {
                // Decreasing offLimit
                if (delta + offLimit > 0) {
                    result.delta = delta + offLimit;
                    result.offLimit = 0;
                } else {
                    result.delta = 0;
                    result.offLimit = delta + offLimit;
                }
            } else {
                // No fx
                result.delta = delta;
                result.offLimit = offLimit;
            }

            return result;
        }

        if (delta >= 0) {
            return _positiveUpdateAxis(range.max, delta, offLimit);
        } else {
            var result = _positiveUpdateAxis(-range.min, -delta, -offLimit);
            result.delta = -result.delta;
            result.offLimit = -result.offLimit;
            return result;
        }
    },

    contains: function(/** Object */ container, /** Object */ element) {
        return (element.left >= container.left) &&
            (element.top >= container.top) &&
            (element.right <= container.right) &&
            (element.bottom <= container.bottom);
    },

    intersects: function(/** Object */ container, /** Object */ element) {
        return !((element.bottom < container.top) ||
            (element.left > container.right) ||
            (element.top > container.bottom) ||
            (element.right < container.left));
    },

    getRectangle: function(/** DOMNode */ node) {

        var position = Utils.getPosition(node);
        return {
            'top': position.top,
            'left': position.left,
            'bottom': position.top + node.offsetHeight,
            'right': position.left + node.offsetWidth
        }
    },

    getClientRectangle: function(/** DOMNode */ node) {
        var computedStyle = document.defaultView.getComputedStyle(node, null);
        var topBorder = computedStyle.getPropertyCSSValue('border-top-width').getFloatValue(CSSPrimitiveValue.CSS_PX);
        var leftBorder = computedStyle.getPropertyCSSValue('border-left-width').getFloatValue(CSSPrimitiveValue.CSS_PX);

        var position = Utils.getPosition(node);
        return {
            'top': position.top + topBorder,
            'left': position.left + leftBorder,
            'bottom': position.top + node.clientHeight,
            'right': position.left + node.clientWidth
        }
    },

    dragRanges: function(/** Object */ container, /** Object */ element) {
        return {
            'x': {
                'min': Math.min(-element.left, 0),
                'max': Math.max((container.right - container.left) - element.right, 0)
            },
            'y': {
                'min': Math.min(-element.top, 0),
                'max': Math.max((container.bottom - container.top) - element.bottom, 0)
            }
        }
    },

    adaptDropPosition: function(/** Element */ containerElement, /** Element */ node) {
        var element = this.getRectangle(node);
        var containerBounds = this.getClientRectangle(containerElement);

        var width = element.right - element.left;
        var height = element.bottom - element.top;

        if (element.right > containerBounds.right)
            element.left = containerBounds.right - width;

        if (element.left < containerBounds.left)
            element.left = containerBounds.left;

        if (element.bottom > containerBounds.bottom)
            element.top = containerBounds.bottom - height;

        if (element.top < containerBounds.top)
            element.top = containerBounds.top;

        return {
            'left': element.left - containerBounds.left,
            'top': element.top - containerBounds.top
        }

    },

    adaptInitialPosition: function(/** Element */ containerElement, /** Element */ node,
                                    /** Object */ position) {
        var containerBounds = {
            'top': 0,
            'left': 0,
            'right': containerElement.offsetWidth,
            'bottom': containerElement.offsetHeight
        }

        var elementBounds = {
            'top': position.top,
            'left': position.left,
            'right': position.left + node.clientWidth,
            'bottom': position.top + node.clientHeight
        }

        var result = {
            'top': position.top,
            'left': position.left
        };

        if (elementBounds.right > containerBounds.right)
            result.left = containerBounds.right - node.offsetWidth;

        if (elementBounds.left < containerBounds.left)
            result.left = containerBounds.left;

        if (elementBounds.bottom > containerBounds.bottom)
            result.top = containerBounds.bottom - node.offsetHeight;

        if (elementBounds.top < containerBounds.top)
            result.top = containerBounds.top;

        return result;
    }
});

var Constants = {
    BuildingBlock: {
        SCREEN: 'screen',
        SCREENFLOW: 'screenflow',
        DOMAIN_CONCEPT: 'domainConcept',
        FORM: 'form',
        OPERATOR: 'operator',
        RESOURCE: 'resource'
    },
    BuildingBlockNames: {
        'screen': 'Screens',
        'domainConcept': 'Domain Concepts',
        'form': 'Forms',
        'operator': 'Operators',
        'resource': 'Services & Resources'
    }
};
Constants.CatalogueRelationships =  {
    "backendservices": Constants.BuildingBlock.RESOURCE,
    "forms": Constants.BuildingBlock.FORM,
    "operators": Constants.BuildingBlock.OPERATOR
};

var GVS = Class.create(ToolbarModel,    /** @lends GVS.prototype */
{

    /**
     * GVS is the system facade.
     * @constructs
     * @extends ToolbarModel
     */
    initialize: function($super){
        $super();

        /**
         * @type DocumentController
         * @private @member
         */
        this._documentController = null;

        /**
         * Hash keeping the action implementations.
         * @type Hash
         * @private @member
         */
        this._actions = null;

        /**
         * User data object
         * @type User
         * @private @member
         */
        this._user = new User();

        /**
         * Hash containing the different dialogs used in the welcome document
         * @type Hash
         * @private @member
         */
        this._dialogs = new Hash();


        /**
         * Object that contains the menu configuration for the GVS
         * @type Object
         * @private
         */
        this._menuConfig = null;
    },


    // **************** PUBLIC METHODS **************** //


    /**
     * Creates all the other objects and installs the event
     * handlers.
     * @public
     */
    init: function(){

        this._actions = {
            newBuildingBlock: this._newBuildingBlock.bind(this),
            newScreenflow: this._newScreenflow.bind(this),
            addScreen: this._addScreen.bind(this),
            newScreen: this._newScreen.bind(this),
            browseScreenflows: this._browseScreenflows.bind(this),
            browseScreens: this._browseScreens.bind(this),
            browseBuildingBlocks: this._browseBuildingBlocks.bind(this),
            showAbout: this._showAboutDialog.bind(this),
            wrapperService: this._openWrapperService.bind(this),
            mediation: this._openMediationTool.bind(this),
            manageConcepts: this._openFactTool.bind(this)
        };

        this._dialogs.set("addScreen", new AddScreenDialog());
        this._dialogs.set("newScreenflow", new NewBuildingBlockDialog('Screenflow'));
        this._dialogs.set("newScreen", new NewBuildingBlockDialog('Screen'));
        this._dialogs.set("newForm", new NewBuildingBlockDialog('Form'));
        this._dialogs.set("newOperator", new NewBuildingBlockDialog('Operator'));
        this._dialogs.set("newResource", new NewBuildingBlockDialog('Resource'));
        this._dialogs.set("browseScreenflows", new ManageScreenflowsDialog());
        this._dialogs.set("browseScreens", new ManageScreensDialog());
        this._dialogs.set("browseBuildingBlocks", new ManageBuildingBlocksDialog());
        this._dialogs.set("preferences", new PreferencesDialog());
        this._dialogs.set("newBuildingBlock", new NewBuildingBlockCodeDialog());

        this._documentController = new DocumentController();

        // Toolbar
        this._addToolbarButtons();

        // Menu
        this._setMenuItems();

        this._documentController.getToolbar().setModel(0, this);

        this._documentController.getMenu().setModel('GVS', this);
    },

    /**
     * Ask the GVS application to perform a high-level action.
     * @public
     */
    action: function(/** String */actionName){
        if (this._actions[actionName]) {
            // Execute the action
            this._actions[actionName]();
        }
        else {
            alert("This function is being implemented. Stay tuned");
        }
    },

    /**
     * Gets the document controller
     * @type DocumentController
     * @public
     */
    getDocumentController: function(){
        return this._documentController;
    },

    /**
     * Gets the user account object
     * @type User
     * @public
     */
    getUser: function(){
        return this._user;
    },

    /**
     * Sets the platform itself enabled or disabled
     * (for modal dialogs)
     */
    setEnabled: function(/** Boolean */enabled){
        this._documentController.getKeyPressRegistry().setEnabled(enabled);
    },

    /**
     * Implementing MenuModel interface
     * @type Object
     */
    getMenuElements: function(){
        return this._menuConfig;
    },

    // **************** PRIVATE METHODS **************** //

    /**
     * High-level action for creating a new screenflow.
     *
     * @private
     */
    _newScreenflow: function(){
        this._dialogs.get("newScreenflow").show();
    },

    /**
     * High-level action for creating a new screen.
     *
     * @private
     */
    _newScreen: function(){
        this._dialogs.get("newScreen").show();
    },

    /**
     * High-level action for adding a new screen to the catalogue
     * @private
     */
    _addScreen: function(){
        this._dialogs.get("addScreen").show();
    },

    /**
     * browse screenflows
     * @private
     */
    _browseScreenflows: function(){
        this._dialogs.get("browseScreenflows").show();
    },

    /**
     * browse screens
     * @private
     */
    _browseScreens: function(){
        this._dialogs.get("browseScreens").show();
    },

    /**
     * browse building blocks
     * @private
     */
    _browseBuildingBlocks: function(){
        this._dialogs.get("browseBuildingBlocks").show();
    },

    /**
     * Open wrapper service
     * @private
     */
    _openWrapperService: function() {
        this._documentController.openExternalTool("Wrap a service", URIs.wrapperService);
    },

    /**
     * @private
     */
    _openMediationTool: function() {
        this._documentController.openExternalTool("Mediation between concepts", URIs.dataMediation);
    },

    /**
     * @private
     */
    _openFactTool: function() {
        this._documentController.openExternalTool("Manage concepts", URIs.factTool);
    },

    /**
     * Opens a dialog to choose which building block to create
     * @private
     */
    _newBuildingBlock: function() {
        this._dialogs.get("newBuildingBlock").show();
    },

    /**
     * Adds the toolbar buttons to the model
     * @private
     */
    _addToolbarButtons: function(){
        this._addToolbarElement('home', new ToolbarButton('Home', 'home', this._documentController.showWelcomeDocument.bind(this._documentController)));

        var preferencesDialog = this._dialogs.get("preferences");
        this._addToolbarElement('preferences', new ToolbarButton('User Preferences', 'preferences', preferencesDialog.show.bind(preferencesDialog)));
    },

    /**
     * Init the loading of the about section
     * @private
     */
    _showAboutDialog: function() {
        PersistenceEngine.sendGet(URIs.about, this, this._onSuccessAbout, Utils.onAJAXError);
    },
    /**
     * OnSuccess handler
     */
    _onSuccessAbout: function (/** XMLHttpRequest */ transport) {
        var dialog = new ExternalContentDialog("About GVS");
        dialog.show(transport.responseText);
    },


    /**
     * Creates the menu structure for the GVS
     * @private
     */
    _setMenuItems: function(){
        this._menuConfig = {
            'file': {
                'type': 'SubMenu',
                'label': 'File',
                'weight': 1,
                'children': {
                    'new': {
                        'type': 'SubMenu',
                        'label': 'New...',
                        'weight': 1,
                        'group': 0,
                        'children': {
                            'newScreenflow': {
                                'type': 'Action',
                                'action': new MenuAction({
                                    'label': 'Screenflow',
                                    'weight': 1,
                                    'handler': function() {
                                        this.action("newScreenflow");
                                    }.bind(this),
                                    'shortcut': 'Shift+N'
                                }),
                                'group': 0
                            },
                            'newScreen': {
                                'type': 'Action',
                                'action': new MenuAction({
                                    'label': 'Screen',
                                    'weight': 10,
                                    'handler': function(){
                                        this.action("newScreen")
                                    }.bind(this),
                                    'shortcut': 'Alt+N'
                                }),
                                'group': 0
                            },
                            'newOperator': {
                                'type': 'Action',
                                'action': new MenuAction({
                                    'label': 'Operator',
                                    'weight': 2,
                                    'handler': function(){
                                        this.action("newOperator")
                                    }.bind(this),
                                }),
                                'group': 1
                            },
                            'newForm': {
                                'type': 'Action',
                                'action': new MenuAction({
                                    'label': 'Form',
                                    'weight': 1,
                                    'handler': function(){
                                        this.action("newForm")
                                    }.bind(this),
                                }),
                                'group': 1
                            },
                            'newResource': {
                                'type': 'Action',
                                'action': new MenuAction({
                                    'label': 'Resource',
                                    'weight': 3,
                                    'handler': function(){
                                        this.action("newResource")
                                    }.bind(this),
                                }),
                                'group': 1
                            }
                        }
                    },
                    'browse': {
                        'type': 'SubMenu',
                        'label': 'Browse...',
                        'weight': 2,
                        'group': 0,
                        'children': {
                            'browseScreenflows': {
                                'type': 'Action',
                                'action': new MenuAction({
                                    'label': 'Screenflows',
                                    'weight': 2,
                                    'handler': function() {
                                        this.action("browseScreenflows");
                                    }.bind(this),
                                    'shortcut': 'Shift+O'
                                }),
                                'group': 0
                            },
                            'browseScreens': {
                                'type': 'Action',
                                'action': new MenuAction({
                                    'label': 'Screens',
                                    'weight': 10,
                                    'handler': function(){
                                        this.action("browseScreens")
                                    }.bind(this),
                                    'shortcut': 'Alt+N'
                                }),
                                'group': 0
                            }
                        }
                    }
                }
            },
            'edit': {
                'type': 'SubMenu',
                'weight': 2,
                'label': 'Edit',
                'children': {
                    'preferences':{
                        'type': 'Action',
                        'action': new MenuAction({
                            'label': 'User Preferences',
                            'weight':1,
                            'handler': function() {
                                this._dialogs.get("preferences").show();
                            }.bind(this)
                        }),
                        'group': 1
                    }
                }

            },
            'help': {
                'type': 'Submenu',
                'weight': MenuElement.MAXIMUM_WEIGHT,
                'label': 'Help',
                'children': {
                    'website': {
                        'type': 'Action',
                        'action': new MenuAction({
                            'label': 'Fast Website',
                            'weight': 1,
                            'handler': function() {
                                 window.open('http://fast.morfeo-project.eu');
                            }
                        }),
                        'group': 0
                    },
                    'about': {
                        'type': 'Action',
                        'action': new MenuAction({
                            'label': 'About GVS',
                            'weight': 2,
                            'handler': function() {
                                this.action("showAbout");
                            }.bind(this)
                        }),
                        'group': 0
                    },
                    'feedback': {
                        'type': 'Action',
                        'action': new MenuAction({
                            'label': 'Send us feedback',
                            'weight': 3,
                            'handler': function() {
                                UserVoice.Popin.show(uservoiceOptions);
                            }.bind(this)
                        }),
                        'group': 0
                    }
                }

            }
        };
        if (!GlobalOptions.isPublicDemo) {
            // Include the new screen feature
        }
    }
});
// Hack to transform GVS into a static class
// It cannot be defined as other static class, as it is derived
// from a non static class
GVS = new GVS();


// vim:ts=4:sw=4:et:

