run: function (search_key) 
{
   //fill imput data into request template 
   var prerequest = 'http://open.api.sandbox.ebay.com/shopping?appid=KasselUn-efea-4b93-9505-5dc2ef1ceecd&version=517&callname=FindItems&ItemSort=EndTime&QueryKeywords=<search_key>&responseencoding=XML'; 

  //search and replace (Operator - Time replacement) 
  prerequest = prerequest.replace(/<search_key>/g,search_key); 
 
  var request = prerequest; 

  //the code for sending a request to same domain resource 
  var xmlHttp = null; 
  var respone = null; 
  try 
  { 
     // Mozilla, Opera, Safari sowie Internet Explorer (ab v7) 
     xmlHttp = new XMLHttpRequest(); 
  } 
  catch(e) 
  { 
      try 
      { 
          // MS Internet Explorer (ab v6) 
          xmlHttp  = new ActiveXObject('Microsoft.XMLHTTP'); 
      } 
      catch(e) 
      { 
            try 
            { 
                  // MS Internet Explorer (ab v5) 
                  xmlHttp  = new ActiveXObject('Msxml2.XMLHTTP'); 
            } 
            catch(e) 
            { 
                  xmlHttp  = null; 
            } 
      } 
  } 

  if (xmlHttp) 
  { 
      //the <resource> tag should contain the requested information 
      xmlHttp.open('GET', '<resource>', true); 
      xmlHttp.onreadystatechange = function () { 
            if (xmlHttp.readyState == 4) 
            { 
                  //the response should save requested information 
                  respone = xmlHttp.responseText; 
            } 
      }; 

      xmlHttp.send(null); 
  } 
 
  var xmlResponse =  response; 

  //the outputPort variable 
  var List = ''; 
  outresult = null;
   for itemResponseElem in xmlResponse.getElementsByTagName(FindItemResponse)
        outlist += new List ()
        outresult.add outList 
        for itemElem in itemResponseElem.getElementsByTagName(Item)
            outProduct = new Product
            outList.add outProduct
		    
            //the transformation code //FOR ONE XML TAG/ELEMENT
            outProduct.name = String_Util.wordsFromTo(String_Util.from(String_Util.trimBoth(itemElem.getElementsByTagName(Title).getItem(1)), 'USB', 1), 1-3) + ',ID: ' + String_Util.trimBoth(itemElem.getElementsByTagName(ItemID).getItem(1)); 
            outProduct.price = String_Util.trimBoth(itemElem.getElementsByTagName(ConvertedCurrentPrice).getItem(elemItemID??)) + ' Euro + ' + String_Util.trimBoth(itemElem.getElementsByTagName(ShippingServiceCost).getItem(1)) + ' for shipping'; 
            outProduct.url = String_Util.until(String_Util.trimBoth(itemElem.getElementsByTagName(ViewItemURLForNaturalSearch).getItem(1)), '/', 3); 
}