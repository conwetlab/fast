package fast.servicescreen.server;

import java.io.FileWriter;

import org.apache.http.client.HttpClient;
import org.apache.http.client.ResponseHandler;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.BasicResponseHandler;
import org.apache.http.impl.client.DefaultHttpClient;

import com.google.gwt.user.server.rpc.RemoteServiceServlet;
import com.sun.jersey.api.client.Client;
import com.sun.jersey.api.client.WebResource;
import com.sun.jersey.api.client.config.ClientConfig;
import com.sun.jersey.api.client.config.DefaultClientConfig;

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
	
	@Override
	//TODO share the generated operator in GVS
	public String shareOperator(String operator, String cookie) {
		ClientConfig clientConfig = new DefaultClientConfig();
		Client client = Client.create(clientConfig);

		//send operator to GVS
		WebResource webResource = client.resource("http://localhost:13337/buildingblock/operator");
//		webResource.accept("buildingblock/operator");

		webResource.header("Cookie", "gvsid=" + cookie);
		String response = webResource.post(String.class, operator);

		//if the operator was successfully posted to GVS it can be shared
		if (response != "")
		{
			//fetch id of the posted operator
			String id = "";
			
			//share the sent operator
			webResource = client.resource("http://localhost:13337/buildingblock/" + id + "/sharing");
//			webResource.accept("buildingblock/" + id + "/sharing");

			webResource.header("Cookie", "gvsid=" + cookie);
			response = webResource.post(String.class, operator);
		}
		return response;
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
		String answer = "";
		
		try
		{
			path = ".";
			
			String classLocation = getClassLocation ();
			
			answer += "pwd: " + classLocation;

			if ( classLocation.contains("ServiceDesignerWep"))
			{
				int prefixLength = classLocation.indexOf("ServiceDesignerWep");
				prefixLength += "ServiceDesignerWep".length();
				String installDir = classLocation.substring(0, prefixLength);
				path = installDir;
				
				answer += " IsOnTomcat at " + installDir;
			}
			else
			{
				int prefixLength = classLocation.indexOf("ServiceScreenDesignerWep/war");
				prefixLength += "ServiceScreenDesignerWep/war".length();
				String installDir = classLocation.substring(0, prefixLength);
				
				answer += " IsLocal at " + installDir;
			}
			
			String baseFileName = path + "/servicescreendesignerwep/" + opName + "Op";
			String fileName = baseFileName + ".html";
			
			answer += " fileName " + fileName;
			
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
			answer += " Error: " + e.getLocalizedMessage();
			
			return answer;
		} 
		
		return answer;
	}

	private String getClassLocation() 
	{
		Class<? extends RequestServiceImpl> myClass = this.getClass();
		String myClassName = myClass.getName();
		String resourceName = myClassName.replace('.', '/') + ".class";
		String classpath = myClass.getClassLoader().getResource(resourceName).toString();
		
		// cut file: prefix
		classpath = classpath.substring("file:".length());
		
		return classpath;
	    
	}
}