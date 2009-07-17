package eu.morfeoproject.fast.server;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.model.node.impl.URIImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Servlet implementation class MetadataServlet
 */
public class MetadataServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
    
	final Logger logger = LoggerFactory.getLogger(MetadataServlet.class);

    /**
     * @see HttpServlet#HttpServlet()
     */
    public MetadataServlet() {
        super();
    }
    
	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		logger.debug("Entering GETMETADATA operation...");
		BufferedReader reader = request.getReader();
		PrintWriter writer = response.getWriter();
		String format = request.getHeader("accept") != null ? request.getHeader("accept") : MediaType.APPLICATION_JSON;
		StringBuffer buffer = new StringBuffer();
		String line = reader.readLine();
		while (line != null) {
			buffer.append(line);
			line = reader.readLine();
		}
		String body = buffer.toString();
		
		try {
			// read and process the JSON input 
			JSONArray input = new JSONArray(body);
			JSONArray arrayScreenflows = new JSONArray();
			JSONArray arrayScreens = new JSONArray();
			for (int i = 0; i < input.length(); i++) {
				URI uri = new URIImpl(input.getString(i));
				if (CatalogueAccessPoint.getCatalogue().containsScreenFlow(uri))
					arrayScreenflows.put(CatalogueAccessPoint.getCatalogue().getScreenFlow(uri).toJSON());
				else if (CatalogueAccessPoint.getCatalogue().containsScreen(uri))
					arrayScreens.put(CatalogueAccessPoint.getCatalogue().getScreen(uri).toJSON());
			}
			// create the JSON output
			JSONObject output = new JSONObject();
			if (arrayScreenflows.length() > 0)
				output.put("screenflows", arrayScreenflows);
			if (arrayScreens.length() > 0)
				output.put("screens", arrayScreens);
			
			writer.print(output.toString(2));
			response.setContentType(MediaType.APPLICATION_JSON);
			response.setStatus(HttpServletResponse.SC_OK);
		} catch (JSONException e) {
			e.printStackTrace();
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
		}
		logger.debug("...Exiting GETMETADATA operation");
	}

}
