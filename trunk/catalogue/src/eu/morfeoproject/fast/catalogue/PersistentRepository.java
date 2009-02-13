package eu.morfeoproject.fast.catalogue;

import java.io.File;

import org.apache.log4j.Logger;
import org.openrdf.repository.Repository;
import org.openrdf.repository.RepositoryException;
import org.openrdf.repository.sail.SailRepository;
import org.openrdf.sail.NotifyingSail;
import org.openrdf.sail.nativerdf.NativeStore;

import eu.morfeoproject.fast.catalogue.repository.simpleinferencer.SimpleRDFSInferencer;


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
	
	static Logger logger = Logger.getLogger(PersistentRepository.class);
	
	static File storageDir = null;
	static String defaultStorageDir = "repository";
	static final String defaultIndexes = "spoc, posc";
	static final int defaultInferencer = TripleStore.FORWARD_CHAINING_RDFS_INFERENCER;
	
	private Repository repository;
    
	// Protected constructor is sufficient to suppress unauthorised calls to the 
	// constructor
	protected PersistentRepository() {
		String indexes = null;
//		try {
//			Properties properties = new Properties();
			//TODO: fix the problem with the repository.properties path
//			properties.load(new FileReader("repository.properties"));
//			storageDir = new File(properties.getProperty("storageDir"));
//			indexes = properties.getProperty("indexes");
//		} catch (FileNotFoundException e) {
//			logger.warn("repository.properties file not found.");
//		} catch (IOException e) {
//			logger.warn("problem found reading repository.properties file.");
//		} finally {
			if (storageDir == null) {
				logger.warn("repository storage directory set to default ("+defaultStorageDir+").");
				storageDir = new File(defaultStorageDir);
			}
			if (indexes == null) {
				logger.warn("repository indexes set to default ("+defaultIndexes+").");
				indexes = defaultIndexes;
			}
//		}

		// persistent store
		NotifyingSail sail = new NativeStore(storageDir, indexes);
		logger.info("created repository [dir="+storageDir.getAbsolutePath()+", indexes="+indexes+"]");
		
		// support inference
//		if (defaultInferencer == TripleStore.FORWARD_CHAINING_RDFS_INFERENCER) {
//			sail = new ForwardChainingRDFSInferencer(sail);
//			logger.info("Forward Chaining RDFS Inferencer enabled");
//		}
		sail = new SimpleRDFSInferencer(sail);
		logger.info("SimpleRDFSInferencer enabled");
		
		repository = new SailRepository(sail);
		try {
			repository.initialize();
		} catch (RepositoryException e) {
			throw new RuntimeException(e);
		}
	}

	/**
	 * SingletonHolder is loaded on the first execution of Singleton.getInstance() 
	 * or the first access to SingletonHolder.INSTANCE, not before.
	 */
	private static class RepositoryHolder {
		private final static PersistentRepository INSTANCE = new PersistentRepository();
	}

	public static PersistentRepository getInstance() {
		return RepositoryHolder.INSTANCE;
	}

	public Repository getGroundingRepository() {
		return this.repository;
	}

}
