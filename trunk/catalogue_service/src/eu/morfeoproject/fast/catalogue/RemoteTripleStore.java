package eu.morfeoproject.fast.catalogue;

public class RemoteTripleStore extends TripleStore {

	public RemoteTripleStore(String sesameServer, String repositoryID) throws TripleStoreException {
		super();
		try {
			repository = PersistentRepository.getHTTPRepository(sesameServer, repositoryID);
			init(repository);
		} catch (Exception e) {
			throw new TripleStoreException("The triple store cannot be initialized.", e);
		}
	}

}
