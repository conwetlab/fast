package eu.morfeoproject.fast.services;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.StringTokenizer;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.ontoware.rdf2go.model.Statement;
import org.ontoware.rdf2go.model.node.Resource;
import org.ontoware.rdf2go.model.node.impl.URIImpl;
import org.openrdf.repository.RepositoryException;
import org.restlet.Restlet;
import org.restlet.data.MediaType;
import org.restlet.data.Method;
import org.restlet.data.Request;
import org.restlet.data.Response;
import org.restlet.data.Status;

import eu.morfeoproject.fast.catalogue.Catalogue;
import eu.morfeoproject.fast.catalogue.DuplicatedScreenException;
import eu.morfeoproject.fast.catalogue.NotFoundException;
import eu.morfeoproject.fast.catalogue.OntologyInvalidException;
import eu.morfeoproject.fast.catalogue.OntologyReadonlyException;
import eu.morfeoproject.fast.model.Condition;
import eu.morfeoproject.fast.model.FastModelFactory;
import eu.morfeoproject.fast.model.Screen;
import eu.morfeoproject.fast.util.FormatterUtil;
import eu.morfeoproject.fast.vocabulary.FCO;

/**
 * 
 * @author irivera
 */
public class ScreenRestlet extends Restlet {

	private Catalogue catalogue;
	
	public ScreenRestlet(Catalogue catalogue) throws RepositoryException {
		super();
		this.catalogue = catalogue;
	}

	@Override
	public void handle(Request request, Response response) {
		String id = (String) request.getAttributes().get("id");
		if (request.getMethod().equals(Method.GET)) {
			if (id == null) {
				// List the members of the collection. For example list all the cars for sale
				JSONArray screens = new JSONArray();
				for (Screen s : catalogue.listScreens())
					screens.put(s.toJSON());
				try {
					response.setEntity(screens.toString(2), MediaType.APPLICATION_JSON);
				} catch (JSONException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
				response.setStatus(Status.SUCCESS_OK);
			} else {
				// Retrieve the addressed member of the collection
				Screen s = catalogue.getScreen(catalogue.getTripleStore().createURI(FCO.Screen+id));
				if (s == null)
					response.setStatus(Status.SUCCESS_NO_CONTENT);
				else {
					try {
						response.setEntity(s.toJSON().toString(2), MediaType.APPLICATION_JSON);
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
				Screen screen = parseScreen(json, id);
				try {
					catalogue.updateScreen(screen);
				} catch (DuplicatedScreenException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				} catch (OntologyInvalidException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				} catch (OntologyReadonlyException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				} catch (NotFoundException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
				response.setEntity(screen.toJSON().toString(2), MediaType.APPLICATION_JSON);
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
				Screen screen = parseScreen(json, null);
				try {
					catalogue.addScreen(screen);
					catalogue.dump();
					response.setEntity(screen.toJSON().toString(2), MediaType.APPLICATION_JSON);
					response.setStatus(Status.SUCCESS_OK);
				} catch (DuplicatedScreenException e) {
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
				catalogue.removeScreen(new URIImpl(FCO.Screen+id));
				response.setStatus(Status.SUCCESS_OK);
			} catch (NotFoundException e1) {
				response.setStatus(Status.SUCCESS_NO_CONTENT);
			}
		} else {
			response.setStatus(Status.CLIENT_ERROR_BAD_REQUEST);
		}
	}
	
	// TODO do it in another class common for all the restlets
	private Screen parseScreen(JSONObject jsonScreen, String id) throws JSONException {
		Screen screen = FastModelFactory.createScreen();
		if (id != null)
			screen.setUri(catalogue.getTripleStore().createURI(FCO.Screen+id));
		screen.setLabel(jsonScreen.getString("label"));
		screen.setDescription(jsonScreen.getString("description"));
		screen.setCreator(new URIImpl(jsonScreen.getString("creator")));
		screen.setRights(new URIImpl(jsonScreen.getString("rights")));
		screen.setVersion(jsonScreen.getString("version"));
		screen.setCreationDate(FormatterUtil.parseDate(jsonScreen.getString("creationDate")));
		screen.setIcon(new URIImpl(jsonScreen.getString("icon")));
		screen.setScreenshot(new URIImpl(jsonScreen.getString("screenshot")));
		JSONArray domainContext = jsonScreen.getJSONArray("domainContext");
		for (int i = 0; i < domainContext.length(); i++)
			screen.getDomainContext().add(catalogue.getTripleStore().createURI(domainContext.getString(i)));
		screen.setHomepage(new URIImpl(jsonScreen.getString("homepage")));
		screen.setPreconditions(parseConditions(jsonScreen.getJSONArray("preconditions")));
		screen.setPostconditions(parseConditions(jsonScreen.getJSONArray("postconditions")));
		return screen;
	}
	
	// TODO do it in another class common for all the restlets
	private List<Condition> parseConditions(JSONArray conditionsArray) throws JSONException {
		ArrayList<Condition> conditions = new ArrayList<Condition>();
		for (int i = 0; i < conditionsArray.length(); i++) {
			Condition c = FastModelFactory.createCondition();
			ArrayList<Statement> stmts = new ArrayList<Statement>();
			Resource subject = catalogue.getTripleStore().createBlankNode();
			StringTokenizer tokens = new StringTokenizer(conditionsArray.getString(i));//, " . ");
			for ( ; tokens.hasMoreTokens(); ) {
				String s = tokens.nextToken();
				String p = tokens.nextToken();
				String o = tokens.nextToken();
				if (tokens.hasMoreTokens())
					tokens.nextToken(); // discard the .
				
				// FIXME this has to be do it in a generic manner, and try to not introduce errors
				// or unknown properties or classes
				Statement st = catalogue.getTripleStore().createStatement(subject, new URIImpl(p), new URIImpl(o));
				
				stmts.add(st);
			}
			c.setStatements(stmts);
			conditions.add(c);
		}
		return conditions;
	}
	
}
