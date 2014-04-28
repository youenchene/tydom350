## Description

A plugin to control old Tydom 350 from Delta Dore


## Quick Start

Donwload the plugin from SARAH's AppStore and follow online plugin's documentation

## Quick API Doc


Turn a light 0 on : http://127.0.0.1:8080/sarah/Tydom350?command=LIGHT&item=0&value=on

Turn a light 0 off : http://127.0.0.1:8080/sarah/Tydom350?command=LIGHT&item=0&value=off


Turn a heat area on mode : http://127.0.0.1:8080/sarah/Tydom350?command=HEAT&area=3&value=on

Turn a heat area eco mode : http://127.0.0.1:8080/sarah/Tydom350?command=HEAT&area=3&value=eco

Turn a heat area frozen protection mode : http://127.0.0.1:8080/sarah/Tydom350?command=HEAT&area=3&value=fp


Turn heat system to auto : http://127.0.0.1:8080/sarah/Tydom350?command=HEAT&mode=auto

Turn heat system to off : http://127.0.0.1:8080/sarah/Tydom350?command=HEAT&mode=off

Turn heat system to away : http://127.0.0.1:8080/sarah/Tydom350?command=HEAT&mode=away


Get Heat system current mode : http://127.0.0.1:8080/sarah/Tydom350?command=HEAT&getmode=1 //not very accurate.

Get indoor Temperature : http://127.0.0.1:8080/sarah/Tydom350?command=TEMP

Get Basic Electricity consumption information : http://127.0.0.1:8080/sarah/Tydom350?command=ELEC




