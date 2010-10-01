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
