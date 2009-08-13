package eu.morfeoproject.fast.services.rdfrepository;

/**
 * Thrown if a passed queryId is unknown or the query timed out and
 * was closed by the server.
 * A runtimeexception by design, this should not happen.
 * @author sauermann
 */
public class UnknownQueryIdException extends RuntimeException {

    /**
     *
     */
    private static final long serialVersionUID = 2795920401858486550L;

    /**
     * 
     */
    public UnknownQueryIdException() {
        //
    }
    
    /**
     * 
     */
    public UnknownQueryIdException(int queryId) {
        this("Query ID "+queryId+" unknown");
    }

    /**
     * @param message
     */
    public UnknownQueryIdException(String message) {
        super(message);
    }

    /**
     * @param cause
     */
    public UnknownQueryIdException(Throwable cause) {
        super(cause);
    }

    /**
     * @param message
     * @param cause
     */
    public UnknownQueryIdException(String message, Throwable cause) {
        super(message, cause);
    }

}
