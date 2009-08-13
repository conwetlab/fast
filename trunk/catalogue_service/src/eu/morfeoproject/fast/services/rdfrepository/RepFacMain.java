package eu.morfeoproject.fast.services.rdfrepository;

import org.openrdf.repository.RepositoryException;

public class RepFacMain {

	public static void main(String [] args) throws RepositoryException {
		RepositoryFactory rf = new RepositoryFactory();
		rf.createMemoryRepository();
	}
	
}
