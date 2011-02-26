/**
 * Copyright (c) 2008-2011, FAST Consortium
 * 
 * This file is part of FAST Platform.
 * 
 * FAST Platform is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * FAST Platform is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 * or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public
 * License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with FAST Platform. If not, see <http://www.gnu.org/licenses/>.
 * 
 * Info about members and contributors of the FAST Consortium
 * is available at http://fast.morfeo-project.eu
 *
 **/
package eu.morfeoproject.fast.catalogue.services;

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
import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.model.node.impl.URIImpl;

import eu.morfeoproject.fast.catalogue.NotFoundException;
import eu.morfeoproject.fast.catalogue.model.BackendService;
import eu.morfeoproject.fast.catalogue.model.BuildingBlock;
import eu.morfeoproject.fast.catalogue.model.Concept;
import eu.morfeoproject.fast.catalogue.model.Form;
import eu.morfeoproject.fast.catalogue.model.Operator;
import eu.morfeoproject.fast.catalogue.model.Screen;
import eu.morfeoproject.fast.catalogue.model.ScreenFlow;

/**
 * Servlet implementation class MetadataServlet
 */
public class MetadataServlet extends GenericServlet {
	private static final long serialVersionUID = 1L;

    /**
     * @see HttpServlet#HttpServlet()
     */
    public MetadataServlet() {
        super();
    }
    
	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		BufferedReader reader = request.getReader();
		PrintWriter writer = response.getWriter();
		StringBuffer buffer = new StringBuffer();
		String line = reader.readLine();
		while (line != null) {
			buffer.append(line);
			line = reader.readLine();
		}
		String body = buffer.toString();
		
		try {
			// read and process the JSON input 
			JSONArray input = new JSONArray(body);
			JSONArray arrayScreenflows = new JSONArray();
			JSONArray arrayScreens = new JSONArray();
			JSONArray arrayForms = new JSONArray();
			JSONArray arrayOperators = new JSONArray();
			JSONArray arrayBackendServices = new JSONArray();
			JSONArray arrayClasses = new JSONArray();
			
			for (int i = 0; i < input.length(); i++) {
				URI uri = new URIImpl(input.getString(i));
				try {
					BuildingBlock bb = getCatalogue().getBuildingBlock(uri);
					if (bb == null) {
						Concept concept = getCatalogue().getConcept(uri);
						if (concept != null) arrayClasses.put(concept.toJSON());
					} else if (bb instanceof ScreenFlow)	arrayScreenflows.put(bb.toJSON());
					else if (bb instanceof Screen)			arrayScreens.put(bb.toJSON());
					else if (bb instanceof Form)			arrayForms.put(bb.toJSON());
					else if (bb instanceof Operator)		arrayOperators.put(bb.toJSON());
					else if (bb instanceof BackendService)	arrayBackendServices.put(bb.toJSON());
				} catch (NotFoundException e) {
					log.error(e.toString(), e);
				}
			}
			
			// create the JSON output
			JSONObject output = new JSONObject();
			if (arrayScreenflows.length() > 0)
				output.put("screenflows", arrayScreenflows);
			if (arrayScreens.length() > 0)
				output.put("screens", arrayScreens);
			if (arrayForms.length() > 0)
				output.put("forms", arrayForms);
			if (arrayOperators.length() > 0)
				output.put("operators", arrayOperators);
			if (arrayBackendServices.length() > 0)
				output.put("backendservices", arrayBackendServices);
			if (arrayClasses.length() > 0)
				output.put("classes", arrayClasses);
			
			writer.print(output.toString(2));
			response.setContentType(MediaType.APPLICATION_JSON);
			response.setStatus(HttpServletResponse.SC_OK);
		} catch (JSONException e) {
			log.error(e.toString(), e);
			response.sendError(HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
		}
	}

}
