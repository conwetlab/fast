      function from(str, sign, sepNr)
      {
         var tmp = new String(Trim(str));
         var save = '';
         if (sepNr < 1)
         {
         sepNr = 1;
         }
         while (tmp.indexOf(sign) != -1 && sepNr > 0)
         {
         save = tmp.substring(tmp.indexOf(sign), tmp.indexOf(sign)
         + sign.length);
         tmp = tmp.substring(tmp.indexOf(sign) + sign.length, tmp.length);
         sepNr--;
         }
         tmp = save + tmp;
         return tmp;
      }

      function until(str, sign, sepNr)
      {
         var tmp = new String(Trim(str));
         var res = '';
         var length = sign.length;
         if(sepNr < 1)
         {
         sepNr = 1;
         }
         while(tmp.indexOf(sign) != -1 && sepNr > 0)
         {
         res += tmp.substring(0, tmp.indexOf(sign) + length);
         tmp = tmp.substring(tmp.indexOf(sign) + length, tmp.length);
         sepNr--;
         }
         return res;
      }

      function charsFromTo(str, from, to)
      {
         var tmp = new String(Trim(str));
         var res = '';
         if(from < 1)
         {
         from = 1;
         }
         if(to > tmp.length)
         {
         to = tmp.length;
         }
         for(from; from <= to; from++)
         {
         res += charAt(tmp, from);
         }
         return res;
      }

      function charAt(str, index)
      {
         var res = '';
         if(index < 1)
         {
         index = 1;
         }
         else if(index > str.length)
         {
         index = str.length;
         }
         index = index - 1;
         res = str.charAt(index);
         return res;
      }

      function wordsFromTo(str, from, to)
      {
         var tmp = new String(Trim(str));
         var res = '';
         var _split = tmp.split(' ');
         var length = _split.length;
         if(from < 1)
         {
         from = 1;
         }
         if(to > length)
         {
         to = length;
         }
         for(from; from <= to; from++)
         {
         res =  res + wordAt(str, from) + ' ';
         }
         return res;
      }

      function wordAt(str, nr)
      {
         var res = new String(Trim(str));
         var _split = res.split(' ');
         var length = _split.length;
         nr = nr -1;
         if(nr < 0 || nr >= length)
         {
         nr = length-1;
         }
         res = _split[nr];
         return res;
      }

      function Trim(str)
      {
         return RTrim(LTrim(str));
      }

      function LTrim(str)
      {
         var whitespace = new String(' ');
         var s = new String(str);
         if (whitespace.indexOf(s.charAt(0)) != -1)
         {
         var j=0, i = s.length;
         while (j < i && whitespace.indexOf(s.charAt(j)) != -1)
         j++;
         s = s.substring(j, i);
         }
         return s;
      }

      function RTrim(str)
      {
         var whitespace = new String(' ');
         var s = new String(str);
         if (whitespace.indexOf(s.charAt(s.length-1)) != -1)
         {
         var i = s.length - 1;
         while (i >= 0 && whitespace.indexOf(s.charAt(i)) != -1)
         i--;
         s = s.substring(0, i+1);
         }
         return s;
      }

      function getValue(currentTags, name)
      {
         	var elemValue = '';
         	var elemItem = currentTags.getElementsByTagName(name).item(0);
         	if( elemItem != null )
         	{ elemValue = elemItem.textContent; }
         	else if( currentTags.attributes.getNamedItem(name) != null )
           { elemValue = currentTags.attributes.getNamedItem(name).value; }

           return elemValue;
      }
