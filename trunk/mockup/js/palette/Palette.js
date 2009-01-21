
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
function Palette () {
	
	var resources = new Object ();
	resources.screens = new Array ();
	resources.flows = new Array ();
	resources.operators = new Array ();
	resources.services = new Array ();
	resources.concepts = new Array ();
	resources.forms = new Array ();
	
	/////////////////////
	// Private Methods //
	/////////////////////
	
	// This function adds all the resources to the palette
	var createHtmlNodes = function (){
		
		//screens
		for (var i=0; i< resources.screens.length;i++){
			createNode ("screens",resources.screens[i]);
		}
		//flows
		for (var i=0; i< resources.flows.length;i++){
			createNode ("flows",resources.flows[i]);

		}
		//operators
		for (var i=0; i< resources.operators.length;i++){
			createNode ("operators",resources.operators[i]);
		}
		//services
		for (var i=0; i< resources.services.length;i++){
			createNode ("services",resources.services[i]);
		}
		//concepts
		for (var i=0; i< resources.concepts.length;i++){
			createNode ("concepts",resources.concepts[i]);
		}
		//forms
		for (var i=0; i< resources.forms.length;i++){
			createNode ("forms",resources.forms[i]);
		}
	}
		
	//This function creates a new palette resource as a child of its container
	var createNode = function (parent,resource){
		var container = document.createElement ("div");
		container.setAttribute ("class","paletteSlot");
		
		var node = document.createElement ("div");
		var className = parent.substr(0,parent.length-1);  //create the class name using the parent element. screens = screen 
		node.setAttribute ("class",className + " resource");
		node.setAttribute ("id",resource.id);
		node.innerHTML = insertContent (parent,resource);
		node.setStyle ({"float": "left", clear:"both"});
		container.appendChild(node);
		if (className == "screen")
			node.data = resource;
		if (className == "concept"){
			node.addClassName(resource.id);
		}
		var title = document.createElement ("div");
		title.innerHTML = resource.value;
		title.style.paddingTop = "1ex";
		$(container).appendChild(title);
		$(parent).appendChild(container);
		node.observe ("mouseover",function (){this.style.cursor="move"});
		var tip = null;
		if (className == "screen"){
			tip = createTooltip (node);
		}
		var context = new Object ();
		context.element = node;
		context.numCopies = 0;
		context.isNew = true;
		context.tip = tip;
	 	Draggable.call (this,node,node,context,onStart, onUpdate, onFinish);

        var cleaner = document.createElement("div");
		cleaner.setAttribute("style", "clear:both; width: 100%;");
		$(parent).appendChild(cleaner);
	}
	
	var createFact = function(name, fact) {
		return "<div class='fact' " + 
		            "factName='" + name + "'>" +
		            fact.shortcut +
				"</div>";
	}
	
	var insertContent = function (parent,resource){		
		var result;
		switch (parent){
			case "screens":			
				// title
				result = "<div class='screenTop'>"+ resource.value +"</div>";
				
				// pres
				result += "<div class='preArea'>";
				for (var preName in resource.pre) {
					result += createFact(preName, resource.pre[preName]);
				}
				result += "</div>";

				// a line in the middle				
				result += "<div class='prepostSeparator'></div>";
				
				if (resource.image){
					result += "<div class='screenImage'><img class='img' src='" +resource.image + "'/></div>"; 
				}
				
				
				// posts
				result += "<div class='postArea'>";
				for (var postName in resource.post) {
					result += createFact(postName, resource.post[postName]);
				}
				result += "</div>";
				break;
			case "flows":
				if (resource.id == "start")
					result = "<img src=\"images/start.png\"/>";
				if (resource.id == "arrow")
					result = "<img src=\"images/arrow.png\"/>";
				if (resource.id == "end")
					result = "<img src=\"images/end.png\"/>";
				break;	
			case "concepts":
				if (resource.id == "slot"){
					result = "Slot";
				}
				if (resource.id == "event"){
					result = "Ev.";
				}
				break;
			default:
				result = resource.value;
		}
		return result;
	}
	
	////////////////////
	// Public Methods //
	////////////////////
	Palette.prototype.load = function(){
		//showContainers("screenflow");
		createHtmlNodes();
	}
	
	
	// Gadget initalization
	//TODO: Change with real values. Auto-generated values
	resources.screens[0] = {
		screenId: "amazonSearch",
		id: "amazonSearch",
		value: "Product Search",
		desc: "This screen allows users to look for a product in Amazon, providing a keyword search interface. It produces a search criteria or filter fact",
		tags: "amazon search",
		post: {
			filter: conceptualModel["filter"]
		},
		URL: "screens/productSearch.html",
		image: "images/glass.png",
		satisfeable: true,
		updateSatisfeability: updateScreenSatisfeability,
		colorize: colorizeScreen,
		addInferredFacts: addInferredFacts
	};
	resources.screens[1] = {
		screenId: "amazonList",
		id: "amazonList",
		value: "Product List",
		desc: "This screen shows the results of a given search in Amazon. It allows users to choose a product to see its details",
		tags: "amazon list",
		pre: {
			filter: conceptualModel["filter"]
		},
		post: {
			item: conceptualModel["item"]
		},
		URL: "screens/productList.html",
		image: "images/list.png",
		updateSatisfeability: updateScreenSatisfeability,
		colorize: colorizeScreen,
		addInferredFacts: addInferredFacts
	};
	resources.screens[2] = {
			screenId: "amazonProduct",
			id: "amazonProduct",
			value: "Product Details",
			desc: "This screen shows the details for a given product sold by Amazon. It allows users to add it to their shopping carts",
			tags: "amazon details shoppingCart",
			pre: {
				item: conceptualModel["item"]
			},
			post: {
				cart: conceptualModel["cart"]
			},
			URL: "screens/productDetails.html",
			image: "images/details.png",
			updateSatisfeability: updateScreenSatisfeability,
			colorize: colorizeScreen,
			addInferredFacts: addInferredFacts
	};
	resources.screens[3] = {
			screenId: "amazonShopping",
			id: "amazonShopping",
			value: "Shopping Cart",
			desc: "This screen shows the list of products added to the user shopping cart. It allows users to update product quantity and clear the cart",
			tags: "amazon shoppingCart list",
			pre: {
				cart: conceptualModel["cart"]
			},
			post: {
				purchase: conceptualModel["purchase"]
			},
			URL: "screens/shoppingCart.html",
			image: "images/shoppingcart.png",
			updateSatisfeability: updateScreenSatisfeability,
			colorize: colorizeScreen,
			addInferredFacts: addInferredFacts
	};
	resources.screens[4] = {
			screenId: "amazonOrder",
			id: "amazonOrder",
			value: "Order",
			desc: "This screen allows users to purchase their shopping cart. It shows an Amazon interface to fulfill the required data to purchase the shopping cart",
			tags: "amazon order purchase",
			pre: {
				purchase: conceptualModel["purchase"]
			},
			URL: "screens/order.html",
			image: "images/order.png",
			updateSatisfeability: updateScreenSatisfeability,
			colorize: colorizeScreen,
			addInferredFacts: addInferredFacts
	};
	resources.screens[5] = {
			screenId:"amazonSuggestion",
			id: "amazonSuggestion",
			value: "Suggestion List",
			desc: "This screen shows the list of products related to a given one. It allows users select a new product from this list",
			tags: "amazon list suggestion",
			pre: {
				item: conceptualModel["item"]
			},
			post: {
				item: conceptualModel["item"]
			},
			URL: "screens/suggestionList.html",
			image: "images/suggestion.png",
			updateSatisfeability: updateScreenSatisfeability,
			colorize: colorizeScreen,
			addInferredFacts: addInferredFacts
	};
	resources.screens[6] = {
			screenId:"amazonPrice",
			id: "PriceComparative",
			value: "P. Comparative",
			desc: "This screen shows a price comparative for a given product",
			tags: "amazon list suggestion price.comparative",
			pre: {
				item: conceptualModel["item"]
			},
			post: {
				cart: conceptualModel["cart"]
			},
			URL: "screens/priceComparative.html",
			image: "images/money.png",
			updateSatisfeability: updateScreenSatisfeability,
			colorize: colorizeScreen,
			addInferredFacts: addInferredFacts
	};
	resources.screens[7] = {
			screenId:"eBayList",
			id: "eBayList",
			value: "eBay List",
			desc: "This screen shows a list of products related to a given (amazon) item",
			tags: "ebay list suggestion price.comparative",
			pre: {
				item: conceptualModel["item"]
			},
			post: {
				eBayItem: conceptualModel["eBayItem"]
			},
			URL: "screens/eBayList.html",
			image: "images/list.png",
			updateSatisfeability: updateScreenSatisfeability,
			colorize: colorizeScreen,
			addInferredFacts: addInferredFacts
	};
	resources.flows[0] = {id:"start", value:"ScreenFlow Start"};
	resources.flows[1] = {id:"arrow", value:"Optional Connector"};
	resources.flows[2] = {id:"end", value:"ScreenFlow End"};
	/*resources.operators[0] = {id:"opr1", value:"Operator 1"};
	resources.operators[1] = {id:"opr2", value:"Operator 2"};
	resources.services[0] = {id:"srv1", value:"Backend Service 1"};
	resources.services[1] = {id:"srv2", value:"Backend Service 2"};*/
	resources.concepts[0] = {id:"slot", value:"Slot"};
	resources.concepts[1] = {id:"event", value:"Event"};
	/*resources.forms[0] = {id:"frm1", value:"Form 1"};
	resources.forms[1] = {id:"frm2", value:"Form 2"};*/
}

function updateScreenSatisfeability(KB) {
	// satisfeable by default
	this.satisfeable = true;

	// Checking pres
	for (var preName in this.pre){
		this.satisfeable = this.satisfeable && KB[preName];
		this.pre[preName].satisfeable = KB[preName];
	}
}

// returns whether there was any update
function addInferredFacts (KB){
	var changed = false;

	if (this.satisfeable) {
		for (var postName in this.post) {
			if (!KB[postName]) {
				KB[postName] = true;
				changed = true;			
			}
		}
	}
	
	return changed;	
}

function colorizeScreen (node){
	
	var globalColor = (this.satisfeable)? "green" : "#B90000";  
	
	var data = this;
	
	// border and posts
	node.style.borderColor = globalColor;
	$$("#" + node.id + " .screenTop")[0].style.backgroundColor = globalColor;
	
	$$("#" + node.id  + " .postArea .fact").each (function(node){
		if (data.satisfeable) {
			node.removeClassName("unsatisfeable");
			node.addClassName("satisfeable");
		} else {
			node.removeClassName("satisfeable");
 			node.addClassName("unsatisfeable");
		}
	});
	
	//pres
	$$("#" + node.id  + " .preArea .fact").each (function(node){
		if (data.pre[node.getAttribute("factName")].satisfeable){
		 	node.removeClassName("unsatisfeable");
			node.addClassName("satisfeable");
		} else {
			node.removeClassName("satisfeable");
 			node.addClassName("unsatisfeable");
		}
	});
	
	// Screen Class
	if (this.satisfeable) {
		node.removeClassName("unsatisfeable");
		node.addClassName("satisfeable");
	} else {
		node.removeClassName("satisfeable");
			node.addClassName("unsatisfeable");
	}

}
function showContainers (type){ //type=screenflow/screen
	var accordion = dijit.byId("leftAccordion");
	switch (type){
		case "screenflow":
			//remove all elements
			accordion.getChildren().each(function(child){
				accordion.removeChild(child);
			});	
			//show correct elements
			accordion.addChild(dijit.byId("aFlows"));
			accordion.addChild(dijit.byId("aScreens"));
			accordion.selectChild(dijit.byId("aScreens"));
			break;
		case "screen":
			//remove all elements
			accordion.getChildren().each(function(child){
				accordion.removeChild(child);
			});
			accordion.addChild(dijit.byId("aOperators"));
			accordion.addChild(dijit.byId("aServices"));
			accordion.addChild(dijit.byId("aConcepts"));
			accordion.addChild(dijit.byId("aForms"));
			accordion.selectChild(dijit.byId("aForms"));
			break;
		default: //show all tabs
			accordion.getChildren().each(function(child){
				accordion.removeChild(child);
			});
			accordion.addChild(dijit.byId("aFlows"));
			accordion.addChild(dijit.byId("aScreens"));
			accordion.addChild(dijit.byId("aOperators"));
			accordion.addChild(dijit.byId("aServices"));
			accordion.addChild(dijit.byId("aConcepts"));
			accordion.addChild(dijit.byId("aForms"));
			accordion.selectChild(dijit.byId("aForms"));
			break;
	}
}

