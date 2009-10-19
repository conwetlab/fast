createFilter: function (item){
	var filter = {id: 'filterEbay', data:{keywords: item.data.title, maxEntries: 5, currentPage: 1}};
	this.manageData(["filterEbay"], [filter], []);
}