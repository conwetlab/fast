package eu.morfeoproject.fast.restserver;

import java.io.IOException;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.model.node.impl.URIImpl;
import org.openrdf.repository.RepositoryException;
import org.restlet.data.MediaType;
import org.restlet.data.Method;
import org.restlet.data.Request;
import org.restlet.data.Response;
import org.restlet.data.Status;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import eu.morfeoproject.fast.catalogue.Catalogue;

public class MetadataRestlet extends CatalogueRestlet {
	
	final Logger logger = LoggerFactory.getLogger(MetadataRestlet.class);
	
	public MetadataRestlet(Catalogue catalogue) throws RepositoryException {
		super();
		this.catalogue = catalogue;
	}

	@Override
	public void handle(Request request, Response response) {
		if (request.getMethod().equals(Method.POST)) {
			logger.debug("Entering GETMETADATA operation...");
			try {
				// read and process the JSON input 
				JSONArray input = new JSONArray(request.getEntity().getText());
				JSONArray arrayScreenflows = new JSONArray();
				JSONArray arrayScreens = new JSONArray();
				for (int i = 0; i < input.length(); i++) {
					URI uri = new URIImpl(input.getString(i));
					if (catalogue.containsScreenFlow(uri))
						arrayScreenflows.put(catalogue.getScreenFlow(uri).toJSON());
					else if (catalogue.containsScreen(uri))
						arrayScreens.put(catalogue.getScreen(uri).toJSON());
				}
				// create the JSON output
				JSONObject output = new JSONObject();
				if (arrayScreenflows.length() > 0)
					output.put("screenflows", arrayScreenflows);
				if (arrayScreens.length() > 0)
					output.put("screens", arrayScreens);
				
				response.setEntity(output.toString(2), MediaType.APPLICATION_JSON);
				response.setStatus(Status.SUCCESS_OK);
			} catch (JSONException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
				response.setStatus(Status.CLIENT_ERROR_BAD_REQUEST);
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
				response.setStatus(Status.CLIENT_ERROR_BAD_REQUEST);
			}
			logger.debug("...Exiting GETMETADATA operation");
		} else {
			response.setStatus(Status.CLIENT_ERROR_METHOD_NOT_ALLOWED);
		}
	}
}
