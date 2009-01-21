/**
* MORFEO Project
* http://morfeo-project.org
*
* Component: FAST
*
* (C) Copyright 2008 Telefónica Investigación y Desarrollo
*     S.A.Unipersonal (Telefónica I+D)
*
* Info about members and contributors of the MORFEO project
* is available at:
*
*   http://morfeo-project.org/
*
* This program is free software; you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation; either version 2 of the License, or
* (at your option) any later version.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with this program; if not, write to the Free Software
* Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA.
*
* If you want to use this software an plan to distribute a
* proprietary application in any way, and you are not licensing and
* distributing your source code under GPL, you probably need to
* purchase a commercial license of the product.  More info about
* licensing options is available at:
*
*   http://morfeo-project.org/
*/
function Draggable(draggableElement, handler, data, onStart, onDrag, onFinish) {
	var xDelta = 0, yDelta = 0;
	var xStart = 0, yStart = 0;
	var xOffset = 0, yOffset = 0;
	var x, y;
	var objects;
	var draggable = this;

	// remove the events
	function enddrag(e) {
		e = e || window.event; // needed for IE

		// Only attend to left button (or right button for left-handed persons) events
		if (!BrowserUtilsFactory.getInstance().isLeftButton(e.button))
			return false;

		Event.stopObserving (document, "mouseup", enddrag, true);
		Event.stopObserving (document, "mousemove", drag, true);

		for (var i = 0; i < objects.length; i++) {
			if (objects[i].contentDocument) {
				Event.stopObserving(objects[i].contentDocument, "mouseup", enddrag, true);
				Event.stopObserving(objects[i].contentDocument, "mousemove", drag, true);
			}
		}
	
		onFinish(draggable, data);
		draggableElement.style.zIndex = "";
	
		Event.observe (handler, "mousedown", startdrag, true);
	
		document.onmousedown = null; // reenable context menu
		document.oncontextmenu = null; // reenable text selection

		return false;
	}

	// fire each time it's dragged
	function drag(e) {
		e = e || window.event; // needed for IE

		xDelta = xStart - parseInt(e.screenX);
		yDelta = yStart - parseInt(e.screenY);
		xStart = parseInt(e.screenX);
		yStart = parseInt(e.screenY);
		y = y - yDelta;
		x = x - xDelta;
		draggableElement.style.top = y + 'px';
		draggableElement.style.left = x + 'px';

		onDrag(draggable, data, x + xOffset, y + yOffset);
	}

	// initiate the drag
	function startdrag(e) {
		e = e || window.event; // needed for IE

		// Only attend to left button (or right button for left-handed persons) events
		if (!BrowserUtilsFactory.getInstance().isLeftButton(e.button))
			return false;

		document.oncontextmenu = function() { return false; }; // disable context menu
		document.onmousedown = function() { return false; }; // disable text selection
		Event.stopObserving (handler, "mousedown", startdrag, true);

		onStart(draggable, data);
		xStart = parseInt(e.screenX);
		yStart = parseInt(e.screenY);
		y = draggableElement.offsetTop;
		x = draggableElement.offsetLeft;
		draggableElement.style.top = y + 'px';
		draggableElement.style.left = x + 'px';
		Event.observe (document, "mouseup", enddrag, true);
		Event.observe (document, "mousemove", drag, true);

		objects = document.getElementsByTagName("object");
		for (var i = 0; i < objects.length; i++) {
			if (objects[i].contentDocument) {
				Event.observe(objects[i].contentDocument, "mouseup" , enddrag, true);
				Event.observe(objects[i].contentDocument, "mousemove", drag, true);
			}
		}

		draggableElement.style.zIndex = "200"; // TODO
		

		return false;
	}

	// cancels the call to startdrag function
	function cancelbubbling(e) {
		e = e || window.event; // needed for IE
		Event.stop(e);
	}

	// add mousedown event listener
	Event.observe (handler, "mousedown", startdrag, true);
	var children = handler.childElements();
	for (var i = 0; i < children.length; i++)
		Event.observe (children[i], "mousedown", cancelbubbling, true);

	this.setXOffset = function(offset) {
		xOffset = offset;
	}

	this.setYOffset = function(offset) {
		yOffset = offset;
	}
}
