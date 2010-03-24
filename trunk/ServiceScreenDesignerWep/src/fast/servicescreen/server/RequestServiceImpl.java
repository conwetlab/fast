package fast.servicescreen.server;

import java.io.FileWriter;

import org.apache.http.client.HttpClient;
import org.apache.http.client.ResponseHandler;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.BasicResponseHandler;
import org.apache.http.impl.client.DefaultHttpClient;

import com.google.gwt.user.server.rpc.RemoteServiceServlet;

import fast.servicescreen.client.RequestService;

/**
 * This service is only available as source code. U can instantiate and
 * call it´s request methods to access HTTP requests and more..
 */
@SuppressWarnings("serial")
public class RequestServiceImpl extends RemoteServiceServlet implements RequestService
{
	// Saves the actual REST server response
	private String responseBody;
	private HttpClient httpclient;
	private HttpGet httpget;
	private ResponseHandler<String> responseHandler;
	
	//TODO: sry guys, but writing a file to relative (project) path does not work for webApps
	//until jet, so everybody has to enter the projects path here.. 
	private String path = ".";
	
	@Override
	public String sendHttpRequest_GET(String url)
	{
		// create httpClient and httpGET container
		httpclient = new DefaultHttpClient();
		httpget = new HttpGet(url);

		// Create response handler
		responseHandler = new BasicResponseHandler();
		
		try
		{
			// send the GET request
			responseBody = httpclient.execute(httpget, responseHandler);
		}
		catch (Exception e)
		{
			e.printStackTrace();
			responseBody = "-1";
		}
		return responseBody;
	}

	/**
	 * This method try to form a given String
	 * into a file, and save it as .js
	 * */
	@Override
	public String saveJsFileOnServer(String fileContent)
	{
		try
		{
			String fileName = path + "/servicescreendesignerwep/embeddedOperator.html";
			FileWriter writer = new FileWriter(fileName, false);
			
			writer.write(fileContent);
			
			writer.close();
		}
		catch (Exception e)
		{
			return "false";
		} 
		
		return "true";
	}
}