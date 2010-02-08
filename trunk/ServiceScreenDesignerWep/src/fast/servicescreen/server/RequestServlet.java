package fast.servicescreen.server;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gwt.user.client.rpc.RemoteServiceRelativePath;

/**
 * Call URL:
 * http://localhost:8080/requestServlet?url=xxx
 * 
 * for xxx insert the searchURL, BUT fill with escape
 * code first, alter with req.setCharacterEncoding(env):
 * xxx = http://open.api.sandbox.ebay.com/shopping?appid=KasselUn-efea-4b93-9505-5dc2ef1ceecd&version=517&callname=FindItems&ItemSort=EndTime&QueryKeywords=USB&responseencoding=XML
 * 
 * -> with URL Escape Codes: / -> %2F, = -> %3D, ? = %3F, & -> %26, : -> %3A
 * xxx = http%3A%2F%2Fopen.api.sandbox.ebay.com%2Fshopping%3Fappid%3DKasselUn-efea-4b93-9505-5dc2ef1ceecd%26version%3D517%26callname%3DFindItems%26ItemSort%3DEndTime%26QueryKeywords%3DUSB%26responseencoding%3DXML
 * 
 * */
@SuppressWarnings("serial")
@RemoteServiceRelativePath("\requestServlet")
public class RequestServlet extends HttpServlet
{
	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException
	{
		String url = req.getParameter("url");
		
		if(url != null && ! "".equals(url))
		{
			//makes a redircet call with given url and fill the respone with that answere
			resp.sendRedirect(url);

			//flushs the response buffer and write any value to the client 
			resp.flushBuffer();
		}
	}
}