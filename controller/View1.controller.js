sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/odata/ODataModel",
	"sap/ui/model/json/JSONModel",
	"sap/m/Popover",
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/m/List",
	"sap/m/StandardListItem",
	"sap/m/MessageToast",
	"sap/m/Image",
	"sap/ui/layout/HorizontalLayout",
	"sap/m/Label",
	"sap/m/Text",
	"sap/m/CustomListItem",
	"sap/ui/core/Fragment",
	"sap/m/MessageBox",
	"sap/ui/core/BusyIndicator"
], function(Controller, ODataModel, JSONModel, Popover, Button, Dialog, List, StandardListItem, MessageToast, Image, HorizontalLayout,
	Label, Text, CustomListItem, Fragment, MessageBox, BusyIndicator) {
	"use strict";
	return Controller.extend("Cage_Control.controller.View1", {
		onInit: function() {
			var oView = this.getView();
			var osite = oView.byId("Mag");
			var URL = "/sap/opu/odata/sap/ZGET_PLANT_SRV/";
			var OData = new ODataModel(URL, true);
			var query = "/S_T001WSet(Type='')";
			BusyIndicator.show();
			OData.read(query, null, null, true, function(response) {
				BusyIndicator.hide();
				var plant = response.EPlant;
				var name1 = response.ET001w.Name1;
				var site = plant + ' ' + name1;
				osite.setText(site);
			}, function() {
				BusyIndicator.hide();
			});
		},

		CheckCage: function() {
			var oView = this.getView();
			var oCage = oView.byId("Cage").getValue();
			var searchString = 'H' + '/' + oCage;
			var URL = "/sap/opu/odata/sap/ZRETURN_DC_SRV/";
			var OData = new ODataModel(URL, true);
			var query = "ItemsSet?$filter=ZembArt " + "%20eq%20" + "%27" + searchString + "%27&$format=json";
			BusyIndicator.show();
			OData.read(query, null, null, true, function(response) {
				BusyIndicator.hide();
				debugger;
				var lines = response.results.length;
				if (lines > 0) {
					//  oView.byId("Cage").setValue('');
					var site = response.results[0].Werks;
					sap.ui.getCore().fromSite = site;
					sap.ui.getCore().Cage = oCage;
					var sele = response.results[0].Sele;
					var oInfo = oView.byId("Info");
					var nbreBox = 'From :' + site + '   ' + 'Nbre of Box : ' + lines + '   ' + 'Seal : ' + sele;
					oInfo.setText(nbreBox);
					var newArray = response.results;
					var model = new JSONModel({
						"items": newArray
					});
					model.setSizeLimit(100);
					var oController = oView.getController();
					oController.getView().setModel(model, "itemModel");
					oController.getView().byId("List").setVisible(true);
					oController.getView().byId("Info").setVisible(true);
					oController.getView().byId("OK").setVisible(true);
				}
			}, function() {
				BusyIndicator.hide();
			});
		},

		Validate: function() {
			var oView = this.getView();
			var Cage = sap.ui.getCore().Cage;
			var fromSite = sap.ui.getCore().fromSite;
			var searchString = 'J' + '.' + Cage + '.' + fromSite;
			var URL = "/sap/opu/odata/sap/ZRETURN_DC_SRV/";
			var OData = new ODataModel(URL, true);
			//	var query = "ItemsSet?$filter=ZembArt " + "%20eq%20" + "%27" + searchString + "%27&$format=json";
			var query = "/ItemsSet(ZembArt='" + searchString + "')";
			BusyIndicator.show();
			OData.read(query, null, null, true, function(response) {
				BusyIndicator.hide();
				if (response.E_MESSAGE !== "" && response.E_ZTYPE === "E") {
					//	var path = $.sap.getModulePath("Cage_Control", "/MIMEs/audio");
					//	var path = "Cage_Control/MIMEs/audio");
					//   var aud = new Audio(path + "/MOREINFO.png");
					//   aud.play();
					MessageBox.show(response.E_MESSAGE, MessageBox.Icon.ERROR);
				}
				if (response.E_MESSAGE !== "" && response.E_ZTYPE === "O") {
					var oController = oView.getController();
					oController.getView().byId("List").setVisible(false);
					oController.getView().byId("Info").setVisible(false);
					oController.getView().byId("OK").setVisible(false);
					var cage_input = oController.getView().byId("Cage");
					cage_input.setValue('');
					cage_input.focus();
					MessageBox.show(response.E_MESSAGE, MessageBox.Icon.INFORMATION);
				}
			}, function() {
				BusyIndicator.hide();
			});
		}
	});
});