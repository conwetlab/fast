package fast.servicescreen.client.rpc;

import com.google.gwt.core.client.GWT;
import com.google.gwt.json.client.JSONArray;
import com.google.gwt.json.client.JSONObject;
import com.google.gwt.json.client.JSONParser;
import com.google.gwt.json.client.JSONString;
import com.google.gwt.json.client.JSONValue;
import com.google.gwt.user.client.Cookies;
import com.google.gwt.user.client.rpc.AsyncCallback;

import fast.common.client.BuildingBlock;
import fast.servicescreen.client.RequestService;
import fast.servicescreen.client.RequestServiceAsync;

public class ShareResourceHandler {
	
	//TODO maybe roll out to config-file
	private String gvsUrl = "http://localhost:13337/";
	private String codeBaseUrl = "http://localhost:8080/ServiceScreenDesignerWep/servicescreendesignerwep/";
	
	private RequestServiceAsync shResService;

	public String share(BuildingBlock res)
	{
		final String resultString = "";
		
		//url and header
		String url = gvsUrl + "buildingblock/resource";
		final String cookie = "fastgvsid=" + Cookies.getCookie("fastgvsid");
		
		//build operator
		String body = "buildingblock=" + buildResource(res);
		
		//upload to GVS
		shResService = GWT.create(RequestService.class);
		shResService.sendHttpRequest_POST(url, cookie, body, new AsyncCallback<String>(){
			@Override
			public void onFailure(Throwable caught) {}

			@Override
			public void onSuccess(String result) {
				//TODO fetch id from result and share 
//				System.out.println(result);
				JSONValue resourceVal = JSONParser.parse(result);
				JSONObject resourceObj = resourceVal.isObject();
				JSONValue idVal = resourceObj.get("id");
				JSONString idStr = idVal.isString();
				String id = idStr.stringValue();
				
				String shareUrl = "buildingblock/" + id + "/sharing";
				shResService.sendHttpRequest_POST(shareUrl, cookie, "", new AsyncCallback<String>(){
					@Override
					public void onFailure(Throwable caught) {}
					
					@Override
					public void onSuccess(String result)
					{
						//Resource was shared
						System.out.println("Resource was shared: " + result);
					}
				});
			}

		});
		
		return resultString;
	}
	
	//assembles the request body
	private String buildResource(BuildingBlock res)
	{	
		String result = "";		
		JSONObject resource = new JSONObject();

		//name
		String name = res.getName();
		JSONString resName = new JSONString(name);
		resource.put("name", resName);
		
		//code
		String codeUrl = codeBaseUrl + res.getName() + "Op.js";
		JSONString resCode = new JSONString(codeUrl);
		resource.put("code", resCode);
		
		//version TODO has to be unique per operator and its development stages
		JSONString resVersion = new JSONString("0.3");
		resource.put("version", resVersion);
		
		//actions TODO: adjust
//		JSONObject opActions = new JSONObject();
//		//actions.name
//		opActions.put("name", new JSONString("testOperator"));
//		//actions.preconditions [id,label,pattern,positive] TODO: adjust
//		JSONArray preConds = new JSONArray();
//		JSONObject preCond1 = new JSONObject();
//		//actions.preconditions.id
//		preCond1.put("id", new JSONString("item"));		
//		//actions.preconditions.label
//		JSONObject preCond1Label = new JSONObject();
//		preCond1Label.put("en-gb", new JSONString("An item"));
//		preCond1.put("label", preCond1Label);
//		//actions.preconditions.pattern
//		String preCond1Pattern = "?Item http://www.w3.org/1999/02/22-rdf-syntax-ns#type http://aws.amazon.com/AWSECommerceService#Item";
//		preCond1.put("pattern", new JSONString(preCond1Pattern));
//		//actions.preconditions.positive
//		preCond1.put("positive", new JSONString("true"));
//		preConds.set(0, preCond1);
		
//		//preconditions[id,label,pattern,positive]
//		JSONArray preConds = new JSONArray();
//		int index = 0;
//		for (Iterator<FactPort> iterator = screen.iteratorOfPreconditions(); iterator.hasNext();) {
//			FactPort preCond = (FactPort) iterator.next();
//			//name
//			String preCondStringName = preCond.getName();
//			if( preCondStringName == null )
//			{
//				preCondStringName = "";
//			}
//			JSONString preCondName = new JSONString(preCondStringName);
//			//factType
//			String preCondStringFactType = preCond.getFactType();
//			if( preCondStringFactType == null )
//			{
//				preCondStringFactType = "";
//			}
//			JSONString preCondFactType = new JSONString(preCondStringFactType);
//			//exampleValue
//			String preCondStringExampleValue = preCond.getExampleValue();
//			if( preCondStringExampleValue == null )
//			{
//				preCondStringExampleValue = "";
//			}
//			JSONString preCondExampleValue = new JSONString(preCondStringExampleValue);
//
//			JSONObject inPort = new JSONObject();
//			inPort.put("name", preCondName);
//			inPort.put("factType", preCondFactType);
//			inPort.put("exampleValue", preCondExampleValue);
//			
//			preConds.set(index, inPort);
//			index++;
//		}
//		opActions.put("preconditions", preConds);
//		//actions.uses
//		opActions.put("uses", new JSONArray());
//		resource.put("actions", opActions);
	
		

//		//postconditions: [id, label, pattern, positive] TODO adjust
//		JSONArray postConds = new JSONArray();
//		JSONArray innerPostConds = new JSONArray();
//		JSONObject postCond1 = new JSONObject();
//		//actions.preconditions.id
//		postCond1.put("id", new JSONString("list"));		
//		//actions.preconditions.label
//		JSONObject postCond1Label = new JSONObject();
//		postCond1Label.put("en-gb", new JSONString("A list"));
//		postCond1.put("label", postCond1Label);
//		//actions.preconditions.pattern
//		String postCond1Pattern = "?eFilter http://www.w3.org/1999/02/22-rdf-syntax-ns#type http://developer.ebay.com/DevZone/shopping/docs/CallRef/FindItemsAdvanced.html#Request";
//		postCond1.put("pattern", new JSONString(postCond1Pattern));
//		//actions.preconditions.positive
//		postCond1.put("positive", new JSONString("true"));
//		innerPostConds.set(0, postCond1);
//		postConds.set(0, innerPostConds);
//		operator.put("postconditions", postConds);
		
//		index = 0;
//		for (Iterator<FactPort> iterator = screen.iteratorOfPostconditions(); iterator.hasNext();) {
//			FactPort postCond = (FactPort) iterator.next();
//			//name
//			String postCondStringName = postCond.getName();
//			if( postCondStringName == null )
//			{
//				postCondStringName = "";
//			}
//			JSONString postCondName = new JSONString(postCondStringName);
//			//factType
//			String postCondStringFactType = postCond.getFactType();
//			if( postCondStringFactType == null )
//			{
//				postCondStringFactType = "";
//			}
//			JSONString postCondFactType = new JSONString(postCondStringFactType);
//			//exampleValue
//			String postCondStringExampleValue = postCond.getExampleValue();
//			if( postCondStringExampleValue == null )
//			{
//				postCondStringExampleValue = "";
//			}
//			JSONString postCondExampleValue = new JSONString(postCondStringExampleValue);
//
//			JSONObject outPort = new JSONObject();
//			outPort.put("name", postCondName);
//			outPort.put("factType", postCondFactType);
//			outPort.put("exampleValue", postCondExampleValue);
//
//			postConds.set(index, outPort);
//			index++;
//		}
//		resource.put("postconditions", postConds);
		
		//icon TODO default icon?
//		JSONString resIcon = new JSONString("http://demo.fast.morfeo-project.org/gvsdata/images/catalogue/");
//		resource.put("icon", opIcon);
		
		//screenshot TODO default screenshot?
//		JSONString resScreenshot = new JSONString("http://www.deri.ie/" + "screenshot.jpg");
//		resource.put("screenshot", resScreenshot);
		
		//label TODO default label?
//		JSONObject resLabel = new JSONObject();
//		resLabel.put("en-gb", new JSONString(""));
//		resource.put("label", resLabel);
		
		//description TODO default description?
//		JSONString resDescription = new JSONString("Operator to do something");
//		resource.put("description", resDescription);
		
		//uri TODO default uri?
//		JSONString resUri = new JSONString("");
//		resource.put("uri", resUri);
		
		//tags
		JSONArray resTags = new JSONArray();
		resource.put("tags", resTags);
		
		//rights
		JSONString resRights = new JSONString("http://creativecommons.org/");
		resource.put("rights", resRights);
		
		result = resource.toString();
		
		return result;
	}
}