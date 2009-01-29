package eu.morfeoproject.fast.services;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Set;
import java.util.StringTokenizer;

import org.apache.log4j.Logger;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.ontoware.rdf2go.model.Statement;
import org.ontoware.rdf2go.model.node.Resource;
import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.model.node.impl.URIImpl;
import org.openrdf.repository.RepositoryException;
import org.restlet.Restlet;
import org.restlet.data.MediaType;
import org.restlet.data.Method;
import org.restlet.data.Request;
import org.restlet.data.Response;
import org.restlet.data.Status;

import eu.morfeoproject.fast.catalogue.Catalogue;
import eu.morfeoproject.fast.model.Condition;
import eu.morfeoproject.fast.model.FastModelFactory;
import eu.morfeoproject.fast.model.Screen;
import eu.morfeoproject.fast.util.FormatterUtil;
import eu.morfeoproject.fast.vocabulary.FCO;

/**
 * 
 * @author irivera
 */
public class SearchRestlet extends Restlet {

	static Logger logger = Logger.getLogger(SearchRestlet.class);
	
	private Catalogue catalogue;
	
	public SearchRestlet(Catalogue catalogue) throws RepositoryException {
		super();
		this.catalogue = catalogue;
	}

	@Override
	public void handle(Request request, Response response) {
		String action = (String) request.getAttributes().get("action");

		if (request.getMethod().equals(Method.POST)) {
			if (action.equals("find")) {
				logger.debug("Entering FIND operation...");
				try {
					// create JSON representation of the input
					JSONObject input = new JSONObject(request.getEntity().getText());
					// parse the canvas
					Set<Screen> canvas = new HashSet<Screen>();
					JSONArray jsonCanvas = input.getJSONArray("canvas");
					for (int i = 0; i < jsonCanvas.length(); i++)
						canvas.add(parseScreen((JSONObject)jsonCanvas.get(i), null));
					// parse the domain context
					Set<URI> domainContext = new HashSet<URI>();
					JSONArray jsonDomainContext = input.getJSONArray("domainContext");
					for (int i = 0; i < jsonDomainContext.length(); i++)
						domainContext.add(catalogue.getTripleStore().createURI(jsonDomainContext.getString(i)));
					StringBuffer sb = new StringBuffer();
					for (URI d : domainContext)
						sb.append(d+" ");
					logger.debug("domainContext: "+sb.toString());
					// parse the elements
					// TODO retrieve elements from input
					
					// get the criteria
					String criteria = input.getString("criteria");
					logger.debug("criteria: "+criteria);
					
					// make the call to the catalogue
					Set<Screen> results = catalogue.find(canvas, true, true, 0, 100000, domainContext);
					
					// write the results in the output
					JSONArray output = new JSONArray();
					for (Iterator<Screen> it = results.iterator(); it.hasNext(); ) {
						Screen s = it.next();
						output.put(s.toJSON());
						logger.debug("[MATCH] "+s.getUri());
					}
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
				logger.debug("...Exiting FIND operation");
			} else if (action.equals("check")) {
				logger.debug("Entering CHECK operation...");

				logger.debug("...Exiting CHECK operation");
			} else if (action.equals("getmetadata")) {
				logger.debug("Entering GETMETADATA operation...");

				logger.debug("...Exiting GETMETADATA operation");
			} else {
				response.setStatus(Status.CLIENT_ERROR_NOT_FOUND);
			}
			
			
			
//		String action = (String) request.getAttributes().get("action");
//
//		if (request.getMethod().equals(Method.POST)) {
//			if (action.equals("find")) {
//				logger.debug("Entering FIND operation...");
//				try {
//					Set<Screen> screenSet = new HashSet<Screen>();
//					// parse the input
//					JSONArray input = new JSONArray(request.getEntity().getText());
//					for (int i = 0; i < input.length(); i++)
//						screenSet.add(parseScreen((JSONObject)input.get(i), null));
//					
//					// make the call to the catalogue
//					Set<Screen> results = catalogue.find(screenSet, true, true, 0, 100000);
//					
//					// write the results in the output
//					JSONArray output = new JSONArray();
//					for (Iterator<Screen> it = results.iterator(); it.hasNext(); ) {
//						Screen s = it.next();
//						output.put(s.toJSON());
//						logger.debug("[MATCH] "+s.getUri());
//					}
//					response.setEntity(output.toString(2), MediaType.APPLICATION_JSON);
//					response.setStatus(Status.SUCCESS_OK);
//				} catch (JSONException e) {
//					// TODO Auto-generated catch block
//					e.printStackTrace();
//				} catch (IOException e) {
//					// TODO Auto-generated catch block
//					e.printStackTrace();
//				}
//				logger.debug("...Exiting FIND operation");
//			}
		} else {
			response.setStatus(Status.CLIENT_ERROR_METHOD_NOT_ALLOWED);
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
					tokens.nextToken(); // discards the .
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
