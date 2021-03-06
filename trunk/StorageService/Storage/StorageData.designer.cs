﻿//-----------------------------------------------------------------------
// <copyright file="StorageData.designer.cs" company="Cyntelix">
//     Copyright (c) Cyntelix. All rights reserved.
// </copyright>
// <author>Ciprian Palaghita</author>
//-----------------------------------------------------------------------
#pragma warning disable 1591
//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//     Runtime Version:2.0.50727.4200
//
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace Storage
{
	using System.Data.Linq;
	using System.Data.Linq.Mapping;
	using System.Data;
	using System.Collections.Generic;
	using System.Reflection;
	using System.Linq;
	using System.Linq.Expressions;
	using System.Runtime.Serialization;
	using System.ComponentModel;
	using System;
	
	
	[System.Data.Linq.Mapping.DatabaseAttribute(Name="CyntelixFast")]
	public partial class StorageDataDataContext : System.Data.Linq.DataContext
	{
		
		private static System.Data.Linq.Mapping.MappingSource mappingSource = new AttributeMappingSource();
		
    #region Extensibility Method Definitions
    partial void OnCreated();
    partial void InsertAuthor(Author instance);
    partial void UpdateAuthor(Author instance);
    partial void DeleteAuthor(Author instance);
    partial void InsertVendor(Vendor instance);
    partial void UpdateVendor(Vendor instance);
    partial void DeleteVendor(Vendor instance);
    partial void InsertGadget(Gadget instance);
    partial void UpdateGadget(Gadget instance);
    partial void DeleteGadget(Gadget instance);
    partial void InsertGadgetMetadata(GadgetMetadata instance);
    partial void UpdateGadgetMetadata(GadgetMetadata instance);
    partial void DeleteGadgetMetadata(GadgetMetadata instance);
    #endregion
		
		public StorageDataDataContext() : 
				base(global::System.Configuration.ConfigurationManager.ConnectionStrings["FASTStorageConnectionString"].ConnectionString, mappingSource)
		{
			OnCreated();
		}
		
		public StorageDataDataContext(string connection) : 
				base(connection, mappingSource)
		{
			OnCreated();
		}
		
		public StorageDataDataContext(System.Data.IDbConnection connection) : 
				base(connection, mappingSource)
		{
			OnCreated();
		}
		
		public StorageDataDataContext(string connection, System.Data.Linq.Mapping.MappingSource mappingSource) : 
				base(connection, mappingSource)
		{
			OnCreated();
		}
		
		public StorageDataDataContext(System.Data.IDbConnection connection, System.Data.Linq.Mapping.MappingSource mappingSource) : 
				base(connection, mappingSource)
		{
			OnCreated();
		}
		
		public System.Data.Linq.Table<Author> Authors
		{
			get
			{
				return this.GetTable<Author>();
			}
		}
		
		public System.Data.Linq.Table<Vendor> Vendors
		{
			get
			{
				return this.GetTable<Vendor>();
			}
		}
		
		public System.Data.Linq.Table<Gadget> Gadgets
		{
			get
			{
				return this.GetTable<Gadget>();
			}
		}
		
		public System.Data.Linq.Table<GadgetMetadata> GadgetMetadatas
		{
			get
			{
				return this.GetTable<GadgetMetadata>();
			}
		}
	}
	
	[Table(Name="dbo.Author")]
	[DataContract()]
	public partial class Author : INotifyPropertyChanging, INotifyPropertyChanged
	{
		
		private static PropertyChangingEventArgs emptyChangingEventArgs = new PropertyChangingEventArgs(String.Empty);
		
		private int _AuthorId;
		
		private string _AuthorName;
		
		private string _href;
		
		private string _email;
		
    #region Extensibility Method Definitions
    partial void OnLoaded();
    partial void OnValidate(System.Data.Linq.ChangeAction action);
    partial void OnCreated();
    partial void OnAuthorIdChanging(int value);
    partial void OnAuthorIdChanged();
    partial void OnAuthorNameChanging(string value);
    partial void OnAuthorNameChanged();
    partial void OnhrefChanging(string value);
    partial void OnhrefChanged();
    partial void OnemailChanging(string value);
    partial void OnemailChanged();
    #endregion
		
		public Author()
		{
			this.Initialize();
		}
		
		[Column(Storage="_AuthorId", AutoSync=AutoSync.OnInsert, DbType="Int NOT NULL IDENTITY", IsPrimaryKey=true, IsDbGenerated=true)]
		[DataMember(Order=1)]
		public int AuthorId
		{
			get
			{
				return this._AuthorId;
			}
			set
			{
				if ((this._AuthorId != value))
				{
					this.OnAuthorIdChanging(value);
					this.SendPropertyChanging();
					this._AuthorId = value;
					this.SendPropertyChanged("AuthorId");
					this.OnAuthorIdChanged();
				}
			}
		}
		
		[Column(Storage="_AuthorName", DbType="NVarChar(50) NOT NULL", CanBeNull=false)]
		[DataMember(Order=2)]
		public string AuthorName
		{
			get
			{
				return this._AuthorName;
			}
			set
			{
				if ((this._AuthorName != value))
				{
					this.OnAuthorNameChanging(value);
					this.SendPropertyChanging();
					this._AuthorName = value;
					this.SendPropertyChanged("AuthorName");
					this.OnAuthorNameChanged();
				}
			}
		}
		
		[Column(Storage="_href", DbType="NVarChar(50)")]
		[DataMember(Order=3)]
		public string href
		{
			get
			{
				return this._href;
			}
			set
			{
				if ((this._href != value))
				{
					this.OnhrefChanging(value);
					this.SendPropertyChanging();
					this._href = value;
					this.SendPropertyChanged("href");
					this.OnhrefChanged();
				}
			}
		}
		
		[Column(Storage="_email", DbType="NVarChar(50)")]
		[DataMember(Order=4)]
		public string email
		{
			get
			{
				return this._email;
			}
			set
			{
				if ((this._email != value))
				{
					this.OnemailChanging(value);
					this.SendPropertyChanging();
					this._email = value;
					this.SendPropertyChanged("email");
					this.OnemailChanged();
				}
			}
		}
		
		public event PropertyChangingEventHandler PropertyChanging;
		
		public event PropertyChangedEventHandler PropertyChanged;
		
		protected virtual void SendPropertyChanging()
		{
			if ((this.PropertyChanging != null))
			{
				this.PropertyChanging(this, emptyChangingEventArgs);
			}
		}
		
		protected virtual void SendPropertyChanged(String propertyName)
		{
			if ((this.PropertyChanged != null))
			{
				this.PropertyChanged(this, new PropertyChangedEventArgs(propertyName));
			}
		}
		
		private void Initialize()
		{
			OnCreated();
		}
		
		[OnDeserializing()]
		[System.ComponentModel.EditorBrowsableAttribute(EditorBrowsableState.Never)]
		public void OnDeserializing(StreamingContext context)
		{
			this.Initialize();
		}
	}
	
	[Table(Name="dbo.Vendor")]
	[DataContract()]
	public partial class Vendor : INotifyPropertyChanging, INotifyPropertyChanged
	{
		
		private static PropertyChangingEventArgs emptyChangingEventArgs = new PropertyChangingEventArgs(String.Empty);
		
		private int _VendorId;
		
		private string _VendorName;
		
    #region Extensibility Method Definitions
    partial void OnLoaded();
    partial void OnValidate(System.Data.Linq.ChangeAction action);
    partial void OnCreated();
    partial void OnVendorIdChanging(int value);
    partial void OnVendorIdChanged();
    partial void OnVendorNameChanging(string value);
    partial void OnVendorNameChanged();
    #endregion
		
		public Vendor()
		{
			this.Initialize();
		}
		
		[Column(Storage="_VendorId", AutoSync=AutoSync.OnInsert, DbType="Int NOT NULL IDENTITY", IsPrimaryKey=true, IsDbGenerated=true)]
		[DataMember(Order=1)]
		public int VendorId
		{
			get
			{
				return this._VendorId;
			}
			set
			{
				if ((this._VendorId != value))
				{
					this.OnVendorIdChanging(value);
					this.SendPropertyChanging();
					this._VendorId = value;
					this.SendPropertyChanged("VendorId");
					this.OnVendorIdChanged();
				}
			}
		}
		
		[Column(Storage="_VendorName", DbType="NVarChar(50) NOT NULL", CanBeNull=false)]
		[DataMember(Order=2)]
		public string VendorName
		{
			get
			{
				return this._VendorName;
			}
			set
			{
				if ((this._VendorName != value))
				{
					this.OnVendorNameChanging(value);
					this.SendPropertyChanging();
					this._VendorName = value;
					this.SendPropertyChanged("VendorName");
					this.OnVendorNameChanged();
				}
			}
		}
		
		public event PropertyChangingEventHandler PropertyChanging;
		
		public event PropertyChangedEventHandler PropertyChanged;
		
		protected virtual void SendPropertyChanging()
		{
			if ((this.PropertyChanging != null))
			{
				this.PropertyChanging(this, emptyChangingEventArgs);
			}
		}
		
		protected virtual void SendPropertyChanged(String propertyName)
		{
			if ((this.PropertyChanged != null))
			{
				this.PropertyChanged(this, new PropertyChangedEventArgs(propertyName));
			}
		}
		
		private void Initialize()
		{
			OnCreated();
		}
		
		[OnDeserializing()]
		[System.ComponentModel.EditorBrowsableAttribute(EditorBrowsableState.Never)]
		public void OnDeserializing(StreamingContext context)
		{
			this.Initialize();
		}
	}
	
	[Table(Name="dbo.Gadget")]
	[DataContract()]
	public partial class Gadget : INotifyPropertyChanging, INotifyPropertyChanged
	{
		
		private static PropertyChangingEventArgs emptyChangingEventArgs = new PropertyChangingEventArgs(String.Empty);
		
		private string _GadgetUri;
		
		private string _Owner;
		
		private string _Version;
		
		private int _AuthorId;
		
		private int _GadgetMetadataId;
		
		private int _VendorId;
		
		private string _AbsoluteURL;
		
		private bool _IsDeleted;
		
		private bool _NoContent;
		
		private EntityRef<Author> _Author;
		
		private EntityRef<Vendor> _Vendor;
		
		private EntityRef<GadgetMetadata> _GadgetMetadata;
		
		private bool serializing;
		
    #region Extensibility Method Definitions
    partial void OnLoaded();
    partial void OnValidate(System.Data.Linq.ChangeAction action);
    partial void OnCreated();
    partial void OnGadgetUriChanging(string value);
    partial void OnGadgetUriChanged();
    partial void OnOwnerChanging(string value);
    partial void OnOwnerChanged();
    partial void OnVersionChanging(string value);
    partial void OnVersionChanged();
    partial void OnAuthorIdChanging(int value);
    partial void OnAuthorIdChanged();
    partial void OnGadgetMetadataIdChanging(int value);
    partial void OnGadgetMetadataIdChanged();
    partial void OnVendorIdChanging(int value);
    partial void OnVendorIdChanged();
    partial void OnAbsoluteURLChanging(string value);
    partial void OnAbsoluteURLChanged();
    partial void OnIsDeletedChanging(bool value);
    partial void OnIsDeletedChanged();
    partial void OnNoContentChanging(bool value);
    partial void OnNoContentChanged();
    #endregion
		
		public Gadget()
		{
			this.Initialize();
		}
		
		[Column(Storage="_GadgetUri", DbType="NVarChar(50) NOT NULL", CanBeNull=false, IsPrimaryKey=true)]
		[DataMember(Order=1)]
		public string GadgetUri
		{
			get
			{
				return this._GadgetUri;
			}
			set
			{
				if ((this._GadgetUri != value))
				{
					this.OnGadgetUriChanging(value);
					this.SendPropertyChanging();
					this._GadgetUri = value;
					this.SendPropertyChanged("GadgetUri");
					this.OnGadgetUriChanged();
				}
			}
		}
		
		[Column(Storage="_Owner", DbType="NVarChar(50) NOT NULL", CanBeNull=false)]
		[DataMember(Order=2)]
		public string Owner
		{
			get
			{
				return this._Owner;
			}
			set
			{
				if ((this._Owner != value))
				{
					this.OnOwnerChanging(value);
					this.SendPropertyChanging();
					this._Owner = value;
					this.SendPropertyChanged("Owner");
					this.OnOwnerChanged();
				}
			}
		}
		
		[Column(Storage="_Version", DbType="NVarChar(7) NOT NULL", CanBeNull=false)]
		[DataMember(Order=3)]
		public string Version
		{
			get
			{
				return this._Version;
			}
			set
			{
				if ((this._Version != value))
				{
					this.OnVersionChanging(value);
					this.SendPropertyChanging();
					this._Version = value;
					this.SendPropertyChanged("Version");
					this.OnVersionChanged();
				}
			}
		}
		
		[Column(Storage="_AuthorId", DbType="Int NOT NULL")]
		[DataMember(Order=4)]
		public int AuthorId
		{
			get
			{
				return this._AuthorId;
			}
			set
			{
				if ((this._AuthorId != value))
				{
					if (this._Author.HasLoadedOrAssignedValue)
					{
						throw new System.Data.Linq.ForeignKeyReferenceAlreadyHasValueException();
					}
					this.OnAuthorIdChanging(value);
					this.SendPropertyChanging();
					this._AuthorId = value;
					this.SendPropertyChanged("AuthorId");
					this.OnAuthorIdChanged();
				}
			}
		}
		
		[Column(Storage="_GadgetMetadataId", DbType="Int NOT NULL")]
		[DataMember(Order=5)]
		public int GadgetMetadataId
		{
			get
			{
				return this._GadgetMetadataId;
			}
			set
			{
				if ((this._GadgetMetadataId != value))
				{
					if (this._GadgetMetadata.HasLoadedOrAssignedValue)
					{
						throw new System.Data.Linq.ForeignKeyReferenceAlreadyHasValueException();
					}
					this.OnGadgetMetadataIdChanging(value);
					this.SendPropertyChanging();
					this._GadgetMetadataId = value;
					this.SendPropertyChanged("GadgetMetadataId");
					this.OnGadgetMetadataIdChanged();
				}
			}
		}
		
		[Column(Storage="_VendorId", DbType="Int NOT NULL")]
		[DataMember(Order=6)]
		public int VendorId
		{
			get
			{
				return this._VendorId;
			}
			set
			{
				if ((this._VendorId != value))
				{
					if (this._Vendor.HasLoadedOrAssignedValue)
					{
						throw new System.Data.Linq.ForeignKeyReferenceAlreadyHasValueException();
					}
					this.OnVendorIdChanging(value);
					this.SendPropertyChanging();
					this._VendorId = value;
					this.SendPropertyChanged("VendorId");
					this.OnVendorIdChanged();
				}
			}
		}
		
		[Column(Storage="_AbsoluteURL", DbType="NVarChar(50) NOT NULL", CanBeNull=false)]
		[DataMember(Order=7)]
		public string AbsoluteURL
		{
			get
			{
				return this._AbsoluteURL;
			}
			set
			{
				if ((this._AbsoluteURL != value))
				{
					this.OnAbsoluteURLChanging(value);
					this.SendPropertyChanging();
					this._AbsoluteURL = value;
					this.SendPropertyChanged("AbsoluteURL");
					this.OnAbsoluteURLChanged();
				}
			}
		}
		
		[Column(Storage="_IsDeleted", DbType="Bit NOT NULL")]
		[DataMember(Order=8)]
		public bool IsDeleted
		{
			get
			{
				return this._IsDeleted;
			}
			set
			{
				if ((this._IsDeleted != value))
				{
					this.OnIsDeletedChanging(value);
					this.SendPropertyChanging();
					this._IsDeleted = value;
					this.SendPropertyChanged("IsDeleted");
					this.OnIsDeletedChanged();
				}
			}
		}
		
		[Column(Storage="_NoContent", DbType="Bit NOT NULL")]
		[DataMember(Order=9)]
		public bool NoContent
		{
			get
			{
				return this._NoContent;
			}
			set
			{
				if ((this._NoContent != value))
				{
					this.OnNoContentChanging(value);
					this.SendPropertyChanging();
					this._NoContent = value;
					this.SendPropertyChanged("NoContent");
					this.OnNoContentChanged();
				}
			}
		}
		
		[Association(Name="Author_Gadget", Storage="_Author", ThisKey="AuthorId", OtherKey="AuthorId", IsForeignKey=true)]
		[DataMember(Order=10, EmitDefaultValue=false)]
		public Author Author
		{
			get
			{
				if ((this.serializing 
							&& (this._Author.HasLoadedOrAssignedValue == false)))
				{
					return null;
				}
				return this._Author.Entity;
			}
			set
			{
				if ((this._Author.Entity != value))
				{
					this.SendPropertyChanging();
					this._Author.Entity = value;
					this.SendPropertyChanged("Author");
				}
			}
		}
		
		[Association(Name="Vendor_Gadget", Storage="_Vendor", ThisKey="VendorId", OtherKey="VendorId", IsForeignKey=true)]
		[DataMember(Order=11, EmitDefaultValue=false)]
		public Vendor Vendor
		{
			get
			{
				if ((this.serializing 
							&& (this._Vendor.HasLoadedOrAssignedValue == false)))
				{
					return null;
				}
				return this._Vendor.Entity;
			}
			set
			{
				if ((this._Vendor.Entity != value))
				{
					this.SendPropertyChanging();
					this._Vendor.Entity = value;
					this.SendPropertyChanged("Vendor");
				}
			}
		}
		
		[Association(Name="GadgetMetadata_Gadget", Storage="_GadgetMetadata", ThisKey="GadgetMetadataId", OtherKey="GadgetMetadataId", IsForeignKey=true)]
		[DataMember(Order=12, EmitDefaultValue=false)]
		public GadgetMetadata GadgetMetadata
		{
			get
			{
				if ((this.serializing 
							&& (this._GadgetMetadata.HasLoadedOrAssignedValue == false)))
				{
					return null;
				}
				return this._GadgetMetadata.Entity;
			}
			set
			{
				if ((this._GadgetMetadata.Entity != value))
				{
					this.SendPropertyChanging();
					this._GadgetMetadata.Entity = value;
					this.SendPropertyChanged("GadgetMetadata");
				}
			}
		}
		
		public event PropertyChangingEventHandler PropertyChanging;
		
		public event PropertyChangedEventHandler PropertyChanged;
		
		protected virtual void SendPropertyChanging()
		{
			if ((this.PropertyChanging != null))
			{
				this.PropertyChanging(this, emptyChangingEventArgs);
			}
		}
		
		protected virtual void SendPropertyChanged(String propertyName)
		{
			if ((this.PropertyChanged != null))
			{
				this.PropertyChanged(this, new PropertyChangedEventArgs(propertyName));
			}
		}
		
		private void Initialize()
		{
			this._Author = default(EntityRef<Author>);
			this._Vendor = default(EntityRef<Vendor>);
			this._GadgetMetadata = default(EntityRef<GadgetMetadata>);
			OnCreated();
		}
		
		[OnDeserializing()]
		[System.ComponentModel.EditorBrowsableAttribute(EditorBrowsableState.Never)]
		public void OnDeserializing(StreamingContext context)
		{
			this.Initialize();
		}
		
		[OnSerializing()]
		[System.ComponentModel.EditorBrowsableAttribute(EditorBrowsableState.Never)]
		public void OnSerializing(StreamingContext context)
		{
			this.serializing = true;
		}
		
		[OnSerialized()]
		[System.ComponentModel.EditorBrowsableAttribute(EditorBrowsableState.Never)]
		public void OnSerialized(StreamingContext context)
		{
			this.serializing = false;
		}
	}
	
	[Table(Name="dbo.GadgetMetadata")]
	[DataContract()]
	public partial class GadgetMetadata : INotifyPropertyChanging, INotifyPropertyChanged
	{
		
		private static PropertyChangingEventArgs emptyChangingEventArgs = new PropertyChangingEventArgs(String.Empty);
		
		private int _GadgetMetadataId;
		
		private string _GadgetName;
		
		private string _GadgetShortName;
		
		private string _GadgetDescription;
		
		private System.Nullable<int> _GadgetDefaultHeight;
		
		private System.Nullable<int> _GadgetDefaultWidth;
		
    #region Extensibility Method Definitions
    partial void OnLoaded();
    partial void OnValidate(System.Data.Linq.ChangeAction action);
    partial void OnCreated();
    partial void OnGadgetMetadataIdChanging(int value);
    partial void OnGadgetMetadataIdChanged();
    partial void OnGadgetNameChanging(string value);
    partial void OnGadgetNameChanged();
    partial void OnGadgetShortNameChanging(string value);
    partial void OnGadgetShortNameChanged();
    partial void OnGadgetDescriptionChanging(string value);
    partial void OnGadgetDescriptionChanged();
    partial void OnGadgetDefaultHeightChanging(System.Nullable<int> value);
    partial void OnGadgetDefaultHeightChanged();
    partial void OnGadgetDefaultWidthChanging(System.Nullable<int> value);
    partial void OnGadgetDefaultWidthChanged();
    #endregion
		
		public GadgetMetadata()
		{
			this.Initialize();
		}
		
		[Column(Storage="_GadgetMetadataId", AutoSync=AutoSync.OnInsert, DbType="Int NOT NULL IDENTITY", IsPrimaryKey=true, IsDbGenerated=true)]
		[DataMember(Order=1)]
		public int GadgetMetadataId
		{
			get
			{
				return this._GadgetMetadataId;
			}
			set
			{
				if ((this._GadgetMetadataId != value))
				{
					this.OnGadgetMetadataIdChanging(value);
					this.SendPropertyChanging();
					this._GadgetMetadataId = value;
					this.SendPropertyChanged("GadgetMetadataId");
					this.OnGadgetMetadataIdChanged();
				}
			}
		}
		
		[Column(Storage="_GadgetName", DbType="NVarChar(40) NOT NULL", CanBeNull=false)]
		[DataMember(Order=2)]
		public string GadgetName
		{
			get
			{
				return this._GadgetName;
			}
			set
			{
				if ((this._GadgetName != value))
				{
					this.OnGadgetNameChanging(value);
					this.SendPropertyChanging();
					this._GadgetName = value;
					this.SendPropertyChanged("GadgetName");
					this.OnGadgetNameChanged();
				}
			}
		}
		
		[Column(Storage="_GadgetShortName", DbType="NVarChar(10)")]
		[DataMember(Order=3)]
		public string GadgetShortName
		{
			get
			{
				return this._GadgetShortName;
			}
			set
			{
				if ((this._GadgetShortName != value))
				{
					this.OnGadgetShortNameChanging(value);
					this.SendPropertyChanging();
					this._GadgetShortName = value;
					this.SendPropertyChanged("GadgetShortName");
					this.OnGadgetShortNameChanged();
				}
			}
		}
		
		[Column(Storage="_GadgetDescription", DbType="NVarChar(150)")]
		[DataMember(Order=4)]
		public string GadgetDescription
		{
			get
			{
				return this._GadgetDescription;
			}
			set
			{
				if ((this._GadgetDescription != value))
				{
					this.OnGadgetDescriptionChanging(value);
					this.SendPropertyChanging();
					this._GadgetDescription = value;
					this.SendPropertyChanged("GadgetDescription");
					this.OnGadgetDescriptionChanged();
				}
			}
		}
		
		[Column(Storage="_GadgetDefaultHeight", DbType="Int")]
		[DataMember(Order=5)]
		public System.Nullable<int> GadgetDefaultHeight
		{
			get
			{
				return this._GadgetDefaultHeight;
			}
			set
			{
				if ((this._GadgetDefaultHeight != value))
				{
					this.OnGadgetDefaultHeightChanging(value);
					this.SendPropertyChanging();
					this._GadgetDefaultHeight = value;
					this.SendPropertyChanged("GadgetDefaultHeight");
					this.OnGadgetDefaultHeightChanged();
				}
			}
		}
		
		[Column(Storage="_GadgetDefaultWidth", DbType="Int")]
		[DataMember(Order=6)]
		public System.Nullable<int> GadgetDefaultWidth
		{
			get
			{
				return this._GadgetDefaultWidth;
			}
			set
			{
				if ((this._GadgetDefaultWidth != value))
				{
					this.OnGadgetDefaultWidthChanging(value);
					this.SendPropertyChanging();
					this._GadgetDefaultWidth = value;
					this.SendPropertyChanged("GadgetDefaultWidth");
					this.OnGadgetDefaultWidthChanged();
				}
			}
		}
		
		public event PropertyChangingEventHandler PropertyChanging;
		
		public event PropertyChangedEventHandler PropertyChanged;
		
		protected virtual void SendPropertyChanging()
		{
			if ((this.PropertyChanging != null))
			{
				this.PropertyChanging(this, emptyChangingEventArgs);
			}
		}
		
		protected virtual void SendPropertyChanged(String propertyName)
		{
			if ((this.PropertyChanged != null))
			{
				this.PropertyChanged(this, new PropertyChangedEventArgs(propertyName));
			}
		}
		
		private void Initialize()
		{
			OnCreated();
		}
		
		[OnDeserializing()]
		[System.ComponentModel.EditorBrowsableAttribute(EditorBrowsableState.Never)]
		public void OnDeserializing(StreamingContext context)
		{
			this.Initialize();
		}
	}
}
#pragma warning restore 1591
