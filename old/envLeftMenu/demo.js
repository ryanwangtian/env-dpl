/**
 * Created by tian.wang on 2015/3/31.
 */
var data = [{
    id: "dashboard",
    name: "DashBoard",
    icon: "env-icon-arrow-monitor",
    url: "http://www.baidu.com",
    children: []
}, {
    id: "scoreboard",
    name: "Scoreboard",
    children: [{
        id: "gridView",
        name: "Grid View",
        url: "http://www.soso.com",
        children: []
    }, {
        id: "wfScoreboard",
        name: "Wind Farm Scoreboard",
        url: "http://www.so.com",
        children: []
    }, {
        id: "wtgScoreboard",
        name: "Turbine Scoreboard",
        url: "http://www.bing.com",
        children: []
    }]
}, {
    id: "kpiChart",
    name: "KPI Chart",
    children: [{
        id: "downtimeLoss",
        name: "Downtime Loss",
        children: []
    }, {
        id: "faultLoss",
        name: "Fault Loss",
        children: [{
            id: "equipmentLoss",
            name: "Equipment Loss",
            children: []
        }, {
            id: "faultCodeLoss",
            name: "Fault Code Loss",
            children: []
        }, {
            id: "faultFrequency",
            name: "Fault Frequency",
            children: []
        }, {
            id: "repairmentLoss",
            name: "Repairment Loss",
            children: []
        }]
    }, {
        id: "operationLoss",
        name: "Operation Loss",
        children: [{
            id: "gridCurtailment",
            name: "Grid Curtailment",
            children: []
        }, {
            id: "powerCurveLoss",
            name: "Power Curve Loss",
            children: []
        }]
    }, {
        id: "costOfLabor",
        name: "Cost of Labor",
        children: [{
            id: "laborHours",
            name: "Labor Hours",
            children: []
        }, {
            id: "laborUtilization",
            name: "Labor Utilization",
            children: []
        }]
    }]
}, {
    id: "inquiryTable",
    name: "Inquiry Table",
    icon: "env-icon-arrow-line-chart",
    children: [{
        id: "productionLoss",
        name: "Production and Loss",
        children: []
    }, {
        id: "downtimeLoss",
        name: "Downtime Loss",
        children: [{
            id: "downtimeRecord",
            name: "Downtime Record",
            children: []
        }, {
            id: "equipmentLoss",
            name: "Equipment Loss",
            children: []
        }, {
            id: "faultCodeLoss",
            name: "Fault Code Loss",
            children: []
        }, {
            id: "faultFrequency",
            name: "Fault Frequency",
            children: []
        }, {
            id: "repairmentLoss",
            name: "Repairment Loss",
            children: []
        }, {
            id: "faultRepairment",
            name: "Fault Repairment",
            children: []
        }]
    }, {
        id: "operationLoss",
        name: "Operation Loss",
        children: [{
            id: "wfCurtailmentRecord",
            name: "WindFarm Curtailemnt Record",
            children: []
        }, {
            id: "turbineCurtailmentLoss",
            name: "Turbine Curtailment Loss",
            children: []
        }, {
            id: "powercurveLoss",
            name: "Powercurve Loss",
            children: []
        }]
    }, {
        id: "labor Utilization",
        name: "Labor Utilization",
        children: []
    }, {
        id: "enCost",
        name: "EN Cost",
        children: []
    }]
}, {
    id: "analysisTools",
    name: "Analysis Tools",
    children: [{
        id: "performanceRanking",
        name: "Performance Ranking",
        children: []
    }, {
        id: "kpiAnalysis",
        name: "KPI Analysis",
        children: []
    }]
}];
$(function() {
    $("#test").envLeftMenu({
        data: data,
        onMenuItemClicked: function(menuItem) {
            if (menuItem.children.length <= 0) {
                alert(JSON.stringify(menuItem.data));
            }
        }
    });
});