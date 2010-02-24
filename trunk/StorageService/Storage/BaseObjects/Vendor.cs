//-----------------------------------------------------------------------
// <copyright file="Vendor.cs" company="Cyntelix">
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
    public partial class Vendor
    {
        public override bool Equals(object obj)
        {
            if(typeof(Vendor).Equals(obj.GetType()))
            {
                Vendor refObj = (Vendor)obj;
                if (this.VendorName != refObj.VendorName)
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
