#!/bin/bash

python ./manage.py dumpdata --settings=settings --format=xml --indent=4 buildingblock > buildingblock/fixtures/initial_data.xml
python ./manage.py dumpdata --settings=settings --format=xml --indent=4 auth user > fast/fixtures/initial_data.xml
