/**
 * Copyright (c) 2008-2011, FAST Consortium
 * 
 * This file is part of FAST Platform.
 * 
 * FAST Platform is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * FAST Platform is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 * or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public
 * License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with FAST Platform. If not, see <http://www.gnu.org/licenses/>.
 * 
 * Info about members and contributors of the FAST Consortium
 * is available at http://fast.morfeo-project.eu
 *
 **/
package eu.morfeoproject.fast.catalogue.vocabulary;

import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.model.node.impl.URIImpl;

/**
 * Vocabulary File. Created by org.ontoware.rdf2go.util.VocabularyWriter on Tue Nov 30 16:24:34 GMT 2010
 * input file: src/eu/morfeoproject/fast/catalogue/ontologies/doap.rdf
 * namespace: http://usefulinc.com/ns/doap#
 */
public interface DOAP {
	public static final URI NS_DOAP = new URIImpl("http://usefulinc.com/ns/doap#",false);

    /**
     * Label: Git repository@de Gitのリポジトリ@ja Git Repository@en Dépôt Git@fr Repositorio Git@es Úložiště Git@cs 
     * Comment: Repositorio Git del código fuente.@es Git source code repository.@en Úložiště zdrojových kódů Git.@cs ソースコードのGitのリポジトリ@ja Dépôt Git du code source.@fr Git Quellcode-Versionierungssystem.@de 
     */
    public static final URI GitRepository = new URIImpl("http://usefulinc.com/ns/doap#GitRepository", false);

    /**
     * Label: Repositorio Subversion@es Dépôt Subversion@fr Úložiště Subversion@cs Subversionのリポジトリ@ja Subversion Repository@en Subversion Repository@de 
     * Comment: Subversion source code repository.@en Repositorio Subversion del código fuente.@es Subversion Quellcode-Versionierungssystem.@de Úložiště zdrojových kódů Subversion.@cs ソースコードのSubversionのリポジトリ@ja Dépôt Subversion du code source.@fr 
     */
    public static final URI SVNRepository = new URIImpl("http://usefulinc.com/ns/doap#SVNRepository", false);

    /**
     * Label: Úložiště BitKeeper@cs Dépôt BitKeeper@fr BitKeeperのリポジトリ@ja Repositorio BitKeeper@es BitKeeper Repository@en BitKeeper Repository@de 
     * Comment: Repositorio BitKeeper del código fuente.@es Úložiště zdrojových kódů BitKeeper.@cs ソースコードのBitKeeperのリポジトリ@ja Dépôt BitKeeper du code source.@fr BitKeeper Quellcode-Versionierungssystem.@de BitKeeper source code repository.@en 
     */
    public static final URI BKRepository = new URIImpl("http://usefulinc.com/ns/doap#BKRepository", false);

    /**
     * Label: CVSのリポジトリ@ja Repositorio CVS@es Dépôt CVS@fr CVS Repository@en CVS Repository@de Úložiště CVS@cs 
     * Comment: Repositorio CVS del código fuente.@es Dépôt CVS du code source.@fr Úložiště zdrojových kódů CVS.@cs CVS Quellcode-Versionierungssystem.@de CVS source code repository.@en ソースコードのCVSのリポジトリ@ja 
     */
    public static final URI CVSRepository = new URIImpl("http://usefulinc.com/ns/doap#CVSRepository", false);

    /**
     * Label: Úložiště GNU Arch@cs Dépôt GNU Arch@fr GNU Archのリポジトリ@ja Repositorio GNU Arch@es GNU Arch repository@en GNU Arch repository@de 
     * Comment: ソースコードのGNU Archのリポジトリ@ja GNU Arch source code repository.@en Repositorio GNU Arch del código fuente.@es GNU Arch Quellcode-Versionierungssystem.@de Úložiště zdrojových kódů GNU Arch.@cs Dépôt GNU Arch du code source.@fr 
     */
    public static final URI ArchRepository = new URIImpl("http://usefulinc.com/ns/doap#ArchRepository", false);

    /**
     * Label: 明細書じ@ja Specification@en 
     * Comment: あるシステムの詳しく書いた明細書。多分技術的なもの。@ja A specification of a system's aspects, technical or otherwise.@en 
     */
    public static final URI Specification = new URIImpl("http://usefulinc.com/ns/doap#Specification", false);

    /**
     * Label: Projet@fr Prijekt@de Proyecto@es プロジェクト@ja Projekt@cs Project@en 
     * Comment: Ein Projekt.@de プログラミングのプロジェクト@ja A project.@en Projekt.@cs Un proyecto.@es Un projet.@fr 
     */
    public static final URI Project = new URIImpl("http://usefulinc.com/ns/doap#Project", false);

    /**
     * Label: Bazzarのリポジトリ@ja Bazaar Branch@en 
     * Comment: ソースコードのBazzarのリポジトリ@ja Bazaar source code branch.@en 
     */
    public static final URI BazaarBranch = new URIImpl("http://usefulinc.com/ns/doap#BazaarBranch", false);

    /**
     * Label: Dépôt darcs@fr darcs Repository@en darcsのリポジトリ@ja Repositorio darcs@es 
     * Comment: Dépôt darcs du code source.@fr Repositorio darcs del código fuente.@es darcs source code repository.@en ソースコードのdarcsのリポジトリ@ja 
     */
    public static final URI DarcsRepository = new URIImpl("http://usefulinc.com/ns/doap#DarcsRepository", false);

    /**
     * Label: Mercurialのリポジトリ@ja Mercurial Repository@en 
     * Comment: ソースコードのMercurialのリポジトリ@ja Mercurial source code repository.@en 
     */
    public static final URI HgRepository = new URIImpl("http://usefulinc.com/ns/doap#HgRepository", false);

    /**
     * Label: バーション@ja Verze@cs Versión@es Version@en Version@fr Version@de 
     * Comment: Versionsinformation eines Projekt Releases.@de Détails sur une version d'une realease d'un projet.@fr リリースのバーション情報@jp Informace o uvolněné verzi projektu.@cs Información sobre la versión de un release del proyecto.@es Version information of a project release.@en 
     */
    public static final URI Version = new URIImpl("http://usefulinc.com/ns/doap#Version", false);

    /**
     * Label: Úložiště@cs Repositorio@es Dépôt@fr リポジトリ@ja Repository@en Repository@de 
     * Comment: Quellcode-Versionierungssystem.@de Source code repository.@en Repositorio del código fuente.@es ソースコードのリポジトリ@ja Úložiště zdrojových kódů.@cs Dépôt du code source.@fr 
     */
    public static final URI Repository = new URIImpl("http://usefulinc.com/ns/doap#Repository", false);

    /**
     * Label: 目指したユーザ@ja audience@en 
     * Comment: 目指したユーザたちの説明@ja Description of target user base@en 
     * Comment: http://usefulinc.com/ns/doap#Project 
     * Range: http://www.w3.org/2000/01/rdf-schema#Literal 
     */
    public static final URI audience = new URIImpl("http://usefulinc.com/ns/doap#audience", false);

    /**
     * Label: catégorie@fr kategorie@cs category@en Kategorie@de 分類@ja categoría@es 
     * Comment: Eine Kategorie eines Projektes.@de Kategorie projektu.@cs Una categoría de proyecto.@es A category of project.@en このプロジェクトの分類。@ja Une catégorie de projet.@fr 
     * Comment: http://usefulinc.com/ns/doap#Project 
     */
    public static final URI category = new URIImpl("http://usefulinc.com/ns/doap#category", false);

    /**
     * Label: browse@de browse@en navegar@es prohlížeč@cs visualiser@fr ウェブのユーザインタフェース@ja 
     * Comment: Web browser interface to repository.@en Interface web au dépôt.@fr Web-Browser Interface für das Repository.@de Interface web del repositorio.@es このリポジトリのウェブのウェブのユーザインタフェース@ja Webové rozhraní pro prohlížení úložiště.@cs 
     * Comment: http://usefulinc.com/ns/doap#Repository 
     */
    public static final URI browse = new URIImpl("http://usefulinc.com/ns/doap#browse", false);

    /**
     * Label: description courte@fr descripción corta@es short description@en Kurzbeschreibung@de krátký popis@cs 簡単な説明@ja 
     * Comment: Kurzbeschreibung (8 oder 9 Wörter) eines Projects als einfacher Text.@de Short (8 or 9 words) plain text description of a project.@en Krátký (8 nebo 9 slov) čistě textový popis projektu.@cs Texte descriptif concis (8 ou 9 mots) d'un projet.@fr Descripción corta (8 o 9 palabras) en texto plano de un proyecto.@es 日本語の二十文字ぐらいの説明@ja 
     * Range: http://www.w3.org/2000/01/rdf-schema#Literal 
     */
    public static final URI shortdesc = new URIImpl("http://usefulinc.com/ns/doap#shortdesc", false);

    /**
     * Label: Wiki@de wiki@en wiki@fr wiki@es wiki@cs ウィキ@ja 
     * Comment: URL del Wiki para discusión colaborativa del proyecto.@es このプロジェクトの討論用ウィキ@ja URL adresa wiki projektu pro společné diskuse.@cs L'URL du Wiki pour la discussion collaborative sur le projet.@fr URL of Wiki for collaborative discussion of project.@en Wiki-URL für die kollaborative Dikussion eines Projektes.@de 
     * Comment: http://usefulinc.com/ns/doap#Project 
     */
    public static final URI wiki = new URIImpl("http://usefulinc.com/ns/doap#wiki", false);

    /**
     * Label: sistema operativo@es operating system@en système d'exploitation@fr operační systém@cs Betriebssystem@de オペレーティングシステム@ja 
     * Comment: Sistema opertivo al cuál está limitado el proyecto.  Omita esta propiedad si el proyecto no es específico
		de un sistema opertaivo en particular.@es Operační systém, na jehož použití je projekt limitován. Vynechejte tuto vlastnost, pokud je projekt nezávislý na operačním systému.@cs Betriebssystem auf dem das Projekt eingesetzt werden kann. Diese Eigenschaft kann ausgelassen werden, wenn das Projekt nicht BS-spezifisch ist.@de このプロジェクトの限られたオペレーティングシステム。もし、プロジェクトはどのOSも大丈夫なら、このプロパティを書き落としていい。@ja Operating system that a project is limited to.  Omit this property if the project is not OS-specific.@en Système d'exploitation auquel est limité le projet. Omettez cette propriété si le
		projet n'est pas limité à un système d'exploitation.@fr 
     * Comment: http://usefulinc.com/ns/doap#Version http://usefulinc.com/ns/doap#Project 
     * Range: http://www.w3.org/2000/01/rdf-schema#Literal 
     */
    public static final URI os = new URIImpl("http://usefulinc.com/ns/doap#os", false);

    /**
     * Label: emplacement du dépôt@fr umístění úložiště@cs Repository Lokation@de repository location@en lugar del respositorio@es このリポジトリのURL@ja 
     * Comment: Umístění úložiště.@cs このリポジトリの場所。@ja Lokation eines Repositorys.@de Emplacement d'un dépôt.@fr Location of a repository.@en lugar de un repositorio.@es 
     * Comment: http://usefulinc.com/ns/doap#Repository 
     */
    public static final URI location = new URIImpl("http://usefulinc.com/ns/doap#location", false);

    /**
     * Label: licencia@es ライセンス@ja Lizenz@de licence@fr licence@cs license@en 
     * Comment: URI adresa RDF popisu licence, pod kterou je software distribuován.@cs L'URI d'une description RDF de la licence sous laquelle le programme est distribué.@fr The URI of an RDF description of the license the software is distributed under.@en Die URI einer RDF-Beschreibung einer Lizenz unter der die Software herausgegeben wird.@de El URI de una descripción RDF de la licencia bajo la cuál se distribuye el software.@es このプロジェクトの散布ライセンスのRDF説明のURI@ja 
     */
    public static final URI license = new URIImpl("http://usefulinc.com/ns/doap#license", false);

    /**
     * Label: プログラミング言語@ja langage de programmation@fr programovací jazyk@cs programming language@en Programmiersprache@de lenguaje de programación@es 
     * Comment: Lenguaje de programación en el que un proyecto es implementado o con el cuál pretende usarse.@es Programmiersprache in der ein Projekt implementiert ist oder intendiert wird zu benutzen.@de Programovací jazyk, ve kterém je projekt implementován nebo pro který je zamýšlen k použití.@cs このプログラミングの実装のプログラミング言語、または目指した言語。@ja Programming language a project is implemented in or intended for use with.@en Langage de programmation avec lequel un projet est implémenté,
		ou avec lequel il est prévu de l'utiliser.@fr 
     * Comment: http://usefulinc.com/ns/doap#Project 
     * Range: http://www.w3.org/2000/01/rdf-schema#Literal 
     */
    public static final URI programming_language = new URIImpl("http://usefulinc.com/ns/doap#programming-language", false);

    /**
     * Label: 実装した明細書@ja Implements specification@en 
     * Comment: このプロジェクトが実装したシステムの明細書。標準やAPIや明細書のようなもの。@ja A specification that a project implements. Could be a standard, API or legally defined level of conformance.@en 
     * Comment: http://usefulinc.com/ns/doap#Project 
     * Range: http://usefulinc.com/ns/doap#Specification 
     * @comment: implements is a reserved keywork in Java (Ismael Rivera) 
     */
    public static final URI implements_specification = new URIImpl("http://usefulinc.com/ns/doap#implements", false);

    /**
     * Label: mailing list@en e–mailová diskuse@cs メーリングリスト@ja Mailing Liste@de lista de correo@es liste de diffusion@fr 
     * Comment: メーリングリストのホームページやメールアドレス@ja Homepage der Mailing Liste oder E-Mail Adresse.@de Página web de la lista de correo o dirección de correo.@es Domovská stránka nebo e–mailová adresa e–mailové diskuse.@cs Page web de la liste de diffusion, ou adresse de courriel.@fr Mailing list home page or email address.@en 
     * Comment: http://usefulinc.com/ns/doap#Project 
     */
    public static final URI mailing_list = new URIImpl("http://usefulinc.com/ns/doap#mailing-list", false);

    /**
     * Label: bug database@en databáze chyb@cs base de datos de bugs@es suivi des bugs@fr バグページ@ja Fehlerdatenbank@de 
     * Comment: Suivi des bugs pour un projet.@fr Fehlerdatenbank eines Projektes.@de Bug tracker for a project.@en Správa chyb projektu.@cs このプロジェクのバグ管理ページ@ja Bug tracker para un proyecto.@es 
     * Comment: http://usefulinc.com/ns/doap#Project 
     */
    public static final URI bug_database = new URIImpl("http://usefulinc.com/ns/doap#bug-database", false);

    /**
     * Label: 作成日付@ja erstellt@de creado@es vytvořeno@cs créé@fr created@en 
     * Comment: 何かが作成された日付、AAAA-MM-JJの型、例えば2004-04-05。@ja Datum, kdy bylo něco vytvořeno ve formátu RRRR-MM-DD, např. 2004-04-05@cs Date when something was created, in YYYY-MM-DD form. e.g. 2004-04-05@en Fecha en la que algo fue creado, en formato AAAA-MM-DD. e.g. 2004-04-05@es Date à laquelle a été créé quelque chose, au format AAAA-MM-JJ (par ex. 2004-04-05)@fr Erstellungsdatum von Irgendwas, angegeben im YYYY-MM-DD Format, z.B. 2004-04-05.@de 
     * Range: http://www.w3.org/2000/01/rdf-schema#Literal 
     */
    public static final URI created = new URIImpl("http://usefulinc.com/ns/doap#created", false);

    /**
     * Label: Homepage@de página web@es homepage@en ホームページ@ja page web@fr domovská stránka@cs 
     * Comment: URL der Projekt-Homepage,
		verbunden mit genau einem Projekt.@de このプロジェクトのホームページのURL。このホームページは他のプロジェクトのホームページじゃないこと。@ja L'URL de la page web d'un projet,
		associée avec un unique projet.@fr URL of a project's homepage,
		associated with exactly one project.@en URL adresa domovské stránky projektu asociované s právě jedním projektem.@cs El URL de la página de un proyecto,
		asociada con exactamente un proyecto.@es 
     * Comment: http://usefulinc.com/ns/doap#Project 
     */
    public static final URI homepage = new URIImpl("http://usefulinc.com/ns/doap#homepage", false);

    /**
     * Label: 提供組織@ja vendor@en 
     * Comment: 提供組織、商業の組織や自由の組織。@ja Vendor organization: commercial, free or otherwise@en 
     * Comment: http://usefulinc.com/ns/doap#Project 
     * Range: http://xmlns.com/foaf/0.1/Organization 
     */
    public static final URI vendor = new URIImpl("http://usefulinc.com/ns/doap#vendor", false);

    /**
     * Label: Helfer@de spoluautor@cs colaborador@es collaborateur@fr 貢献者@ja helper@en 
     * Comment: Collaborateur au projet.@fr Projekt-Mitarbeiter.@de Spoluautor projektu.@cs Project contributor.@en Colaborador del proyecto.@es このプロジェクトの貢献者@ja 
     * Comment: http://usefulinc.com/ns/doap#Project 
     * Range: http://xmlns.com/foaf/0.1/Person 
     */
    public static final URI helper = new URIImpl("http://usefulinc.com/ns/doap#helper", false);

    /**
     * Label: 言語@ja language@en 
     * Comment: このプロジェクトの翻訳された言語のISO言語コート@en ISO language code a project has been translated into@en 
     * Comment: http://usefulinc.com/ns/doap#Project 
     * Range: http://www.w3.org/2000/01/rdf-schema#Literal 
     */
    public static final URI language = new URIImpl("http://usefulinc.com/ns/doap#language", false);

    /**
     * Label: documenter@en rédacteur de l'aide@fr 文章制作者@ja escritor de ayuda@es Dokumentator@de dokumentarista@cs 
     * Comment: Mitarbeiter an der Dokumentation eines Projektes.@de Proveedor de documentación para el proyecto.@es Contributor of documentation to the project.@en Collaborateur à la documentation du projet.@fr Spoluautor dokumentace projektu.@cs このプロジェクトのドキュメントの貢献者@ja 
     * Comment: http://usefulinc.com/ns/doap#Project 
     * Range: http://xmlns.com/foaf/0.1/Person 
     */
    public static final URI documenter = new URIImpl("http://usefulinc.com/ns/doap#documenter", false);

    /**
     * Label: サービスサイト@ja service endpoint@en 
     * Comment: ことプロジェクトが提供したサーブスを載せるサイト。@ja The URI of a web service endpoint where software as a service may be accessed@en 
     * Comment: http://usefulinc.com/ns/doap#Project 
     * Range: http://www.w3.org/2000/01/rdf-schema#Resource 
     */
    public static final URI service_endpoint = new URIImpl("http://usefulinc.com/ns/doap#service-endpoint", false);

    /**
     * Label: プラットフォーム@ja platform@en 
     * Comment: このプロジェクトの必要なプラットフォーム（OSに関係ない）。例えば：Java、Firefox、ECMA CLRとか。@ja Indicator of software platform (non-OS specific), e.g. Java, Firefox, ECMA CLR@en 
     * Comment: http://usefulinc.com/ns/doap#Version http://usefulinc.com/ns/doap#Project 
     * Range: http://www.w3.org/2000/01/rdf-schema#Literal 
     */
    public static final URI platform = new URIImpl("http://usefulinc.com/ns/doap#platform", false);

    /**
     * Label: Spiegel der Seite zum Herunterladen@de miroir pour le téléchargement@fr ダウンロードミラー@ja zrcadlo stránky pro stažení@cs download mirror@en mirror de descarga@es 
     * Comment: Mirror of software download web page.@en Mirror de la página web de descarga.@es Miroir de la page de téléchargement du programme.@fr Spiegel der Seite von die Projekt-Software heruntergeladen werden kann.@de このプロジェクトのダウンロードミラー@ja Zrcadlo stránky pro stažení softwaru.@cs 
     * Comment: http://usefulinc.com/ns/doap#Project 
     */
    public static final URI download_mirror = new URIImpl("http://usefulinc.com/ns/doap#download-mirror", false);

    /**
     * Label: stará domovská stránka@cs Alte Homepage@de ancienne page web@fr 前のホームページ@ja old homepage@en página web antigua@es 
     * Comment: このプロジェクトの前のホームページ。他のプロジェクトの前のホームページじゃないこと。@ja URL adresa předešlé domovské stránky projektu asociované s právě jedním projektem.@cs L'URL d'une ancienne page web d'un
		projet, associée avec un unique projet.@fr URL of a project's past homepage,
		associated with exactly one project.@en URL der letzten Projekt-Homepage,
		verbunden mit genau einem Projekt.@de El URL de la antigua página de un proyecto,
		asociada con exactamente un proyecto.@es 
     * Comment: http://usefulinc.com/ns/doap#Project 
     */
    public static final URI old_homepage = new URIImpl("http://usefulinc.com/ns/doap#old-homepage", false);

    /**
     * Label: Release@de release@en リリース@ja release@fr release@es release@cs 
     * Comment: Une release (révision) d'un projet.@fr Relase (verze) projektu.@cs Ein Release (Version) eines Projekts.@de Un release (versión) de un proyecto.@es このプロジェクトのリリース@ja A project release.@en 
     * Comment: http://usefulinc.com/ns/doap#Project 
     * Range: http://usefulinc.com/ns/doap#Version 
     */
    public static final URI release = new URIImpl("http://usefulinc.com/ns/doap#release", false);

    /**
     * Label: úložiště@cs dépôt@fr repositorio@es リポジトリ@ja Repository@de repository@en 
     * Comment: Úložiště zdrojových kódů.@cs Quellcode-Versionierungssystem.@de Source code repository.@en このプロジェクトのソースコードのリポジトリ@ja Repositorio del código fuente.@es Dépôt du code source.@fr 
     * Comment: http://usefulinc.com/ns/doap#Project 
     * Range: http://usefulinc.com/ns/doap#Repository 
     */
    public static final URI repository = new URIImpl("http://usefulinc.com/ns/doap#repository", false);

    /**
     * Label: このリリースのダウンロードできるファイルのURI@ja ファイル@ja soubor revize@cs file-release@en 
     * Comment: URI adresa stažení asociované s revizí.@cs URI of download associated with this release.@en 
     * Comment: http://usefulinc.com/ns/doap#Version 
     */
    public static final URI file_release = new URIImpl("http://usefulinc.com/ns/doap#file-release", false);

    /**
     * Label: スクリーンショット@ja captures d'écran@fr Screenshots@de snímek obrazovky@cs capturas de pantalla@es screenshots@en 
     * Comment: Página web con capturas de pantalla del proyecto.@es Web page with screenshots of project.@en スクリーンショットのあるウェブページ@ja Page web avec des captures d'écran du projet.@fr Webová stránka projektu se snímky obrazovky.@cs Web-Seite mit Screenshots eines Projektes.@de 
     * Comment: http://usefulinc.com/ns/doap#Project 
     */
    public static final URI screenshots = new URIImpl("http://usefulinc.com/ns/doap#screenshots", false);

    /**
     * Label: メンテナー@ja développeur principal@fr desarrollador principal@es Projektverantwortlicher@de správce@cs maintainer@en 
     * Comment: Maintainer of a project, a project leader.@en Hauptentwickler eines Projektes, der Projektleiter@de Správce projektu, vedoucí projektu.@cs このプロジェクトのメンテなー及びリーダ。@ja Développeur principal d'un projet, un meneur du projet.@fr Desarrollador principal de un proyecto, un líder de proyecto.@es 
     * Comment: http://usefulinc.com/ns/doap#Project 
     * Range: http://xmlns.com/foaf/0.1/Person 
     */
    public static final URI maintainer = new URIImpl("http://usefulinc.com/ns/doap#maintainer", false);

    /**
     * Label: Version@de revision@en リビジョンコート@ja verze@cs révision@fr versión@es 
     * Comment: Identifiant de révision d'une release du programme.@fr このリリースのリビジョン識別子@ja Revision identifier of a software release.@en Versionsidentifikator eines Software-Releases.@de Identifikátor zpřístupněné revize softwaru.@cs Indentificador de la versión de un release de software.@es 
     * Comment: http://usefulinc.com/ns/doap#Version 
     * Range: http://www.w3.org/2000/01/rdf-schema#Literal 
     */
    public static final URI revision = new URIImpl("http://usefulinc.com/ns/doap#revision", false);

    /**
     * Label: 説明@ja description@en description@fr popis@cs descripción@es Beschreibung@de 
     * Comment: Čistě textový, 2 až 4 věty dlouhý popis projektu.@cs Plain text description of a project, of 2-4 sentences in length.@en Texte descriptif d'un projet, long de 2 à 4 phrases.@fr Beschreibung eines Projekts als einfacher Text mit der Länge von 2 bis 4 Sätzen.@de Descripción en texto plano de un proyecto, de 2 a 4 enunciados de longitud.@es プロジェクトの文の説明、2から4までの行数。@ja 
     * Range: http://www.w3.org/2000/01/rdf-schema#Literal 
     */
    public static final URI description = new URIImpl("http://usefulinc.com/ns/doap#description", false);

    /**
     * Label: Tester@de testeur@fr tester@en tester@es tester@cs 試験者@ja 
     * Comment: Ein Tester oder anderer Mitarbeiter der Qualitätskontrolle.@de Un testeur ou un collaborateur au contrôle qualité.@fr このプロジェクトのため、試験をする人や品質メンテナー。@en A tester or other quality control contributor.@en Un tester u otro proveedor de control de calidad.@es Tester nebo jiný spoluautor kontrolující kvalitu.@cs 
     * Comment: http://usefulinc.com/ns/doap#Project 
     * Range: http://xmlns.com/foaf/0.1/Person 
     */
    public static final URI tester = new URIImpl("http://usefulinc.com/ns/doap#tester", false);

    /**
     * Label: Seite zum Herunterladen@de page de téléchargement@fr ダウンロードページ@ja download page@en página de descarga@es stránka pro stažení@cs 
     * Comment: Web page from which the project software can be downloaded.@en Web-Seite von der die Projekt-Software heruntergeladen werden kann.@de Webová stránka, na které lze stáhnout projektový software.@cs Page web à partir de laquelle on peut télécharger le programme.@fr このプロジェクトのダウンロードできるウェブページ@ja Página web de la cuál se puede bajar el software.@es 
     * Comment: http://usefulinc.com/ns/doap#Project 
     */
    public static final URI download_page = new URIImpl("http://usefulinc.com/ns/doap#download-page", false);

    /**
     * Label: ブログ@ja blog@en 
     * Comment: このプロジェクトに関するブログのURI@ja URI of a blog related to a project@en 
     * Comment: http://usefulinc.com/ns/doap#Project 
     * Range: http://www.w3.org/2000/01/rdf-schema#Resource 
     */
    public static final URI blog = new URIImpl("http://usefulinc.com/ns/doap#blog", false);

    /**
     * Label: 翻訳者@ja Übersetzer@de traductor@es translator@en překladatel@cs traducteur@fr 
     * Comment: Collaborateur à la traduction du projet.@fr Proveedor de traducciones al proyecto.@es Spoluautor překladu projektu.@cs このプロジェクトを翻訳する貢献者@ja Contributor of translations to the project.@en Mitarbeiter an den Übersetzungen eines Projektes.@de 
     * Comment: http://usefulinc.com/ns/doap#Project 
     * Range: http://xmlns.com/foaf/0.1/Person 
     */
    public static final URI translator = new URIImpl("http://usefulinc.com/ns/doap#translator", false);

    /**
     * Label: module@en module@fr modul@cs Modul@de モジュール名前@ja módulo@es 
     * Comment: Jméno modulu v úložišti.@cs Modul-Name eines Subversion.@de Nom du module d'un dépôt.@fr Nombre del módulo de un repositorio.@es このリポジトリのモジュール名前@ja Module name of a repository.@en 
     * Comment: -2dbdd05f:12c9d99890a:-7fff 
     */
    public static final URI module = new URIImpl("http://usefulinc.com/ns/doap#module", false);

    /**
     * Label: 名前@ja nombre@es Name@de nom@fr jméno@cs name@en 
     * Comment: Der Name von Irgendwas@de Le nom de quelque chose.@fr Jméno něčeho.@cs A name of something.@en El nombre de algo.@es 何かの名前@ja 
     * Range: http://www.w3.org/2000/01/rdf-schema#Literal 
     */
    public static final URI name = new URIImpl("http://usefulinc.com/ns/doap#name", false);

    /**
     * Label: raíz anónima@es Anonymes Root@de anonymní kořen@cs anonymous root@en 匿名ルート@ja racine anonyme@fr 
     * Comment: Úložiště pro anonymní přístup.@cs Dépôt pour accès anonyme.@fr Repository für anonymen Zugriff@de Repository for anonymous access.@en 匿名でアクセスできるパス@ja Repositorio para acceso anónimo.@es 
     * Comment: http://usefulinc.com/ns/doap#Repository 
     * Range: http://www.w3.org/2000/01/rdf-schema#Literal 
     */
    public static final URI anon_root = new URIImpl("http://usefulinc.com/ns/doap#anon-root", false);

    /**
     * Label: 開発者@ja desarrollador@es developer@en vývojář@cs développeur@fr Entwickler@de 
     * Comment: Developer of software for the project.@en Vývojář softwaru projektu.@cs Software-Entwickler für eine Projekt.@de Développeur pour le projet.@fr プロジェクトのソフトウェアの開発者@ja Desarrollador de software para el proyecto.@es 
     * Comment: http://usefulinc.com/ns/doap#Project 
     * Range: http://xmlns.com/foaf/0.1/Person 
     */
    public static final URI developer = new URIImpl("http://usefulinc.com/ns/doap#developer", false);

}
