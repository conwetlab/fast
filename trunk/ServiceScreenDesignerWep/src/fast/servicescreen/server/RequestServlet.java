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
 * Standalone Proxy Servlet
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
			
			//attach the responses output stream
			ServletOutputStream out = resp.getOutputStream();
			
			//write the GET result into the response (this will trigger
			//the forward to the original transmitter)
			byte[] outByte = value.getBytes("utf-8");
			out.write(outByte);
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
			responseBody = "-1";
		}
		return responseBody;
	}
}