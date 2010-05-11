package eu.morfeoproject.fast.catalogue.services;

import java.io.BufferedReader;
import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONException;
import org.json.JSONObject;
import org.ontoware.rdf2go.model.Syntax;
import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.model.node.impl.URIImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Servlet implementation class SlotServlet
 */
public class OntologyServlet extends GenericServlet {
	private static final long serialVersionUID = 1L;

	static Logger logger = LoggerFactory.getLogger(OntologyServlet.class);
    
    /**
     * @see HttpServlet#HttpServlet()
     */
    public OntologyServlet() {
        super();
    }

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		BufferedReader reader = request.getReader();
		StringBuffer buffer = new StringBuffer();
		String line = reader.readLine();
		while (line != null) {
			buffer.append(line);
			line = reader.readLine();
		}
		String body = buffer.toString();
		
		try {
			JSONObject json = new JSONObject(body);
			URI uri = new URIImpl(json.getString("uri"));
			String downloadUri = json.getString("source");
			String syntaxStr = json.getString("syntax");
			Syntax syntax = null;
			if (syntaxStr.equalsIgnoreCase("rdf+xml")) 		syntax = Syntax.RdfXml;
			else if (syntaxStr.equalsIgnoreCase("turtle")) 	syntax = Syntax.Turtle;
			
			// add ontology to the catalogue
			if (CatalogueAccessPoint.getCatalogue().addPublicOntology(uri, downloadUri, syntax))
				response.setStatus(HttpServletResponse.SC_OK);
			else
				response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Ontology '"+uri+"' cannot be added.");
		} catch (JSONException e) {
			logger.error("Error while parsing JSON: "+e, e);
			response.sendError(HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
		}
	}

}
