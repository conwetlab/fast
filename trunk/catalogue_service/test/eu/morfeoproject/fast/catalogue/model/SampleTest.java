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
