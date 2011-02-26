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
package eu.morfeoproject.fast.catalogue.model;

import static org.junit.Assert.assertTrue;

import org.junit.Before;
import org.junit.Test;
import org.ontoware.rdf2go.model.node.impl.URIImpl;

import eu.morfeoproject.fast.util.TestUtils;

public class ImportOntologiesTest {

	@Before
	public void setup() throws Exception {
        TestUtils.getCatalogue().clear();
	}
	
	@Test
	public void importMissingOntology() throws Exception {
		Form f1 = (Form) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "form", "data/json/forms/travelRequest.json");
		TestUtils.getCatalogue().addForm(f1);
		assertTrue(TestUtils.getCatalogue().getAllOntologies().contains(new URIImpl("http://vocab.deri.ie/travel")));
	}
	
}
