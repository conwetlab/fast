//-----------------------------------------------------------------------
// <copyright file="DAAuthor.cs" company="Cyntelix">
//     Copyright (c) Cyntelix. All rights reserved.
// </copyright>
// <author>Ciprian Palaghita</author>
//-----------------------------------------------------------------------
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Storage.DataAccess
{
    public class DAAuthor : DABase
    {
        private static DAAuthor singleInstance = null;
        static DAAuthor()
        {
            singleInstance = new DAAuthor();
        }
        public static DAAuthor Instance
        {
            get { return singleInstance; }
        }

        public Author GetAuthorByName(Author author)
        {
            //return base.DataContext.Authors.SingleOrDefault<Author>(a => a.AuthorName == authorName);
            foreach (Author a in base.DataContext.Authors)
            {
                if (a.Equals(author))
                    return a;
            }
            return null;
        }

        public int AddAuthor(Author newAuthor)
        {
            Author existingObj = GetAuthorByName(newAuthor);
            if (existingObj == null)
            {
                base.DataContext.Authors.InsertOnSubmit(newAuthor);
                base.DataContext.SubmitChanges();

                return newAuthor.AuthorId;
            }
            else
            {
                return existingObj.AuthorId;
            }
        }


    }
}
