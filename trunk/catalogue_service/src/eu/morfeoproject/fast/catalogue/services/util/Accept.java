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
package eu.morfeoproject.fast.catalogue.services.util;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import eu.morfeoproject.fast.catalogue.util.Util;

/**
 * A helper class to query the "accept" header values.
 * 
 * @author Carlos Rueda
 */
public class Accept {

	// contentType entry
	public static class Entry {
		String contentType;
		Map<String, Float> params = new LinkedHashMap<String, Float>();

		public String toString() {
			StringBuilder sb = new StringBuilder(contentType);

			for (String parName : params.keySet()) {
				sb.append("; " + parName + " = " + params.get(parName));
			}

			return sb.toString();
		}
	}

	private List<Entry> entries = new ArrayList<Entry>();

	public Entry dominating;

	/**
	 * Parses the list of values according to: <a
	 * href="http://www.w3.org/Protocols/HTTP/HTRQ_Headers.html#z3"
	 * >http://www.w3.org/Protocols/HTTP/HTRQ_Headers.html#z3</a>
	 * 
	 * @param request
	 *            the request.
	 */
	public Accept(HttpServletRequest request) {
		List<String> acceptList = Util.getHeader(request, "accept");

		for (String field : acceptList) {
			String[] tokEntries = field.split("\\s*,\\s*");
			for (String entry : tokEntries) {
				String[] parts = entry.split("\\s*;\\s*");

				Entry ct = new Entry();
				ct.contentType = parts[0];
				entries.add(ct);

				for (int i = 1; i < parts.length; i++) {
					String paramPart = parts[i];
					String[] nameVal = paramPart.split("\\s*=\\s*");

					try {
						ct.params.put(nameVal[0], Float.valueOf(nameVal[1]));
					} catch (NumberFormatException ignore) {
					}
				}
			}
		}

		// determine dominating entry:

		// FIXME Hmm, why the following? (2003-04-01)
		// // TODO Entry paramenters not yet considered.
		// for ( Entry ctEntry : entries ) {
		// if ( "application/rdf+xml".equalsIgnoreCase(ctEntry.contentType) ) {
		// dominating = ctEntry;
		// break;
		// }
		// else if ( "text/html".equalsIgnoreCase(ctEntry.contentType) ) {
		// dominating = ctEntry;
		// break;
		// }
		// }
		// makes more sense to just pick the first entry as we are not yet
		// considering the "q" params.

		if (dominating == null && entries.size() > 0) {
			// FIXME arbitrarely choosing first entry.
			dominating = entries.get(0);
		}

		entries = Collections.unmodifiableList(entries);
	}

	public List<Entry> getEntries() {
		return entries;
	}

	/**
	 * @return the dominating accept content type. May be null if the client
	 *         didn't send any "accept" values.
	 */
	public String getDominating() {
		return dominating == null ? null : dominating.contentType;
	}

	public String toString() {
		return String.valueOf(entries) + "  Dominating: " + dominating;
	}

	public boolean contains(String contentType) {
		for (Entry ctEntry : entries) {
			if (contentType.equalsIgnoreCase(ctEntry.contentType)) {
				return true;
			}
		}
		return false;
	}

	public boolean isEmpty() {
		return entries.isEmpty();
	}
}
