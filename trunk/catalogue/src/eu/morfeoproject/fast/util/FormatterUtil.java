package eu.morfeoproject.fast.util;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

/**
 * Provide several functions to format the string representation of a date
 * into a Date and vice versa.
 * @author irivera
 */
public class FormatterUtil {
	
	private static final String DATEPATTERN = "yyyy-MM-dd hh:mm:ss";
	
	public static String formatDate(Date date) {
		SimpleDateFormat sdf = new SimpleDateFormat(DATEPATTERN);
		return sdf.format(date);
	}
	
	public static Date parseDate(String text) {
		SimpleDateFormat sdf = new SimpleDateFormat(DATEPATTERN);
		try {
			return sdf.parse(text);
		} catch (ParseException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			return null;
		}
	}
	
}
