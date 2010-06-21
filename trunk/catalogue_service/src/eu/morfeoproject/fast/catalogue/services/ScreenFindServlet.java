package eu.morfeoproject.fast.catalogue.services;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Set;

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

import eu.morfeoproject.fast.catalogue.Catalogue;
import eu.morfeoproject.fast.catalogue.NotFoundException;
import eu.morfeoproject.fast.catalogue.buildingblocks.BuildingBlock;

/**
 * Servlet implementation class ScreenFindServlet
 */
public class ScreenFindServlet extends GenericServlet {
	private static final long serialVersionUID = 1L;
    
	final Logger logger = LoggerFactory.getLogger(ScreenFindServlet.class);

    /**
     * @see HttpServlet#HttpServlet()
     */
    public ScreenFindServlet() {
        super();
    }

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		logger.info("Entering FIND operation...");
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
		Catalogue catalogue = CatalogueAccessPoint.getCatalogue();
		
		try {
			// create JSON representation of the input
			JSONObject input = new JSONObject(body);
			// parse the canvas
			HashSet<BuildingBlock> canvas = new HashSet<BuildingBlock>();
			JSONArray jsonCanvas = input.getJSONArray("canvas");
			for (int i = 0; i < jsonCanvas.length(); i++) {
				URI uri = new URIImpl(((JSONObject)jsonCanvas.get(i)).getString("uri"));
				BuildingBlock r = catalogue.getBuildingBlock(uri);
				if (r == null) 
					throw new NotFoundException("Resource "+uri+" does not exist.");
				canvas.add(r); 
			}
			// parse the domain context
			JSONObject jsonDomainContext = input.getJSONObject("domainContext");
			JSONArray jsonTags = jsonDomainContext.getJSONArray("tags");
			HashSet<String> tags = new HashSet<String>();
			for (int i = 0; i < jsonTags.length(); i++)
				tags.add(jsonTags.getString(i));
			StringBuffer sb = new StringBuffer();
			for (String tag : tags)
				sb.append(tag+" ");
			// TODO do something with the user
			String user = jsonDomainContext.getString("user");
			// parse the elements
			JSONArray jsonElements = input.getJSONArray("elements");
			for (int i = 0; i < jsonElements.length(); i++) {
				URI uri = new URIImpl(((JSONObject)jsonElements.get(i)).getString("uri"));
				BuildingBlock r = catalogue.getBuildingBlock(uri);
				if (r == null)
					throw new NotFoundException("Screen "+uri+" does not exist.");
				canvas.add(r); 
			}

			// make the call to the catalogue
			Set<URI> results = catalogue.findBackwards(canvas, true, true, 0, -1, tags);

			// write the results in the output
			JSONArray output = new JSONArray();
			for (Iterator<URI> it = results.iterator(); it.hasNext(); ) {
				URI r = it.next();
				output.put(r);
			}
			writer.print(output.toString(2));
			response.setContentType(MediaType.APPLICATION_JSON);
			response.setStatus(HttpServletResponse.SC_OK);
		} catch (JSONException e) {
			e.printStackTrace();
			response.sendError(HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
		} catch (NotFoundException e) {
			e.printStackTrace();
			response.sendError(HttpServletResponse.SC_NOT_FOUND, e.getMessage());
		}
		logger.info("...Exiting FIND operation");
	}

}
