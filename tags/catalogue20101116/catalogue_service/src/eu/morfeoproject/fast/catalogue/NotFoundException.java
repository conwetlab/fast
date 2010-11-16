/**
 * 
 */
package eu.morfeoproject.fast.catalogue;

/**
 * @author Ismael Rivera
 *
 */
public class NotFoundException extends Exception {

	private static final long serialVersionUID = 1L;

	/**
	 * 
	 */
	public NotFoundException() {
		// TODO Auto-generated constructor stub
	}

	/**
	 * @param message
	 */
	public NotFoundException(String message) {
		super(message);
		// TODO Auto-generated constructor stub
	}

	/**
	 * @param cause
	 */
	public NotFoundException(Throwable cause) {
		super(cause);
		// TODO Auto-generated constructor stub
	}

	/**
	 * @param message
	 * @param cause
	 */
	public NotFoundException(String message, Throwable cause) {
		super(message, cause);
		// TODO Auto-generated constructor stub
	}

}
