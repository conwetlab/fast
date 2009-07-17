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
import eu.morfeoproject.fast.model.Event;
import eu.morfeoproject.fast.util.URLUTF8Encoder;

/**
 * Servlet implementation class EventServlet
 */
public class EventServlet extends GenericServlet {
	private static final long serialVersionUID = 1L;

	static Logger logger = LoggerFactory.getLogger(EventServlet.class);
    
    /**
     * @see HttpServlet#HttpServlet()
     */
    public EventServlet() {
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
		if (id.equalsIgnoreCase("events")) id = null;
		
		if (id == null) {
			// List the members of the collection
			logger.info("Retrieving all events");
			try {
				if (format.equals(MediaType.APPLICATION_RDF_XML)) {
					response.setContentType(MediaType.APPLICATION_RDF_XML);
					Model model = RDF2Go.getModelFactory().createModel();
					try {
						model.open();
						for (Event ev : CatalogueAccessPoint.getCatalogue().listEvents()) {
							Model eventModel = ev.createModel();
							for (String ns : eventModel.getNamespaces().keySet())
								model.setNamespace(ns, eventModel.getNamespace(ns));
							model.addModel(eventModel);
							eventModel.close();
						}
						model.writeTo(writer, Syntax.RdfXml);
					} catch (Exception e) {
						e.printStackTrace();
					} finally {
						model.close();
					}
				} else { //if (format.equals(MediaType.APPLICATION_JSON)) {
					response.setContentType(MediaType.APPLICATION_JSON);
					JSONArray events = new JSONArray();
					for (Event ev : CatalogueAccessPoint.getCatalogue().listEvents())
						events.put(ev.toJSON());
					writer.print(events.toString(2));
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
			Event ev = CatalogueAccessPoint.getCatalogue().getEvent(new URIImpl(id));
			if (ev == null) {
				response.setStatus(HttpServletResponse.SC_NOT_FOUND, "The resource "+id+" has not been found.");
			} else {
				try {
					if (format.equals(MediaType.APPLICATION_JSON)) {
						response.setContentType(MediaType.APPLICATION_JSON);
						writer.print(ev.toJSON().toString(2));
					} else if (format.equals(MediaType.APPLICATION_RDF_XML)) {
						response.setContentType(MediaType.APPLICATION_RDF_XML);
						Model eventModel = ev.createModel();
						eventModel.writeTo(writer, Syntax.RdfXml);
						eventModel.close();
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
			Event event = parseEvent(json, null);
			try {
				CatalogueAccessPoint.getCatalogue().addSlotOrEvent(event);
				if (format.equals(MediaType.APPLICATION_RDF_XML)) {
					response.setContentType(MediaType.APPLICATION_RDF_XML);
					Model eventModel = event.createModel();
					eventModel.writeTo(writer, Syntax.RdfXml);
					eventModel.close();
				} else {
					response.setContentType(MediaType.APPLICATION_JSON);
					writer.print(event.toJSON().toString(2));
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
				Event event = parseEvent(json, null);
				try {
					CatalogueAccessPoint.getCatalogue().updateSlotOrEvent(event);
					if (format.equals(MediaType.APPLICATION_RDF_XML)) {
						response.setContentType(MediaType.APPLICATION_RDF_XML);
						Model eventModel = event.createModel();
						eventModel.writeTo(writer, Syntax.RdfXml);
						eventModel.close();
					} else {
						response.setContentType(MediaType.APPLICATION_JSON);
						writer.print(event.toJSON().toString(2));
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
				CatalogueAccessPoint.getCatalogue().removeSlotOrEvent(new URIImpl(id));
				response.setStatus(HttpServletResponse.SC_OK);
			} catch (NotFoundException e) {
				response.setStatus(HttpServletResponse.SC_NOT_FOUND, "The resource "+id+" has not been found.");
			}
		}
	}

}
