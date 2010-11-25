package eu.morfeoproject.fast.catalogue.ontologies;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.model.node.impl.URIImpl;

import com.sindice.Sindice;
import com.sindice.SindiceException;
import com.sindice.query.CacheQuery;
import com.sindice.result.CacheResult;

import eu.morfeoproject.fast.catalogue.cache.Cacheable;

public class SindiceOntologyFinder extends Cacheable<URI> implements OntologyFinder {

	protected final Log log = LogFactory.getLog(SindiceOntologyFinder.class);

	private Sindice sindice = new Sindice();
	
	/**
	 * Finds an ontology URI for a given URI such a Class, Property or anything
	 * related to such an ontology.
	 * It uses the Sindice Cache API, loops over the triple-alike results looking
	 * for a triple containing <http://www.w3.org/2002/07/owl#Ontology> which
	 * probably is the ontology URI we look for.
	 * @param uri the URI we want to find out its ontology
	 * @return the ontology URI
	 */
	public URI find(URI uri) {
		URI result = cache.get(uri.toString());
		if (result != null) {
			if (log.isInfoEnabled()) log.info("Found in cache: " + uri + " belongs to " + result);
			return result;
		}
		
		// ontology URI is not in cache, we have to look up in sindice service
		try {
			if (log.isInfoEnabled()) log.info("Querying Sindice for: " + uri);
			CacheQuery query = new CacheQuery(uri.toString());
			CacheResult cacheResult = sindice.cacheQuery(query);
			for (String triple : cacheResult.getExplicitContent()) {
				if (triple.contains("<http://www.w3.org/2002/07/owl#Ontology>")) {
					int begin = triple.indexOf('<');
					int end = triple.indexOf('>');
					if (begin == -1 || end == -1) {
						log.warn("Could not find ontology URI in: " + triple);
						return null;
					}
					result = new URIImpl(triple.substring(begin + 1, end));
					cache.put(uri.toString(), result);
					if (log.isInfoEnabled()) log.info("Sindice returned ontology URI " + result + " for " + uri);
					return result;
				}
			}
		} catch (SindiceException e) {
			log.error(e.toString(), e);
		}
		log.warn("Could not find ontology URI for " + uri);
		return null;
	}

}
