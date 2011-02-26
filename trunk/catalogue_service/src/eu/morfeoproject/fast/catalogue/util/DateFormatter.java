/**
 * Copyright (c) 2008-2011, FAST Consortium
 * 
 * This file is part of FAST Platform.
 * 
 * FAST Platform is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * FAST Platform is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 * or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public
 * License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with FAST Platform. If not, see <http://www.gnu.org/licenses/>.
 * 
 * Info about members and contributors of the FAST Consortium
 * is available at http://fast.morfeo-project.eu
 *
 **/
package eu.morfeoproject.fast.catalogue.util;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


/**
 * Provide several functions to format the string representation of a date
 * into a Date and vice versa.
 * @author irivera
 */
public class DateFormatter {
	
	final static Logger logger = LoggerFactory.getLogger(DateFormatter.class);
	
	public  static SimpleDateFormat ISO8601FORMAT = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ssZ");
	
	/**
	 * 
	 * @param date
	 * @return string representation of the date in ISO-8601
	 */
	public static String formatDateISO8601(Date date) {
		return ISO8601FORMAT.format(date);
	}
	
	/**
	 * 
	 * @param text
	 * @return an object Date
	 */
	public static Date parseDateISO8601(String text) {
		try {
			return ISO8601FORMAT.parse(text);
		} catch (ParseException e) {
			logger.warn("Cannot parse date with value: "+text);
			return null;
		}
	}
	
}
