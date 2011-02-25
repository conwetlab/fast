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

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.http.client.HttpClient;
import org.apache.http.client.ResponseHandler;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.BasicResponseHandler;
import org.apache.http.impl.client.DefaultHttpClient;

import com.google.gwt.user.client.rpc.RemoteServiceRelativePath;

/**
 * Stand alone proxy servlet. Accessible in JavaScript runtime
 * 
 * TODO dk remove, if FASTApit works fine!
 * */
@SuppressWarnings("serial")
@RemoteServiceRelativePath("\requestServlet")
public class RequestServlet extends HttpServlet
{
	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException
	{
		//get the URL out of the requests parameter and form escape codes back to a real URL
		String url = req.getParameter("url");
		
		if(url != null && ! "".equals(url))
		{
			//execute a GET call with the params URL
			String value = sendHttpRequest_GET(url);
			
			// to facilitate debugging strip xslt tag
			// value = value.replaceFirst("<\\?xml-stylesheet type=\"text/xsl\" href=\"http://ergast.com/schemas/mrd-1.1.xsl\"\\?>", "");
			
			//attach the responses output stream
			ServletOutputStream out = resp.getOutputStream();
			
			//write the GET result into the response (this will trigger
			//the forward to the original transmitter)
			byte[] outByte = value.getBytes("utf-8");
			out.write(outByte);
			out.flush();
			out.close();
		}
	}
	
	/**
	 * This mehtod perform a GET Request 
	 * */
	public String sendHttpRequest_GET(String url)
	{
		String responseBody = "";
		
		// create httpClient and httpGET container
		HttpClient httpclient = new DefaultHttpClient();
		HttpGet httpget = new HttpGet(url);

		// Create response handler
		ResponseHandler<String> responseHandler = new BasicResponseHandler();
		
		try
		{
			// send the GET request
			responseBody = httpclient.execute(httpget, responseHandler);
		}
		catch (Exception e)
		{
			e.printStackTrace();
			responseBody = "-42";
		}
		return responseBody;
	}
}