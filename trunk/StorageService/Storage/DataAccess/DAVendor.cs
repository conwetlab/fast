//-----------------------------------------------------------------------
// <copyright file="DAVendor.cs" company="Cyntelix">
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
    public class DAVendor : DABase
    {
        private static DAVendor singleInstance = null;
        static DAVendor()
        {
            singleInstance = new DAVendor();
        }
        public static DAVendor Instance
        {
             get { return singleInstance; }
        }

        public Vendor GetVendorByName(Vendor vendor)
        {
            //return base.DataContext.Vendors.SingleOrDefault<Vendor>(v => v.VendorName == vendorName);
            foreach (Vendor v in base.DataContext.Vendors)
            {
                if (v.Equals(vendor))
                    return v;
            }
            return null;
        }

        public int AddVendor(Vendor newVendor)
        {
            Vendor existingObj = GetVendorByName(newVendor);
            if (existingObj == null)
            {
                base.DataContext.Vendors.InsertOnSubmit(newVendor);
                base.DataContext.SubmitChanges();

                return newVendor.VendorId;
            }
            else
            {
                return existingObj.VendorId;
            }
        }
    }
}
