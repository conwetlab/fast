package fast.servicescreen.client;

import com.google.gwt.user.client.rpc.RemoteService;
import com.google.gwt.user.client.rpc.RemoteServiceRelativePath;

/**
 * The client side stub for the RPC service.
 */
@RemoteServiceRelativePath("request")	//the sub url to request
public interface RequestService extends RemoteService
{
	String sendHttpRequest_GET(String url);
	
	String sendHttpRequest_POST(String url, String cookie, String body);
	
	String saveJsFileOnServer(String opName, String preHTMLCode, String transCode, String postHTMLCode);
}
