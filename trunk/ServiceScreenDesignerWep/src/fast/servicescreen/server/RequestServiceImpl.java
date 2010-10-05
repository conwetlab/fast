package fast.servicescreen.server;

import java.io.FileWriter;
import java.io.UnsupportedEncodingException;

import org.apache.http.client.HttpClient;
import org.apache.http.client.ResponseHandler;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
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
	private HttpPost httppost;
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
	public String sendHttpRequest_POST(String url, String cookie, String body)
	{
		// create httpClient and httpPOST container
		httpclient = new DefaultHttpClient();
		httppost = new HttpPost(url);
		httppost.addHeader("Cookie", cookie);
		try {
			httppost.setEntity(new StringEntity(body));
		} catch (UnsupportedEncodingException uee) {
			uee.printStackTrace();
		}

		// Create response handler
		responseHandler = new BasicResponseHandler();
		
		try
		{
			// send the POST request
			responseBody = httpclient.execute(httppost, responseHandler);
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
		String answer = "";
		
		try
		{
			path = ".";
			
			String classLocation = getClassLocation ();
			
			answer += "pwd: " + classLocation;

			boolean localDemo = true;
			if (localDemo)
			{
				
				path = "../../GVS/static/";
			}
			else if ( classLocation.contains("ServiceDesignerWep"))
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