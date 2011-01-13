package eu.morfeoproject.fast.catalogue.services;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import java.util.ArrayList;
import java.util.List;

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
		List<IServeResponse> results = client.query(list);
		assertTrue(results.size() > 0);
	}

	@Test
	public void Query2() throws Exception {
		IServeClient client = new IServeClient(new IServeConfiguration("iserve.properties"));
		ArrayList<URI> list = new ArrayList<URI>();
		list.add(new URIImpl("http://www.eyrie.org/%7Ezednenem/2002/rdfchannel#Channel"));
		list.add(new URIImpl("http://coconut.tie.nl:8080/storage/repositories/wp7-ontologies/files/wp7-sap-m33-eval-ontology#Country"));
		List<IServeResponse> results = client.query(list);
		assertTrue(results.size() > 0);
	}

}
