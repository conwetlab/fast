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
