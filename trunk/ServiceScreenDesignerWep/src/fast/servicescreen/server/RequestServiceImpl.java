package fast.servicescreen.server;

import java.io.File;
import java.io.FileWriter;
import java.net.URLDecoder;
import java.util.HashMap;
import java.util.Iterator;

import org.apache.http.HttpResponse;
import org.apache.http.client.ResponseHandler;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.BasicResponseHandler;
import org.apache.http.impl.client.DefaultHttpClient;

import com.google.gwt.user.server.rpc.RemoteServiceServlet;

import fast.servicescreen.client.RequestService;


/**
 * This service is only available as source code. U can instantiate and
 * call it´s request methods to access HTTP requests and more..
 */
public class RequestServiceImpl extends RemoteServiceServlet implements RequestService
{
	private static final long serialVersionUID = 1L;
	
	// Saves the actual REST server response
	private String responseBody = "";
	private HttpGet httpget;
	private ResponseHandler<String> responseHandler;
	
	//the current path
	private String path = ".";
	
	@Override
	public String sendHttpRequest_GET(String url, HashMap<String, String> headers)
	{
		// create httpClient and httpGET container
		DefaultHttpClient httpclient_GET = new DefaultHttpClient();
		httpget = new HttpGet(url);

		//add all headers
		if(headers != null)
		{
			for (Iterator<String> iterator = headers.keySet().iterator(); iterator.hasNext();) {
				String tmpKey = (String) iterator.next();
				String tmpVal = headers.get(tmpKey);
				httpget.addHeader(tmpKey, tmpVal);
			}
		}
		
		// Create response handler
		responseHandler = new BasicResponseHandler();
		
		try
		{
			// send the GET request
			responseBody = httpclient_GET.execute(httpget, responseHandler);
		}
		catch (Exception e)
		{
			e.printStackTrace();
			responseBody = "-1";
		}
		return responseBody;
	}
	
	/**
	 * TODO dk or tg: parse the header!
	 * */
	@Override
	public String sendHttpRequest_POST(String url, HashMap<String, String> headers, String body)
	{
		//create client and method appending to url
		DefaultHttpClient httpclient = new DefaultHttpClient();
//	    PostMethod method = new PostMethod(url);
	    
	    //needed for big responses, but then we should cut the body not containing answerers
//	    BufferedReader br = null;
	    
	    //parse given body and create parameters
//	    parse_andAdd_Parameters(method, body);
	    
	    HttpPost http_post = new HttpPost();
	    
	    //try to execute and watch for problems
	    try
	    {
	    	HttpResponse resp = httpclient.execute(http_post);

//	    	if(returnCode == HttpStatus.SC_NOT_IMPLEMENTED)
//	    	{
//	    		System.err.println("The Post method is not implemented by this URI");
//	    		
	    		// still consume the response body
//	    		responseBody  = method.getResponseBodyAsString();
//	    	}
//	    	else
//	    	{
//	    		//catch response
//	    		br = new BufferedReader(new InputStreamReader(method.getResponseBodyAsStream()));
//	    		String readLine;
//	    		
//	    		while(((readLine = br.readLine()) != null))
//	    		{
//	    			responseBody += readLine;
//	    		}
	    		
	    		responseBody  = resp.toString();//getResponseBodyAsString();
//	    	}
	    }
	    catch (Exception e)
	    {
	    	System.err.println(e);
	    }
	    finally
	    {
//	    	method.releaseConnection();
	    }
	    
	    return responseBody;
	}
	
	/**
	 * This method split body string by \n and by =
	 * and add decoded parameter to given PostMethod
	 * */
//	protected void parse_andAdd_Parameters(PostMethod postMethod, String body)
//	{
//		String[] parameters = body.split("\n");
//		
//		for (int i = 0; i < parameters.length; i++)
//		{
//			String[] cut_NameValue = parameters[i].split("=");
//			
//			if(cut_NameValue.length == 2)
//			{
//				postMethod.addParameter(cut_NameValue[0], cut_NameValue[1]);
//			}
//		}
//	}
	
	/**
	 * This method try to form a given String
	 * into a file, and save it as .js
	 * */
	@SuppressWarnings("deprecation")
	@Override
	public String saveJsFileOnServer(boolean isLocal, String opName, String preHTMLCode, String transCode, String postHTMLCode)
	{
		//the HTML file content
		String htmlContent = preHTMLCode + transCode + postHTMLCode;
		String answer = "";
		
		try
		{
			//getting class path
			path = ".";
			String classLocation = getClassLocation ();
//			answer += "pwd: " + classLocation;
			String installDir;
			int prefixLength;
			
			//TODO dk why that does not work??
			//if local save into war, if not save into webapps folder
//			if (isLocal)
//			{
//				prefixLength = classLocation.indexOf("ServiceScreenDesignerWep/war");
//				prefixLength += "ServiceScreenDesignerWep/war".length();
//				installDir = classLocation.substring(0, prefixLength);
//				
//				answer += "if does not work";
//			}
//			else
//			{
				prefixLength = classLocation.indexOf("ServiceDesignerWep");
				prefixLength += "ServiceDesignerWep".length();
				installDir = classLocation.substring(0, prefixLength);
				path = URLDecoder.decode(installDir) + "/wrapper/";
				
				if(new File(path).mkdir())
				{
					answer += "Create folder 'wrapper'       ";
				}
				
//				answer += "better..";
//			}
			
			//configure filename (for html)
			String baseFileName = path + opName + "Op";
			String fileName = baseFileName + ".html";
			
			//write file
			FileWriter writer = new FileWriter(fileName, false);
			writer.write(htmlContent);
			writer.close();
			
			//configure filename (for javascript)
			fileName = baseFileName + ".js";
			writer = new FileWriter(fileName, false);
			
			//write file
			writer.write(transCode);
			writer.close();
			
			answer += "The file now exists in: " + path;
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