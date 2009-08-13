package eu.morfeoproject.fast.util;
//
//import javax.swing.JTextArea;
import javax.swing.SwingUtilities;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Simple example of creating a Log4j appender that will
 * write to a JTextArea.
 */
//public class TextAreaAppender extends WriterAppender {

//	final Logger logger = Logger.getLogger(TextAreaAppender.class);
//
//	static private JTextArea jTextArea = null;
	
	/** Set the target JTextArea for the logging information to appear. */
//	static public void setTextArea(JTextArea jTextArea) {
//		TextAreaAppender.jTextArea = jTextArea;
//	}

	/**
	 * Format and then append the loggingEvent to the stored
	 * JTextArea.
	 */
//	public void append(LoggingEvent loggingEvent) {
//		if (jTextArea != null) {
//			final String message = this.layout.format(loggingEvent);
//	
//			// Append formatted message to textarea using the Swing Thread.
//			SwingUtilities.invokeLater(new Runnable() {
//				public void run() {
//					jTextArea.append(message);
//				}
//			});
//		}
//	}
//}