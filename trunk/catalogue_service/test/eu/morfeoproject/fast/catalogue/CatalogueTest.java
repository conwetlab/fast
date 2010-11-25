package eu.morfeoproject.fast.catalogue;

import static org.junit.Assert.assertTrue;

import org.junit.Before;
import org.junit.Test;

import eu.morfeoproject.fast.util.TestUtils;

public class CatalogueTest {

	@Before
	public void setup() throws Exception {
        TestUtils.getCatalogue().clear();
	}
	
	@Test	
	public void check() {
		assertTrue(TestUtils.getCatalogue().check()); 
	}
	
}
