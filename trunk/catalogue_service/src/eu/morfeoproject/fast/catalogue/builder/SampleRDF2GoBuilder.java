package eu.morfeoproject.fast.catalogue.builder;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.ontoware.aifbcommons.collection.ClosableIterator;
import org.ontoware.rdf2go.model.Model;
import org.ontoware.rdf2go.model.Statement;
import org.ontoware.rdf2go.model.node.DatatypeLiteral;
import org.ontoware.rdf2go.model.node.LanguageTagLiteral;
import org.ontoware.rdf2go.model.node.Node;
import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.model.node.Variable;
import org.ontoware.rdf2go.vocabulary.RDF;

import eu.morfeoproject.fast.catalogue.MyRDFFactory;
import eu.morfeoproject.fast.catalogue.RDFFactory;
import eu.morfeoproject.fast.catalogue.buildingblocks.factory.BuildingBlockFactory;
import eu.morfeoproject.fast.catalogue.model.Sample;

public class SampleRDF2GoBuilder {

	protected static final Log log = LogFactory.getLog(SampleRDF2GoBuilder.class);

	protected static final RDFFactory factory = new MyRDFFactory();

	public static Sample buildSample(Model model) {
		return retrieveSample(model);
	}
	
	private static Sample retrieveSample(Model model) {
		// extract the URI and its Class
		ClosableIterator<Statement> cIt = model.findStatements(Variable.ANY, RDF.type, Variable.ANY);
		URI uri = null, type = null;
		try {
			Statement stmt = cIt.next();
			uri = stmt.getSubject().asURI();
			type = stmt.getObject().asURI();
		} catch (Exception e) {
			return null;
		} finally {
			cIt.close();
		}
		
		// fill the information about the sample
		Sample sample = BuildingBlockFactory.createSample();
		sample.setUri(uri);
		sample.setType(type);
		
		// finding properties and their values
		cIt = model.findStatements(uri, Variable.ANY, Variable.ANY);
		for ( ; cIt.hasNext(); ) {
			Statement st = cIt.next();
			URI predicate = st.getPredicate();
			Node object = st.getObject();
			
			// discard the statement "sample rdf:type <someUri>"
			// property value don't support blank nodes, only basic literals or URIs
			if (predicate.equals(RDF.type) || factory.isBlankNode(object)) continue;
			
			if (factory.isURI(object)) {
				sample.addPropertyValue(predicate, "uri", object.asURI().toString());
			} else if (factory.isDatatypeLiteral(object)) {
				DatatypeLiteral dtLiteral = (DatatypeLiteral) object;
				sample.addPropertyValue(predicate, "literal", dtLiteral.getValue(), null, dtLiteral.getDatatype());
			} else if (factory.isLanguageTagLiteral(object)) {
				LanguageTagLiteral langLiteral = (LanguageTagLiteral) object;
				sample.addPropertyValue(predicate, "literal", langLiteral.getValue(), langLiteral.getLanguageTag(), null);
			}
		}
		cIt.close();
		
		return sample;
	}

}