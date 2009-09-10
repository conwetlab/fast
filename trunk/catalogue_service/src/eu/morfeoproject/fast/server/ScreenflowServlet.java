package eu.morfeoproject.fast.server;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Iterator;

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

import eu.morfeoproject.fast.catalogue.DuplicatedScreenFlowException;
import eu.morfeoproject.fast.catalogue.NotFoundException;
import eu.morfeoproject.fast.catalogue.OntologyInvalidException;
import eu.morfeoproject.fast.catalogue.OntologyReadonlyException;
import eu.morfeoproject.fast.model.ScreenFlow;
import eu.morfeoproject.fast.util.URLUTF8Encoder;

/**
 * Servlet implementation class ScreenServlet
 */
public class ScreenflowServlet extends GenericServlet {
	private static final long serialVersionUID = 1L;

	static Logger logger = LoggerFactory.getLogger(ScreenflowServlet.class);
    
    /**
     * @see HttpServlet#HttpServlet()
     */
    public ScreenflowServlet() {
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
		if (id.equalsIgnoreCase("screenflows")) id = null;
		
		if (id == null) {
			// List the members of the collection
			logger.info("Retrieving all screenflows");
			try {
				if (format.equals(MediaType.APPLICATION_RDF_XML)) {
					response.setContentType(MediaType.APPLICATION_RDF_XML);
					Model model = RDF2Go.getModelFactory().createModel();
					try {
						model.open();
						for (ScreenFlow sf : CatalogueAccessPoint.getCatalogue().listScreenFlows()) {
							Model sfModel = sf.createModel();
							for (String ns : sfModel.getNamespaces().keySet())
								model.setNamespace(ns, sfModel.getNamespace(ns));
							model.addModel(sfModel);
							sfModel.close();
						}
						model.writeTo(writer, Syntax.RdfXml);
					} catch (Exception e) {
						e.printStackTrace();
					} finally {
						model.close();
					}
				} else { //if (format.equals(MediaType.APPLICATION_JSON)) {
					response.setContentType(MediaType.APPLICATION_JSON);
					JSONArray screenflows = new JSONArray();
					for (ScreenFlow sf : CatalogueAccessPoint.getCatalogue().listScreenFlows())
						screenflows.put(sf.toJSON());
					writer.print(screenflows.toString(2));
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
			ScreenFlow sf = CatalogueAccessPoint.getCatalogue().getScreenFlow(new URIImpl(id));
			if (sf == null) {
				response.setStatus(HttpServletResponse.SC_NOT_FOUND, "The resource "+id+" has not been found.");
			} else {
				try {
					if (format.equals(MediaType.APPLICATION_JSON)) {
						response.setContentType(MediaType.APPLICATION_JSON);
						writer.print(sf.toJSON().toString(2));
					} else if (format.equals(MediaType.APPLICATION_RDF_XML)) {
						response.setContentType(MediaType.APPLICATION_RDF_XML);
						Model screenModel = sf.createModel();
						screenModel.writeTo(writer, Syntax.RdfXml);
						screenModel.close();
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
			ScreenFlow sf = parseScreenFlow(json, null);
			try {
				CatalogueAccessPoint.getCatalogue().addScreenFlow(sf);
				if (format.equals(MediaType.APPLICATION_RDF_XML)) {
					response.setContentType(MediaType.APPLICATION_RDF_XML);
					Model screenModel = sf.createModel();
					screenModel.writeTo(writer, Syntax.RdfXml);
					screenModel.close();
				} else {
					response.setContentType(MediaType.APPLICATION_JSON);
					JSONObject newScreen = sf.toJSON();						
					for (Iterator it = newScreen.keys(); it.hasNext(); ) {
						String key = it.next().toString();
						json.put(key, newScreen.get(key));
					}
					writer.print(json.toString(2));
				}
				response.setStatus(HttpServletResponse.SC_OK);
			} catch (DuplicatedScreenFlowException e) {
				e.printStackTrace();
				response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			} catch (OntologyInvalidException e) {
				e.printStackTrace();
				response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			} catch (OntologyReadonlyException e) {
				e.printStackTrace();
				response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			} catch (NotFoundException e) {
				e.printStackTrace();
				response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			}
		} catch (JSONException e) {
			e.printStackTrace();
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
		} catch (IOException e) {
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
				ScreenFlow sf = parseScreenFlow(json, new URIImpl(id));
				CatalogueAccessPoint.getCatalogue().updateScreenFlow(sf);
				if (format.equals(MediaType.APPLICATION_RDF_XML)) {
					response.setContentType(MediaType.APPLICATION_RDF_XML);
					Model screenModel = sf.createModel();
					screenModel.writeTo(writer, Syntax.RdfXml);
					screenModel.close();
				} else {
					response.setContentType(MediaType.APPLICATION_JSON);
					JSONObject newScreen = sf.toJSON();						
					for (Iterator it = newScreen.keys(); it.hasNext(); ) {
						String key = it.next().toString();
						json.put(key, newScreen.get(key));
					}
					writer.print(json.toString(2));
				}
				response.setStatus(HttpServletResponse.SC_OK);
			} catch (JSONException e) {
				e.printStackTrace();
				response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			} catch (IOException e) {
				e.printStackTrace();
				response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			} catch (NotFoundException e) {
				e.printStackTrace();
				response.setStatus(HttpServletResponse.SC_NOT_FOUND, "The resource "+id+" has not been found.");
			} catch (OntologyReadonlyException e) {
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
				CatalogueAccessPoint.getCatalogue().removeScreen(new URIImpl(id));
				response.setStatus(HttpServletResponse.SC_OK);
			} catch (NotFoundException e) {
				response.setStatus(HttpServletResponse.SC_NOT_FOUND, "The resource "+id+" has not been found.");
			}
		}
	}

}
