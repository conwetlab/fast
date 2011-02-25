#...............................licence...........................................#
#
#    (C) Copyright 2011 FAST Consortium
#
#     This file is part of FAST Platform.
#
#     FAST Platform is free software: you can redistribute it and/or modify
#     it under the terms of the GNU Affero General Public License as published by
#     the Free Software Foundation, either version 3 of the License, or
#     (at your option) any later version.
#
#     FAST Platform is distributed in the hope that it will be useful,
#     but WITHOUT ANY WARRANTY; without even the implied warranty of
#     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#     GNU Affero General Public License for more details.
#
#     You should have received a copy of the GNU Affero General Public License
#     along with FAST Platform.  If not, see <http://www.gnu.org/licenses/>.
#
#     Info about members and contributors of the FAST Consortium
#     is available at
#
#     http://fast.morfeo-project.eu
#
#...............................licence...........................................#
file_list = [
    # Libs
    "lib/json/json2.js",
    "lib/cjson_parse/cjson_parse.js",
    "lib/codemirror/js/codemirror.js",

    # Drag n Drop support
    "gvs/dragndrop/DragHandler.js",
    "gvs/dragndrop/DragSource.js",
    "gvs/dragndrop/Area.js",

    # Factories
    "gvs/catalogue/factories/BuildingBlockFactory.js",
    "gvs/catalogue/factories/ScreenflowFactory.js",
    "gvs/catalogue/factories/ScreenFactory.js",
    "gvs/catalogue/factories/DomainConceptFactory.js",
    "gvs/catalogue/factories/FormFactory.js",
    "gvs/catalogue/factories/OperatorFactory.js",
    "gvs/catalogue/factories/ResourceFactory.js",

    # Catalogue Classes
    "gvs/catalogue/Catalogue.js",
    "gvs/catalogue/BuildingBlockDescription.js",
    "gvs/catalogue/FormDescription.js",
    "gvs/catalogue/ScreenDescription.js",
    "gvs/catalogue/ScreenflowDescription.js",
    "gvs/catalogue/PrePostDescription.js",

    # Inference Engine
    "gvs/catalogue/inferenceEngine/InferenceEngine.js",
    "gvs/catalogue/inferenceEngine/ScreenflowInferenceEngine.js",
    "gvs/catalogue/inferenceEngine/ScreenInferenceEngine.js",

    # Sets
    "gvs/catalogue/sets/BuildingBlockSet.js",
    "gvs/catalogue/sets/DomainConceptSet.js",
    "gvs/catalogue/sets/SetListener.js",
    "gvs/propertiesViewers/Table.js",
    "gvs/propertiesViewers/PropertiesPane.js",
    "gvs/propertiesViewers/FactPane.js",

    # Toolbar
    "gvs/toolbar/Toolbar.js",
    "gvs/toolbar/ToolbarModel.js",
    "gvs/toolbar/ToolbarButton.js",
    "gvs/toolbar/ToolbarSeparator.js",
    "gvs/toolbar/ToolbarDropDown.js",

    # Menu
    "gvs/menu/Menu.js",
    "gvs/menu/MenuElement.js",
    "gvs/menu/MenuAction.js",
    "gvs/menu/SubMenu.js",

    # Documents
    "gvs/documents/AbstractDocument.js",
    "gvs/documents/ExternalDocument.js",
    "gvs/documents/PaletteDocument.js",
    "gvs/documents/WelcomeDocument.js",
    "gvs/documents/DocumentController.js",
    "gvs/documents/ScreenflowDocument.js",
    "gvs/documents/ScreenDocument.js",
    "gvs/documents/BuildingBlockDocument.js",

    # Cache
    "gvs/cache/ScreenCanvasCache.js",
    "gvs/cache/ScreenflowCanvasCache.js",

    # Facts
    "gvs/facts/Fact.js",
    "gvs/facts/FactFactory.js",
    "gvs/facts/FactIcon.js",

    # Component instances
    "gvs/instances/MenuOptions.js",
    "gvs/instances/ComponentInstance.js",
    "gvs/instances/ScreenInstance.js",
    "gvs/instances/PrePostInstance.js",
    "gvs/instances/ScreenComponentInstance.js",
    "gvs/instances/ResourceInstance.js",
    "gvs/instances/OperatorInstance.js",
    "gvs/instances/FormInstance.js",

    # Palette
    "gvs/palette/Palette.js",
    "gvs/palette/PaletteComponent.js",
    "gvs/palette/PaletteController.js",
    "gvs/palette/PaletteSearchBox.js",
    "gvs/palette/ScreenComponent.js",
    "gvs/palette/DomainConceptComponent.js",
    "gvs/palette/ResourceComponent.js",
    "gvs/palette/OperatorComponent.js",
    "gvs/palette/FormComponent.js",

    # Building Block Views
    "gvs/views/BuildingBlockView.js",
    "gvs/views/ScreenView.js",
    "gvs/views/DomainConceptView.js",
    "gvs/views/ResourceView.js",
    "gvs/views/OperatorView.js",
    "gvs/views/FormView.js",
    "gvs/views/FormSnapshotView.js",
    "gvs/views/ActionView.js",

    # Piping
    "gvs/piping/Terminal.js",
    "gvs/piping/Pipe.js",
    "gvs/piping/PipeFactory.js",
    "gvs/piping/TriggerMappingFactory.js",
    "gvs/piping/Trigger.js",
    "gvs/piping/ScreenTrigger.js",

    # Persistence Engine
    "gvs/persistenceEngine/PersistenceEngine.js",

    # Dialogs
    "gvs/dialogs/FormDialog.js",
    "gvs/dialogs/ConfirmDialog.js",
    "gvs/dialogs/PrePostDialog.js",
    "gvs/dialogs/PreferencesDialog.js",
    "gvs/dialogs/ExternalContentDialog.js",
    "gvs/dialogs/BuildGadgetDialog.js",
    "gvs/dialogs/PublishGadgetDialog.js",
    "gvs/dialogs/AddScreenDialog.js",
    "gvs/dialogs/NewBuildingBlockDialog.js",
    "gvs/dialogs/NewBuildingBlockCodeDialog.js",
    "gvs/dialogs/SaveAsDialog.js",
    "gvs/dialogs/GalleryDialog.js",
    "gvs/dialogs/ManageScreenflowsDialog.js",
    "gvs/dialogs/ManageScreensDialog.js",
    "gvs/dialogs/PreviewDialog.js",
    "gvs/dialogs/TriggerDialog.js",
    "gvs/dialogs/ParamsDialog.js",
    "gvs/dialogs/TitleDialog.js",
    "gvs/dialogs/CaptionDialog.js",
    "gvs/dialogs/PropertiesDialog.js",
    "gvs/dialogs/Alert.js",
    "gvs/dialogs/Confirm.js",
    "gvs/dialogs/StandaloneEmbeddingDialog.js",
    "gvs/dialogs/ButtonArrayDialog.js",
    "gvs/dialogs/ManageBuildingBlocksDialog.js",
    "gvs/dialogs/iServeDialog.js",


    # Plans
    "gvs/plans/PlanPanel.js",
    "gvs/plans/PlanSet.js",
    "gvs/plans/PlanComponent.js",
    "gvs/plans/PlanView.js",
    "gvs/plans/PlanInstance.js",

    # Build
    "gvs/build/GadgetDialog.js",

    # Player
    "gvs/player/ScreenflowPlayer.js",

    # User account
    "gvs/user/User.js",

    # Miscelaneous utilities
    "gvs/utils/RecommendationManager.js",
    "gvs/utils/UIDGenerator.js",
    "gvs/utils/BrowserUtils.js",
    "gvs/utils/Utils.js",
    "gvs/utils/Logger.js",
    "gvs/utils/KeyPressRegistry.js",
    "gvs/utils/Geometry.js",

    # Constants
    "gvs/commons/Constants.js",

    # GVS Entry point
    "gvs/GVS.js"

]
