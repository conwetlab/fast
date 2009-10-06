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
import org.ontoware.rdf2go.RDF2Go;
import org.ontoware.rdf2go.model.Model;
import org.ontoware.rdf2go.model.Syntax;
import org.ontoware.rdf2go.model.node.impl.URIImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import eu.morfeoproject.fast.catalogue.NotFoundException;
import eu.morfeoproject.fast.model.Postcondition;
import eu.morfeoproject.fast.util.URLUTF8Encoder;

/**
 * Servlet implementation class PostconditionServlet
 */
public class PostconditionServlet extends GenericServlet {
	private static final long serialVersionUID = 1L;

	static Logger logger = LoggerFactory.getLogger(PostconditionServlet.class);
    
    /**
     * @see HttpServlet#HttpServlet()
     */
    public PostconditionServlet() {
        super();
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		PrintWriter writer = response.getWriter();
		String format = request.getHeader("accept") != null ? request.getHeader("accept") : MediaType.APPLICATION_JSON;
		String[] chunks = request.getRequestURI().split("/");
		String id = chunks[chunks.length-1];
		if (id.equalsIgnoreCase("postconditions")) id = null;
		
		if (id == null) {
			// List the members of the collection
			logger.info("Retrieving all postconditions");
			try {
				if (format.equals(MediaType.APPLICATION_RDF_XML)) {
					response.setContentType(MediaType.APPLICATION_RDF_XML);
					Model model = RDF2Go.getModelFactory().createModel();
					try {
						model.open();
						for (Postcondition ev : CatalogueAccessPoint.getCatalogue().listPostconditions()) {
							Model postModel = ev.createModel();
							for (String ns : postModel.getNamespaces().keySet())
								model.setNamespace(ns, postModel.getNamespace(ns));
							model.addModel(postModel);
							postModel.close();
						}
						model.writeTo(writer, Syntax.RdfXml);
					} catch (Exception e) {
						e.printStackTrace();
					} finally {
						model.close();
					}
				} else { //if (format.equals(MediaType.APPLICATION_JSON)) {
					response.setContentType(MediaType.APPLICATION_JSON);
					JSONArray posts = new JSONArray();
					for (Postcondition ev : CatalogueAccessPoint.getCatalogue().listPostconditions())
						posts.put(ev.toJSON());
					writer.print(posts.toString(2));
				}
				response.setStatus(HttpServletResponse.SC_OK);
			} catch (JSONException e) {
				e.printStackTrace();
				response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			}
		} else {
			// Retrieve the addressed member of the collection
			id = URLUTF8Encoder.decode(id);
			logger.info("Retrieving screen "+id);
			Postcondition ev = CatalogueAccessPoint.getCatalogue().getPostcondition(new URIImpl(id));
			if (ev == null) {
				response.setStatus(HttpServletResponse.SC_NOT_FOUND, "The resource "+id+" has not been found.");
			} else {
				try {
					if (format.equals(MediaType.APPLICATION_JSON)) {
						response.setContentType(MediaType.APPLICATION_JSON);
						writer.print(ev.toJSON().toString(2));
					} else if (format.equals(MediaType.APPLICATION_RDF_XML)) {
						response.setContentType(MediaType.APPLICATION_RDF_XML);
						Model postModel = ev.createModel();
						postModel.writeTo(writer, Syntax.RdfXml);
						postModel.close();
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
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
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

		// Create a new entry in the collection where the ID is assigned automatically by 
		// the collection and it is returned.
		try {
			JSONObject json = new JSONObject(body);
			Postcondition post = parsePostcondition(json, null);
			try {
				CatalogueAccessPoint.getCatalogue().addPreOrPost(post);
				if (format.equals(MediaType.APPLICATION_RDF_XML)) {
					response.setContentType(MediaType.APPLICATION_RDF_XML);
					Model postModel = post.createModel();
					postModel.writeTo(writer, Syntax.RdfXml);
					postModel.close();
				} else {
					response.setContentType(MediaType.APPLICATION_JSON);
					writer.print(post.toJSON().toString(2));
				}
				response.setStatus(HttpServletResponse.SC_OK);
			} catch (Exception e) {
				e.printStackTrace();
				response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			}
		} catch (JSONException e) {
			e.printStackTrace();
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
		}	
	}

	/**
	 * @see HttpServlet#doPut(HttpServletRequest, HttpServletResponse)
	 */
	protected void doPut(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		BufferedReader reader = request.getReader();
		PrintWriter writer = response.getWriter();
		String format = request.getHeader("accept") != null ? request.getHeader("accept") : MediaType.APPLICATION_JSON;
		String[] chunks = request.getRequestURI().split("/");
		String id = chunks[chunks.length-1];
		if (id.equalsIgnoreCase("screens")) id = null;
		StringBuffer buffer = new StringBuffer();
		String line = reader.readLine();
		while (line != null) {
			buffer.append(line);
			line = reader.readLine();
		}
		String body = buffer.toString();
		
		if (id == null) {
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
		} else {
			// Update the addressed member of the collection or create it with a defined ID.
			id = URLUTF8Encoder.decode(id);
			try {
				JSONObject json = new JSONObject(body);
				Postcondition post = parsePostcondition(json, null);
				try {
					CatalogueAccessPoint.getCatalogue().updatePreOrPost(post);
					if (format.equals(MediaType.APPLICATION_RDF_XML)) {
						response.setContentType(MediaType.APPLICATION_RDF_XML);
						Model postModel = post.createModel();
						postModel.writeTo(writer, Syntax.RdfXml);
						postModel.close();
					} else {
						response.setContentType(MediaType.APPLICATION_JSON);
						writer.print(post.toJSON().toString(2));
					}
					response.setStatus(HttpServletResponse.SC_OK);
				} catch (Exception e) {
					e.printStackTrace();
					response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
				}
			} catch (JSONException e) {
				e.printStackTrace();
				response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			}
		}
	}

	/**
	 * @see HttpServlet#doDelete(HttpServletRequest, HttpServletResponse)
	 */
	protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String[] chunks = request.getRequestURI().split("/");
		String id = chunks[chunks.length-1];
		if (id.equalsIgnoreCase("screens")) id = null;
		
		if (id == null) {
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
		} else {
			// Delete the addressed member of the collection.
			id = URLUTF8Encoder.decode(id);
			try {
				CatalogueAccessPoint.getCatalogue().removePreOrPost(new URIImpl(id));
				response.setStatus(HttpServletResponse.SC_OK);
			} catch (NotFoundException e) {
				response.setStatus(HttpServletResponse.SC_NOT_FOUND, "The resource "+id+" has not been found.");
			}
		}
	}

}
