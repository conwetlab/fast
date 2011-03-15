UPDATE `buildingblock_buildingblock` SET `uri`=replace(`uri`, "http://localhost:9000", "http://demo.fast.morfeo-project.org"), `data`=replace(`data`, "http://localhost:9000", "http://demo.fast.morfeo-project.org");
UPDATE `buildingblock_buildingblockcode` SET `code`=replace(`code`, "http://localhost:9000", "http://demo.fast.morfeo-project.org");

