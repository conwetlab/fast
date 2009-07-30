package eu.morfeoproject.fast.server;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
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

import eu.morfeoproject.fast.catalogue.NotFoundException;
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
		String[] tags = new String[0];
		
		if (id.equalsIgnoreCase("concepts") && chunks[chunks.length-3].equalsIgnoreCase("tags")) {
			if (chunks[chunks.length-2].contains("+"))
				tags = chunks[chunks.length-2].split("+");
			else {
				tags = new String[1];
				tags[0] = chunks[chunks.length-2];
			}
			id = null;
		} else if (id.equalsIgnoreCase("concepts")) {
			id = null;
		} else {
			id = URLUTF8Encoder.decode(id);
		}
		
		if (id == null) {
			// List the members of the collection
			logger.info("Retrieving all concepts");
			try {
				if (format.equals(MediaType.APPLICATION_JSON)) {
					response.setContentType(MediaType.APPLICATION_JSON);
					JSONArray concepts = new JSONArray();
					for (URI uri : CatalogueAccessPoint.getCatalogue().listConcepts(tags)) {
						Set<Statement> conceptStmt = CatalogueAccessPoint.getCatalogue().getConcept(uri);
						if (conceptStmt != null && conceptStmt.size() > 0) {
							JSONObject concept = statements2JSON(conceptStmt);
							concept.accumulate("uri", uri);
							concepts.put(concept);
						}
					}
					writer.print(concepts.toString(2));
				} else if (format.equals(MediaType.APPLICATION_RDF_XML)) {
					response.setContentType(MediaType.APPLICATION_RDF_XML);
					Model model = RDF2Go.getModelFactory().createModel();
					model.open();
					for (URI uri : CatalogueAccessPoint.getCatalogue().listConcepts(tags)) {
						Set<Statement> concept = CatalogueAccessPoint.getCatalogue().getConcept(uri);
						model.addAll(concept.iterator());
					}
					model.writeTo(writer, Syntax.RdfXml);
					model.close();
				}
				response.setStatus(HttpServletResponse.SC_OK);
			} catch (JSONException e) {
				e.printStackTrace();
				response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			}
		} else {
			// Retrieve the addressed member of the collection
			logger.info("Retrieving concept "+id);
			Set<Statement> concept = CatalogueAccessPoint.getCatalogue().getConcept(new URIImpl(id));
			if (concept == null || concept.size() == 0) {
				response.setStatus(HttpServletResponse.SC_NOT_FOUND, "The resource "+id+" has not been found.");
			} else {
				try {
					if (format.equals(MediaType.APPLICATION_JSON)) {
						response.setContentType(MediaType.APPLICATION_JSON);
						writer.print(statements2JSON(concept).toString(2));
					} else if (format.equals(MediaType.APPLICATION_RDF_XML)) {
						response.setContentType(MediaType.APPLICATION_RDF_XML);
						Model model = RDF2Go.getModelFactory().createModel();
						model.open();
						model.addAll(concept.iterator());
						model.writeTo(writer, Syntax.RdfXml);
						model.close();
					}				
					response.setStatus(HttpServletResponse.SC_OK);
				} catch (JSONException e) {
					e.printStackTrace();
					response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
				}
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
		
		if (id != null) {
			id = URLUTF8Encoder.decode(id);
			try {
				JSONObject json = new JSONObject(body);
				for (String key : JSONObject.getNames(json)) {
					Object object = json.get(key);
					if (object instanceof JSONArray) {
						JSONArray array = (JSONArray)object;
						for (int idx = 0; idx < array.length(); idx++) {
							try {
								CatalogueAccessPoint.getCatalogue().getTripleStore().addStatement(new URIImpl(id), new URIImpl(key), new URIImpl(array.get(idx).toString()));
							} catch(IllegalArgumentException e) {
								CatalogueAccessPoint.getCatalogue().getTripleStore().addStatement(new URIImpl(id), new URIImpl(key), array.get(idx).toString());
							}
						}
					} else if (object instanceof JSONObject) {
						// do nothing
					} else {
						try {
							CatalogueAccessPoint.getCatalogue().getTripleStore().addStatement(new URIImpl(id), new URIImpl(key), new URIImpl(json.get(key).toString()));
						} catch(IllegalArgumentException e) {
							CatalogueAccessPoint.getCatalogue().getTripleStore().addStatement(new URIImpl(id), new URIImpl(key), json.get(key).toString());
						}
					}
				}
				response.setStatus(HttpServletResponse.SC_OK);
			} catch (JSONException e) {
				e.printStackTrace();
			}
		} else {
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
		}
		CatalogueAccessPoint.getCatalogue().printStatements();
	}

	/**
	 * Update the information about a concept. "Update" means the concept will be deleted and created again with
	 * the new information. If the concept does not exist it will be created.
	 * @see HttpServlet#doPut(HttpServletRequest, HttpServletResponse)
	 */
	protected void doPut(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		BufferedReader reader = request.getReader();
		String[] chunks = request.getRequestURI().split("/");
		String id = chunks[chunks.length-1];
		StringBuffer body = new StringBuffer();
		String line = reader.readLine();
		while (line != null) {
			body.append(line);
			line = reader.readLine();
		}
		
		if (id != null) {
			id = URLUTF8Encoder.decode(id);
			try {
				CatalogueAccessPoint.getCatalogue().removeConcept(new URIImpl(id));
			} catch (NotFoundException e) {}
			try {
				JSONObject json = new JSONObject(body.toString());
				for (String key : JSONObject.getNames(json)) {
					Object object = json.get(key);
					if (object instanceof JSONArray) {
						JSONArray array = (JSONArray)object;
						for (int idx = 0; idx < array.length(); idx++) {
							try {
								CatalogueAccessPoint.getCatalogue().getTripleStore().addStatement(new URIImpl(id), new URIImpl(key), new URIImpl(array.get(idx).toString()));
							} catch(IllegalArgumentException e) {
								CatalogueAccessPoint.getCatalogue().getTripleStore().addStatement(new URIImpl(id), new URIImpl(key), array.get(idx).toString());
							}
						}
					} else if (object instanceof JSONObject) {
						// do nothing
					} else {
						try {
							CatalogueAccessPoint.getCatalogue().getTripleStore().addStatement(new URIImpl(id), new URIImpl(key), new URIImpl(json.get(key).toString()));
						} catch(IllegalArgumentException e) {
							CatalogueAccessPoint.getCatalogue().getTripleStore().addStatement(new URIImpl(id), new URIImpl(key), json.get(key).toString());
						}
					}
				}
				response.setStatus(HttpServletResponse.SC_OK);
			} catch (JSONException e) {
				e.printStackTrace();
			}
		} else {
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
		}
		CatalogueAccessPoint.getCatalogue().printStatements();
	}

	/**
	 * @see HttpServlet#doDelete(HttpServletRequest, HttpServletResponse)
	 */
	protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String[] chunks = request.getRequestURI().split("/");
		String id = chunks[chunks.length-1];
		
		if (id != null) {
			id = URLUTF8Encoder.decode(id);
			try {
				CatalogueAccessPoint.getCatalogue().removeConcept(new URIImpl(id));
				response.setStatus(HttpServletResponse.SC_OK);
			} catch (NotFoundException e) {
				response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			}
		}
	}
}
