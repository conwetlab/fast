package fast.servicescreen.client.rpc;

import com.google.gwt.core.client.GWT;
import com.google.gwt.json.client.JSONObject;
import com.google.gwt.json.client.JSONString;
import com.google.gwt.user.client.Cookies;
import com.google.gwt.user.client.rpc.AsyncCallback;

import fast.common.client.BuildingBlock;
import fast.servicescreen.client.RequestService;
import fast.servicescreen.client.RequestServiceAsync;

public class ShareOperatorHandler {

	public String share(BuildingBlock op)
	{
		final String resultString = "";
		
		//url and header
		String url = "http://localhost:13337/buildingblock/operator";
		final String cookie = "fastgvsid=" + Cookies.getCookie("fastgvsid");
		
		//build operator
		String body = "buildingblock=" + buildOperator(op);
		
		//upload to GVS
		final RequestServiceAsync shOpService = GWT.create(RequestService.class);
		shOpService.sendHttpRequest_POST(url, cookie, body, new AsyncCallback<String>(){

			@Override
			public void onFailure(Throwable caught) {
//				resultString = "-42";
			}

			@Override
			public void onSuccess(String result) {
//				TODO send share-request with specific id
				System.out.println(result);
//				String shareUrl = "";
//				shOpService.sendHttpRequest_POST(shareUrl, cookie, "", new AsyncCallback<String>();
			}

		});
		
		return resultString;
	}
	
	//TODO assemble the request body
	private String buildOperator(BuildingBlock op)
	{
		String result = "";
		
		JSONObject operator = new JSONObject();

		// name
		String name = (String)op.get("name");
		if( name == null )
		{
			name = "";
		}
		JSONString opName = new JSONString(name);
		operator.put("name", opName);

//		// preconditions
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
//		operator.put("preconditions", preConds);
//
//		//postconditions
//		JSONArray postConds = new JSONArray();
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
//		operator.put("postconditions", postConds);
		
		result = operator.toString();
		
		return result;
	}
}
