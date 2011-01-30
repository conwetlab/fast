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
