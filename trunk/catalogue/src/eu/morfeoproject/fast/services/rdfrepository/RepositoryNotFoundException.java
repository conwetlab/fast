package eu.morfeoproject.fast.services.rdfrepository;

/**
 * The requested Repository was not found.
 * This exception is intentionally a RuntimeException because 99% of all calls
 * done to the RDFRepository will have the correct repository-Id.
 * Usually the ID is {@link RDFRepositoryCommon#MAIN_REPOSITORY_ID} or
 * {@link RDFRepositoryCommon#CONFIG_REPOSITORY_ID}.
 * @author sauermann
 */
public class RepositoryNotFoundException extends RuntimeException {

    /**
     *
     */
    private static final long serialVersionUID = -488996229634524838L;

    /**
     * 
     */
    public RepositoryNotFoundException() {
        //
    }

    /**
     * @param message
     */
    public RepositoryNotFoundException(String message) {
        super(message);
    }

    /**
     * @param cause
     */
    public RepositoryNotFoundException(Throwable cause) {
        super(cause);
    }

    /**
     * @param message
     * @param cause
     */
    public RepositoryNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }

}
