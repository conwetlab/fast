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
package fast.servicescreen.client.gui;

import com.google.gwt.user.client.ui.HTML;

public class TabWidget extends HTML{
	public TabWidget(String title){
		super();
		StringBuffer html=new StringBuffer();
		html.append("<table style=\"border-collapse:collapse;border: 0px;margin:0px;height:30px;\"><tr style=\"border: 0px\">");
		html.append("<td class=\"fastTabLeft\"></td>");
		html.append("<td class=\"fastTabText\">"+title+"</td>");
		html.append("<td class=\"fastTabRight\"></td>");
		html.append("<td style=\"width:2px;background: #E1EBFB;\"></td>");
		html.append("</tr></table>");


//		html.append("<div style=\"white-space:nowrap\">");
//		html.append("<div class=\"fastTabLeft\"></div>");
//		html.append("<div class=\"fastTabText\">"+title+"</div>");
//		html.append("<div class=\"fastTabRight\"></div>");
//		html.append("</div>");
		
		setHTML(html.toString());
	}
}
