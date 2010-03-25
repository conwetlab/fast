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
	
	//the current path
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
	public String saveJsFileOnServer(String opName, String preHTMLCode, String transCode, String postHTMLCode)
	{
		//the HTML file content
		String htmlContent = preHTMLCode + transCode + postHTMLCode;
		
		try
		{
			//TODO write sep. js file
			
			String baseFileName = path + "/servicescreendesignerwep/" + opName + "Operator";
			String fileName = baseFileName + ".html";
			FileWriter writer = new FileWriter(fileName, false);
			
			writer.write(htmlContent);
			
			writer.close();
			
			// write the pure json script, too
			fileName = baseFileName + ".js";
			writer = new FileWriter(fileName, false);
			
			writer.write(transCode);
			
			writer.close();
			
		}
		catch (Exception e)
		{
			return "false";
		} 
		
		return "true";
	}
}