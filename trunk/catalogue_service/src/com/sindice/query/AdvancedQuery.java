/*
 * Copyright 2010 Milan Stankovic <milstan@hypios.com>
 * Hypios.com, STIH, University Paris-Sorbonne &
 * Davide Palmisano,  Fondazione Bruno Kessler <palmisano@fbk.eu>
 * Michele Mostarda,  Fondazione Bruno Kessler <mostarda@fbk.eu>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.sindice.query;

/**
 * This class models an advanced query to <i>Sindice.com</i>.
 * 
 * @author Milan Stankovic (milstan@gmail.com)
 */
public class AdvancedQuery extends SearchQuery {

    public static String SINDICE_ENDPOINT_PATTERN = SINDICE_ENDPOINT_PREFIX + "/v2/search?q=%s&qt=advanced&page=%s";

    private static String QUERY_PROPERTY_PATTERN = "* <%s> %s";

    private boolean sortByDate;    

	private String property;

	private String value;

	public AdvancedQuery(String property, String value, boolean sortByDate) {
		super();
		if(property == null) {
            throw new IllegalArgumentException("property parameter cannot be null");
        }
		this.property = property;
		if( value == null ) {
            throw new IllegalArgumentException("value parameter cannot be null");
        }
		this.value = value;
		this.sortByDate = sortByDate;
	}

	@Override
	protected String formURL(int page) {
		String valueformated = (value.contains("http") ? "<" + value + ">"
				: "\"" + value + "\"");

        String queryString = String.format(
                SINDICE_ENDPOINT_PATTERN,
                encode(String.format(QUERY_PROPERTY_PATTERN, property, valueformated)),
                page
        );
        return queryString;
	}

}
