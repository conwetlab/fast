/**
 * 
 */
package eu.morfeoproject.fast.catalogue.services;

/**
 * @author Ismael Rivera
 *
 */
public class ParseScreenException extends Exception {

	private static final long serialVersionUID = 1L;

	/**
	 * 
	 */
	public ParseScreenException() {
	}

	/**
	 * @param message
	 */
	public ParseScreenException(String message) {
		super(message);
	}

	/**
	 * @param cause
	 */
	public ParseScreenException(Throwable cause) {
		super(cause);
	}

	/**
	 * @param message
	 * @param cause
	 */
	public ParseScreenException(String message, Throwable cause) {
		super(message, cause);
	}

}
