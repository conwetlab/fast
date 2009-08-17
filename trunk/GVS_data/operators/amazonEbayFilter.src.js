/**{
	uri:"http://TODO/operator#amazonEbayFilter",
	id:"amazonEbayFilter1",
	actions: [{action:"filter", preconditions:[{id:"item", name:"http://TODO/amazon#item", positive:true}], uses:[]}],
	postconditions: [{id:"filterEbay", name:"http://TODO/ebay#filter", positive:true}],
	triggers:["filterEbay"]
}**/
{{element.name}}.prototype.createFilter = function (item){
	var filter = {id: 'filterEbay', data:{keywords: item.data.title, maxEntries: 5, currentPage: 1}};
	{{element.instance}}.manageData(["filterEbay"], [filter], []);
}