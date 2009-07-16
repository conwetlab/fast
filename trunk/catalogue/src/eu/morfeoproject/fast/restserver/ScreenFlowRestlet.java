package eu.morfeoproject.fast.restserver;

import java.io.IOException;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
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
import eu.morfeoproject.fast.catalogue.DuplicatedScreenFlowException;
import eu.morfeoproject.fast.catalogue.NotFoundException;
import eu.morfeoproject.fast.catalogue.OntologyInvalidException;
import eu.morfeoproject.fast.catalogue.OntologyReadonlyException;
import eu.morfeoproject.fast.model.ScreenFlow;
import eu.morfeoproject.fast.vocabulary.FGO;

/**
 * 
 * @author irivera
 */
public class ScreenFlowRestlet extends CatalogueRestlet {

	final Logger logger = LoggerFactory.getLogger(ScreenFlowRestlet.class);

	public ScreenFlowRestlet(Catalogue catalogue) throws RepositoryException {
		super();
		this.catalogue = catalogue;
	}

	@Override
	public void handle(Request request, Response response) {
		String id = (String) request.getAttributes().get("id");
		if (request.getMethod().equals(Method.GET)) {
			if (id == null) {
				// List the members of the collection
				logger.info("Retrieving all screenflows");
				JSONArray screenFlows = new JSONArray();
				for (ScreenFlow sf : catalogue.listScreenFlows())
					screenFlows.put(sf.toJSON());
				try {
					response.setEntity(screenFlows.toString(2), MediaType.APPLICATION_JSON);
				} catch (JSONException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
				response.setStatus(Status.SUCCESS_OK);
			} else {
				// Retrieve the addressed member of the collection
				logger.info("Retrieving screenflow "+id);
				ScreenFlow sf = catalogue.getScreenFlow(catalogue.getTripleStore().createURI(FGO.ScreenFlow+id));
				if (sf == null)
					response.setStatus(Status.SUCCESS_NO_CONTENT);
				else {
					try {
						response.setEntity(sf.toJSON().toString(2), MediaType.APPLICATION_JSON);
					} catch (JSONException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}
					response.setStatus(Status.SUCCESS_OK);
				}
			}
		} else if (request.getMethod().equals(Method.PUT) && id != null) {
			// Update the addressed member of the collection or create it with a defined ID.
			try {
				JSONObject json = new JSONObject(request.getEntity().getText());
				ScreenFlow sf = parseScreenFlow(json, id);
				try {
					catalogue.updateScreenFlow(sf);
				} catch (OntologyReadonlyException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				} catch (NotFoundException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
				response.setEntity(sf.toJSON().toString(2), MediaType.APPLICATION_JSON);
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
		} else if (request.getMethod().equals(Method.POST)) {
			MediaType mt = request.getEntity().getMediaType();
//			if (!request.getEntity().getMediaType().getMainType().equals(MediaType.APPLICATION_JSON.toString())) {
//				response.setStatus(Status.CLIENT_ERROR_BAD_REQUEST, "Media type expected is application/json.");
//			} else {
				// Create a new entry in the collection where the ID is assigned automatically by 
				// the collection and it is returned.
			try {
				JSONObject json = new JSONObject(request.getEntity().getText());
//				json.remove("uri"); // FIXME unnecessary, get the screen URI from the URL
				ScreenFlow screenFlow = parseScreenFlow(json, null);
				try {
					catalogue.addScreenFlow(screenFlow);
					response.setEntity(screenFlow.toJSON().toString(2), MediaType.APPLICATION_JSON);
					response.setStatus(Status.SUCCESS_OK);
				} catch (DuplicatedScreenFlowException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
					response.setStatus(Status.CLIENT_ERROR_BAD_REQUEST);
				} catch (OntologyInvalidException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
					response.setStatus(Status.CLIENT_ERROR_BAD_REQUEST);
				} catch (OntologyReadonlyException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
					response.setStatus(Status.CLIENT_ERROR_BAD_REQUEST);
				} catch (NotFoundException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
					response.setStatus(Status.CLIENT_ERROR_BAD_REQUEST);
				}
			} catch (JSONException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
				response.setStatus(Status.CLIENT_ERROR_BAD_REQUEST);
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}	
		} else if (request.getMethod().equals(Method.DELETE) && id != null) {
			// Delete the addressed member of the collection.
			try {
				catalogue.removeScreenFlow(new URIImpl(FGO.ScreenFlow+id));
				response.setStatus(Status.SUCCESS_OK);
			} catch (NotFoundException e1) {
				response.setStatus(Status.CLIENT_ERROR_NOT_FOUND, "The resource "+FGO.Screen+id+" has not been found.");
			}
		} else {
			response.setStatus(Status.CLIENT_ERROR_BAD_REQUEST);
		}
	}
	
}
