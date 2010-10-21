package fast.servicescreen.client;

import java.util.ArrayList;
import java.util.HashMap;

import com.google.gwt.user.client.rpc.AsyncCallback;

/**
 * The async counterpart of <code>GreetingService</code>.
 */
public interface RequestServiceAsync
{
	void sendHttpRequest_GET(String url, HashMap<String, String> headers, AsyncCallback<String> callback);
	
	void sendHttpRequest_POST(String url, HashMap<String, String> headers, String body, AsyncCallback<String> callback);
	
	void sendHttpRequest_PUT(String url, HashMap<String, String> headers, String body, AsyncCallback<String> callback);
	
	void sendHttpRequest_DELETE(String url, HashMap<String, String> headers, AsyncCallback<String> callback);
	
	void saveJsFileOnServer(String opName, String preHTMLCode, String transCode, String postHTMLCode, AsyncCallback<String> callback);
}
