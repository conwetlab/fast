package fast.servicescreen.client.rpc;

import com.google.gwt.core.client.GWT;
import com.google.gwt.user.client.Cookies;
import com.google.gwt.user.client.rpc.AsyncCallback;

import fast.common.client.BuildingBlock;
import fast.servicescreen.client.RequestService;
import fast.servicescreen.client.RequestServiceAsync;

public class ShareOperatorHandler {

	public String share(BuildingBlock op)
	{
		final String resultString = "";
		
		String cookie = Cookies.getCookie("fastgvsid");
		
		String operator = "buildingblock={}";
		
		RequestServiceAsync shOpService = GWT.create(RequestService.class);
		shOpService.shareOperator(operator, cookie, new AsyncCallback<String>(){

			@Override
			public void onFailure(Throwable caught) {
//				resultString = "-42";
			}

			@Override
			public void onSuccess(String result) {
//				resultString = result;
			}

		});
		
		return resultString;
	}
	
}
