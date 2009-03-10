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
function onStart (draggable,context){
	
	//start dragging 
	if (context.isNew){ //Moving from the palette to the canvas, create a copy
		if (context.tip)
			context.tip.destroy();
		var newElement = context.element.cloneNode (true);
		newElement.data = context.element.data;
		


		//insert the new element replacing the original, which is going to be moved
		var left = context.element.offsetLeft;
		var top = context.element.offsetTop + $("header").offsetHeight+$("header").offsetTop - $("screens").parentNode.scrollTop;
		context.element.parentNode.insertBefore (newElement,context.element);
		
		var tip = null;
		if (newElement.data) // it is a screen
			tip = createTooltip(newElement);
		context.element.parentNode.removeChild (context.element);
		$("main").appendChild (context.element);
		context.element.style.top = top;
		context.element.style.left = left;
		context.numCopies++;
		context.element.id = "c" + context.numCopies + "_" +context.element.id;
		context.element.style.position = "relative";

	
		
		var newContext = new Object();
		newContext.numCopies = context.numCopies;
		newContext.element = newElement;
		newContext.isNew = true;
		newContext.tip = tip;
		Draggable.call (this,newElement,newElement,newContext,onStart, onUpdate, onFinish);
		
	}	
 }
 function onUpdate (draggable,context,x,y){
 	if (!context.isNew){
		if (context.element.offsetLeft < 0 || context.element.offsetTop < 0){
			context.element.style.left = context.position.left;
			context.element.style.top = context.position.top;
		}
		else {
			context.position.left = context.element.offsetLeft;
			context.position.top = context.element.offsetTop;
		}
	}
 }
 function onFinish (draggable,context){
 	
	if (context.isNew){
 		if (isInto(context.element, $("topTabs")) && ((context.element.id.lastIndexOf("start") == -1) || !start)) {
		
			// if is the start connector, allow only one
			if (context.element.id.lastIndexOf("start") != -1) 
				start = true;
			
			$("main").removeChild(context.element);
			$("screenFlowCanvas").appendChild(context.element);
			context.isNew = false;
			
			//Update the element position
			//At the begining, top and left are relative to the screen
			//Now they must be relative to the canvas
			
			context.element.style.margin = "0px";
			context.element.style.position = "absolute"
			context.element.style.left = context.element.offsetLeft - $("topTabs").offsetLeft;
			context.element.style.top = context.element.offsetTop - ($("topTabs").offsetTop + $("tab1").parentNode.offsetTop + $("header").offsetHeight + $("header").offsetTop);
			context.position = new Object();
			context.position.left = context.element.offsetLeft;
			context.position.top = context.element.offsetTop;
			
			Draggable.call(this, context.element, context.element, context, onStart, onUpdate, onFinish);
			context.element.observe("click", onClick);
			context.element.observe("dblclick", onDblClick);
			
			satisfeabilityUpdate();
			if (context.element.data){
				screenflowButton(true);
				screens.push(context.element.data);
			}
			onClick (null,context.element);
			selectElement(context.element);
			
		}	
		else {
			$("main").removeChild(context.element);
		}
	}
 }
 function isInto (element,container){ 
 	return ((element.offsetLeft > container.offsetLeft) &&  
			(element.offsetLeft <= container.offsetLeft + container.offsetWidth))&&
			((element.offsetTop > container.offsetTop+$("tab1").parentNode.offsetTop + $("header").offsetHeight+$("header").offsetTop) 
			&& (element.offsetTop <= container.offsetTop+$("tab1").parentNode.offsetTop + $("header").offsetHeight+$("header").offsetTop + container.offsetHeight));
} 
function onClick (e,el){
	if (!el)
		var element = Event.element(e);
	else
		var element = el;
	
	var elementClass = $w(element.className);
	elementClass = elementClass.without ("resource").without("satisfeable").without("unsatifeable").without("selected");
	var resourceType = (elementClass.size()>=1)?elementClass[0] : "unknown";
	switch (resourceType){
		case "img":
		case "fact":
			element = element.parentNode;
		case "screenTop":
		case "preArea":
		case "postArea":
		case "prepostSeparator":
		case "screenImage":
			//Workaround for title bar
			element = element.parentNode;
		case "screen":
			//TODO Fix this. Create a resource structure in which to look for this kind of info
			$("detailsTitle").innerHTML = "Properties of " + element.data.screenId;
			$("details.title").innerHTML = element.data.screenId;
			$("details.id").innerHTML = element.id;
			$("details.desc").innerHTML = element.data.desc;
			$("details.tags").innerHTML = element.data.tags;
			break;
		case "concept":
			if (elementClass[1]=="slot"){
				$("detailsTitle").innerHTML = "Properties of Slot";
				if (slots[element.id]){
					$("details.title").innerHTML = slots[element.id].fact.name;
					$("details.desc").innerHTML = "Variable Name: " + slots[element.id].variable + "<br />";
					$("details.desc").innerHTML += "Friendcode: " + slots[element.id].friendcode + "<br />";
					$("details.desc").innerHTML += "Attribute: " + slots[element.id].selectedAttribute;
				}
				else {
					$("details.title").innerHTML = "Undefined Slot";
					$("details.desc").innerHTML = "&nbsp;";
				}
			}
			else if (elementClass[1]=="event"){
				$("detailsTitle").innerHTML = "Properties of Event";
				if (events[element.id]){
					$("details.title").innerHTML = events[element.id].fact.name;
					$("details.desc").innerHTML = "Variable Name: " + events[element.id].variable + "<br />";
					$("details.desc").innerHTML += "Friendcode: " + events[element.id].friendcode + "<br />";
					$("details.desc").innerHTML += "Attribute: " + events[element.id].selectedAttribute;
				}
				else {
					$("details.title").innerHTML = "Undefined Event";
					$("details.desc").innerHTML = "&nbsp;";
				}
			}
			$("details.id").innerHTML = element.id;
			break;
		default:
			$("detailsTitle").innerHTML = "Properties";
			$("details.title").innerHTML = "&nbsp;";
			$("details.id").innerHTML = "&nbsp;";
			$("details.desc").innerHTML = "&nbsp;";
			$("details.tags").innerHTML = "&nbsp;";
			break;
	}
	selectElement(element);
}
function onDblClick (e){
	var element = Event.element(e);
	var elementClass = $w(element.className);
	elementClass = elementClass.without ("resource").without("satisfeable").without("unsatifeable").without("selected");
	var resourceType = (elementClass.size()>=1)?elementClass[0] : "unknown";
	switch (resourceType){
		case "img":
		case "fact":
			element = element.parentNode;
		case "screenTop":
		case "preArea":
		case "postArea":
		case "prepostSeparator":
			//Workaround for title bar
			element = element.parentNode;
		case "screen":
		
			//if the tab is already created, replace it
			/*var previousTab = dijit.byId("tab2");
			if (previousTab){
				dijit.byId("topTabs").removeChild(previousTab);
				previousTab.destroyDescendants();
				previousTab.destroy();
			}*/	
			//if the tab is already created, go to it
			var previousTab = dijit.byId("scrtab_"+element.id);
			if (previousTab){

				dijit.byId("topTabs").selectChild("scrtab_"+element.id);
                
			}
			else {
				//Create the screen tab for that screen
				var newContent = document.createElement ("div");
				//newContent.setAttribute ("id","screenCanvas");
				newContent.setAttribute ("class","canvas");
				//Object that will show the screen interface
				var o = document.createElement("object");
				o.setAttribute("data",element.data.URL);
				o.setAttribute("type","text/html");
				o.setStyle({width: "700px", border:"1px solid #AAA",margin:"auto", height: "300px", zIndex:"1000",backgroundColor:"white"});
				newContent.appendChild (o);
				//newContent.update("");
				var newTab = new dijit.layout.ContentPane({title:"Screen - " + element.data.value, id:"scrtab_"+element.id, closable: true}, null);
				newTab.setContent (newContent);
					
	
				dijit.byId("topTabs").addChild(newTab);
				//select the tab			
				dijit.byId("topTabs").selectChild("scrtab_"+element.id);
			}
			break;
		case "concept":
            removeOnKeyListener();
			behaviour = getNodeBehaviour(element.id);
			showVariableDialog(behaviour,element);
			break;
	}
}
function onClickCanvas (e){
	var canvas = Event.element(e);
	//Element.childElements(canvas).each(function(s){s.style.borderWidth = "1px"});
	$("detailsTitle").innerHTML = "Properties";
	$("details.title").innerHTML = "&nbsp;";
	$("details.id").innerHTML = "&nbsp;";
	$("details.desc").innerHTML = "&nbsp;";
	$("details.tags").innerHTML = "&nbsp;";
    previousElement = null;
	selectElement(null);
}


function selectElement(element) {
	if (selectedElement) {
		selectedElement.removeClassName("selected");
	}
	selectedElement = element;
	if (selectedElement) {
		selectedElement.addClassName("selected");
	}	
	screenFactsUpdate();
}


function satisfeabilityUpdate (){
	// Empty the KB
	KB = new Object ();


	// Add environmental facts
	for (var factName in environmentFacts) {
		if (!KB[factName]) {
			KB[factName] = true;		
		}
	}
	
	//Add slots facts
	for (var slot in slots) {
		var factName = slots[slot].fact.name;
		if (!KB[factName]) {
			KB[factName] = true;
		}
	}
	
	var anyUpdate;
	
	do {
		anyUpdate = false;
		Element.childElements($("screenFlowCanvas")).each(
			function(node) { 
				if (node.data) {  // only for screens
					node.data.updateSatisfeability(KB);
					anyUpdate = anyUpdate || node.data.addInferredFacts(KB);
				}
			});
	} while (anyUpdate);
	
	var unsatisfeablePres = getUnsatisfeableScreenPre();
	var generatedFacts = getGeneratedFacts();
	
	Element.childElements($("screenFlowCanvas")).each(
		function(node){
			if (node.data) { // only for screens
				node.data.colorize(node, false, unsatisfeablePres, generatedFacts);
			}
		});
		
	$$("#screens .paletteSlot").each(
		function(node){
			if (node.firstChild.data) { // only for screens
				node.firstChild.data.updateSatisfeability(KB);
				node.firstChild.data.colorize(node.firstChild, true, unsatisfeablePres, generatedFacts);
			}
		});

	inspectorUpdate();
	screenFactsUpdate();
}

function getUnsatisfeableScreenPre(){
	var unsatisfeablePre = {};
	// Screen Facts
	Element.childElements($("screenFlowCanvas")).each(
		function(node){
			if (node.data) { // only for screens
				for (var factName in node.data.pre) {
					if (!node.data.pre[factName].satisfeable){
						unsatisfeablePre[factName] = true;
					}
				}
			}
		});
	return unsatisfeablePre;
}

function getGeneratedFacts(){
	var facts = {};
	// Screen Post Facts
	Element.childElements($("screenFlowCanvas")).each(
		function(node){
			if (node.data) {
				for (var factName in node.data.post) {
					if(!node.data.pre || node.data.pre[factName]==undefined){
						facts[factName] = true; 
					}
				}
			}
		});
	// Slots
	for (var slot in slots) {
		if (slots[slot].fact.satisfeable){
			facts[slots[slot].fact.name] = true;	
		}
	}
	return facts;
}

var rowTemplate = new Template ('<tr><td class="inspectorIcon"><div class="factIcon #{satisfeable}">#{shortcut}</div></td><td class="inspectorName">#{name}</td><td class="inspectorDesc">#{desc}</td><td class="inspectorSem">#{sem}</td></tr>');
var emptyLine = '<tr><td class="inspectorIcon">&nbsp;</td><td class="inspectorName">&nbsp;</td><td class="inspectorDesc">&nbsp;</td><td class="inspectorSem">&nbsp;</td></tr>';

function screenFactsUpdate (){
	var container  = $("prepostContainer");
	var preContent  = '<tr class="tableHeader"><td class="inspectorIcon bold">&nbsp;</td>' +
	                  '<td class="inspectorName bold">PRE Name</td>' + 
					  '<td class="inspectorDesc bold">Description</td>' +
					  '<td class="inspectorSem bold">Semantics</td></tr>';
	var postContent = '<tr class="tableHeader"><td class="inspectorIcon bold">&nbsp;</td>' +
	                  '<td class="inspectorName bold">POST Name</td>' + 
					  '<td class="inspectorDesc bold">Description</td>' +
					  '<td class="inspectorSem bold">Semantics</td></tr>';
	var rowData;
	
	if (selectedElement && selectedElement.data) {
		for (var factName in selectedElement.data.pre) {
			rowData = {
				satisfeable : (selectedElement.data.pre[factName].satisfeable)?"satisfeableIcon":"unsatisfeableIcon", 
				shortcut: selectedElement.data.pre[factName].shortcut,
				name: factName,
				desc: selectedElement.data.pre[factName].desc,
				sem: selectedElement.data.pre[factName].sem
			};
			preContent += rowTemplate.evaluate(rowData);
		}
		for (var factName in selectedElement.data.post) {
			rowData = {
				satisfeable : (selectedElement.data.satisfeable)?"satisfeableIcon":"unsatisfeableIcon", 
				shortcut: selectedElement.data.post[factName].shortcut,
				name: factName,
				desc: selectedElement.data.post[factName].desc,
				sem: selectedElement.data.post[factName].sem
			};
			postContent += rowTemplate.evaluate(rowData);
		}
	}
	preContent += emptyLine;
	postContent += emptyLine;
	
	container.innerHTML = preContent+postContent;
}

function inspectorUpdate() {
	var container = $("inspectorContainer");
	
	var content = "";
	var rowData;
	var alreadyDisplayed = {};
	
	// Environment Facts
	for (var factName in environmentFacts) {
		
		rowData = {
			satisfeable : (environmentFacts[factName].satisfeable)?"satisfeableIcon":"unsatisfeableIcon", 
			shortcut: environmentFacts[factName].shortcut,
			name: factName,
			desc: environmentFacts[factName].desc,
			sem: environmentFacts[factName].sem
		};
		alreadyDisplayed[factName] = true;
		content += rowTemplate.evaluate(rowData);
	}
		// Environment Facts
	for (var slot in slots) {
		if (!alreadyDisplayed[slots[slot].fact.name]){
			rowData = {
				satisfeable : (slots[slot].fact.satisfeable)?"satisfeableIcon":"unsatisfeableIcon", 
				shortcut: slots[slot].fact.shortcut,
				name: slots[slot].fact.name,
				desc: slots[slot].fact.desc,
				sem: slots[slot].fact.sem
			};
			alreadyDisplayed[slots[slot].fact.name] = true;
			content += rowTemplate.evaluate(rowData);			
		}
	}
	
	// Screen Facts
	Element.childElements($("screenFlowCanvas")).each(
		function(node){
			if (node.data) { // only for screens
				for (var factName in node.data.pre) {
					
					if (!alreadyDisplayed[factName]) {
						rowData = {
							satisfeable : (node.data.pre[factName].satisfeable)?"satisfeableIcon":"unsatisfeableIcon", 
							shortcut: node.data.pre[factName].shortcut,
							name: factName,
							desc: node.data.pre[factName].desc,
							sem: node.data.pre[factName].sem
						};
						alreadyDisplayed[factName] = true;
						content += rowTemplate.evaluate(rowData);
					}
				}
				for (var factName in node.data.post) {
					if (!alreadyDisplayed[factName]) {
						rowData = {
							satisfeable : (node.data.satisfeable)?"satisfeableIcon":"unsatisfeableIcon", 
							shortcut: node.data.post[factName].shortcut,
							name: factName,
							desc: node.data.post[factName].desc,
							sem: node.data.post[factName].sem
						};
						alreadyDisplayed[factName] = true;
						content += rowTemplate.evaluate(rowData);
					}
				}
			}
		});
	container.innerHTML = content;
}
function onKeyPressCanvas (e){	
	if (e.keyCode == Event.KEY_DELETE && selectedElement){ //Delete an element from the canvas
		var title = (selectedElement.title)?selectedElement.title:"the selected element";
		if(confirm("You are about to remove " + title + " from canvas. Are you sure?")) { //delete if ok
			//if it is a screen, Delete it from the screen list
			if (selectedElement.data){
				screens[screens.indexOf(selectedElement.data)]=null;
				screens = screens.compact();
				//If there are no screens in the screenflows, hide the generate button
				if (screens.length == 0){
					screenflowButton(false);
				}
			}
			if (selectedElement.className.indexOf("event")>=0){
				delete events[selectedElement.id];
			}
			else if (selectedElement.className.indexOf("slot")>=0){
				delete slots[selectedElement.id];
			}
			//Delete the element
			$(selectedElement.parentNode).removeChild (selectedElement);
			satisfeabilityUpdate ();
            $("detailsTitle").innerHTML = "Properties";
            $("details.title").innerHTML = "&nbsp;";
            $("details.id").innerHTML = "&nbsp;";
            $("details.desc").innerHTML = "&nbsp;";
            $("details.tags").innerHTML = "&nbsp;";
            previousElement = null;
			selectElement(null);
		}
	}
}
//This function hides or shows the button to create the gadget from the screenflow
function screenflowButton(show){
	if (show){
		$("showDialog").setStyle({visibility:"visible"});
		$("showDialog2").setStyle({visibility:"visible"});
	}
	else{
		$("showDialog").setStyle({visibility:"hidden"})
		$("showDialog2").setStyle({visibility:"hidden"})
	}
}
function showDialog(){
	//Check screenflow reachability
	//At least one reachable screen
	var oneReachable = false;
	//All screens are reachable
	var allReachable = true;
	//remove duplicated screens
	_screens = screens.uniq();
	_screens.each(function(screen){
		if (screen.satisfeable)
			oneReachable = true;
		else
			allReachable = false;
	});

	if (!oneReachable){ //It is not an executable gadget
		alert ("The screenflow doesn't contain any reachable screen. It is imposible to create a gadget");
		return;
	}
	if (!allReachable){
		if(!confirm("There are some unreachable screens. These screens will never be accessed in the gadget. Do you want to continue?")) { //delete if ok
			return;
		}
	}
    removeOnKeyListener();
	dijit.byId('dialog1').show();
}

function showDialog2(){
	//Check screenflow reachability
	//At least one reachable screen
	var oneReachable = false;
	//All screens are reachable
	var allReachable = true;
	//remove duplicated screens
	_screens = screens.uniq();
	_screens.each(function(screen){
		if (screen.satisfeable)
			oneReachable = true;
		else
			allReachable = false;
	});
	//remove last ","

	if (!oneReachable){ //It is not an executable gadget
		alert ("The screenflow doesn't contain any reachable screen. It is imposible to store a gadget");
		return;
	}
	if (!allReachable){
		if(!confirm("There are some unreachable screens. These screens will never be accessed in the gadget. Do you want to continue?")) { //delete if ok
			return;
		}
	}
    removeOnKeyListener();
	dijit.byId('dialog2').show();
}

function createGadget(){
	var screenList = "";
	var _screens = screens.uniq();
	_screens.each(function(screen){
		if (screen.satisfeable){
			screenList += screen.screenId + ",";
		}
	});
	screenList = screenList.substring(0,screenList.length-1);
	//Update form input fields
	$("screensCreateGadget").setAttribute("value",screenList);
	//Update slots & events
	var slotsValue = "";
	for (slot in slots){
		slotsValue += slots[slot].variable + ","; //variable name
		slotsValue += slots[slot].label + ","; //variable label
		slotsValue += slots[slot].friendcode + ","; //friendcode
		slotsValue += slots[slot].fact.name; //fact name
		if (slots[slot].selectedAttribute != "all"){
			slotsValue +="," + slots[slot].selectedAttribute; //fact attribute	
		}
		slotsValue += ";";
	}
	if (slotsValue.length > 0){
		slotsValue = slotsValue.substring(0,slotsValue.length-1);
	}
	$("slots").setAttribute("value",slotsValue);
	
	var eventsValue = "";
	for (event in events){
		eventsValue += events[event].variable + ","; //variable name
		eventsValue += events[event].label + ","; //variable label
		eventsValue += events[event].friendcode + ","; //friendcode
		eventsValue += events[event].fact.name; //fact name
		if (events[event].selectedAttribute != "all") {
			eventsValue += "," + events[event].selectedAttribute; //fact attribute
		}
		eventsValue += ";";
	}
	if (eventsValue.length > 0){
			eventsValue = eventsValue.substring(0,eventsValue.length-1);
	}
	$("events").setAttribute("value",eventsValue);
	
	//Invoke the form
	var form = $("gadgetForm");
	form.setAttribute("action",baseURL);
	form.submit();	
	dijit.byId("dialog1").hide();
}


function storeGadget(){
	dijit.byId("dialog2").hide();
	var screenList = "";
	var _screens = screens.uniq();
	_screens.each(function(screen){
		if (screen.satisfeable){
			screenList += screen.screenId + ",";
		}
	});
	screenList = screenList.substring(0,screenList.length-1);
	//Update form input fields
	$("storeScreens").setAttribute("value",screenList);
	
	//Update slots & events
	var slotsValue = "";
	for (slot in slots){
		slotsValue += slots[slot].variable + ","; //variable name
		slotsValue += slots[slot].label + ","; //variable label
		slotsValue += slots[slot].friendcode + ","; //friendcode
		slotsValue += slots[slot].fact.name; //fact name
		if (slots[slot].selectedAttribute != "all"){
			slotsValue +="," + slots[slot].selectedAttribute; //fact attribute	
		}
		slotsValue += ";";
	}
	if (slotsValue.length > 0){
			slotsValue = slotsValue.substring(0,slotsValue.length-1);
	}
	$("storeSlots").setAttribute("value",slotsValue);
	
	var eventsValue = "";
	for (event in events){
		eventsValue += events[event].variable + ","; //variable name
		eventsValue += events[event].label + ","; //variable label
		eventsValue += events[event].friendcode + ","; //friendcode
		eventsValue += events[event].fact.name; //fact name
		if (events[event].selectedAttribute != "all") {
			eventsValue += "," + events[event].selectedAttribute; //fact attribute
		}
		eventsValue += ";";
	}
	if (eventsValue.length > 0){
			eventsValue = eventsValue.substring(0,eventsValue.length-1);
	}
	$("storeSlots").setAttribute("value",slotsValue);
	$("storeEvents").setAttribute("value",eventsValue);
	
	//Invoke the form
	var form = $("gadgetStoreForm");

	/*var keys = new Array();
	var values = new Array();
	for (var i = 0; i < form.elements.length; i++){
		keys[i] = form.elements[i].id;
		values[i] = form.elements[i].value;
	}
	
	dijit.byId("dialog2").hide();
	
	var windowName = 'EzWeb Template URL: ' + form.vendor.value + '-' + form.name.value + '-' + form.version.value;
	
	openWindowWithPost(ezWebStoreURL, windowName, keys, values,'');*/
	//Invoke the form
	var form = $("gadgetStoreForm");
	form.setAttribute("action",ezWebStoreURL);
	form.submit();	
	
	
}

function encodeURL (string) {
	// private method for UTF-8 encoding
	var _utf8_encode = function (string) {
		string = string.replace(/\r\n/g,"\n");
		var utftext = "";

		for (var n = 0; n < string.length; n++) {

			var c = string.charCodeAt(n);

			if (c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}
		}

		return utftext;
	}
	
	return escape(_utf8_encode(string));
}
function createTooltip (node){
			
			var content = "<h3>" + node.data.value + "</h3>" + node.data.desc;
			if (node.data.pre)
				content += "<h4>Input Facts:</h4>";
			content += "<table>";
			$H(node.data.pre).each (function (pair){
				content += '<tr><td style="border:none;width:10%">';
				content +=  '<div class="factIcon  unknownIcon">';
				content += pair.value.shortcut + "</div></td>";
				content += "<td style='border:none;'>" + pair.value.desc + "</td></tr>"; 
			});
			content += "</table>";
			if (node.data.post)
				content += "<h4>Output Facts:</h4>";
			content +="<table>";
			$H(node.data.post).each (function (pair){
				content += '<tr><td style="border:none;width:10%">';
				content +=  '<div class="factIcon unknownIcon">';
				content += pair.value.shortcut + "</div></td>";
				content += "<td style='border:none;'>" + pair.value.desc + "</td></tr>"; 
			});
			
			content += "</table>";
			var screenInformation = document.createElement('span');
			screenInformation.innerHTML = content;
			tip = new dijit.Tooltip({ connectId:[node.id]},screenInformation);
			tip.startup();
			return tip;
}


function showVariableDialog(behaviour,node){
	var type;
	var fact;
	var variable;
	var label;
	var friendcode;
	var selectedAttribute;
	if (node.id.indexOf("event")>= 0){
		type = "Event";
	}
	else if (node.id.indexOf("slot")>= 0){
		type = "Slot";
	}
	
	if (behaviour){
		fact = behaviour.fact;
		variable = behaviour.variable;
		label = behaviour.label;
		friendcode = behaviour.friendcode;
		selectedAttribute = behaviour.selectedAttribute;
	}
	else {
		fact = null;
		variable = "variableName";
		label = "Variable Label";
		friendcode = "friendcode";
		selectedAttribute = null;
	}
	
	dijit.byId('factBehaviour').show();
	updateFactInterface(type,fact,variable,label,friendcode,selectedAttribute);
}
function updateFactInterface (type,fact,variable,label,friendcode,selectedAttribute){
	$("behaviour").update (type);
	var innerOption = "<option value='none'>Choose a fact...</option>";
	for (factDef in conceptualModel){
		innerOption += "<option value='" + conceptualModel[factDef].name + "'";
		if (fact && conceptualModel[factDef].name == fact.name){
			innerOption += "selected='selected'";
		}
		innerOption +=">" + conceptualModel[factDef].name + "</option>";
	}
	$("fact").innerHTML = innerOption;
	
	$("variableName").value = variable;
	$("label").value = label;
	innerOption = "<option value='all' "+ (selectedAttribute == "all" ? "selected='selected'":"") +">All attributes</option>";
	if (fact){
		for (var i=0; i <fact.attributes.length ; i++){
			innerOption += "<option value='" + fact.attributes[i] + "'";
			if (fact.attributes[i] == selectedAttribute){
				innerOption += "selected='selected'";
			}
			innerOption +=">" + fact.attributes[i] + "</option>";
		}
	}
	$("friendcode").value = friendcode;
	$("attribute").innerHTML = innerOption;
}
function updateFriendcode(){
	var attribute =$F("attribute");
	var fact = $F("fact");
	if (attribute != "all"){
		$("friendcode").value = fact + "-" + attribute;	
	}
	else {
		$("friendcode").value = fact;
	}
}
function updateSelectedFact(){
	fact = $F("fact");
	if (fact == "none") {
		updateFactInterface($("behaviour").innerHTML, null, "variableName", "Variable Label", "friendcode", null);
	}
	else {
		if(slots[selectedElement.id] && slots[selectedElement.id].fact.name == fact){
			updateFactInterface($("behaviour").innerHTML,slots[selectedElement.id].fact,
				slots[selectedElement.id].variable,slots[selectedElement.id].label,slots[selectedElement.id].friendcode,
				slots[selectedElement.id].selectedAttribute);
		}
		else if (events[selectedElement.id] && events[selectedElement.id].fact.name == fact){
			updateFactInterface($("behaviour").innerHTML,events[selectedElement.id].fact,
				events[selectedElement.id].variable,events[selectedElement.id].label,events[selectedElement.id].friendcode,
				events[selectedElement.id].selectedAttribute);
		}
		else {
			updateFactInterface($("behaviour").innerHTML, conceptualModel[fact],
				fact,fact,fact,null);
		}
	}
}
function updateFactBehaviour (){
	var factName = $F("fact");
	
	if (factName == "none"){
		$("factError").setStyle({opacity:"100"});
		dojo.fadeOut({node:"factError",duration:750,delay:750}).play();
		return;
	}
	
	if (slots[selectedElement.id]) {
		delete slots[selectedElement.id];
	}
	if (events[selectedElement.id]){
		delete events[selectedElement.id];
	}
	var friendcode;	
	if ($F("friendcode") != ""){
		friendcode = $F("friendcode");
	}
	else{
		friendcode = factName + ($F("attribute")=="all")?"":"-" + $F("attribute");
	}
	
	var element = {
		fact: conceptualModel[factName],
		variable:($F("variableName") !="")?$F("variableName"):factName,
		label:($F("label") !="")?$F("label"):factName,
		friendcode:friendcode,
		selectedAttribute: $F("attribute")
	}
	
	if (selectedElement.id.indexOf("event")>=0){
		events[selectedElement.id] = element;
	}
	else if (selectedElement.id.indexOf("slot")>=0){
		slots[selectedElement.id] = element;
	}
	selectedElement.innerHTML = element.fact.shortcut;
	if(element.selectedAttribute != "all"){
		selectedElement.innerHTML +="*";	
	}
	onClick(null,selectedElement);
	dijit.byId('factBehaviour').hide();
	satisfeabilityUpdate();
}
function getNodeBehaviour(domId){ //it returns the slot or event for a given 
							 	//concept dom node, or null if it is not set
	var behaviour = null;
	if (slots[domId]){
		behaviour = slots[domId];
	}
	if (!behaviour && events[domId]){
		behaviour = events[domId];	
	}
	return behaviour;
}
function changeTab (tab){
     var id;

    if (tab.id) {  // it is tab widget
        id = tab.id;
    } else { //it is a string id
        id = tab;
    }
    if (id == "tab1") { //Screenflow canvas
        if (previousElement){
            onClick (null,previousElement);
            previousElement = null;
        }
       
    }
    else {
        $("detailsTitle").innerHTML = "Properties";
        $("details.title").innerHTML = "&nbsp;";
        $("details.id").innerHTML = "&nbsp;";
        $("details.desc").innerHTML = "&nbsp;";
        $("details.tags").innerHTML = "&nbsp;";
        if (selectedElement != null) {
            previousElement = selectedElement;
            selectElement(null);         
        }
    }
}
function addOnKeyListener(){
    Element.observe(document, "keypress",onKeyPressCanvas);
}
function removeOnKeyListener(){
    Element.stopObserving(document, "keypress",onKeyPressCanvas);
}
