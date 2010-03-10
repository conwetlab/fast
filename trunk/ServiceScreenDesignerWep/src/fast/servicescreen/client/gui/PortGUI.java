package fast.servicescreen.client.gui;

import java.util.Iterator;

import com.google.gwt.event.dom.client.ClickEvent;
import com.google.gwt.event.dom.client.ClickHandler;
import com.google.gwt.user.client.ui.Button;
import com.google.gwt.user.client.ui.FlexTable;
import com.google.gwt.user.client.ui.Label;
import com.google.gwt.user.client.ui.SuggestBox;
import com.google.gwt.user.client.ui.TextBox;
import com.google.gwt.user.client.ui.Widget;
import com.google.gwt.user.client.ui.HTMLTable.Cell;

import fast.common.client.BuildingBlock;
import fast.common.client.FactPort;

public class PortGUI
{
   public PortGUI(BuildingBlock buildingBlock)
   {
      this.buildingBlock = buildingBlock;
   }
   
   private BuildingBlock buildingBlock;
   public FlexTable inputPortTable;
   public FlexTable outputPortTable;

   @SuppressWarnings("unchecked")
   public Widget createInputPortTable() 
   {
      inputPortTable = new FlexTable();
      
      int numRows = inputPortTable.getRowCount();
      
       // add headlines
       inputPortTable.setHTML(numRows, 0, "Input Facts:");
       numRows++;
       
       // add the add-buttons
       // Add new input port Button
       Button addInputPortButton = new Button("Add Fact");
       addInputPortButton.addClickHandler(new AddNewInputPortHandler());
       inputPortTable.setWidget(numRows, 0, addInputPortButton);
       numRows++;

       // add input header row
       inputPortTable.setWidget(numRows, 0, new Label("Fact Name"));
       inputPortTable.setWidget(numRows, 1, new Label("Fact Type"));
       inputPortTable.setWidget(numRows, 2, new Label("Example Value"));
       numRows++;
     
       // add rows for existing input fact ports
       Iterator<FactPort> iteratorOfPreconditions = buildingBlock.iteratorOfPreconditions();
       while (iteratorOfPreconditions.hasNext())
       {
          FactPort factPort = iteratorOfPreconditions.next();
            
          // per fact port add one row with three text boxes for name, type, and example value
          createInputTableRowFor(factPort);
       }
       
       // return the panel
       inputPortTable.ensureDebugId("cwFlexTable");
      return inputPortTable;
   }

   private void createInputTableRowFor(FactPort factPort)
   {
      TextBox nameBox = CTextChangeHandler.createTextBox(factPort, "name");
      SuggestBox typeBox = CTextChangeHandler.createTypeSuggestBox(factPort, "factType");
      TextBox exampleBox = CTextChangeHandler.createTextBox(factPort, "exampleValue");
      
      int inputNumRows = inputPortTable.getRowCount();
      
      //add the text and suggest boxes
      inputPortTable.setWidget(inputNumRows, 0, nameBox);
      inputPortTable.setWidget(inputNumRows, 1, typeBox);
      inputPortTable.setWidget(inputNumRows, 2, exampleBox);
      
      // add remove button
      Button removePortButton = new Button("Remove Port");
      RemoveInputPortHandler inputPortHandler = new RemoveInputPortHandler();
      inputPortHandler.setFactPort(factPort);
      removePortButton.addClickHandler(inputPortHandler);
      inputPortTable.setWidget(inputNumRows, 3, removePortButton);
   }
   
   @SuppressWarnings("unchecked")
   public Widget createOutputPortTable() 
   {
      outputPortTable = new FlexTable();
      
      int numRows = outputPortTable.getRowCount();
      
       // add headlines
      outputPortTable.setHTML(numRows, 0, "Output Facts:");
       numRows++;
       
       // Add new output port Button
       Button addOutputPortButton = new Button("Add Fact");
       addOutputPortButton.addClickHandler(new AddNewOutputPortHandler());
       outputPortTable.setWidget(numRows, 0, addOutputPortButton);
       numRows++;

       // add output header row
       outputPortTable.setWidget(numRows, 0, new Label("Fact Name"));
       outputPortTable.setWidget(numRows, 1, new Label("Fact Type"));
       outputPortTable.setWidget(numRows, 2, new Label("Example Value"));
       numRows++;
       
       // add rows for existing output fact ports
       Iterator<FactPort> iteratorOfPostconditions = buildingBlock.iteratorOfPostconditions();
       while (iteratorOfPostconditions.hasNext())
       {
          FactPort factPort = iteratorOfPostconditions.next();
            
          // per fact port add one row with three text boxes for name, type, and example value
          createOutputTableRowFor(factPort);
       }
       
       // return the panel
       outputPortTable.ensureDebugId("cwFlexTable");
      return outputPortTable;
   }

   private void createOutputTableRowFor(FactPort factPort)
   {
      TextBox nameBox = CTextChangeHandler.createTextBox(factPort, "name");
      SuggestBox typeBox = CTextChangeHandler.createTypeSuggestBox(factPort, "factType");
      TextBox exampleBox = CTextChangeHandler.createTextBox(factPort, "exampleValue");
      
      int outputNumRows = outputPortTable.getRowCount();
      
      //add the text and suggest boxes
      outputPortTable.setWidget(outputNumRows, 0, nameBox);
      outputPortTable.setWidget(outputNumRows, 1, typeBox);
      outputPortTable.setWidget(outputNumRows, 2, exampleBox);
      
      // add remove button
      Button removePortButton = new Button("Remove Port");
      RemoveOutputPortHandler outputPortHandler = new RemoveOutputPortHandler();
      outputPortHandler.setFactPort(factPort);
      removePortButton.addClickHandler(outputPortHandler);
      outputPortTable.setWidget(outputNumRows, 4, removePortButton);
   }

   class AddNewInputPortHandler implements ClickHandler
   {
     @Override
     public void onClick(ClickEvent event)
     {
        FactPort factPort = new FactPort();
        buildingBlock.addToPreconditions(factPort);
        createInputTableRowFor(factPort);
     }
   }
   
   /**
    * This Handler is for removing and adding Ports
    * */
   class RemoveInputPortHandler implements ClickHandler
   {
      
     private FactPort factPort;
     
     public FactPort getFactPort()
     {
        return factPort;
     }

     public void setFactPort(FactPort factPort)
     {
        this.factPort = factPort;
     }

     @Override
     public void onClick(ClickEvent event)
     {
        if(inputPortTable.getRowCount() == 4) return; // <=== do not remove last row
      
        Cell cell = inputPortTable.getCellForEvent(event);         
        int rowCount = cell.getRowIndex();
        inputPortTable.removeRow(rowCount);
        
        // remove factport from preconditions
        buildingBlock.removeFromPreconditions(factPort);
     } 
   }
   
   class AddNewOutputPortHandler implements ClickHandler
   {
     @Override
     public void onClick(ClickEvent event)
     {
        FactPort factPort = new FactPort();
        buildingBlock.addToPostconditions(factPort);
        createOutputTableRowFor(factPort);
     }
   }
   
   class RemoveOutputPortHandler implements ClickHandler
   {
      private FactPort factPort;
      
      public FactPort getFactPort()
      {
         return factPort;
      }

      public void setFactPort(FactPort factPort)
      {
         this.factPort = factPort;
      }
      
      @Override
     public void onClick(ClickEvent event)
     {
    	  //don't remove last row
    	  if(outputPortTable.getRowCount() == 4)
    	  {
    		  return;
    	  }
         
    	  Cell cell = outputPortTable.getCellForEvent(event);         
    	  int rowCount = cell.getRowIndex();
    	  outputPortTable.removeRow(rowCount);
        
    	  // remove factport from postconditions
    	  buildingBlock.removeFromPostconditions(factPort);
     } 
   }
   

}
