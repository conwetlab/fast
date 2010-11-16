package eu.morfeoproject.fast.catalogue.buildingblocks;

import org.ontoware.rdf2go.model.Model;
import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.vocabulary.RDF;

import eu.morfeoproject.fast.catalogue.vocabulary.FGO;

public class Postcondition extends PreOrPost {

	public Postcondition(URI uri) {
		super(uri);
	}

	@Override
	public Model toRDF2GoModel() {
		Model model = super.toRDF2GoModel();
		model.addStatement(getUri(), RDF.type, FGO.Postcondition);
		return model;
	}
	
}
