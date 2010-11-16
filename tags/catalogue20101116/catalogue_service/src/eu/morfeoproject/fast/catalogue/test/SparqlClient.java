package eu.morfeoproject.fast.catalogue.test;

import org.openrdf.query.MalformedQueryException;
import org.openrdf.query.QueryEvaluationException;
import org.openrdf.query.QueryLanguage;
import org.openrdf.query.TupleQuery;
import org.openrdf.query.TupleQueryResult;
import org.openrdf.repository.RepositoryConnection;
import org.openrdf.repository.RepositoryException;
import org.openrdf.repository.http.HTTPRepository;

public class SparqlClient {
	public SparqlClient() {
		
	}
	
	public void run() throws RepositoryException, MalformedQueryException, QueryEvaluationException {
		String endpointURL = "http://localhost:8880/openrdf-sesame";
		HTTPRepository dbpediaEndpoint = new HTTPRepository(endpointURL, "albert");
		dbpediaEndpoint.initialize();

		RepositoryConnection conn = 
		         dbpediaEndpoint.getConnection();
		try {
		  String sparqlQuery = 
		         " SELECT * WHERE {?x <http://www.w3.org/2000/01/rdf-schema#domain> <http://purl.oclc.org/fast/ontology/gadget#Resource>} ";
		  TupleQuery query = conn.prepareTupleQuery(QueryLanguage.SPARQL, sparqlQuery);
		  TupleQueryResult result = query.evaluate();

		  while (result.hasNext()) {
		      System.out.println(result.next().toString());
		  }
		}
		finally {
		  conn.close();
		}
	}
	
	public static void main(String []args) {
		try {
			new SparqlClient().run();
		} catch (RepositoryException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (MalformedQueryException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (QueryEvaluationException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
}
