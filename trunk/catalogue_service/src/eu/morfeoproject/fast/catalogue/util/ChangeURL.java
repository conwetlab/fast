package eu.morfeoproject.fast.catalogue.util;

import org.ontoware.aifbcommons.collection.ClosableIterator;
import org.ontoware.rdf2go.model.Statement;
import org.ontoware.rdf2go.model.node.Node;
import org.ontoware.rdf2go.model.node.Resource;
import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.model.node.Variable;
import org.ontoware.rdf2go.model.node.impl.URIImpl;

import eu.morfeoproject.fast.catalogue.Catalogue;
import eu.morfeoproject.fast.catalogue.CatalogueConfiguration;

public class ChangeURL {

	/**
	 * URIs in the triple store are dependant on the public Catalogue URL
	 * If the Catalogue is deployed in a different URL, this script should be run to update
	 * the URIs of the resources.
	 * 
	 * It takes two parameters: ChangeURL oldUrl newUrl
	 */
	public static void main(String[] args) {
		if (args[0] != null && args[1] != null) {
			String oldUrl = args[0];
			String newUrl = args[1];
			System.out.println("Updating resources URLs from "+oldUrl+" to new Catalogue URL "+newUrl+"...");
			CatalogueConfiguration conf = new CatalogueConfiguration("repository.properties");
			Catalogue catalogue = new Catalogue(conf);
			
			int count = 0;
			boolean replace = false;
			ClosableIterator<Statement> cIt = catalogue.getTripleStore().findStatements(Variable.ANY, Variable.ANY, Variable.ANY, Variable.ANY);
			while (cIt.hasNext()) {
				replace = false;
				Statement stmt = cIt.next();
				URI context = stmt.getContext();
				Resource subject = stmt.getSubject();
				URI predicate = stmt.getPredicate();
				Node object = stmt.getObject();
				
				if (context != null && context.toString().startsWith(oldUrl)) {
					context = new URIImpl(context.toString().replace(oldUrl, newUrl));
					replace = true;
				}
				if (subject instanceof URI && subject.toString().startsWith(oldUrl)) {
					subject = new URIImpl(subject.toString().replace(oldUrl, newUrl));
					replace = true;
				}
				if (predicate.toString().startsWith(oldUrl)) {
					predicate = new URIImpl(predicate.toString().replace(oldUrl, newUrl));
					replace = true;
				}
				if (object instanceof URI && object.toString().startsWith(oldUrl)) {
					object = new URIImpl(object.toString().replace(oldUrl, newUrl));
					replace = true;
				}
				
				if (replace) {
					catalogue.getTripleStore().removeStatement(stmt.getContext(), stmt.getSubject(),stmt.getPredicate(), stmt.getObject());
					catalogue.getTripleStore().addStatement(context, subject, predicate, object);
					System.out.println(context+" - "+subject+" - "+predicate+" - "+object);
					count++;
				}
			}
			cIt.close();
			catalogue.close();
			System.out.println(count+" URLs updated.");
		} else {
			System.out.println("Usage: ChangeURL oldUrl newUrl");
		}
	}

}
