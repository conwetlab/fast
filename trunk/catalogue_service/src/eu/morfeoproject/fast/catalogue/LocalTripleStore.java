package eu.morfeoproject.fast.catalogue;

import java.io.File;

public class LocalTripleStore extends TripleStore {

	public LocalTripleStore(String dir, String indexes) throws TripleStoreException {
		super();
		try {
			repository = PersistentRepository.getLocalRepository(new File(dir), indexes);
			init(repository);
		} catch (Exception e) {
			throw new TripleStoreException("The triple store cannot be initialized.", e);
		}
	}

}
