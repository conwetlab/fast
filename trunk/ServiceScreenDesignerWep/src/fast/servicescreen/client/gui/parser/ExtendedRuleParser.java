package fast.servicescreen.client.gui.parser;

import java.util.LinkedHashMap;

/**
 * Contains the parse mechanism within the finite automata, and the result storage
 * */
public class ExtendedRuleParser
{
	private String text;
	private int readPos;
	private Token currentToken;
	private char currentChar;
	private char lookAheadChar;
	
	//result storage
	private LinkedHashMap<Integer, Operation> parseResults = null;
	
	//The start of parsing a text
	public void parse(String parseText)
	{
		if(parseText != null)
		{
			//set up parser
			parseResults = new LinkedHashMap<Integer, Operation>();
			
			this.text = "" + parseText;
			readPos = -1;
		
			nextChar();
			nextChar();
			
			startParsing();
		}
	}

	private Integer nr;
	/**
	 * Parse the line and saves them to structured from
	 * in the LinkedHashMap.
	 * */
	private void startParsing()
	{
		nr = 0;
		nextToken();
		Kind opKind;
		
		while(currentToken != null)
		{
			opKind = currentToken.getKind();
			
			switch(opKind)
			{
				case RName:		//save founded name
								saveEntry(currentToken.getWord(), currentToken.getKind());
								
								nextChar_NoWSJump();
								break;
					
				case words:		//save founded operation
								saveEntry(currentToken.getWord(), currentToken.getKind());
								
								//save founded param
								nextChar();
								nextToken();
								if(currentToken != null)
									saveEntry(fillParam(currentToken.getWord()), Kind.Param);
								
								nextChar_NoWSJump();
								break;
								
				case chars:		//save founded operation
								saveEntry(currentToken.getWord(), currentToken.getKind());
					
								//save founded param
								nextChar();
								nextToken();
								if(currentToken != null)
									saveEntry(fillParam(currentToken.getWord()), Kind.Param);
								
								nextChar_NoWSJump();
								break;
								
				case until:		//save founded operation inkl. Params
								saveUntilOrFrom_Operation();
								
								break;
								
				case from:		//save founded operation inkl. Params
								saveUntilOrFrom_Operation();
					
								break;
				
				case plus:		//save the plus 
								saveEntry("+", Kind.plus);
								break;
								
				case constant:	//save the constant
								saveEntry(currentToken.getWord(), Kind.constant);
								break;
			}
			
			nextToken();
		}
	}
	

	
	/**
	 * if param doesn´t contain "-" (fe. 42) this will return
	 * param with "-"param appended (fe. 42-42)
	 * */
	private String fillParam(String checkParam)
	{
		if(checkParam.length() == 1)
		{
			checkParam = checkParam + "-" + checkParam;
		}
		
		return checkParam;
	}
	
	//save one entry in the parseResults list
	private void saveEntry(String value, Kind kind)
	{
		parseResults.put(nr, new Operation(value, kind));
		
		this.nr++;
	}
	
	//save one entry (with signs) in the parseResults list
	private void saveEntry(String value, String signs, Kind kind)
	{
		parseResults.put(nr, new Operation(value, signs, kind));
		
		this.nr++;
	}
	
	private void saveUntilOrFrom_Operation()
	{
		saveEntry(currentToken.getWord(), currentToken.getKind());
		
		//save founded param
		nextChar();										//skip (
		nextToken_Sings();								//load the signs
		
		String u_signs = "" + currentToken.getWord(); 	//save sign(s)
		nextChar();										//skip ,
		nextToken();									//load sepNr
		
		if(! "".equals(u_signs))
		{
			if(currentToken == null)
			{
				saveEntry("1", u_signs, Kind.Param);	//default sepNr
			}
			else
			{
				saveEntry(currentToken.getWord(), u_signs, Kind.Param);
			}
		}
		
		nextChar();					//skip )
		nextChar_NoWSJump();		//maybee skip next .
	}
	
	/**
	 * Returns the Kind - enum witch matches
	 * the given String.
	 * 
	 * Notice: An undefined String will
	 * return Kind.RName as type!
	 * */
	public Kind defineType(String defineMe)
	{
		if(defineMe.equals(Kind.words.toString()))
		{
			return Kind.words;
		}
		else if(defineMe.equals(Kind.chars.toString()))
		{
			return Kind.chars;
		}
		else if(defineMe.equals(Kind.until.toString()))
		{
			return Kind.until;
		}
		else if(defineMe.equals(Kind.from.toString()))
		{
			return Kind.from;
		}
		
		//much more operations HERE

		else
		{
			return Kind.RName;
		}
	}
	
	/**
	 * Returns the next token.
	 * */
	@SuppressWarnings("deprecation")
	private void nextToken()
	{
		Token token = new Token();
		String word = "";
		
		//a WHITESPACE is interpreted as + operation, and a plus Token will be returned
		if(Character.isSpace(currentChar))
		{
			//skips all whitespaces (more flexible)
			while( ! (currentChar == Character.MIN_VALUE) && Character.isSpace(currentChar))
			{
				nextChar(); //skip whitespace
			}
			
			token.setKind(Kind.plus);
			
			currentToken = token;
		}
		
		//check, if we parse a CONSTANT or any other
		else if(currentChar == '"')
		{
			nextChar(); //skip START "
			
			//get the constant
			while(currentChar != '"' && Character.MIN_VALUE != currentChar)
			{
				word += currentChar;
				
				nextChar();
			}
			
			nextChar(); //skip END "
			
			if(! "".equals(word))
			{
				//set value
				token.setWord(word);

				//set kind = constant
				token.setKind(Kind.constant);
				
				currentToken = token;
			}
			else
			{
				currentToken = null;
			}
		}
		else
		{
			//get the word
			while((Character.isLetterOrDigit(currentChar) || currentChar == '-')
				  && Character.MIN_VALUE != currentChar)
			{
				word += currentChar;
				
				nextChar();
			}
			
			if(! "".equals(word))
			{
				//set value
				token.setWord(word);

				//set kind
				token.setKind(defineType(word));
				
				currentToken = token;
			}
			else
			{
				currentToken = null;
			}
		}
	}
	
	/**
	 * To allow that a whitespace is handled as '+',
	 * operations should not jump over a static '.' in the end,
	 * because it should be end of operations, and we won´t jump over a
	 * whitespace! So call this method, to setup next Char after parsing
	 * a operation or Param! 
	 * */
	@SuppressWarnings("deprecation")
	private void nextChar_NoWSJump()
	{		
		if(readPos < text.length())
		{
			if(! Character.isSpace(currentChar))
			{
				readPos++;
				
				currentChar = lookAheadChar;
				
				lookAheadChar = text.charAt(readPos);
			}
		}
		else
		{
			currentChar = lookAheadChar;
			
			lookAheadChar = Character.MIN_VALUE;
		}
	}
	
	/**
	 * Returns the next token. The result will be
	 * any sings until a , or EOT is founded.
	 * */
	private void nextToken_Sings()
	{
		Token token = new Token();
		String word = "";
		
		//get the word
		while(! (currentChar == ',') && Character.MIN_VALUE != currentChar)
		{
			word += currentChar;
			
			nextChar();
		}

		if(! "".equals(word))
		{
			//set value
			token.setWord(word);

			//set kind
			token.setKind(defineType(word));

			currentToken = token;
		}
		else
		{
			currentToken = null;
		}
	}
	
	/**
	 * Setup nextChar anyway
	 * */
	private void nextChar()
	{
		readPos++;
		
		currentChar = lookAheadChar;
		
		if(readPos < text.length())
		{
			lookAheadChar = text.charAt(readPos);
		}
		else
		{
			lookAheadChar = Character.MIN_VALUE;
		}
	}
	
	public Operation getOperation(int index)
	{
		if(parseResults.containsKey(index))
		{
			return parseResults.get(index);
		}
		
		//else
		return null;
	}
	
	public int getParseResultsSize()
	{
		return parseResults.size();
	}
}