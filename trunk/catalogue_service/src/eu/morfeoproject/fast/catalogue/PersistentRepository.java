package eu.morfeoproject.fast.catalogue;

import java.io.File;
import java.util.HashMap;
import java.util.Map;

import org.openrdf.repository.Repository;
import org.openrdf.repository.RepositoryException;
import org.openrdf.repository.sail.SailRepository;
import org.openrdf.sail.NotifyingSail;
import org.openrdf.sail.nativerdf.NativeStore;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


/**
 * This class implements Singleton solution of Bill Pugh
 * This is the recommended method. It is known as the initialisation on demand 
 * holder idiom and is as lazy as possible. Moreover, it works in all known 
 * versions of Java. This solution is the most portable across different Java 
 * compilers and virtual machines.
 * 
 * The inner class is referenced no earlier (and therefore loaded no earlier 
 * by the class loader) than the moment that getInstance() is called. Thus, this 
 * solution is thread-safe without requiring special language constructs (i.e. 
 * volatile and/or synchronised).
 * 	
 * @author Ismael Rivera
 */
public class PersistentRepository {
	
	final Logger logger = LoggerFactory.getLogger(PersistentRepository.class);
	
	static final String defaultIndexes = "spoc, posc, sopc, psoc, ospc, opsc";
	static final int defaultInferencer = TripleStore.FORWARD_CHAINING_RDFS_INFERENCER;
	
	private static Map<String, Repository> repositories = new HashMap<String, Repository>();
	
	public static Repository getRepository(File dir, String indexes) {
		if (indexes == null) indexes = defaultIndexes;
		Repository repository = repositories.get(dir.getAbsolutePath());
		if (repository == null) {
			NotifyingSail sail = new NativeStore(dir, indexes);
			repository = new SailRepository(sail);
			try {
				repository.initialize();
			} catch (RepositoryException e) {
				throw new RuntimeException(e);
			}
			repositories.put(dir.getAbsolutePath(), repository);
		}
		return repository;
	}
	
	public static Repository getRepository(File dir) {
		return PersistentRepository.getRepository(dir, defaultIndexes);
	}
	
}
