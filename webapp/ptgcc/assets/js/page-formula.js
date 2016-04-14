app.section('formula');
viewModel.FormulaPage = {}; var fp = viewModel.FormulaPage;
fp.templatestatement = {
    _id: "",
    Title: "",
    StatementID: "",
    Element: [],
};
fp.templateFormula = {
    StatementElement: {
    	Index:0,
        Title1:"",
        Title2:"",
        Type:1,
        DataValue:[],
        Show: "",
        Bold: false,
        NegateValue: false,
        NegateDisplay: false,
    },
    IsTxt: false,
    Formula: "",
    ValueTxt: "",
    ValueNum: 0,
    ImageName: "",
    ElementVersion: [],
};
fp.configFormula = ko.mapping.fromJS(fp.templateFormula);
fp.konstanta = ko.observable(0);
fp.dataFormula = ko.mapping.fromJS(fp.templatestatement);
fp.selectColumn = ko.observable({});
fp.dataVersion = ko.observableArray([]);
fp.modeFormula = ko.observable("");
fp.lastParam = ko.observable(true);
fp.recordKoefisien = ko.observableArray([]);
fp.recordSugest = ko.observableArray([]);
fp.selectListAkun = function(index, data){
    if (fp.modeFormula() == ""){
    	$('#formula-editor').ecLookupDD("addLookup",{id:'@'+index, value: "@"+(index+1), koefisien:true});
    } else if (fp.modeFormula() == "SUM" || fp.modeFormula() == "AVG") {
        var $areaselect = $("#tablekoefisien>tbody .eclookup-selected").parent().find(".areakoefisien"), idselect = $areaselect.attr("id");
        if($areaselect.length>0)
            $('#'+idselect).ecLookupDD("addLookup",{id:'@'+index, value: "@"+(index+1), koefisien:true});
    }
    fp.lastParamSelect();
};
fp.changeKonstanta = function(){
    console.log("asdasd");
};
fp.lastParamSelect = function(){
    var objFormula = $('#formula-editor').ecLookupDD("get");
    if (objFormula.length>0)
        fp.lastParam(objFormula[objFormula.length-1].koefisien);
    else
        fp.lastParam("");
}
fp.showFormula = function(index,data, indexColoumn){
    console.log("index",index);
    console.log("index coloum",indexColoumn);
    console.log("data",ko.mapping.toJS(data));
    // if (data.Type == 50){
        fp.modeFormula("");
    	$("#formula-popup").modal("show");
        fp.selectColumn({index:index,indexcol:indexColoumn});
        var datatojs = ko.mapping.toJS(data);
        // for(var i in datatojs.Formula){
        //     if (datatojs.Formula[i] == "+" || datatojs.Formula[i] == "-" || datatojs.Formula[i] == "*" || datatojs.Formula[i] == "/")
        //         $('#formula-editor').ecLookupDD("addLookup",{id:datatojs.Formula[i], value: datatojs.Formula[i], koefisien:false});
        //     else
        //         $('#formula-editor').ecLookupDD("addLookup",{id:datatojs.Formula[i], value: datatojs.Formula[i], koefisien:true});
        // }
    // }
};
fp.saveFormulaEditor = function(){
    var objFormula = $('#formula-editor').ecLookupDD("get"), resultFormula = "", resultFormulaArr = [];
    for (var i in objFormula){
        resultFormula += objFormula[i].value;
        resultFormulaArr.push(objFormula[i].value);
    }
    if (fp.selectColumn().indexcol == 1){
        fp.dataFormula.Element()[fp.selectColumn().index].Formula(resultFormula);
    } else {
        // console.log(fp.selectColumn().index);
        // console.log(fp.selectColumn().indexcol-2);
        // console.log(fp.dataFormula.Element()[fp.selectColumn().index].ElementVersion()[(fp.selectColumn().indexcol-2)].Formula());
        fp.dataFormula.Element()[fp.selectColumn().index].ElementVersion()[(fp.selectColumn().indexcol-2)].Formula(resultFormula);
    }
    $('#formula-editor').ecLookupDD("clear");
    fp.backFormulaEditor();
    $("#formula-popup").modal("hide");
};
fp.saveStatement = function(){
    app.ajaxPost("/statement/savestatementversion", {}, function(){
        
    });
}
fp.selectKoefisien = function(event){
    fp.modeFormula("");
	$('#formula-editor').ecLookupDD("addLookup",{id:event, value: event, koefisien:false});
    fp.lastParamSelect();
    $("#konstanta").focus();
};
fp.selectKoefisienGroup = function(event){
    fp.backFormulaEditor();
    fp.modeFormula(event);
	// $('#formula-editor').ecLookupDD("addLookup",{id:event, value: event});

};
fp.backFormulaEditor = function(){
    fp.recordKoefisien([]);
    fp.addParameter();
    fp.modeFormula("");
};
fp.addParameter = function(){
    fp.recordKoefisien.push({valueform:"",valueto:""});
    $('#koefisien1'+(fp.recordKoefisien().length-1)).ecLookupDD({
        dataSource:{
            data:[],
        }, 
        placeholder: "Area Formula",
        areaDisable: false,
        inputType: 'ddl', 
        inputSearch: "value", 
        idField: "id", 
        idText: "value", 
        displayFields: "value", 
        showSearch: false,
        focusable: true,
    });
    $('#koefisien2'+(fp.recordKoefisien().length-1)).ecLookupDD({
        dataSource:{
            data:[],
        }, 
        placeholder: "Area Formula",
        areaDisable: false,
        inputType: 'ddl', 
        inputSearch: "value", 
        idField: "id", 
        idText: "value", 
        displayFields: "value", 
        showSearch: false,
        focusable: true,
    });
};
fp.addKostantaFormula = function(){
    var resultFormula = "", boolsuccess = false;
    if (fp.modeFormula() == "SUM")
        resultFormula += "fn:sum";
    else if (fp.modeFormula() == "AVG")
        resultFormula += "fn:avg";
    else
        resultFormula += "fn:if";

    if (fp.modeFormula() != "IF"){
        var objFormula1 = [], objFormula2 = [], index1 = 0, index2 = 0, boolyo = false;
        for (var i in fp.recordKoefisien()){
            objFormula1 = $('#koefisien1'+i).ecLookupDD("get");
            objFormula2 = $('#koefisien2'+i).ecLookupDD("get");
            if (objFormula1.length > 0){
                index1 = parseInt(objFormula1[0].value.substring(0,objFormula1.length));
            } else {
                alert("Value From can't be empty");
            }
            if (objFormula2.length > 0){
                index2 = parseInt(objFormula2[0].value.substring(0,objFormula2.length));
            } else {
                alert("Value To can't be empty");
            }
            if (index1 > index2){
                alert("Value from must lower than to");
            } else {
                resultFormula += "("+objFormula1[0].value+".."+objFormula2[0].value+")";
                boolsuccess = true;
            }
        }
    } else {

    }
    // $('#formula-editor').ecLookupDD("addLookup",{id:, value: , koefisien:true});
    if (boolsuccess){
        $('#formula-editor').ecLookupDD("addLookup",{id:resultFormula, value:resultFormula , koefisien:true});
        fp.backFormulaEditor();
    }
}
fp.removeKoefisien = function(data){
    fp.recordKoefisien.remove(data)
};
fp.clearFormula = function(){
	$('#formula-editor').ecLookupDD("clear");
};
fp.getDataStatement = function(){
    app.ajaxPost("/statement/getstatementversion", {statementid: "bid1EWFRZwL-at1uyFvzJYUjPu3yuh3j", mode: "new"}, function(res){
        if(!app.isFine(res)){
            return;
        }
        if (!res.data) {
            res.data = [];
        }
        for(var i in res.data.Element){
            res.data.Element[i] = $.extend({}, fp.templateFormula, res.data.Element[i] || {});
        }
        ko.mapping.fromJS(res.data, fp.dataFormula);
        fp.getListSugest();
    });
    // for(var i in dataexample.Element){
    //     dataexample.Element[i] = $.extend({}, fp.templateFormula, dataexample.Element[i] || {});
    // }
    // ko.mapping.fromJS(dataexample, fp.dataFormula);
};
fp.getListSugest = function(){
    app.ajaxPost("/statement/getsvbysid", {statementid: "bid1EWFRZwL-at1uyFvzJYUjPu3yuh3j"}, function(res){
        if(!app.isFine(res)){
            return;
        }
        if (!res.data) {
            res.data = [];
        }
        fp.recordSugest(res.data);
        $('#version1').ecLookupDD({
            dataSource:{
                data:fp.recordSugest(),
            },
            placeholder: "Search Version",
            inputType: "ddl",
            idField: "_id", 
            idText: "title", 
            displayFields: "title", 
            inputSearch: "title",
            selectData: function(res){
                console.log(res.data);
            }
        });
    });
}
fp.removeColumnFormula = function(index){
    console.log($("td[indexid="+index+"]"));
}
fp.addColumn = function(){
    var dataStatement = $.extend(true, {}, ko.mapping.toJS(fp.dataFormula)), elemVer = {};
    for (var i in dataStatement.Element){
        elemVer = $.extend(true, {}, fp.templateFormula);
        delete elemVer["ElementVersion"];
        dataStatement.Element[i].ElementVersion.push(elemVer);
    }
    ko.mapping.fromJS(dataStatement, fp.dataFormula);
    var index = $("#tableFormula>thead>tr input.searchversion").length + 1;
    $("#tableFormula>thead>tr").append("<td indexid='"+index+"'><div class='searchversion'><input class='searchversion' id='version"+index+"' indexcolumn='"+index+"' /></div><div class='row-remove'><span class='glyphicon glyphicon-remove' onClick='fp.removeColumnFormula("+index+")'></span></td>");
    $('#version'+index).ecLookupDD({
        dataSource:{
            data:fp.recordSugest(),
        },
        placeholder: "Search Version",
        inputType: "ddl",
        idField: "_id", 
        idText: "title", 
        displayFields: "title", 
        inputSearch: "title",
    });
}

$(function (){
    fp.getDataStatement();
    $("#kostanta").bind("keyup", function(e) {
        if (e.keyCode == 13){
            $('#formula-editor').ecLookupDD("addLookup",{id: fp.konstanta().toString(), value: fp.konstanta().toString(), koefisien:true});
            fp.konstanta(0);
        }
    })
	$('#formula-editor').ecLookupDD({
		dataSource:{
			data:[],
		}, 
		placeholder: "Area Formula",
		areaDisable: true,
		inputType: 'multiple', 
		inputSearch: "value", 
		idField: "id", 
		idText: "value", 
		displayFields: "value", 
	});
});