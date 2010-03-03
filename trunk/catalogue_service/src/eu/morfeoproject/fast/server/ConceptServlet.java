package eu.morfeoproject.fast.server;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.Set;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.ontoware.rdf2go.RDF2Go;
import org.ontoware.rdf2go.model.Model;
import org.ontoware.rdf2go.model.Statement;
import org.ontoware.rdf2go.model.Syntax;
import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.model.node.impl.URIImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import eu.morfeoproject.fast.model.CTag;
import eu.morfeoproject.fast.model.Concept;
import eu.morfeoproject.fast.util.DateFormatter;
import eu.morfeoproject.fast.util.URLUTF8Encoder;

/**
 * Servlet implementation class ConceptServlet
 */
public class ConceptServlet extends GenericServlet {
	private static final long serialVersionUID = 1L;

	static Logger logger = LoggerFactory.getLogger(ConceptServlet.class);
    
    /**
     * @see HttpServlet#HttpServlet()
     */
    public ConceptServlet() {
        super();
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 * To retrieve all the concepts: /concepts
	 * To retrieve a specific concept: /concepts/<uri>
	 * To retrieve all the concepts annotated with some tag: /tags/<tag1>+...+<tagN>/concepts
	 * Doesn't make sense to retrieve a concept with a certain id
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		PrintWriter writer = response.getWriter();
		String format = request.getHeader("accept") != null ? request.getHeader("accept") : MediaType.APPLICATION_JSON;
		String[] chunks = request.getRequestURI().split("/");
		String id = chunks[chunks.length-1];
		if (id.equalsIgnoreCase("concepts")) id = null;
		String[] tags = null;
		if (chunks[chunks.length-3].equalsIgnoreCase("tags"))
			tags = splitTags(chunks[chunks.length-2]);
		
		if (id == null) {
			// List the members of the collection
			logger.info("Retrieving all concepts");
			try {
				if (format.equals(MediaType.APPLICATION_RDF_XML) ||
						format.equals(MediaType.APPLICATION_TURTLE)) {
					response.setContentType(format);
					Model model = RDF2Go.getModelFactory().createModel();
					model.open();
					for (URI uri : CatalogueAccessPoint.getCatalogue().listConcepts(tags)) {
						Concept concept = CatalogueAccessPoint.getCatalogue().getConcept(uri);
						model.addModel(concept.createModel());
					}
					model.writeTo(writer, Syntax.forMimeType(format));
					model.close();
				} else {
					response.setContentType(MediaType.APPLICATION_JSON);
					JSONArray concepts = new JSONArray();
					for (URI uri : CatalogueAccessPoint.getCatalogue().listConcepts(tags)) {
						Concept concept = CatalogueAccessPoint.getCatalogue().getConcept(uri);
						concepts.put(concept.toJSON());
					}
					writer.print(concepts.toString(2));
				}
				response.setStatus(HttpServletResponse.SC_OK);
			} catch (JSONException e) {
				e.printStackTrace();
				response.sendError(HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
			}
		}
		writer.close();
	}

	/**
	 * Adds the information given to a certain concept. If the concepts does not exist, it will
	 * create it.
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		BufferedReader reader = request.getReader();
		String[] chunks = request.getRequestURI().split("/");
		String id = chunks[chunks.length-1];
		StringBuffer buffer = new StringBuffer();
		String line = reader.readLine();
		while (line != null) {
			buffer.append(line);
			line = reader.readLine();
		}
		String body = buffer.toString();
		
		try {
			JSONObject json = new JSONObject(body);
			if (json.has("uri")) {
				URI uri = new URIImpl(json.getString("uri"));
				if (json.has("subClassOf"))
					CatalogueAccessPoint.getCatalogue().createClass(uri, new URIImpl(json.getString("subClassOf")));
				else
					CatalogueAccessPoint.getCatalogue().createClass(uri);

				if (json.has("label")) {
					JSONObject jsonLabels = json.getJSONObject("label");
					Iterator<String> labels = jsonLabels.keys();
					for ( ; labels.hasNext(); ) {
						String key = labels.next();
						CatalogueAccessPoint.getCatalogue().setLabel(uri, key, jsonLabels.getString(key));
					}
				}
				if (json.has("description")) {
					JSONObject jsonDescriptions = json.getJSONObject("description");
					Iterator<String> descriptions = jsonDescriptions.keys();
					for ( ; descriptions.hasNext(); ) {
						String key = descriptions.next();
						CatalogueAccessPoint.getCatalogue().setDescription(uri, key, jsonDescriptions.getString(key));
					}
				}
				if (json.has("tags")) {
					JSONArray aTag = json.getJSONArray("tags");
					for (int i = 0; i < aTag.length(); i++) {
						CTag tag = new CTag();
						JSONObject oTag = aTag.getJSONObject(i);
						if (oTag.has("means") && !oTag.isNull("means") && oTag.getString("means") != "")
							tag.setMeans(new URIImpl(oTag.getString("means")));
						if (oTag.has("label")){
							JSONObject jsonLabels = oTag.getJSONObject("label");
							Iterator<String> labels = jsonLabels.keys();
							for ( ; labels.hasNext(); ) {
								String key = labels.next();
								tag.getLabels().put(key, jsonLabels.getString(key));
							}
						}
						if (oTag.has("taggingDate") && !oTag.isNull("taggingDate") && oTag.getString("taggingDate") != "")
							tag.setTaggingDate(DateFormatter.parseDateISO8601(oTag.getString("taggingDate")));
						CatalogueAccessPoint.getCatalogue().setTag(uri, tag);
					}
				}				
				response.setStatus(HttpServletResponse.SC_OK);
			} else {
				response.sendError(HttpServletResponse.SC_BAD_REQUEST, "URI is required.");
			}
		} catch (JSONException e) {
			e.printStackTrace();
		}
	}

	/**
	 * Update the information about a concept. "Update" means the concept will be deleted and created again with
	 * the new information. If the concept does not exist it will be created.
	 * @see HttpServlet#doPut(HttpServletRequest, HttpServletResponse)
	 */
//	protected void doPut(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
//		BufferedReader reader = request.getReader();
//		String[] chunks = request.getRequestURI().split("/");
//		String id = chunks[chunks.length-1];
//		StringBuffer body = new StringBuffer();
//		String line = reader.readLine();
//		while (line != null) {
//			body.append(line);
//			line = reader.readLine();
//		}
//		
//		if (id != null) {
//			id = URLUTF8Encoder.decode(id);
//			try {
//				CatalogueAccessPoint.getCatalogue().removeConcept(new URIImpl(id));
//			} catch (NotFoundException e) {}
//			try {
//				JSONObject json = new JSONObject(body.toString());
//				for (String key : JSONObject.getNames(json)) {
//					Object object = json.get(key);
//					if (object instanceof JSONArray) {
//						JSONArray array = (JSONArray)object;
//						for (int idx = 0; idx < array.length(); idx++) {
//							try {
//								CatalogueAccessPoint.getCatalogue().getTripleStore().addStatement(new URIImpl(id), new URIImpl(key), new URIImpl(array.get(idx).toString()));
//							} catch(IllegalArgumentException e) {
//								CatalogueAccessPoint.getCatalogue().getTripleStore().addStatement(new URIImpl(id), new URIImpl(key), array.get(idx).toString());
//							}
//						}
//					} else if (object instanceof JSONObject) {
//						// do nothing
//					} else {
//						try {
//							CatalogueAccessPoint.getCatalogue().getTripleStore().addStatement(new URIImpl(id), new URIImpl(key), new URIImpl(json.get(key).toString()));
//						} catch(IllegalArgumentException e) {
//							CatalogueAccessPoint.getCatalogue().getTripleStore().addStatement(new URIImpl(id), new URIImpl(key), json.get(key).toString());
//						}
//					}
//				}
//				response.setStatus(HttpServletResponse.SC_OK);
//			} catch (JSONException e) {
//				e.printStackTrace();
//			}
//		} else {
//			response.sendError(HttpServletResponse.SC_BAD_REQUEST, "An ID must be specified.");
//		}
//	}

	/**
	 * @see HttpServlet#doDelete(HttpServletRequest, HttpServletResponse)
	 */
//	protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
//		String[] chunks = request.getRequestURI().split("/");
//		String id = chunks[chunks.length-1];
//		
//		if (id != null) {
//			id = URLUTF8Encoder.decode(id);
//			try {
//				CatalogueAccessPoint.getCatalogue().removeConcept(new URIImpl(id));
//				response.setStatus(HttpServletResponse.SC_OK);
//			} catch (NotFoundException e) {
//				response.sendError(HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
//			}
//		}
//	}
	
	/**
	 * Transform a string of tags into an array. The tags are
	 * separated by +. Example: amazon+shopping
	 * @param tagsStr
	 * @return an array of tags
	 */
	private String [] splitTags(String tagsStr) {
		String [] tags = null;
		if (tagsStr == null)
			return new String[0];
		else if (tagsStr.contains("+")) {
			//tags = tagsStr.split("+"); throws an exception!!
			ArrayList<String> tmp = new ArrayList<String>();
			int from = 0;
			int to = tagsStr.indexOf("+");
			while (to != -1) {
				tmp.add(tagsStr.substring(from, to));
				from = to + 1;
				to = tagsStr.indexOf("+", from);
			}
			tmp.add(tagsStr.substring(from, tagsStr.length()));
			tags = new String[tmp.size()];
			tags = tmp.toArray(tags);
		} else {
			tags = new String[1];
			tags[0] = tagsStr;
		}
		return tags;
	}
	
}
