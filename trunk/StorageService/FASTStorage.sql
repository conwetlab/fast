/****** Object:  ForeignKey [FK_Gadget_Author]    Script Date: 02/22/2010 14:56:16 ******/
IF  EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[dbo].[FK_Gadget_Author]') AND parent_object_id = OBJECT_ID(N'[dbo].[Gadget]'))
ALTER TABLE [dbo].[Gadget] DROP CONSTRAINT [FK_Gadget_Author]
GO
/****** Object:  ForeignKey [FK_Gadget_GadgetMetadata]    Script Date: 02/22/2010 14:56:16 ******/
IF  EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[dbo].[FK_Gadget_GadgetMetadata]') AND parent_object_id = OBJECT_ID(N'[dbo].[Gadget]'))
ALTER TABLE [dbo].[Gadget] DROP CONSTRAINT [FK_Gadget_GadgetMetadata]
GO
/****** Object:  ForeignKey [FK_Gadget_Vendor]    Script Date: 02/22/2010 14:56:16 ******/
IF  EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[dbo].[FK_Gadget_Vendor]') AND parent_object_id = OBJECT_ID(N'[dbo].[Gadget]'))
ALTER TABLE [dbo].[Gadget] DROP CONSTRAINT [FK_Gadget_Vendor]
GO
/****** Object:  Table [dbo].[Gadget]    Script Date: 02/22/2010 14:56:16 ******/
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Gadget]') AND type in (N'U'))
DROP TABLE [dbo].[Gadget]
GO
/****** Object:  Table [dbo].[Author]    Script Date: 02/22/2010 14:56:16 ******/
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Author]') AND type in (N'U'))
DROP TABLE [dbo].[Author]
GO
/****** Object:  Table [dbo].[Vendor]    Script Date: 02/22/2010 14:56:16 ******/
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Vendor]') AND type in (N'U'))
DROP TABLE [dbo].[Vendor]
GO
/****** Object:  Table [dbo].[GadgetMetadata]    Script Date: 02/22/2010 14:56:16 ******/
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[GadgetMetadata]') AND type in (N'U'))
DROP TABLE [dbo].[GadgetMetadata]
GO
/****** Object:  Default [DF_Gadget_IsDeleted]    Script Date: 02/22/2010 14:56:16 ******/
IF  EXISTS (SELECT * FROM sys.default_constraints WHERE object_id = OBJECT_ID(N'[dbo].[DF_Gadget_IsDeleted]') AND parent_object_id = OBJECT_ID(N'[dbo].[Gadget]'))
Begin
IF  EXISTS (SELECT * FROM dbo.sysobjects WHERE id = OBJECT_ID(N'[DF_Gadget_IsDeleted]') AND type = 'D')
BEGIN
ALTER TABLE [dbo].[Gadget] DROP CONSTRAINT [DF_Gadget_IsDeleted]
END


End
GO
/****** Object:  Default [DF_Gadget_NoContent]    Script Date: 02/22/2010 14:56:16 ******/
IF  EXISTS (SELECT * FROM sys.default_constraints WHERE object_id = OBJECT_ID(N'[dbo].[DF_Gadget_NoContent]') AND parent_object_id = OBJECT_ID(N'[dbo].[Gadget]'))
Begin
IF  EXISTS (SELECT * FROM dbo.sysobjects WHERE id = OBJECT_ID(N'[DF_Gadget_NoContent]') AND type = 'D')
BEGIN
ALTER TABLE [dbo].[Gadget] DROP CONSTRAINT [DF_Gadget_NoContent]
END


End
GO
/****** Object:  Table [dbo].[GadgetMetadata]    Script Date: 02/22/2010 14:56:16 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[GadgetMetadata]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[GadgetMetadata](
	[GadgetMetadataId] [int] IDENTITY(1,1) NOT NULL,
	[GadgetName] [nvarchar](40) COLLATE Latin1_General_CI_AS NOT NULL,
	[GadgetShortName] [nvarchar](10) COLLATE Latin1_General_CI_AS NULL,
	[GadgetDescription] [nvarchar](150) COLLATE Latin1_General_CI_AS NULL,
	[GadgetDefaultHeight] [int] NULL,
	[GadgetDefaultWidth] [int] NULL,
 CONSTRAINT [PK_GadgetMetadata] PRIMARY KEY CLUSTERED 
(
	[GadgetMetadataId] ASC
)WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON)
)
END
GO
/****** Object:  Table [dbo].[Vendor]    Script Date: 02/22/2010 14:56:16 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Vendor]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[Vendor](
	[VendorId] [int] IDENTITY(1,1) NOT NULL,
	[VendorName] [nvarchar](50) COLLATE Latin1_General_CI_AS NOT NULL,
 CONSTRAINT [PK_Vendor] PRIMARY KEY CLUSTERED 
(
	[VendorId] ASC
)WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON)
)
END
GO
/****** Object:  Table [dbo].[Author]    Script Date: 02/22/2010 14:56:16 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Author]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[Author](
	[AuthorId] [int] IDENTITY(1,1) NOT NULL,
	[AuthorName] [nvarchar](50) COLLATE Latin1_General_CI_AS NOT NULL,
	[href] [nvarchar](50) COLLATE Latin1_General_CI_AS NULL,
	[email] [nvarchar](50) COLLATE Latin1_General_CI_AS NULL,
 CONSTRAINT [PK_Author] PRIMARY KEY CLUSTERED 
(
	[AuthorId] ASC
)WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON)
)
END
GO
/****** Object:  Table [dbo].[Gadget]    Script Date: 02/22/2010 14:56:16 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Gadget]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[Gadget](
	[GadgetUri] [nvarchar](50) COLLATE Latin1_General_CI_AS NOT NULL,
	[Owner] [nvarchar](50) COLLATE Latin1_General_CI_AS NOT NULL,
	[Version] [nvarchar](7) COLLATE Latin1_General_CI_AS NOT NULL,
	[AuthorId] [int] NOT NULL,
	[GadgetMetadataId] [int] NOT NULL,
	[VendorId] [int] NOT NULL,
	[AbsoluteURL] [nvarchar](50) COLLATE Latin1_General_CI_AS NOT NULL,
	[IsDeleted] [bit] NOT NULL,
	[NoContent] [bit] NOT NULL,
 CONSTRAINT [PK_Gadget] PRIMARY KEY CLUSTERED 
(
	[GadgetUri] ASC
)WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON)
)
END
GO
/****** Object:  Default [DF_Gadget_IsDeleted]    Script Date: 02/22/2010 14:56:16 ******/
IF Not EXISTS (SELECT * FROM sys.default_constraints WHERE object_id = OBJECT_ID(N'[dbo].[DF_Gadget_IsDeleted]') AND parent_object_id = OBJECT_ID(N'[dbo].[Gadget]'))
Begin
IF NOT EXISTS (SELECT * FROM dbo.sysobjects WHERE id = OBJECT_ID(N'[DF_Gadget_IsDeleted]') AND type = 'D')
BEGIN
ALTER TABLE [dbo].[Gadget] ADD  CONSTRAINT [DF_Gadget_IsDeleted]  DEFAULT ((0)) FOR [IsDeleted]
END


End
GO
/****** Object:  Default [DF_Gadget_NoContent]    Script Date: 02/22/2010 14:56:16 ******/
IF Not EXISTS (SELECT * FROM sys.default_constraints WHERE object_id = OBJECT_ID(N'[dbo].[DF_Gadget_NoContent]') AND parent_object_id = OBJECT_ID(N'[dbo].[Gadget]'))
Begin
IF NOT EXISTS (SELECT * FROM dbo.sysobjects WHERE id = OBJECT_ID(N'[DF_Gadget_NoContent]') AND type = 'D')
BEGIN
ALTER TABLE [dbo].[Gadget] ADD  CONSTRAINT [DF_Gadget_NoContent]  DEFAULT ((1)) FOR [NoContent]
END


End
GO
/****** Object:  ForeignKey [FK_Gadget_Author]    Script Date: 02/22/2010 14:56:16 ******/
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[dbo].[FK_Gadget_Author]') AND parent_object_id = OBJECT_ID(N'[dbo].[Gadget]'))
ALTER TABLE [dbo].[Gadget]  WITH CHECK ADD  CONSTRAINT [FK_Gadget_Author] FOREIGN KEY([AuthorId])
REFERENCES [dbo].[Author] ([AuthorId])
GO
IF  EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[dbo].[FK_Gadget_Author]') AND parent_object_id = OBJECT_ID(N'[dbo].[Gadget]'))
ALTER TABLE [dbo].[Gadget] CHECK CONSTRAINT [FK_Gadget_Author]
GO
/****** Object:  ForeignKey [FK_Gadget_GadgetMetadata]    Script Date: 02/22/2010 14:56:16 ******/
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[dbo].[FK_Gadget_GadgetMetadata]') AND parent_object_id = OBJECT_ID(N'[dbo].[Gadget]'))
ALTER TABLE [dbo].[Gadget]  WITH CHECK ADD  CONSTRAINT [FK_Gadget_GadgetMetadata] FOREIGN KEY([GadgetMetadataId])
REFERENCES [dbo].[GadgetMetadata] ([GadgetMetadataId])
GO
IF  EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[dbo].[FK_Gadget_GadgetMetadata]') AND parent_object_id = OBJECT_ID(N'[dbo].[Gadget]'))
ALTER TABLE [dbo].[Gadget] CHECK CONSTRAINT [FK_Gadget_GadgetMetadata]
GO
/****** Object:  ForeignKey [FK_Gadget_Vendor]    Script Date: 02/22/2010 14:56:16 ******/
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[dbo].[FK_Gadget_Vendor]') AND parent_object_id = OBJECT_ID(N'[dbo].[Gadget]'))
ALTER TABLE [dbo].[Gadget]  WITH CHECK ADD  CONSTRAINT [FK_Gadget_Vendor] FOREIGN KEY([VendorId])
REFERENCES [dbo].[Vendor] ([VendorId])
GO
IF  EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[dbo].[FK_Gadget_Vendor]') AND parent_object_id = OBJECT_ID(N'[dbo].[Gadget]'))
ALTER TABLE [dbo].[Gadget] CHECK CONSTRAINT [FK_Gadget_Vendor]
GO
