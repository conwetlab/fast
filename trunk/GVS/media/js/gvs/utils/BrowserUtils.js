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
