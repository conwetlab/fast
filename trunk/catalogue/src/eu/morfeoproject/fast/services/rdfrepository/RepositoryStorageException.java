package eu.morfeoproject.fast.services.rdfrepository;

/**
 * A generic Repository storage exception.
 * This is thrown when read or write operation in the storage fail.
 * @author sauermann
 */
public class RepositoryStorageException extends Exception {

    /**
     * A generic Repository storage exception.
     */
    public RepositoryStorageException() {
        super();
    }

    /**
     * A generic Repository storage exception.
     * @param  message the detail message (which is saved for later retrieval
     *         by the {@link #getMessage()} method).
     * @param  cause the cause (which is saved for later retrieval by the
     *         {@link #getCause()} method).  (A <tt>null</tt> value is
     *         permitted, and indicates that the cause is nonexistent or
     *         unknown.)

     */
    public RepositoryStorageException(String message, Throwable cause) {
        super(message, cause);
    }

    /**
     * A generic Repository storage exception.
     * @param  message the detail message (which is saved for later retrieval
     *         by the {@link #getMessage()} method).

     */
    public RepositoryStorageException(String message) {
        super(message);
    }

    /**
     * A generic Repository storage exception.
     * @param  cause the cause (which is saved for later retrieval by the
     *         {@link #getCause()} method).  (A <tt>null</tt> value is
     *         permitted, and indicates that the cause is nonexistent or
     *         unknown.)

     */
    public RepositoryStorageException(Throwable cause) {
        super(cause);
    }
    
    

}
