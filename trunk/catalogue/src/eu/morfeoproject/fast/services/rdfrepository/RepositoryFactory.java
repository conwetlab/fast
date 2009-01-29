package eu.morfeoproject.fast.services.rdfrepository;

import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;

import org.ontoware.rdf2go.RDF2Go;
import org.ontoware.rdf2go.exception.ModelRuntimeException;
import org.ontoware.rdf2go.model.Model;
import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.model.node.impl.URIImpl;
import org.openrdf.repository.Repository;
import org.openrdf.repository.RepositoryException;
import org.openrdf.repository.sail.SailRepository;
import org.openrdf.sail.memory.MemoryStore;

public class RepositoryFactory {

	public Repository createMemoryRepository() throws RepositoryException {
		MemoryStore sail = new MemoryStore();
		Repository repository = new SailRepository(sail);
		repository.initialize();
		
		// initialise the content of the repository
		init(repository);
		
		return repository;
	}
	

	// TODO delete this method
	private void init(Repository repository) {
		Model model = RDF2Go.getModelFactory().createModel();
		model.open();
		
		String screenFile = "examples/screen.owl";
		String projectFile = "examples/projects.owl";
		
		URI screenUri = new URIImpl("http://www.deri.org/fast/screen#");
		URI projectUri = new URIImpl("http://www.deri.org/fast/projects#");
		
		// read the RDF/XML files
		try {
			model.readFrom(new FileReader(screenFile));
			model.readFrom(new FileReader(projectFile));
		} catch (ModelRuntimeException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (FileNotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		model.dump();
		
		model.close();
	}

	
}
