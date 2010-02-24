//-----------------------------------------------------------------------
// <copyright file="Author.cs" company="Cyntelix">
//     Copyright (c) Cyntelix. All rights reserved.
// </copyright>
// <author>Ciprian Palaghita</author>
//-----------------------------------------------------------------------
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Storage
{
    public partial class Author
    {
        public override bool Equals(object obj)
        {
            if (typeof(Author).Equals(obj.GetType()))
            {
                Author refObj = (Author)obj;
                if (this.AuthorName != refObj.AuthorName)
                    return false;
                if (this.href != refObj.href)
                    return false;
                if (this.email != refObj.email)
                    return false;
            }
            else
            {
                return false;
            }

            return true;
        }
    }
}
