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

import static org.junit.Assert.assertEquals;

import org.json.JSONObject;
import org.junit.Before;
import org.junit.Test;
import org.ontoware.rdf2go.model.node.URI;

import eu.morfeoproject.fast.catalogue.builder.SampleJSONBuilder;
import eu.morfeoproject.fast.catalogue.model.Sample;
import eu.morfeoproject.fast.catalogue.util.Util;
import eu.morfeoproject.fast.util.TestUtils;

public class SampleTest {


	@Before
	public void setup() throws Exception {
        TestUtils.getCatalogue().clear();
	}
	
	@Test
	public void createSample() throws Exception {
		JSONObject json = new JSONObject(Util.getFileContentAsString("data/json/samples/sample1.json"));
		Sample s1 = SampleJSONBuilder.buildSample(json);
		TestUtils.getCatalogue().addSample(s1);
		Sample s2 = TestUtils.getCatalogue().getSample(s1.getUri());
		assertEquals(s1, s2);
		assertEquals(s1.getType(), s2.getType());
		assertEquals(2, s2.toJSON().getJSONArray("properties").length());
	}
	
	@Test
	public void deleteSample() throws Exception {
		JSONObject json = new JSONObject(Util.getFileContentAsString("data/json/samples/sample1.json"));
		URI uri = TestUtils.getCatalogue().addSample(SampleJSONBuilder.buildSample(json)).getUri();
		TestUtils.getCatalogue().removeSample(uri);
		Sample s2 = TestUtils.getCatalogue().getSample(uri);
		assertEquals(s2, null);
	}
	
}
