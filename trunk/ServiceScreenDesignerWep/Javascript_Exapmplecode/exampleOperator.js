function transform(search_key) 
{
   //fill imput data into request template 
   var prerequest = 'http://open.api.sandbox.ebay.com/shopping?appid=KasselUn-efea-4b93-9505-5dc2ef1ceecd&version=517&callname=FindItems&ItemSort=EndTime&QueryKeywords=<search_key>&responseencoding=XML'; 

  //search and replace (Operator - Time replacement) 
  prerequest = prerequest.replace(/<search_key>/g,search_key); 
 
  var request = prerequest; 

  
  
  //request part simul... no send, no content.. see saved eOp file
  var http_request = new XMLHttpRequest();

  
  
  
  //attach xmlDoc
  var xmlResponse = http_request.responseXML;

  //fill first with all elements (named by the from field in the rootRule)
  var first = xmlResponse.getElementsByTagName('FindItemResponse');

  //create elements.length places in outResult
  var outResult = new Array(first.length);
  
  //iterate over all founded 'FindItemResponse' Elements
  for (var firCount = 0; firCount < first.length; firCount++)
  {
	  var outList = new String('');	//doof!		
	  
	  //take current firstElement (should only one at time)
	  var firstItem = first.item(firCount);
	  
	  //iterate over childs of first.item(0?!)   <FindItemResponse> ... </FindItemResponse>  
	  for(var iCount = 0; iCount < firstItem.childNodes.length; ++iCount)
	  {
		  var iElement = firstItem.childNodes.item(iCount);
		  
		  var outProduct = {
				  		      name : wordsFromTo(from(Trim(iElement.getElementsByTagName('Title').getItem(1)), 'USB', 1), 1-3) + ',ID: ' + Trim(iElement.getElementsByTagName('ItemID').getItem(1)),
				              price: Trim(iElement.getElementsByTagName('ConvertedCurrentPrice').getItem(1)) + ' Euro + ' + Trim(iElement.getElementsByTagName('ShippingServiceCost').getItem(1)) + ' for shipping',
				              url  : until(Trim(iElement.getElementsByTagName('ViewItemURLForNaturalSearch').getItem(1)), '/', 3)
				           };
		  
		  outList += outProduct;
	  }
	  
	  //save outList in outResult (firCount is identifier)
	  outResult.Put(firCount, outList);
  }
  
  return outResult.toString();
  
//  outresult = null;
//   for itemResponseElem in xmlResponse.getElementsByTagName(FindItemResponse)
//        outlist += new List ()
//        outresult.add outList 
//        for itemElem in itemResponseElem.getElementsByTagName(Item)
//            outProduct = new Product
//            outList.add outProduct
//		    
//            //the transformation code //FOR ONE XML TAG/ELEMENT
//            outProduct.name = String_Util.wordsFromTo(String_Util.from(String_Util.trimBoth(itemElem.getElementsByTagName(Title).getItem(1)), 'USB', 1), 1-3) + ',ID: ' + String_Util.trimBoth(itemElem.getElementsByTagName(ItemID).getItem(1)); 
//            outProduct.price = String_Util.trimBoth(itemElem.getElementsByTagName(ConvertedCurrentPrice).getItem(elemItemID??)) + ' Euro + ' + String_Util.trimBoth(itemElem.getElementsByTagName(ShippingServiceCost).getItem(1)) + ' for shipping'; 
//            outProduct.url = String_Util.until(String_Util.trimBoth(itemElem.getElementsByTagName(ViewItemURLForNaturalSearch).getItem(1)), '/', 3); 
}