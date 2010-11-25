package eu.morfeoproject.fast.catalogue.buildingblocks;

import static org.junit.Assert.assertTrue;

import org.junit.Before;
import org.junit.Test;

import eu.morfeoproject.fast.util.TestUtils;

public class ImportOntologiesTest {

	@Before
	public void setup() throws Exception {
        TestUtils.getCatalogue().clear();
	}
	
	@Test
	public void importMissingOntology() throws Exception {
		// TODO do a proper test
		assertTrue(true);
	}
	
}
