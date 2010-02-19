package eu.morfeoproject.fast.model;

import org.ontoware.rdf2go.model.Model;
import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.vocabulary.RDF;

import eu.morfeoproject.fast.vocabulary.FGO;

public class Form extends ScreenComponent {
	
	protected Form(URI uri) {
		setUri(uri);
	}
	
	@Override
	public Model createModel() {
		Model model = super.createModel();
		
		model.addStatement(getUri(), RDF.type, FGO.Form);

		return model;
	}
	
}
