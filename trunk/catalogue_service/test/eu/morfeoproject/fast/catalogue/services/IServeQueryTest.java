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

import static org.junit.Assert.assertTrue;

import java.util.ArrayList;
import java.util.Collection;

import org.junit.Test;
import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.model.node.impl.URIImpl;

import uk.ac.open.kmi.iserve.IServeClient;
import uk.ac.open.kmi.iserve.IServeConfiguration;
import uk.ac.open.kmi.iserve.IServeResponse;


public class IServeQueryTest {

	@Test
	public void Query1() throws Exception {
		IServeClient client = new IServeClient(new IServeConfiguration("iserve.properties"));
		ArrayList<URI> list = new ArrayList<URI>();
		list.add(new URIImpl("http://xmlns.com/foaf/0.1/Person"));
		Collection<IServeResponse> results = client.query(list);
		assertTrue(results.size() > 0);
	}

	@Test
	public void Query2() throws Exception {
		IServeClient client = new IServeClient(new IServeConfiguration("iserve.properties"));
		ArrayList<URI> list = new ArrayList<URI>();
		list.add(new URIImpl("http://www.eyrie.org/%7Ezednenem/2002/rdfchannel#Channel"));
		list.add(new URIImpl("http://coconut.tie.nl:8080/storage/repositories/wp7-ontologies/files/wp7-sap-m33-eval-ontology#Country"));
		Collection<IServeResponse> results = client.query(list);
		assertTrue(results.size() > 0);
	}

}
