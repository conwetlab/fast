package fast.servicescreen.client;

import com.google.gwt.user.client.rpc.AsyncCallback;

/**
 * The async counterpart of <code>GreetingService</code>.
 */
public interface RequestServiceAsync
{
	void sendHttpRequest_GET(String url, AsyncCallback<String> callback);
	
	void sendHttpRequest_POST(String url, String cookie, String body, AsyncCallback<String> callback);
	
	void saveJsFileOnServer(String opName, String preHTMLCode, String transCode, String postHTMLCode, AsyncCallback<String> callback);
}
