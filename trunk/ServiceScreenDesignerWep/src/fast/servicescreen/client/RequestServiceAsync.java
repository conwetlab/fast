package fast.servicescreen.client;

import com.google.gwt.user.client.rpc.AsyncCallback;

/**
 * The async counterpart of <code>GreetingService</code>.
 */
public interface RequestServiceAsync
{
	void sendHttpRequest_GET(String url, AsyncCallback<String> callback);
	
	void saveJsFileOnServer(String fileContent, AsyncCallback<String> callback);
}
