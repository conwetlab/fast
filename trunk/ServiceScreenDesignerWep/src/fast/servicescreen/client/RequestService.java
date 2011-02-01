package fast.servicescreen.client;

import java.util.HashMap;

import com.google.gwt.user.client.rpc.RemoteService;
import com.google.gwt.user.client.rpc.RemoteServiceRelativePath;

/**
 * The client side stub for the RPC service.
 */
@RemoteServiceRelativePath("request")	//the sub url to request
public interface RequestService extends RemoteService
{
	String sendHttpRequest_GET(String url, HashMap<String, String> headers);
	
	String sendHttpRequest_POST(String url, HashMap<String, String> headers, String body);
	
	String saveJsFileOnServer(boolean isLocal, String opName, String preHTMLCode, String transCode, String postHTMLCode);
}
