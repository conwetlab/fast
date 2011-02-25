/**
 * Copyright (c) 2008-2011, FAST Consortium
 * 
 * This file is part of FAST Platform.
 * 
 * FAST Platform is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * FAST Platform is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 * or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public
 * License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with FAST Platform. If not, see <http://www.gnu.org/licenses/>.
 * 
 * Info about members and contributors of the FAST Consortium
 * is available at http://fast.morfeo-project.eu
 *
 **/
package fast.servicescreen.server;

import java.io.File;
import java.io.FileWriter;
import java.io.InputStream;
import java.net.URLDecoder;
import java.util.HashMap;
import java.util.Iterator;

import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.ResponseHandler;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.BasicResponseHandler;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.params.HttpProtocolParams;

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
	 * This method receive a requestURL, a hash map within header names and values and
	 * a body.
	 * 
	 *  TODO dk currently this works for SOAP requests.. get it work for nbormal POST, too
	 * */
	@Override
	public String sendHttpRequest_POST(String url, HashMap<String, String> headers, String body)
	{
		//create client and method appending to url
		DefaultHttpClient httpclient = new DefaultHttpClient();
        HttpProtocolParams.setUseExpectContinue(httpclient.getParams(), false);
        HttpPost post = new HttpPost(url);
        
        //adds the given header
        addHeader(post, headers);

        String result = "";
        try
        {
        	HttpEntity entity = new StringEntity(body);
        	post.setEntity(entity);
        	
        	HttpResponse response = httpclient.execute(post);
        	
        	HttpEntity r_entity = response.getEntity();

        	if( r_entity != null )
        	{
        		int sign = 0;
        		InputStream inStream = r_entity.getContent();
        		
        		while((sign = inStream.read()) > -1)
        		{
        			result += new String(new byte[] {(byte) sign});
        		}
        	}
        }
        catch(Exception e)
        {
        	e.printStackTrace();
        }
  
        //delete connection
        httpclient.getConnectionManager().shutdown();

        
        return result;
	}
	
	/**
	 * This method forms <key=name, value=value> map into
	 * several headers and ad those to the given post method
	 * */
	protected void addHeader(HttpPost post, HashMap<String, String> nameValueHeader)
	{
		String name = "";
		String value = "";
		for (Iterator<String> iterator = nameValueHeader.keySet().iterator(); iterator.hasNext();)
		{
			name = iterator.next();
			value = nameValueHeader.get(name);
			
			post.addHeader(name, value);
		}
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
			String installDir;
			int prefixLength;
			
			//if local save into war, if not save into webapps folder
			if (isLocal)
			{
				prefixLength = classLocation.indexOf("ServiceScreenDesignerWep/war");
				prefixLength += "ServiceScreenDesignerWep/war".length();
				path = classLocation.substring(0, prefixLength) + "/wrapper/";
			}
			else
			{
				prefixLength = classLocation.indexOf("ServiceDesignerWep");
				prefixLength += "ServiceDesignerWep".length();
				installDir = classLocation.substring(0, prefixLength);
				path = URLDecoder.decode(installDir) + "/wrapper/";
				
				if(new File(path).mkdir())
				{
					answer += "Create folder 'wrapper'       ";
				}
			}
			
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