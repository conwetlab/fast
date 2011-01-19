package eu.morfeoproject.fast.catalogue.services;

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

import eu.morfeoproject.fast.catalogue.BuildingBlockException;
import eu.morfeoproject.fast.catalogue.NotFoundException;
import eu.morfeoproject.fast.catalogue.services.util.Accept;

/**
 * Servlet implementation class OperatorServlet
 */
public class CopyServlet extends GenericServlet {
	private static final long serialVersionUID = 1L;

    /**
     * @see HttpServlet#HttpServlet()
     */
    public CopyServlet() {
        super();
    }

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		BufferedReader reader = request.getReader();
		PrintWriter writer = response.getWriter();
		Accept accept = new Accept(request);
		String format = accept.isEmpty() ? "" : accept.getDominating();
		StringBuffer buffer = new StringBuffer();
		String line = reader.readLine();
		while (line != null) {
			buffer.append(line);
			line = reader.readLine();
		}
		String body = buffer.toString();

		// Create a new entry in the collection where the ID is assigned automatically by 
		// the collection and it is returned.
		try {
			String output = null;
			try {
				JSONArray json = new JSONArray(body);
				for (int idx = 0; idx < json.length(); idx++) {
					JSONObject element = json.getJSONObject(idx);
					URI bbUri = new URIImpl(element.getString("uri"));
					URI copyUri = getCatalogue().createCopy(bbUri);
					response.setContentType(MediaType.APPLICATION_JSON);
					element.put("copy", copyUri);
				}
				output = json.toString(2);
			} catch (JSONException e) {
				JSONObject json = new JSONObject(body);
				URI bbUri = new URIImpl(json.getString("uri"));
				URI copyUri = getCatalogue().createCopy(bbUri);
				response.setContentType(MediaType.APPLICATION_JSON);
				json.put("copy", copyUri);
				output = json.toString(2);
			}
			writer.print(output);
			response.setStatus(HttpServletResponse.SC_OK);
		} catch (NotFoundException e) {
			log.error(e.toString(), e);
			response.sendError(HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
		} catch (BuildingBlockException e) {
			log.error(e.toString(), e);
			response.sendError(HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
		} catch (JSONException e) {
			log.error(e.toString(), e);
			response.sendError(HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
		}	
	}

}
