/*
    TICKETFREE ADMIN TOOL
*/

//<editor-fold desc="VARIABLES">
//---VARIABLES------
// CURRENT POS
//var posX = 34.100467;
//var posY = -118.322124;
// HOLLYWOOD HOME
var posX = 34.100749;
var posY = -118.317985;
// HOLLYWOOD CENTER
//var posX = 34.102575;
//var posY = -118.337379;
// VAN NUYS
//var posX = 34.195153051244446;
//var posY = -118.47051293162548;
var map;
var currentTime;
var track;
var tracks = new Array();
var mapTracks;
var sign;
var signs = new Array();
var geocoder;
var drawingManager;
var retrieveDataAPI = "../service/retrieveDataWeb.php";
var retrieveSignAPI = "../service/retrieveSign.php";
var retrieveTrackAPI = "../service/retrieveTrack.php";
var updateSignAPI = "../service/updateSign.php";
var deleteSignAPI = "../service/deleteSign.php";
var retrieveSignDir = "../service/signs/";
var updateTrackAPI = "../service/updateTrack.php";
var updateRuleAPI = "../service/updateRule.php";
var addTrackAPI = "../service/insertTrack.php";
var addRuleAPI = "../service/insertRule.php";
var addSignAPI = "../service/insertSign.php";
var deleteTrackAPI = "../service/deleteTrack.php";
var deleteRuleAPI = "../service/deleteRule.php";
var verifyTrackAPI = "../service/verifyTrack.php";
var verifyRuleAPI = "../service/verifyRule.php";
var verifySignAPI = "../service/verifySign.php";
var hideTrackAPI = "../service/hideTrack.php";
var hideRuleAPI = "../service/hideRule.php";
var hideSignAPI = "../service/hideSign.php";
var retrieveCenterPointAPI = "../service/retrieveCenterPoint.php";
var jsonObj;
var infowindow;
var signwindow;
var newRuleCount = 1;
var newTrackID = 0;
var newTrackPath;

var IsVerified = "T";
var VerifiedBy = 1;
var Flagged = "F";
var DeviceID = "Admin";

var TFObj = {
    Track : 1,
    Rule : 2,
    Point : 3,
    Sign : 4
};
var ParkingRule = {
    NoParking : 1,
    NoStopping : 2,
    HourParking1 : 3,
    HourParking2 : 4,
    HourParking3 : 5,
    HourParking4 : 6,
    HourParking5 : 7,
    MinuteParking15 : 8,
    MinuteParking30 : 9,
    MinuteParking45 : 10,
    NoParkingAnytime : 11,
    LoadingOnly5 : 12,
    MinuteParking20: 13,
    MinuteParking40: 14,
    HourParking8: 15,
    HourParking10: 16,
    HourParking9: 17
};
var SignType = {
    Parking: 1,
    WTF: 2,
    Temporary: 3,
    Handicap: 4,
    Meter: 5,
    Hydrant: 6,
    Artifact: 7,
    NoParking: 8
};
var TrackType = {
    Regular : 1,
    Paid : 2,
    Temporary : 3,
    NoParkingAnytime : 4,
    TaxiZone : 5,
    CommercialZone : 6,
    HandicapZone : 7
};
var CaptureRadius = {
    Regular : "0.000800",
    Big : "0.002000",
    Huge : "0.006000",
    MayorLeague : "0.014000",
    Renato : "0.004400"
};
var ZoomRadius = [
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0.018",
    "0.016",
    "0.014",
    "0.012",
    "0.01",
    "0.0080",
    "0.0050",
    "0.0033",
    "0.0022",
    "0.0011"

];
//</editor-fold>
// LOAD
$(document).ready(function() {
    // MAP
    var mapZoom = 19;
    geocoder = new google.maps.Geocoder();
    if(getUrlVars()["lat"]) {
        posX = getUrlVars()["lat"];
    }
    if(getUrlVars()["lng"]) {
        posY = getUrlVars()["lng"];
    }
    if(getUrlVars()["zoom"]) {
        mapZoom = parseInt(getUrlVars()["zoom"]);
    }
    var mapOptions = {
        zoom: mapZoom,
        center: new google.maps.LatLng(posX, posY),
        mapTypeId: google.maps.MapTypeId.HYBRID,
        tilt: 0
    };
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

    drawingManager = new google.maps.drawing.DrawingManager({

        drawingMode: null,

        drawingControl: true,

        drawingControlOptions: {

            position: google.maps.ControlPosition.TOP_CENTER,

            drawingModes: [

                google.maps.drawing.OverlayType.MARKER,

                google.maps.drawing.OverlayType.POLYLINE

            ]

        },

        polylineOptions: {

            strokeColor: '#0095C6',

//            strokeColor: '#FF0000',

            strokeOpacity: 1,

            strokeWeight: 5,

            clickable: true,

            draggable: true,

            zIndex: 1,

            editable: true

        }

    });

    drawingManager.setMap(map);
    // EVENTS
    google.maps.event.addListener(drawingManager, 'polylinecomplete', function(polyline) {
        if(newTrackPath != null) newTrackPath.setMap(null);
        google.maps.event.addListener(polyline, 'click', function(event) {
            newTrackPath = polyline;

            var trackString =   "<table class='table-track'><tr><td class='data-h1'>Track Type</td><td>" +
                "<select id='track-type-new' name='track-type-new'>" +
                "<option value='1'>Regular</option>" +
                "<option value='2'>Paid</option>" +
                "<option value='3'>Temporary</option>" +
                "<option value='4'>No Parking Anytime</option>" +
                "<option value='5'>Taxi Zone</option>" +
                "<option value='6'>Commercial Zone</option>" +
                "<option value='7'>Handicap Zone</option>" +
                "</select>" +
                "</td>" +
                "</tr>" +
                "<tr>" +
                "<td class='data-h1'>Street</td>" +
                "<td><input type='text' id='track-street-new' name='track-street-new' value='' /></td>" +
                "</tr>" +
                "</table>" +
                "<div class='box_normal'>" +
                "<button class='buttonsmall-red icon-add' id='btn_addTrack' onclick='addTrack()'>Add Track</button>" +
                "</div>" +
                "<button class='buttonsmall-red icon-delete' id='btn_deleteNewTrack' onclick='deleteNewTrack()'>Delete Track</button>";

            var ruleString = "<button class='buttonsmall-red icon-newrule' id='btn_showNewRule' style='visibility: hidden'>Show New Rule</button>";

            var newContentString = "<div id='tabs'>" +
                "<ul>" +
                "<li><a href='#tabs-1'>Tracks</a></li>" +
                "<li><a href='#tabs-2'>Rules</a></li>" +
                "</ul>";
            newContentString += "<div id='tabs-1'>" + trackString  + "</div>";
            newContentString += "<div id='tabs-2'>" + ruleString  + "</div></div>";

            newRuleCount = 1;
            if(infowindow != null) infowindow.close();
            infowindow = new google.maps.InfoWindow({
                content: newContentString,
                position: event.latLng
            });
            infowindow.open(map);
            google.maps.event.addListener(infowindow, 'domready', function(event) {
                $( "#tabs" ).tabs();
            });
        });
        google.maps.event.addListener(polyline, 'rightclick', function(event) {
            newTrackPath = polyline;
            var newContentString = "<div class='right-click-panel'>" +
                "<button class='buttonsmall-red icon-horizontal' id='btn_alignHorizontal' onclick='polylineAlignHorizontal(-1)'>Align Horizontal</button>" +
                "<button class='buttonsmall-red icon-vertical' id='btn_alignVertical' onclick='polylineAlignVertical(-1)'>Align Vertical</button>" +
                "</div>";

//            newRuleCount = 1;
            if(infowindow != null) infowindow.close();
            infowindow = new google.maps.InfoWindow({
                content: newContentString,
                position: event.latLng
            });
            infowindow.open(map);
        });

    });
    google.maps.event.addListener(map, 'click', function() {
        if(infowindow != null) infowindow.close();
    });
    google.maps.event.addListener(map, 'dblclick', function(event) {
        var newPlaceHolder = "<div id='placehold'></div>";
        var newContentString = "<div><span>Position:</span><input type='text' style='width: 120px' value='" + event.latLng.lat() + "," + event.latLng.lng() + "' /></div><br />";
        newContentString += "";

        newContentString += "<select id='sign-type' name='sign-type'>" +
            "<option value='1' selected='selected'>Parking</option>" +
            "<option value='2'>WTF</option>" +
            "<option value='3'>Temporary</option>" +
            "<option value='4'>Handicap</option>" +
            "<option value='5'>Meter</option>" +
            "<option value='6'>Hydrant</option>" +
            "<option value='7'>Artifact</option>" +
            "<option value='8'>No Parking</option>" +
            "</select>";

        newContentString += "<button class='buttonsmall-red icon-add' id='btn_addSign' onclick='addSignDefault(" + event.latLng.lat() + "," + event.latLng.lng() + ")'>Add Sign</button>";
//        newContentString += "<span>Add Sign:</span>";
        newContentString += "<input id='fileupload' type='file' name='files[]' class='buttonsmall-red icon-update' value='Sign Image'>";
        newContentString += "<div id='progress' class='progress'>";
        newContentString += "<div class='bar progress-bar progress-bar-success' style='width: 0%'></div>";
        newContentString += "</div>";
        newContentString += "<div id='files' class='files'></div>";
        if(infowindow != null) infowindow.close();
        infowindow = new google.maps.InfoWindow({
            content: newPlaceHolder,
            position: event.latLng
        });
        infowindow.open(map);

        $(newContentString).appendTo('#placehold').each(function() {
            bindUpload(event.latLng.lat(),event.latLng.lng());
        });

    });
    google.maps.event.addListener(map, 'rightclick', function() {
        if(drawingManager.getDrawingMode() == google.maps.drawing.OverlayType.POLYLINE)
            drawingManager.setDrawingMode(null);
        else
            drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYLINE);
    });
    google.maps.event.addListener(map, 'center_changed', function() { // LAGS, SHOULD DETECT DISTANCE FROM PREVIOUS LOCATION
//        if(map.getZoom() > 16) {
//            mainRefresh();
//        }
    });
    google.maps.event.addListener(map, 'zoom_changed', function() {
        if(map.getZoom() > 16) {
            mainRefresh();
        } else {
            if($("#view_tracks").is(':checked')) {
//                $("#view_tracks").prop('checked', false);
            }
            if($("#view_signs").is(':checked')) {
//                $("#view_signs").prop('checked', false);
            }
        }
    });

    // FIRE IT UP! - API CALLS
//    currentTime = TFDateTimeUTC(Date.create().getHours(),Date.create().getMinutes());
//    currentTime = Date.create('now');
    retrieveData();
    retrieveSigns();

//    $("#view_tracks").prop('checked',true);
//    $("#view_signs").prop('checked',true);
    $("#view_tracks").change(function() {
        if ($(this).is(':checked')) {
            trackRefresh();
        }
        else {
            for(trackNum in tracks)
            {
                tracks[trackNum].TrackPolyline.setMap(null);
            }
            tracks = null;
        }
    });
    $("#view_signs").change(function() {
        if ($(this).is(':checked')) {
            signRefresh();
        }
        else {
            for(signNum in signs)
                signs[signNum].setMap(null);
            signs = null;
        }
    });

    $("#searchBar").on("focus",function() {
        $("#searchBar").css("border", "3px solid #e10026");
    });
    $("#searchBar").on("blur",function() {
        $("#searchBar").css("border", "1px solid #CCCCCC");
    });
});

// API CALLS
function retrieveData() {
    $.post(retrieveDataAPI, { posLat: posX, posLong: posY, posRadius: ZoomRadius[map.getZoom()]}, function(responseText) {
        jsonObj = $.parseJSON(responseText);
        if(jsonObj.success == 1) {
//            alert('got data'); LOAD TIME
//            alert('Retrieved: ' + jsonObj.tracks.length + ' tracks');
            tracks = new Array();

            // POPULATE TRACKS AND TF DATA
            for(var trackPos=0;trackPos<jsonObj.tracks.length;trackPos++)
            {
                var trackObj = jsonObj.tracks[trackPos];
                var trackMarkers = new Array();
                for(var coorPos=0;coorPos<jsonObj.coordinates.length;coorPos++) {
                    if(trackObj.ID == jsonObj.coordinates[coorPos].TrackID) {
                        trackMarkers.push(new google.maps.LatLng(jsonObj.coordinates[coorPos].posLat, jsonObj.coordinates[coorPos].posLong));
                    }
                }
                // PAINT TRACKS
                var trackColor = '#FF8C00';
                if(trackObj.TrackType == TrackType.NoParkingAnytime) {
                    trackColor = '#FF0000';
                }
                if(trackObj.TrackType == TrackType.HandicapZone) {
                    trackColor = '#0024FF';
                }
                if(trackObj.TrackType == TrackType.CommercialZone || trackObj.TrackType == TrackType.TaxiZone) {
                    trackColor = '#FFE400';
                }
                if(trackObj.TrackType == TrackType.Temporary) {
                    trackColor = '#CE00A0';
                }
                if(trackObj.IsVerified == "F") {
                   trackColor = '#BA00E0';
                }
                if(trackObj.IsDeleted == "T") {
                    trackColor = '#000000';
                }
                track = new google.maps.Polyline({

                    path: trackMarkers,

                    geodesic: true,

                    strokeColor: trackColor,

                    strokeOpacity: 1.0,

                    strokeWeight: 5,

                    clickable: true,

                    draggable: true,

                    editable: true

                });

                track.setMap(map);

                var mapTrack = new MapTrack(trackObj.ID,track);

                tracks.push(mapTrack);

                onTrackClick(track,trackObj,trackPos);

            }

            // CONTROL PANEL -- NEW TRACKS HEADER
            var panelContent = "<h3>New Tracks";
            if(jsonObj.uvTracks.length > 0) {

                panelContent += " (" + jsonObj.uvTracks.length + ")";

            }
            panelContent += "</h3>";

            // CONTROL PANEL -- NEW TRACKS CONTENT
            panelContent += "<div class='panel-bg'>";
            if(jsonObj.uvTracks.length > 0) {

                panelContent += "<table class='new-tracks'>";

                panelContent += "<tr><th>ID</th><th>Street</th><th>View</th><th>Verify</th><th>Hide</th><th>In Client</th><th>Delete</th></tr>";

                for(var uvTrackPos=0;uvTrackPos<jsonObj.uvTracks.length;uvTrackPos++) {

                    var uvTrack = jsonObj.uvTracks[uvTrackPos];

                    panelContent += "<tr>" +

                        "<td style='width: 10%'>" + uvTrack.ID + "</td>" +

                        "<td>" + uvTrack.Street + "</td>" +

                        "<td style='width: 10%'>" +

                        "<button class='buttonpanel-red icon-view' onclick='viewTrack(" + uvTrack.ID + "," + TFObj.Track + ")'></button>" +

                        "</td>" +

                        "<td style='width: 10%'>" +

                        "<button class='buttonpanel-red icon-verify' onclick='verifyTrack(" + uvTrack.ID + ")'></button>" +

                        "</td>" +

                        "<td style='width: 10%'>" +

                        "<button class='buttonpanel-red icon-hide' onclick='hideTrack(" + uvTrack.ID + ")'></button>" +

                        "</td>" +

                        "<td style='width: 10%'>";

                    if(uvTrack.IsDeleted == "F") {

                        panelContent += "<img src='img/check-32.png' />";

                    }

                    else {

                        panelContent += "<img src='img/cancel-32.png' />";

                    }

                    panelContent += "</td>" +

                        "<td style='width: 10%'>" +

                        "<button class='buttonpanel-red icon-trash' onclick='deleteTrack(" + uvTrack.ID + ")'></button>" +

                        "</td>" +

                        "</tr>";

                }

                panelContent += "</table>";

            }
            else {

                panelContent += "<p>No unverified tracks found.</p>";

            }
            panelContent += "</div>";

            // CONTROL PANEL -- NEW RULES HEADER
            panelContent += "<h3>New Rules";
            if(jsonObj.uvRules.length > 0) {

                panelContent += " (" + jsonObj.uvRules.length + ")";

            }
            panelContent += "</h3>";

            // CONTROL PANEL -- NEW RULES CONTENT
            panelContent += "<div class='panel-bg'>";
            if(jsonObj.uvRules.length > 0) {

                panelContent += "<table class='new-tracks'>";

                panelContent += "<tr><th>ID</th><th>Rule</th><th>View</th><th>Verify</th><th>Hide</th><th>In Client</th><th>Delete</th></tr>";

                for(var uvRulesPos=0;uvRulesPos<jsonObj.uvRules.length;uvRulesPos++) {

                    var uvRule = jsonObj.uvRules[uvRulesPos];

                    panelContent += "<tr>" +

                        "<td style='width: 10%'>" + uvRule.ID + "</td>";

                    panelContent += "<td>" +

                        getRuleDescription(parseInt(uvRule.RuleType)) + "-" +

                        getRuleTimes(uvRule) + "-" +

                        getRuleDays(uvRule) + "</td>";

                    panelContent += "<td style='width: 10%'>" +

                        "<button class='buttonpanel-red icon-view' onclick='viewTrack(" + uvRule.ID + "," + TFObj.Rule + ")'></button>" +

                        "</td>" +

                        "<td style='width: 10%'>" +

                        "<button class='buttonpanel-red icon-verify' onclick='verifyRule(" + uvRule.ID + ")'></button>" +

                        "</td>" +

                        "<td style='width: 10%'>" +

                        "<button class='buttonpanel-red icon-hide' onclick='hideRule(" + uvRule.ID + ")'></button>" +

                        "</td>" +

                        "<td style='width: 10%'>";

//                    if(uvTrack.IsDeleted == "F") {
                    if(uvRule.IsDeleted == "F") {

                        panelContent += "<img src='img/check-32.png' />";

                    }

                    else {

                        panelContent += "<img src='img/cancel-32.png' />";

                    }

                    panelContent += "</td>" +

                        "<td style='width: 10%'>" +

                        "<button class='buttonpanel-red icon-trash' onclick='deleteRule(" + uvRule.ID + ")'></button>" +

                        "</td>" +

                        "</tr>";

                }

                panelContent += "</table>";

            }
            else {

                panelContent += "<p>No unverified rules found.</p>";

            }
            panelContent += "</div>";

            // CONTROL PANEL -- NEW SIGNS HEADER
            panelContent += "<h3>New Signs";
            if(jsonObj.uvSigns.length > 0) {

                panelContent += " (" + jsonObj.uvSigns.length + ")";

            }
            panelContent += "</h3>";

            // CONTROL PANEL -- NEW SIGNS CONTENT
            panelContent += "<div class='panel-bg'>";
            if(jsonObj.uvSigns.length > 0) {

                panelContent += "<table class='new-tracks'>";

                panelContent += "<tr><th>ID</th><th>View</th><th>Verify</th><th>Hide</th><th>In Client</th><th>Delete</th></tr>";

                for(var uvSignsPos=0;uvSignsPos<jsonObj.uvSigns.length;uvSignsPos++) {

                    var uvSign = jsonObj.uvSigns[uvSignsPos];

                    panelContent += "<tr>" +

                        "<td style='width: 10%'>" + uvSign.ID + "</td>";

                    panelContent += "<td style='width: 10%'>" +

                        "<button class='buttonpanel-red icon-view' onclick='viewSign(" + uvSign.posLat + "," + uvSign.posLong + ")'></button>" +

                        "</td>" +

                        "<td style='width: 10%'>" +

                        "<button class='buttonpanel-red icon-verify' onclick='verifySign(" + uvSign.ID + ")'></button>" +

                        "</td>" +

                        "<td style='width: 10%'>" +

                        "<button class='buttonpanel-red icon-hide' onclick='hideSign(" + uvSign.ID + ")'></button>" +

                        "</td>" +

                        "<td style='width: 10%'>";

                    if(uvSign.IsDeleted == "F") {

                        panelContent += "<img src='img/check-32.png' />";

                    }

                    else {

                        panelContent += "<img src='img/cancel-32.png' />";

                    }

                    panelContent += "</td>" +

                        "<td style='width: 10%'>" +

                        "<button class='buttonpanel-red icon-trash' onclick='deleteSign(" + uvSign.ID + "," + 0 + ")'></button>" +

                        "</td>" +

                        "</tr>";

                }

                panelContent += "</table>";

            }
            else {

                panelContent += "<p>No unverified signs found.</p>";

            }
            panelContent += "</div>";

            // CONTROL PANEL -- STATISTICS HEADER
            panelContent += "<h3>Statistics</h3>";

            // CONTROL PANEL -- STATISTICS CONTENT
            panelContent += "<div class='panel-bg'>";
            panelContent += "<table class='new-tracks'>";
            panelContent += "<tr><th>Key</th><th>Value</th></tr>";
            panelContent += "<tr><td>Global Tracks</td><td>" + jsonObj.TrackCount[0] +  "</td></tr>";
            panelContent += "<tr><td>Global Rules</td><td>" + jsonObj.RuleCount[0] +  "</td></tr>";
            panelContent += "<tr><td>Global Points</td><td>" + jsonObj.PointCount[0] +  "</td></tr>";
            panelContent += "<tr><td>Global Signs</td><td>" + jsonObj.SignCount[0] +  "</td></tr>";
            panelContent += "<tr><td>Global Sign Pictures</td><td>" + jsonObj.SignDirCount +  "</td></tr>";
            panelContent += "<tr><td>Hidden Tracks</td><td>" + jsonObj.uvHiddenTrackCount[0] +  "</td></tr>";
            panelContent += "<tr><td>Hidden Rules</td><td>" + jsonObj.uvHiddenRuleCount[0] +  "</td></tr>";
            panelContent += "<tr><td>Hidden Signs</td><td>" + jsonObj.uvHiddenSignCount[0] +  "</td></tr>";
            panelContent += "<tr><td>Trial Users</td><td>" + jsonObj.UserCount[0] +  "</td></tr>";

            //SYS_ACCOUNT COUNT TRIAL USERS
            panelContent += "</table>";
            panelContent += "</div>";


            // CONTROL PANEL ACTIVATE
            $("#map-panel").html(panelContent);
            var icons = {
                header: "ui-icon-circle-arrow-e",
                activeHeader: "ui-icon-circle-arrow-s"
            };
            $("#map-panel").accordion({
                icons: icons
            });
//            $("#map-panel").accordion("refresh");


//            $("#map-panel").resizable();
        }

        else {
            alert('No data found for this location');
        }

    });
}
function retrieveSigns() {
    $.post(retrieveSignAPI, { posLat: posX, posLong: posY, posRadius: ZoomRadius[map.getZoom()]}, function(responseText) {
        var jsonSignObj = $.parseJSON(responseText);
        signs = new Array();

        // PAINT/ACTIVATE SIGN MARKERS
        for(var signPos=0;signPos<jsonSignObj.signs.length;signPos++)
        {
            var signObj = jsonSignObj.signs[signPos];
            var imgIcon = "img/su_parkingsign_48.png";
            switch(parseInt(signObj.SignType)) {
                case SignType.Parking:
                    imgIcon = "img/su_parking_48.png";
                    break;
                case SignType.WTF:
                    imgIcon = "img/su_wtf_48.png";
                    break;
                case SignType.Temporary:
                    imgIcon = "img/su_temporary_48.png";
                    break;
                case SignType.Handicap:
                    imgIcon = "img/su_handicap_48.png";
                    break;
                case SignType.Meter:
                    imgIcon = "img/su_meter_48.png";
                    break;
                case SignType.Hydrant:
                    imgIcon = "img/su_hydrant_48.png";
                    break;
                case SignType.Artifact:
                    imgIcon = "img/su_artifact_48.png";
                    break;
                case SignType.NoParking:
                    imgIcon = "img/su_parkingsign_48.png";
                    break;
            }
            sign = new google.maps.Marker({
                position: new google.maps.LatLng(signObj.posLat,signObj.posLong),
                icon: imgIcon,
                draggable: true
            });
            sign.setMap(map);
            signs.push(sign);
            onSignClick(sign,signObj,signPos);
        }
    });
}

function addRule(RulePos,trackPos) {
    var StartAM = ($("input:radio[name=rule-startmeridian-new" + RulePos + "]:checked" ).val() == "AM") ? true : false;
    var NewStartTime= new TFDateTimeBase24($("#rule-starthour-new" + RulePos).val(),$("#rule-startminute-new" + RulePos).val(),StartAM);
    var EndAM = ($("input:radio[name=rule-endmeridian-new" + RulePos + "]:checked" ).val() == "AM") ? true : false;
    var NewEndTime = new TFDateTimeBase24($("#rule-endhour-new" + RulePos).val(),$("#rule-endminute-new" + RulePos).val(),EndAM);
    var SundayChecked = ($("#rule-sunday-new" + RulePos).is(":checked")) ? "T" : "F";
    var MondayChecked = ($("#rule-monday-new" + RulePos).is(":checked")) ? "T" : "F";
    var TuesdayChecked = ($("#rule-tuesday-new" + RulePos).is(":checked")) ? "T" : "F";
    var WednesdayChecked = ($("#rule-wednesday-new" + RulePos).is(":checked")) ? "T" : "F";
    var ThursdayChecked = ($("#rule-thursday-new" + RulePos).is(":checked")) ? "T" : "F";
    var FridayChecked = ($("#rule-friday-new" + RulePos).is(":checked")) ? "T" : "F";
    var SaturdayChecked = ($("#rule-saturday-new" + RulePos).is(":checked")) ? "T" : "F";
    var NewRuleType = $("#rule-type-new" + RulePos).val();

    if(NewRuleType == ParkingRule.NoParkingAnytime) {
        NewRuleType = ParkingRule.NoParking;
        NewStartTime.Hour = 0;
        NewStartTime.Minute = 0;
        NewEndTime.Hour = 0;
        NewEndTime.Minute = 0;
    }

    $.post(addRuleAPI, {
            RuleType: NewRuleType,
            TrackID: tracks[trackPos].TrackID,
            StartHour: NewStartTime.Hour,
            StartMinute: NewStartTime.Minute,
            EndHour: NewEndTime.Hour,
            EndMinute: NewEndTime.Minute,
            IsSunday: SundayChecked,
            IsMonday: MondayChecked,
            IsTuesday: TuesdayChecked,
            IsWednesday: WednesdayChecked,
            IsThursday: ThursdayChecked,
            IsFriday: FridayChecked,
            IsSaturday: SaturdayChecked,
            IsVerified: IsVerified,
            VerifiedBy: VerifiedBy,
            Flagged: Flagged,
            DeviceID: DeviceID
        },
        function(responseText) {
            var result = $.parseJSON(responseText);

            tracks[trackPos].TrackPolyline.setMap(null);
            if(infowindow != null) infowindow.close();
            $.post(retrieveTrackAPI, {
                TrackID: tracks[trackPos].TrackID
            }, function(responseText) {
                retrieveTrack(responseText);
            });
        });
}
function addLatestRule(trackPos) {
    ruleObj = null;
    selectVal = $("#lastRules").val();
    for(var rulePos = 0;rulePos<jsonObj.rules.length;rulePos++) {
        if(jsonObj.rules[rulePos].ID == selectVal) {
            ruleObj = jsonObj.rules[rulePos];
            break;
        }
    }
    $.post(addRuleAPI, {
            RuleType: ruleObj.RuleType,
            TrackID: tracks[trackPos].TrackID,
            StartHour: ruleObj.StartHour,
            StartMinute: ruleObj.StartMinute,
            EndHour: ruleObj.EndHour,
            EndMinute: ruleObj.EndMinute,
            IsSunday: ruleObj.IsSunday,
            IsMonday: ruleObj.IsMonday,
            IsTuesday: ruleObj.IsTuesday,
            IsWednesday: ruleObj.IsWednesday,
            IsThursday: ruleObj.IsThursday,
            IsFriday: ruleObj.IsFriday,
            IsSaturday: ruleObj.IsSaturday,
            IsVerified: IsVerified,
            VerifiedBy: VerifiedBy,
            Flagged: Flagged,
            DeviceID: DeviceID
        },
        function(responseText) {
            var result = $.parseJSON(responseText);

            tracks[trackPos].TrackPolyline.setMap(null);
            if(infowindow != null) infowindow.close();
            $.post(retrieveTrackAPI, {
                TrackID: tracks[trackPos].TrackID
            }, function(responseText) {
                retrieveTrack(responseText);
            });
        });
}
function addTrack() {
    if(newTrackPath == null)
    {
        alert("newTrackPath is not set");
        return;
    }
    $.post(addTrackAPI, {
            StartPosLat: newTrackPath.getPath().getAt(0).lat(),
            StartPosLong: newTrackPath.getPath().getAt(0).lng(),
            EndPosLat: newTrackPath.getPath().getAt(1).lat(),
            EndPosLong: newTrackPath.getPath().getAt(1).lng(),
            TrackType: $("#track-type-new").val(),
            Street: $("#track-street-new").val(),
            IsVerified: IsVerified,
            Flagged: Flagged,
            DeviceID: DeviceID
        },
        function(responseText) {
            var result = $.parseJSON(responseText);
            newTrackID = result.newTrackID;
            newTrackPath.setMap(null);

            if(infowindow != null) infowindow.close();
            $.post(retrieveTrackAPI, {
                TrackID: newTrackID
            }, function(responseText) {
                retrieveTrack(responseText);
            });
        });

}
function addSign(filename,lat,lng) {
    $.post(addSignAPI, {
            SignType: $("#sign-type").val(),
            picLocation: filename,
            posLat: lat,
            posLong: lng,
            IsVerified: IsVerified,
            Flagged: Flagged,
            DeviceID: DeviceID
        },
        function(responseText) {
            var result = $.parseJSON(responseText);
            if(infowindow != null) infowindow.close();
            signRefresh();
        });
}

function addSignDefault(lat,lng) {
    var selectedSignType = $("#sign-type").val();
    switch(parseInt(selectedSignType)) {
        case SignType.Handicap:
            filename = "def_handicap.jpg";
            break;
        case SignType.Meter:
            filename = "def_meter.jpg";
            break;
        case SignType.Hydrant:
            filename = "def_hydrant.jpg";
            break;
        case SignType.NoParking:
            filename = "def_noparking.jpg";
            break;
        default:
            filename = "def_parking.gif";
            break;
    }
    $.post(addSignAPI, {
            SignType: selectedSignType,
            picLocation: filename,
            posLat: lat,
            posLong: lng,
            IsVerified: IsVerified,
            Flagged: Flagged,
            DeviceID: DeviceID
        },
        function(responseText) {
            var result = $.parseJSON(responseText);
            if(infowindow != null) infowindow.close();
            signRefresh();
        });
}

function updateTrack(trackPos) {
//    check lat/lng values here
//    alert("StartPosLat: " + tracks[trackPos].getPath().getAt(2).lat() + "\n" +
//        "StartPosLong: " + tracks[trackPos].getPath().getAt(2).lng() + "\n" +
//        "EndPosLat: " + tracks[trackPos].getPath().getAt(1).lat() + "\n" +
//        "EndPosLng: " + tracks[trackPos].getPath().getAt(1).lng() + "\n");
    $.post(updateTrackAPI, {
            StartPosLat: tracks[trackPos].TrackPolyline.getPath().getAt(0).lat(),
            StartPosLong: tracks[trackPos].TrackPolyline.getPath().getAt(0).lng(),
            EndPosLat: tracks[trackPos].TrackPolyline.getPath().getAt(1).lat(),
            EndPosLong: tracks[trackPos].TrackPolyline.getPath().getAt(1).lng(),
            TrackID: tracks[trackPos].TrackID, //jsonObj.tracks[trackPos].ID,
            TrackType: $("#track-type" + trackPos).val(),
            Street: $("#track-street" + trackPos).val(),
            IsVerified: IsVerified,
            Flagged: Flagged,
            DeviceID: DeviceID,
            IsDeleted: "F"
        },
        function(responseText) {
//            alert('update trackPos: ' + trackPos);
            var result = $.parseJSON(responseText);
            tracks[trackPos].TrackPolyline.setMap(null);
            if(infowindow != null) infowindow.close();
            $.post(retrieveTrackAPI, {
                TrackID: tracks[trackPos].TrackID
            }, function(responseText) {
                retrieveTrack(responseText);
                $.post()
            });
        });
}
function updateRule(RuleID,trackPos) {
//    for(var rulePos=0;rulePos<jsonObj.rules.length;rulePos++)
//    {
//        if(jsonObj.rules[rulePos].ID == RuleID)
//        {
    var StartAM = ($("input:radio[name=rule-startmeridian" + RuleID + "]:checked" ).val() == "AM") ? true : false;
    var NewStartTime= new TFDateTimeBase24($("#rule-starthour" + RuleID).val(),$("#rule-startminute" + RuleID).val(),StartAM);
    var EndAM = ($("input:radio[name=rule-endmeridian" + RuleID + "]:checked" ).val() == "AM") ? true : false;
    var NewEndTime = new TFDateTimeBase24($("#rule-endhour" + RuleID).val(),$("#rule-endminute" + RuleID).val(),EndAM);
    var SundayChecked = ($("#rule-sunday" + RuleID).is(":checked")) ? "T" : "F";
    var MondayChecked = ($("#rule-monday" + RuleID).is(":checked")) ? "T" : "F";
    var TuesdayChecked = ($("#rule-tuesday" + RuleID).is(":checked")) ? "T" : "F";
    var WednesdayChecked = ($("#rule-wednesday" + RuleID).is(":checked")) ? "T" : "F";
    var ThursdayChecked = ($("#rule-thursday" + RuleID).is(":checked")) ? "T" : "F";
    var FridayChecked = ($("#rule-friday" + RuleID).is(":checked")) ? "T" : "F";
    var SaturdayChecked = ($("#rule-saturday" + RuleID).is(":checked")) ? "T" : "F";

    var NewRuleType = $("#rule-type" + RuleID).val();

    if(NewRuleType == ParkingRule.NoParkingAnytime) {
        NewRuleType = ParkingRule.NoParking;
        NewStartTime.Hour = 0;
        NewStartTime.Minute = 0;
        NewEndTime.Hour = 0;
        NewEndTime.Minute = 0;
    }

    $.post(updateRuleAPI, {
            RuleID: RuleID,
            RuleType: NewRuleType,
            StartHour: NewStartTime.Hour,
            StartMinute: NewStartTime.Minute,
            EndHour: NewEndTime.Hour,
            EndMinute: NewEndTime.Minute,
            IsSunday: SundayChecked,
            IsMonday: MondayChecked,
            IsTuesday: TuesdayChecked,
            IsWednesday: WednesdayChecked,
            IsThursday: ThursdayChecked,
            IsFriday: FridayChecked,
            IsSaturday: SaturdayChecked,
            IsVerified: IsVerified,
            VerifiedBy: VerifiedBy,
            Flagged: Flagged,
            DeviceID: DeviceID,
            IsDeleted: "F"
        },
        function(responseText) {
            var result = $.parseJSON(responseText);
            tracks[trackPos].TrackPolyline.setMap(null);

            if(infowindow != null) infowindow.close();
            $.post(retrieveTrackAPI, {
                TrackID: tracks[trackPos].TrackID
            }, function(responseText) {
                retrieveTrack(responseText);
            });
        });
//            break;
//        }
//    }
}
function updateSign(signPos,signID) {
    $.post(updateSignAPI, {
            SignID: signID,
            SignType: $("#sign-type" + signPos).val(),
            posLat: signs[signPos].getPosition().lat(),
            posLong: signs[signPos].getPosition().lng(),
            IsVerified: IsVerified,
            Flagged: Flagged,
            DeviceID: DeviceID,
            IsDeleted: "F"
        },
        function(responseText) {
            var result = $.parseJSON(responseText);
//            map.setCenter(new google.maps.LatLng(signs[signPos].getPosition().lat(),signs[signPos].getPosition().lng()));
            signRefresh();
        });
}

function deleteSignRefresh(signPos,signID,deleteImage) {
    $.post(deleteSignAPI,{ SignID: signID, DeleteImage: deleteImage },
        function(responseText) {
            var result = $.parseJSON(responseText);
            signs[signPos].setMap(null);
            if(signwindow != null) signwindow.close();
        });
}
function deleteSign(signID,deleteImage) {
    $.post(deleteSignAPI,{ SignID: signID, DeleteImage: deleteImage },
        function(responseText) {
            var result = $.parseJSON(responseText);
            if(result.success == 1) {
                //success
            }
            else {
                alert("deleteSign() json failed");
            }
        });
}
function deleteTrackRefresh(trackPos) {
    $.post(deleteTrackAPI,{ TrackID: tracks[trackPos].TrackID },
    function(responseText) {
        var result = $.parseJSON(responseText);
        if(result.success == 1) {
            tracks[trackPos].TrackPolyline.setMap(null);
            if(infowindow != null) infowindow.close();
            $.post(retrieveTrackAPI, {
                TrackID: tracks[trackPos].TrackID
            }, function(responseText) {
                retrieveTrack(responseText);
            });
        }
        else {
            alert("deleteTrackRefresh() json failed");
        }
    });
}
function deleteTrack(trackID) {
    $.post(deleteTrackAPI,{ TrackID: trackID },
        function(responseText) {
            var result = $.parseJSON(responseText);
            if(result.success == 1) {
                if(infowindow != null)
                    infowindow.close();
            }
            else {
                alert("deleteTrack() json failed");
            }
        });
}
function deleteNewTrack() {
    if(newTrackPath != null) newTrackPath.setMap(null);
}
function deleteRuleRefresh(GivenRuleID,trackPos) {
    $.post(deleteRuleAPI,{ RuleID: GivenRuleID },
        function(responseText) {
            var result = $.parseJSON(responseText);

            if(result.success == 1) {
                tracks[trackPos].TrackPolyline.setMap(null);
                if(infowindow != null) infowindow.close();
                $.post(retrieveTrackAPI, {
                TrackID: tracks[trackPos].TrackID
            }, function(responseText) {
                retrieveTrack(responseText);
            });
            }
            else {
                alert("deleteRuleRefresh() json failed");
            }
        });
}
function deleteRule(GivenRuleID) {
    $.post(deleteRuleAPI,{ RuleID: GivenRuleID },
        function(responseText) {
            var result = $.parseJSON(responseText);
            if(result.success == 1) {
                if(infowindow != null)
                    infowindow.close();
            }
            else {
                alert("deleteRule() json failed");
            }
        });
}

function verifyTrackRefresh(trackID,trackPos) {
    $.post(verifyTrackAPI,{ TrackID: trackID },
        function(responseText) {
            var result = $.parseJSON(responseText);
            if(result.success == 1) {
                tracks[trackPos].TrackPolyline.setMap(null);
                if(infowindow != null) infowindow.close();
                $.post(retrieveTrackAPI, {
                    TrackID: trackID
                }, function(responseText) {
                    retrieveTrack(responseText);
                });
            }
            else {
                alert("verifyTrackRefresh() json failed");
            }
        });
}
function verifyTrack(trackID) {
    $.post(verifyTrackAPI,{ TrackID: trackID },
        function(responseText) {
            var result = $.parseJSON(responseText);
            if(result.success == 1) {
                if(infowindow != null)
                    infowindow.close();
            }
            else {
                alert("verifyTrack() json failed");
            }
        });
}
function verifyRule(ruleID) {
    $.post(verifyRuleAPI,{ RuleID: ruleID },
        function(responseText) {
            var result = $.parseJSON(responseText);
            if(result.success == 1) {
                if(infowindow != null)
                    infowindow.close();
            }
            else {
                alert("verifyRule() json failed");
            }
        });
}
function verifySign(signID) {
    $.post(verifySignAPI,{ SignID: signID },
        function(responseText) {
            var result = $.parseJSON(responseText);
            if(result.success == 1) {
            }
            else {
                alert("verifySign() json failed");
            }
        });
}

function hideTrackRefresh(trackID,trackPos) {
    $.post(hideTrackAPI,{ TrackID: trackID },
        function(responseText) {
            var result = $.parseJSON(responseText);
            if(result.success == 1) {
                tracks[trackPos].TrackPolyline.setMap(null);
                if(infowindow != null) infowindow.close();
                $.post(retrieveTrackAPI, {
                    TrackID: trackID
                }, function(responseText) {
                    retrieveTrack(responseText);
                });
            }
            else {
                alert("hideTrackRefresh() json failed");
            }
        });
}
function hideTrack(trackID) {
    $.post(hideTrackAPI,{ TrackID: trackID },
        function(responseText) {
            var result = $.parseJSON(responseText);
            if(result.success == 1) {
                if(infowindow != null)
                    infowindow.close();
            }
            else {
                alert("hideTrack() json failed");
            }
        });
}
function hideRule(ruleID) {
    $.post(hideRuleAPI,{ RuleID: ruleID },
        function(responseText) {
            var result = $.parseJSON(responseText);
            if(result.success == 1) {
                if(infowindow != null)
                    infowindow.close();
            }
            else {
                alert("hideRule() json failed");
            }
        });
}
function hideSign(signID) {
    $.post(hideSignAPI,{ SignID: signID },
        function(responseText) {
            var result = $.parseJSON(responseText);
            if(result.success == 1) {
            }
            else {
                alert("hideSign() json failed");
            }
        });
}

// EVENTS
function viewTrack(ID,obj) {
    switch(obj) {
        case TFObj.Track:
            $.post(retrieveCenterPointAPI,{ ObjID: ID, ObjType: obj },
                function(responseText) {
                    var result = $.parseJSON(responseText);
                    if(result.success == 1) {
                        if(infowindow != null)
                            infowindow.close();
                        map.setCenter(new google.maps.LatLng(result.posLat,result.posLong));
                    }
                    else {
                        alert("retrieveCenterPoint(TRACK) json failed");
                    }
                });
            break;
        case TFObj.Rule:
            $.post(retrieveCenterPointAPI,{ ObjID: ID, ObjType: obj },
                function(responseText) {
                    var result = $.parseJSON(responseText);
                    if(result.success == 1) {
                        if(infowindow != null)
                            infowindow.close();
                        map.setCenter(new google.maps.LatLng(result.posLat,result.posLong));
                    }
                    else {
                        alert("retrieveCenterPoint(RULE) json failed");
                    }
                });
            break;
        default:
            break;
    }
} // ADMIN
function viewSign(posLat,posLong) {
    map.setCenter(new google.maps.LatLng(posLat,posLong));
} // ADMIN
function retrieveTrack(responseText) {
    newTrackObj = $.parseJSON(responseText);

    //remove old data
    for(var x=0;x<jsonObj.tracks.length;x++) {
        if(jsonObj.tracks[x].ID == newTrackObj.tracks[0].ID) {
            jsonObj.tracks.splice(x,1);
        }
    }
    var rKilled = 0;
    for(var x=0;x<jsonObj.rules.length+rKilled;x++) {
        if(jsonObj.rules[x-rKilled].TrackID == newTrackObj.tracks[0].ID) {
            jsonObj.rules.splice(x-rKilled,1);
            rKilled++;
        }
    }
    jsonObj.tracks.push(newTrackObj.tracks[0]);
    for(var g=0; g<newTrackObj.rules.length; g++) {
        jsonObj.rules.push(newTrackObj.rules[g]);
    }
    var trackObj = newTrackObj.tracks[0];
    var trackMarkers = new Array();
    var trackColor = '#FF8C00';

    if(trackObj.TrackType == TrackType.NoParkingAnytime) {
        trackColor = '#FF0000';
    }
    if(trackObj.TrackType == TrackType.HandicapZone) {
        trackColor = '#0024FF';
    }
    if(trackObj.TrackType == TrackType.CommercialZone || trackObj.TrackType == TrackType.TaxiZone) {
        trackColor = '#FFE400';
    }
    if(trackObj.TrackType == TrackType.Temporary) {
        trackColor = '#CE00A0';
    }
    for(var coorPos=0;coorPos<newTrackObj.coordinates.length;coorPos++)
    {
        trackMarkers.push(new google.maps.LatLng(newTrackObj.coordinates[coorPos].posLat, newTrackObj.coordinates[coorPos].posLong));
    }
    track = new google.maps.Polyline({
        path: trackMarkers,
        geodesic: true,
        strokeColor: trackColor,
        strokeOpacity: 1.0,
        strokeWeight: 5,
        clickable: true,
        editable: true
    });
    track.setMap(map);
    var mapTrack = new MapTrack(trackObj.ID,track);
    tracks.push(mapTrack);
    onTrackClick(track,trackObj,tracks.length-1);
//    alert('retrieveTrack trackPos: ' + tracks.length-1);
}
function onTrackClick(trackRef,trackObj,trackPos) {
    var trackString = "<table class='table-track'><tr><td class='data-h1'>ID</td><td>" + trackObj.ID + "</td></tr>" +
        "<tr>" +
        "<td class='data-h1'>Track Type</td>" +
        "<td>" +

        "<select id='track-type" + trackPos + "' name='track-type" + trackPos + "'>" +
        "<option value='1' ";
    if(trackObj.TrackType == TrackType.Regular) trackString += "selected='selected'";
    trackString += ">Regular</option>" +
        "<option value='2' ";
    if(trackObj.TrackType == TrackType.Paid) trackString += "selected='selected'";
    trackString += ">Paid</option>" +
        "<option value='3' ";
    if(trackObj.TrackType == TrackType.Temporary) trackString += "selected='selected'";
    trackString += ">Temporary</option>" +
        "<option value='4' ";
    if(trackObj.TrackType == TrackType.NoParkingAnytime) trackString += "selected='selected'";
    trackString += ">No Parking Anytime</option>" +
        "<option value='5' ";
    if(trackObj.TrackType == TrackType.TaxiZone) trackString += "selected='selected'";
    trackString += ">Taxi Zone</option>" +
        "<option value='6' ";
    if(trackObj.TrackType == TrackType.CommercialZone) trackString += "selected='selected'";
    trackString += ">Commercial Zone</option>" +
        "<option value='7' ";
    if(trackObj.TrackType == TrackType.HandicapZone) trackString += "selected='selected'";
    trackString += ">Handicap Zone</option>" +
        "</select>" +

        "</td>" +
        "</tr>" +
        "<tr>" +
        "<td class='data-h1'>Street</td>" +
        "<td><input type='text' id='track-street" + trackPos + "' name='track-street" + trackPos + "' value='" + trackObj.Street + "' /></td>" +
        "</tr>" +
        "</table>" +
        "<button class='buttonsmall-red icon-update' id='btn_updateTrack' onclick='updateTrack(" + trackPos + ")'>Update Track</button>" +
        "<button class='buttonsmall-red icon-delete' id='btn_deleteTrack' onclick='deleteTrackRefresh(" + trackPos + ")'>Delete Track</button>";

    var ruleCount = 0;
    var ruleString = "";

    if(jsonObj.rules.length > 11) {
        ruleString += "<select id='lastRules'>";
        var latestRules = new Array();
        latestRules.push(jsonObj.rules[jsonObj.rules.length-1]);
        latestRules.push(jsonObj.rules[jsonObj.rules.length-2]);
        latestRules.push(jsonObj.rules[jsonObj.rules.length-3]);
        latestRules.push(jsonObj.rules[jsonObj.rules.length-4]);
        latestRules.push(jsonObj.rules[jsonObj.rules.length-5]);
        latestRules.push(jsonObj.rules[jsonObj.rules.length-6]);
        latestRules.push(jsonObj.rules[jsonObj.rules.length-7]);
        latestRules.push(jsonObj.rules[jsonObj.rules.length-8]);
        latestRules.push(jsonObj.rules[jsonObj.rules.length-9]);
        latestRules.push(jsonObj.rules[jsonObj.rules.length-10]);
        latestRules.push(jsonObj.rules[jsonObj.rules.length-11]);
        for(var z=0;z<latestRules.length;z++) {
            var ruleObj = latestRules[z];
            ruleString += "<option value='" + ruleObj.ID + "'>" +
                getRuleDescription(parseInt(ruleObj.RuleType)) + "-" +
                getRuleTimes(ruleObj) + "-" +
                getRuleDays(ruleObj) +
                "</option>";
        }
        ruleString += "</select>";
        ruleString += "<button class='buttonsmall-red icon-newrule' id='btn_addLatestRule' onclick='addLatestRule(" + trackPos + ")'>Add Latest Rule</button>" ;
    }
    for(var rulePos=0;rulePos<jsonObj.rules.length;rulePos++) {
        if(jsonObj.rules[rulePos].TrackID == trackObj.ID &&
            jsonObj.rules[rulePos].IsVerified == "T") {
            ruleCount++;
            var ruleObj = jsonObj.rules[rulePos];
            ruleString +=   "<div class='rule-cell'><div class='box_normal'>";

            ruleString += "<select id='rule-type" + ruleObj.ID + "' name='rule-type" + ruleObj.ID + "'>" +
                "<option value='1' ";
            if(ruleObj.RuleType == ParkingRule.NoParking) ruleString += "selected='selected'";
            ruleString += ">No Parking</option>" +
                "<option value='2' ";
            if(ruleObj.RuleType == ParkingRule.NoStopping) ruleString += "selected='selected'";
            ruleString += ">No Stopping</option>" +
                "<option value='3' ";
            if(ruleObj.RuleType == ParkingRule.HourParking1) ruleString += "selected='selected'";
            ruleString += ">1 Hour Parking</option>" +
                "<option value='4' ";
            if(ruleObj.RuleType == ParkingRule.HourParking2) ruleString += "selected='selected'";
            ruleString += ">2 Hour Parking</option>" +
                "<option value='5' ";
            if(ruleObj.RuleType == ParkingRule.HourParking3) ruleString += "selected='selected'";
            ruleString += ">3 Hour Parking</option>" +
                "<option value='6' ";
            if(ruleObj.RuleType == ParkingRule.HourParking4) ruleString += "selected='selected'";
            ruleString += ">4 Hour Parking</option>" +
                "<option value='7' ";
            if(ruleObj.RuleType == ParkingRule.HourParking5) ruleString += "selected='selected'";
            ruleString += ">5 Hour Parking</option>" +
                "<option value='8' ";
            if(ruleObj.RuleType == ParkingRule.MinuteParking15) ruleString += "selected='selected'";
            ruleString += ">15 Minute Parking</option>" +
                "<option value='9' ";
            if(ruleObj.RuleType == ParkingRule.MinuteParking30) ruleString += "selected='selected'";
            ruleString += ">30 Minute Parking</option>" +
                "<option value='10' ";
            if(ruleObj.RuleType == ParkingRule.MinuteParking45) ruleString += "selected='selected'";
            ruleString += ">45 Minute Parking</option>" +
                "<option value='11' ";
            if(ruleObj.RuleType == ParkingRule.NoParkingAnytime) ruleString += "selected='selected'";
            ruleString += ">No Parking Anytime</option>" +
                "<option value='12' ";
            if(ruleObj.RuleType == ParkingRule.LoadingOnly5) ruleString += "selected='selected'";
            ruleString += ">5 Minute Loading Only</option>" +
                "<option value='13' ";
            if(ruleObj.RuleType == ParkingRule.MinuteParking20) ruleString += "selected='selected'";
            ruleString += ">20 Minute Parking</option>" +
                "<option value='14' ";
            if(ruleObj.RuleType == ParkingRule.MinuteParking40) ruleString += "selected='selected'";
            ruleString += ">40 Minute Parking</option>" +
                "<option value='15' ";
            if(ruleObj.RuleType == ParkingRule.HourParking8) ruleString += "selected='selected'";
            ruleString += ">8 Hour Parking</option>" +
                "<option value='16' ";
            if(ruleObj.RuleType == ParkingRule.HourParking10) ruleString += "selected='selected'";
            ruleString += ">10 Hour Parking</option>" +
                "<option value='17' ";
            if(ruleObj.RuleType == ParkingRule.HourParking9) ruleString += "selected='selected'";
            ruleString += ">9 Hour Parking</option>" +
                "</select>" + "</div>";

            var StartTime = new TFDateTimeUTC(ruleObj.StartHour,ruleObj.StartMinute);
            var EndTime = new TFDateTimeUTC(ruleObj.EndHour,ruleObj.EndMinute);

            ruleString += "<table class='table-ruletimes'>" +
                "<tr>" +
                "<td class='data-h1'>Rule Start</td>" +
                "<td>" +
                "<input type='text' id='rule-starthour" + ruleObj.ID + "' class='input-time' name='rule-starthour" + ruleObj.ID + "' value='" + StartTime.Hour + "' />" +
                ":" +
                "<input type='text' id='rule-startminute" + ruleObj.ID + "' class='input-time' name='rule-startminute" + ruleObj.ID + "' value='" + StartTime.Minute + "' />" +
                "<br /><input type='radio' id='rule-startam" + ruleObj.ID + "' name='rule-startmeridian" + ruleObj.ID + "' value='AM' ";
            if(StartTime.isAM == true) ruleString += "checked";
            ruleString += " />AM" +
                "<input type='radio' id='rule-startpm" + ruleObj.ID + "' name='rule-startmeridian" + ruleObj.ID + "' value='PM' ";
            if(StartTime.isAM == false) ruleString += "checked";
            ruleString += " />PM" +
                "</td>" +
                "</tr>" +
                "<tr>" +
                "<td class='data-h1'>Rule End</td>" +
                "<td>" +
                "<input type='text' id='rule-endhour" + ruleObj.ID + "' class='input-time' name='rule-endhour" + ruleObj.ID + "' value='" + EndTime.Hour + "' />" +
                ":" +
                "<input type='text' id='rule-endminute" + ruleObj.ID + "' class='input-time' name='rule-endminute" + ruleObj.ID + "' value='" + EndTime.Minute + "' />" +
                "<br /><input type='radio' id='rule-endam" + ruleObj.ID + "' name='rule-endmeridian" + ruleObj.ID + "' value='AM' ";
            if(EndTime.isAM == true) ruleString += "checked";
            ruleString += " />AM" +
                "<input type='radio' id='rule-endpm" + ruleObj.ID + "' name='rule-endmeridian" + ruleObj.ID + "' value='PM' ";
            if(EndTime.isAM == false) ruleString += "checked";
            ruleString += " />PM" +
                "</td>" +
                "</tr>" +
                "</table>";

            ruleString += "<table class='table-ruledays'>" +
                "<tr>" +
                "<td>S</td><td>M</td><td>T</td><td>W</td><td>Th</td><td>F</td><td>S</td>" +
                "</tr>" +
                "<tr>" +
                "<td><input type='checkbox' id='rule-sunday" + ruleObj.ID + "' value='Sunday' ";
            if(ruleObj.IsSunday == "T") ruleString += "checked";
            ruleString += "/></td>" +
                "<td><input type='checkbox' id='rule-monday" + ruleObj.ID + "' value='Monday' ";
            if(ruleObj.IsMonday == "T") ruleString += "checked";
            ruleString += "/></td>" +
                "<td><input type='checkbox' id='rule-tuesday" + ruleObj.ID + "' value='Tuesday' ";
            if(ruleObj.IsTuesday == "T") ruleString += "checked";
            ruleString += "/></td>" +
                "<td><input type='checkbox' id='rule-wednesday" + ruleObj.ID + "' value='Wednesday' ";
            if(ruleObj.IsWednesday == "T") ruleString += "checked";
            ruleString += "/></td>" +
                "<td><input type='checkbox' id='rule-thursday" + ruleObj.ID + "' value='Thursday' ";
            if(ruleObj.IsThursday == "T") ruleString += "checked";
            ruleString += "/></td>" +
                "<td><input type='checkbox' id='rule-friday" + ruleObj.ID + "' value='Friday' ";
            if(ruleObj.IsFriday == "T") ruleString += "checked";
            ruleString += "/></td>" +
                "<td><input type='checkbox' id='rule-saturday" + ruleObj.ID + "' value='Saturday' ";
            if(ruleObj.IsSaturday == "T") ruleString += "checked";
            ruleString += "/></td>" +
                "</tr>" +
                "</table>" +
                "<button class='buttonsmall-red icon-update' id='btn_updateRule' onclick='updateRule(" + ruleObj.ID + "," + trackPos + ")'>Update Rule</button>" +
                "<button class='buttonsmall-red icon-delete' id='btn_deleteRule' onclick='deleteRuleRefresh(" + ruleObj.ID + "," + trackPos + ")'>Delete Rule</button>";
            if(ruleObj.IsDeleted == "T") {
                ruleString += "<span>" + "Deleted by Client" + "</span>";
            }
            ruleString += "</div>";
        }
    }
    ruleString += "<button class='buttonsmall-red icon-newrule' id='btn_showNewVRule' onclick='showNewRule(" + trackObj.ID + "," + trackPos + "," + 1 + ")'>Show New Rule</button><br />";

    var uvRuleCount = 0;
    var uvRuleString = "";
    for(var rulePos=0;rulePos<jsonObj.rules.length;rulePos++) {
        if(jsonObj.rules[rulePos].TrackID == trackObj.ID &&
            jsonObj.rules[rulePos].IsVerified == "F") {
            uvRuleCount++;
            var ruleObj = jsonObj.rules[rulePos];
            uvRuleString +=   "<div class='rule-cell'><div class='box_normal'>";

            uvRuleString += "<select id='rule-type" + ruleObj.ID + "' name='rule-type" + ruleObj.ID + "'>" +
                "<option value='1' ";
            if(ruleObj.RuleType == ParkingRule.NoParking) uvRuleString += "selected='selected'";
            uvRuleString += ">No Parking</option>" +
                "<option value='2' ";
            if(ruleObj.RuleType == ParkingRule.NoStopping) uvRuleString += "selected='selected'";
            uvRuleString += ">No Stopping</option>" +
                "<option value='3' ";
            if(ruleObj.RuleType == ParkingRule.HourParking1) uvRuleString += "selected='selected'";
            uvRuleString += ">1 Hour Parking</option>" +
                "<option value='4' ";
            if(ruleObj.RuleType == ParkingRule.HourParking2) uvRuleString += "selected='selected'";
            uvRuleString += ">2 Hour Parking</option>" +
                "<option value='5' ";
            if(ruleObj.RuleType == ParkingRule.HourParking3) uvRuleString += "selected='selected'";
            uvRuleString += ">3 Hour Parking</option>" +
                "<option value='6' ";
            if(ruleObj.RuleType == ParkingRule.HourParking4) uvRuleString += "selected='selected'";
            uvRuleString += ">4 Hour Parking</option>" +
                "<option value='7' ";
            if(ruleObj.RuleType == ParkingRule.HourParking5) uvRuleString += "selected='selected'";
            uvRuleString += ">5 Hour Parking</option>" +
                "<option value='8' ";
            if(ruleObj.RuleType == ParkingRule.MinuteParking15) uvRuleString += "selected='selected'";
            uvRuleString += ">15 Minute Parking</option>" +
                "<option value='9' ";
            if(ruleObj.RuleType == ParkingRule.MinuteParking30) uvRuleString += "selected='selected'";
            uvRuleString += ">30 Minute Parking</option>" +
                "<option value='10' ";
            if(ruleObj.RuleType == ParkingRule.MinuteParking45) uvRuleString += "selected='selected'";
            uvRuleString += ">45 Minute Parking</option>" +
                "<option value='11' ";
            if(ruleObj.RuleType == ParkingRule.NoParkingAnytime) uvRuleString += "selected='selected'";
            uvRuleString += ">No Parking Anytime</option>" +
                "<option value='12' ";
            if(ruleObj.RuleType == ParkingRule.LoadingOnly5) uvRuleString += "selected='selected'";
            uvRuleString += ">5 Minute Loading Only</option>" +
                "<option value='13' ";
            if(ruleObj.RuleType == ParkingRule.MinuteParking20) uvRuleString += "selected='selected'";
            uvRuleString += ">20 Minute Parking</option>" +
                "<option value='14' ";
            if(ruleObj.RuleType == ParkingRule.MinuteParking40) uvRuleString += "selected='selected'";
            uvRuleString += ">40 Minute Parking</option>" +
                "<option value='15' ";
            if(ruleObj.RuleType == ParkingRule.HourParking8) uvRuleString += "selected='selected'";
            uvRuleString += ">8 Hour Parking</option>" +
                "<option value='16' ";
            if(ruleObj.RuleType == ParkingRule.HourParking10) uvRuleString += "selected='selected'";
            uvRuleString += ">10 Hour Parking</option>" +
                "<option value='17' ";
            if(ruleObj.RuleType == ParkingRule.HourParking9) uvRuleString += "selected='selected'";
            uvRuleString += ">9 Hour Parking</option>" +
                "</select>" + "</div>";

            var StartTime = new TFDateTimeUTC(ruleObj.StartHour,ruleObj.StartMinute);
            var EndTime = new TFDateTimeUTC(ruleObj.EndHour,ruleObj.EndMinute);

            uvRuleString += "<table class='table-ruletimes'>" +
                "<tr>" +
                "<td class='data-h1'>Rule Start</td>" +
                "<td>" +
                "<input type='text' id='rule-starthour" + ruleObj.ID + "' class='input-time' name='rule-starthour" + ruleObj.ID + "' value='" + StartTime.Hour + "' />" +
                ":" +
                "<input type='text' id='rule-startminute" + ruleObj.ID + "' class='input-time' name='rule-startminute" + ruleObj.ID + "' value='" + StartTime.Minute + "' />" +
                "<br /><input type='radio' id='rule-startam" + ruleObj.ID + "' name='rule-startmeridian" + ruleObj.ID + "' value='AM' ";
            if(StartTime.isAM == true) uvRuleString += "checked";
            uvRuleString += " />AM" +
                "<input type='radio' id='rule-startpm" + ruleObj.ID + "' name='rule-startmeridian" + ruleObj.ID + "' value='PM' ";
            if(StartTime.isAM == false) uvRuleString += "checked";
            uvRuleString += " />PM" +
                "</td>" +
                "</tr>" +
                "<tr>" +
                "<td class='data-h1'>Rule End</td>" +
                "<td>" +
                "<input type='text' id='rule-endhour" + ruleObj.ID + "' class='input-time' name='rule-endhour" + ruleObj.ID + "' value='" + EndTime.Hour + "' />" +
                ":" +
                "<input type='text' id='rule-endminute" + ruleObj.ID + "' class='input-time' name='rule-endminute" + ruleObj.ID + "' value='" + EndTime.Minute + "' />" +
                "<br /><input type='radio' id='rule-endam" + ruleObj.ID + "' name='rule-endmeridian" + ruleObj.ID + "' value='AM' ";
            if(EndTime.isAM == true) uvRuleString += "checked";
            uvRuleString += " />AM" +
                "<input type='radio' id='rule-endpm" + ruleObj.ID + "' name='rule-endmeridian" + ruleObj.ID + "' value='PM' ";
            if(EndTime.isAM == false) uvRuleString += "checked";
            uvRuleString += " />PM" +
                "</td>" +
                "</tr>" +
                "</table>";

            uvRuleString += "<table class='table-ruledays'>" +
                "<tr>" +
                "<td>S</td><td>M</td><td>T</td><td>W</td><td>Th</td><td>F</td><td>S</td>" +
                "</tr>" +
                "<tr>" +
                "<td><input type='checkbox' id='rule-sunday" + ruleObj.ID + "' value='Sunday' ";
            if(ruleObj.IsSunday == "T") uvRuleString += "checked";
            uvRuleString += "/></td>" +
                "<td><input type='checkbox' id='rule-monday" + ruleObj.ID + "' value='Monday' ";
            if(ruleObj.IsMonday == "T") uvRuleString += "checked";
            uvRuleString += "/></td>" +
                "<td><input type='checkbox' id='rule-tuesday" + ruleObj.ID + "' value='Tuesday' ";
            if(ruleObj.IsTuesday == "T") uvRuleString += "checked";
            uvRuleString += "/></td>" +
                "<td><input type='checkbox' id='rule-wednesday" + ruleObj.ID + "' value='Wednesday' ";
            if(ruleObj.IsWednesday == "T") uvRuleString += "checked";
            uvRuleString += "/></td>" +
                "<td><input type='checkbox' id='rule-thursday" + ruleObj.ID + "' value='Thursday' ";
            if(ruleObj.IsThursday == "T") uvRuleString += "checked";
            uvRuleString += "/></td>" +
                "<td><input type='checkbox' id='rule-friday" + ruleObj.ID + "' value='Friday' ";
            if(ruleObj.IsFriday == "T") uvRuleString += "checked";
            uvRuleString += "/></td>" +
                "<td><input type='checkbox' id='rule-saturday" + ruleObj.ID + "' value='Saturday' ";
            if(ruleObj.IsSaturday == "T") uvRuleString += "checked";
            uvRuleString += "/></td>" +
                "</tr>" +
                "</table>" +
                "<button class='buttonsmall-red icon-update' id='btn_updateRule' onclick='updateRule(" + ruleObj.ID + "," + trackPos + ")'>Update Rule</button>" +
                "<button class='buttonsmall-red icon-delete' id='btn_deleteRule' onclick='deleteRuleRefresh(" + ruleObj.ID + "," + trackPos + ")'>Delete Rule</button>";
            if(ruleObj.IsDeleted == "T") {
                uvRuleString += "<span>" + "Deleted by Client" + "</span>";
            }
            uvRuleString += "</div>";
        }
    }
//    uvRuleString += "<button class='buttonsmall-red icon-newrule' id='btn_showNewUVRule' onclick='showNewRule(" + trackObj.ID + "," + trackPos + "," + 2 + ")'>Show New Rule</button><br />";


    var contentString = "<div id='tabs'>" +
        "<ul>" +
        "<li><a href='#tabs-1'>Tracks</a></li>" +
        "<li><a href='#tabs-2'>Verified Rules</a></li>" +
        "<li><a href='#tabs-3'>Unverified Rules</a></li>" +
        "</ul>";
    contentString += "<div id='tabs-1'>" + trackString  + "</div>";
    contentString += "<div id='tabs-2'>" + ruleString  + "</div>";
    contentString += "<div id='tabs-3'>" + uvRuleString  + "</div></div>";

//    var contentString = trackString + ruleString;
    google.maps.event.addListener(trackRef, 'click', function(event) {
        newRuleCount = 1;
        if(infowindow != null) infowindow.close();
        infowindow = new google.maps.InfoWindow({
            content: contentString,
            position: event.latLng
        });
        infowindow.open(map);
        google.maps.event.addListener(infowindow, 'domready', function(event) {
            if(ruleCount == 0)
            {
                showNewRule(trackObj.ID,trackPos,1);
            }
            if(uvRuleCount == 0)
            {
                showNewRule(trackObj.ID,trackPos,2);
            }
            $( "#tabs" ).tabs();
        });

    });

    var rightContentString = "<div class='right-click-panel'>" +
        "<button class='buttonsmall-red icon-verify' id='btn_verify' onclick='verifyTrackRefresh(" + trackObj.ID + "," + trackPos + ")'>Verify Track</button>" +
        "<button class='buttonsmall-red icon-hide' id='btn_hide' onclick='hideTrackRefresh(" + trackObj.ID + "," + trackPos + ")'>Hide Track</button>" +
        "<button class='buttonsmall-red icon-horizontal' id='btn_alignHorizontal' onclick='polylineAlignHorizontal(" + trackPos + ")'>Align Horizontal</button>" +
        "<button class='buttonsmall-red icon-vertical' id='btn_alignVertical' onclick='polylineAlignVertical(" + trackPos + ")'>Align Vertical</button>" +
        "</div>";
    google.maps.event.addListener(trackRef, 'rightclick', function(event) {
//                newTrackPath = polyline;
//            newRuleCount = 1;
        if(infowindow != null) infowindow.close();
        infowindow = new google.maps.InfoWindow({
            content: rightContentString,
            position: event.latLng
        });
        infowindow.open(map);
    });

}
function onSignClick(signRef,signObj,signPos) {
    if(signObj.SignType == SignType.Parking ||
        signObj.SignType == SignType.WTF ||
        signObj.SignType == SignType.Temporary ||
        signObj.SignType == SignType.Handicap ||
        signObj.SignType == SignType.Artifact ||
        signObj.SignType == SignType.Meter ||
        signObj.SignType == SignType.NoParking) {
        google.maps.event.addListener(signRef, 'click', function(event) {
        var contentString = "<img src='";
        contentString += retrieveSignDir + signObj.picLocation;
        contentString += "' alt='Parking Sign' class='parking_sign' />";
        if(signwindow != null) signwindow.close();
        signwindow = new google.maps.InfoWindow({
            content: contentString,
            position: event.latLng
        });
        signwindow.open(map);
        google.maps.event.addListener(signwindow, 'domready', function(event) {

        });

    });
    }

    var rightContentString = "<div class='right-click-panel'>";

    rightContentString += "<select id='sign-type" + signPos + "' name='sign-type" + signPos + "'>" +
        "<option value='1' ";
    if(signObj.SignType == SignType.Parking) rightContentString += "selected='selected'";
    rightContentString += ">Parking</option>" +
        "<option value='2' ";
    if(signObj.SignType == SignType.WTF) rightContentString += "selected='selected'";
    rightContentString += ">WTF</option>" +
        "<option value='3' ";
    if(signObj.SignType == SignType.Temporary) rightContentString += "selected='selected'";
    rightContentString += ">Temporary</option>" +
        "<option value='4' ";
    if(signObj.SignType == SignType.Handicap) rightContentString += "selected='selected'";
    rightContentString += ">Handicap</option>" +
        "<option value='5' ";
    if(signObj.SignType == SignType.Meter) rightContentString += "selected='selected'";
    rightContentString += ">Meter</option>" +
        "<option value='6' ";
    if(signObj.SignType == SignType.Hydrant) rightContentString += "selected='selected'";
    rightContentString += ">Hydrant</option>" +
        "<option value='7' ";
    if(signObj.SignType == SignType.Artifact) rightContentString += "selected='selected'";
    rightContentString += ">Artifact</option>" +
        "<option value='8' ";
    if(signObj.SignType == SignType.NoParking) rightContentString += "selected='selected'";
    rightContentString += ">No Parking</option>" +
        "</select>";

    rightContentString += "<button class='buttonsmall-red icon-update' id='btn_updateSign' onclick='updateSign(" + signPos + "," + signObj.ID + ")'>Update Sign</button>" +
//        "<button class='buttonsmall-red icon-update' id='btn_updateSign' onclick='updateSign(" + signPos + "," + signObj.ID + ")'>Update Sign</button>" +
        "<button class='buttonsmall-red icon-delete' id='btn_deleteSign' onclick='deleteSignRefresh(" + signPos + "," + signObj.ID + "," + 0 + ")'>Delete Sign</button>" +
        "<button class='buttonsmall-red icon-delete' id='btn_deleteSign2' onclick='deleteSignRefresh(" + signPos + "," + signObj.ID + "," + 1 +  ")'>Delete Sign and Image</button>" +
//        "<button class='buttonsmall-red icon-vertical' id='btn_alignSign' onclick=''>Align to Track</button>" +
        "</div>";
    google.maps.event.addListener(signRef, 'rightclick', function(event) {
        if(signwindow != null) signwindow.close();
        signwindow = new google.maps.InfoWindow({
            content: rightContentString,
            position: event.latLng
        });
        signwindow.open(map);
    });

}
function showNewRule(trackID,trackPos,verified) {
    var ruleString =   "<div class='rule-cell'><div class='box_normal'>";

    ruleString += "<select id='rule-type-new" + newRuleCount + "' name='rule-type-new" + newRuleCount + "'>" +
        "<option value='1'>No Parking</option>" +
        "<option value='2'>No Stopping</option>" +
        "<option value='3'>1 Hour Parking</option>" +
        "<option value='4'>2 Hour Parking</option>" +
        "<option value='5'>3 Hour Parking</option>" +
        "<option value='6'>4 Hour Parking</option>" +
        "<option value='7'>5 Hour Parking</option>" +
        "<option value='8'>15 Minute Parking</option>" +
        "<option value='9'>30 Minute Parking</option>" +
        "<option value='10'>45 Minute Parking</option>" +
        "<option value='11'>No Parking Anytime</option>" +
        "<option value='12'>5 Minute Loading Only</option>" +
        "<option value='13'>20 Minute Parking</option>" +
        "<option value='14'>40 Minute Parking</option>" +
        "<option value='15'>8 Hour Parking</option>" +
        "<option value='16'>10 Hour Parking</option>" +
        "<option value='17'>9 Hour Parking</option>" +
        "</select>" + "</div>";

//    var StartTime = new TFDateTimeUTC(ruleObj.StartHour,ruleObj.StartMinute);
//    var EndTime = new TFDateTimeUTC(ruleObj.EndHour,ruleObj.EndMinute);

    ruleString += "<table class='table-ruletimes'>" +
        "<tr>" +
        "<td class='data-h1'>Rule Start</td>" +
        "<td>" +
        "<input type='text' id='rule-starthour-new" + newRuleCount + "' class='input-time' name='rule-starthour-new" + newRuleCount + "' value='" + "12" + "' />" +
        ":" +
        "<input type='text' id='rule-startminute-new" + newRuleCount + "' class='input-time' name='rule-startminute-new" + newRuleCount + "' value='" + "00" + "' />" +
        "<input type='radio' id='rule-startam-new" + newRuleCount + "' name='rule-startmeridian-new" + newRuleCount + "' value='AM' ";
//    if(StartTime.isAM == true) ruleString += "checked";
    ruleString += " />AM" +
        "<input type='radio' id='rule-startpm-new" + newRuleCount + "' name='rule-startmeridian-new" + newRuleCount + "' value='PM' checked";
//    if(StartTime.isAM == false) ruleString += "checked";
    ruleString += " />PM" +
        "</td>" +
        "</tr>" +
        "<tr>" +
        "<td class='data-h1'>Rule End</td>" +
        "<td>" +
        "<input type='text' id='rule-endhour-new" + newRuleCount + "' class='input-time' name='rule-endhour-new" + newRuleCount + "' value='" + "12" + "' />" +
        ":" +
        "<input type='text' id='rule-endminute-new" + newRuleCount + "' class='input-time' name='rule-endminute-new" + newRuleCount + "' value='" + "00" + "' />" +
        "<input type='radio' id='rule-endam-new" + newRuleCount + "' name='rule-endmeridian-new" + newRuleCount + "' value='AM' ";
//    if(EndTime.isAM == true) ruleString += "checked";
    ruleString += " />AM" +
        "<input type='radio' id='rule-endpm-new" + newRuleCount + "' name='rule-endmeridian-new" + newRuleCount + "' value='PM' checked";
//    if(EndTime.isAM == false) ruleString += "checked";
    ruleString += " />PM" +
        "</td>" +
        "</tr>" +
    "</table>";

    ruleString += "<table class='table-ruledays'>" +
        "<tr>" +
        "<td>S</td><td>M</td><td>T</td><td>W</td><td>Th</td><td>F</td><td>S</td>" +
        "</tr>" +
        "<tr>" +
        "<td><input type='checkbox' id='rule-sunday-new" + newRuleCount + "' value='Sunday' ";
//    if(ruleObj.IsSunday == "T") ruleString += "checked";
    ruleString += "/></td>" +
        "<td><input type='checkbox' id='rule-monday-new" + newRuleCount + "' value='Monday' ";
//    if(ruleObj.IsMonday == "T") ruleString += "checked";
    ruleString += "/></td>" +
        "<td><input type='checkbox' id='rule-tuesday-new" + newRuleCount + "' value='Tuesday' ";
//    if(ruleObj.IsTuesday == "T") ruleString += "checked";
    ruleString += "/></td>" +
        "<td><input type='checkbox' id='rule-wednesday-new" + newRuleCount + "' value='Wednesday' ";
//    if(ruleObj.IsWednesday == "T") ruleString += "checked";
    ruleString += "/></td>" +
        "<td><input type='checkbox' id='rule-thursday-new" + newRuleCount + "' value='Thursday' ";
//    if(ruleObj.IsThursday == "T") ruleString += "checked";
    ruleString += "/></td>" +
        "<td><input type='checkbox' id='rule-friday-new" + newRuleCount + "' value='Friday' ";
//    if(ruleObj.IsFriday == "T") ruleString += "checked";
    ruleString += "/></td>" +
        "<td><input type='checkbox' id='rule-saturday-new" + newRuleCount + "' value='Saturday' ";
//    if(ruleObj.IsSaturday == "T") ruleString += "checked";
    ruleString += "/></td>" +
        "</tr>" +
        "</table>";
//        "<div class='box_normal'>";
    ruleString += "<button class='buttonsmall-red icon-add' id='btn_addRule" + newRuleCount + "' onclick='addRule(" + newRuleCount + "," + trackPos + ")'>Add Rule</button>";
    ruleString += "<button class='buttonsmall-red icon-verify' id='btn_checkAll" + newRuleCount + "' onclick='checkAllDays(" + newRuleCount + ")'>All Day</button>";
    ruleString += "</div>";
//    ruleString += "</div>";

//    ruleString += "<button id='btn_showNewRule' onclick='showNewRule()'>Show New Rule</button>" ;
    if(verified == 1) {
        $(ruleString).insertBefore($("#btn_showNewVRule"));
    }
    if(verified == 2) {
        var noRulesFound = "<p>No unverified rules found.</p>"
        $(noRulesFound).insertBefore($("#btn_showNewUVRule"));
    }

    newRuleCount++;

}
function checkAllDays(newRuleCount) {
    $("#rule-sunday-new" + newRuleCount).prop('checked', true);
    $("#rule-monday-new" + newRuleCount).prop('checked', true);
    $("#rule-tuesday-new" + newRuleCount).prop('checked', true);
    $("#rule-wednesday-new" + newRuleCount).prop('checked', true);
    $("#rule-thursday-new" + newRuleCount).prop('checked', true);
    $("#rule-friday-new" + newRuleCount).prop('checked', true);
    $("#rule-saturday-new" + newRuleCount).prop('checked', true);
}

// HELPERS
function mainRefresh() {
    if(infowindow != null) infowindow.close();
    if(signwindow != null) signwindow.close();
    posX = map.getCenter().lat();
    posY = map.getCenter().lng();
    $("#map-panel").accordion( "destroy" ).empty();

    for(trackNum in tracks)
    {
        tracks[trackNum].TrackPolyline.setMap(null);
    }
    tracks = null;
    if($("#view_tracks").is(':checked')) {
        retrieveData();
    }
    for(signNum in signs)
        signs[signNum].setMap(null);
    signs = null;
    if($("#view_signs").is(':checked')) {
        retrieveSigns();
    }
}
function trackRefresh() {
    if(infowindow != null) infowindow.close();
    posX = map.getCenter().lat();
    posY = map.getCenter().lng();
    for(trackNum in tracks)
    {
        tracks[trackNum].TrackPolyline.setMap(null);
    }
    tracks = null;
    retrieveData();
}
function signRefresh() {
    if(signwindow != null) signwindow.close();
    posX = map.getCenter().lat();
    posY = map.getCenter().lng();
    for(signNum in signs)
        signs[signNum].setMap(null);
    signs = null;
    retrieveSigns();
}
function mainSearch() {
    var searchQuery = $("#searchBar").val();
    geocoder.geocode({ 'address':searchQuery}, function(results,status) {
        if(status == google.maps.GeocoderStatus.OK)
        {
            map.setCenter(results[0].geometry.location);
        }
        else
        {
            alert("Geocode was not successful for the following reason: " + status);
        }
    });
}
function polylineAlignHorizontal(trackPos) {
    var StartPosLat;
    var StartPosLong;
    var EndPosLat;
    var EndPosLong;
    if(trackPos == -1)
    {
        StartPosLat = newTrackPath.getPath().getAt(0).lat();
        StartPosLong = newTrackPath.getPath().getAt(0).lng();
        EndPosLat = newTrackPath.getPath().getAt(1).lat();
        EndPosLong = newTrackPath.getPath().getAt(1).lng();
    }
    else
    {
        StartPosLat = tracks[trackPos].TrackPolyline.getPath().getAt(0).lat();
        StartPosLong = tracks[trackPos].TrackPolyline.getPath().getAt(0).lng();
        EndPosLat = tracks[trackPos].TrackPolyline.getPath().getAt(1).lat();
        EndPosLong = tracks[trackPos].TrackPolyline.getPath().getAt(1).lng();
    }

    var flightPlanCoordinates = [
        new google.maps.LatLng(StartPosLat, StartPosLong),
        new google.maps.LatLng(StartPosLat, EndPosLong)
    ];

    if(trackPos == -1)
    {
        newTrackPath.setPath(flightPlanCoordinates);
//        map.setCenter(new google.maps.LatLng(newTrackPath.getPath().getAt(0).lat(),newTrackPath.getPath().getAt(0).lng()));
    }
    else
    {
        tracks[trackPos].TrackPolyline.setPath(flightPlanCoordinates);
//        map.setCenter(new google.maps.LatLng(tracks[trackPos].getPath().getAt(0).lat(),tracks[trackPos].getPath().getAt(0).lng()));
    }
    infowindow.close();
//    alert(tracks[trackPos].getPath().getAt(0));
}
function polylineAlignVertical(trackPos) {
    var StartPosLat;
    var StartPosLong;
    var EndPosLat;
    var EndPosLong;
    if(trackPos == -1)
    {
        StartPosLat = newTrackPath.getPath().getAt(0).lat();
        StartPosLong = newTrackPath.getPath().getAt(0).lng();
        EndPosLat = newTrackPath.getPath().getAt(1).lat();
        EndPosLong = newTrackPath.getPath().getAt(1).lng();
    }
    else
    {
        StartPosLat = tracks[trackPos].TrackPolyline.getPath().getAt(0).lat();
        StartPosLong = tracks[trackPos].TrackPolyline.getPath().getAt(0).lng();
        EndPosLat = tracks[trackPos].TrackPolyline.getPath().getAt(1).lat();
        EndPosLong = tracks[trackPos].TrackPolyline.getPath().getAt(1).lng();
    }

    var flightPlanCoordinates = [
        new google.maps.LatLng(StartPosLat, StartPosLong),
        new google.maps.LatLng(EndPosLat, StartPosLong)
    ];

    if(trackPos == -1)
    {
        newTrackPath.setPath(flightPlanCoordinates);
//        map.setCenter(new google.maps.LatLng(newTrackPath.getPath().getAt(0).lat(),newTrackPath.getPath().getAt(0).lng()));
    }
    else
    {
        tracks[trackPos].TrackPolyline.setPath(flightPlanCoordinates);
//        map.setCenter(new google.maps.LatLng(tracks[trackPos].getPath().getAt(0).lat(),tracks[trackPos].getPath().getAt(0).lng()));
    }
    infowindow.close();
}

function TFDateTimeUTC(Hour,Minute)  {
    this.Hour = parseInt(Hour);
    this.Minute = Minute;
    this.isAM = false;
    if(this.Hour >= 0 && this.Hour < 12)
    {
        this.isAM = true;
    }
    else
    {
        this.Hour -= 12;
        this.isAM = false;
    }
    if(this.Hour == 0) this.Hour = 12;
    if(parseInt(this.Minute) < 10) this.Minute = "0" + this.Minute;
}
function TFDateTimeBase24(Hour,Minute,isAM)  {
    this.Hour = parseInt(Hour);
    this.Minute = Minute;
    this.isAM = isAM;
    if(this.isAM == true)
    {
        if(this.Hour == 12) this.Hour = 0;
    }
    else
    {
        if(this.Hour < 12)
            this.Hour += 12;
    }
}
function MapTrack(TrackID,TrackPolyline) {
    this.TrackID = TrackID;
    this.TrackPolyline = TrackPolyline;

}
function getRuleDescription(RuleType) {

    switch(RuleType) {
        case ParkingRule.NoParking:
            return "No Parking";
        case ParkingRule.NoStopping:
            return "No Stopping";
        case ParkingRule.HourParking1:
            return "1 Hour Parking";
        case ParkingRule.HourParking2:
            return "2 Hour Parking";
        case ParkingRule.HourParking3:
            return "3 Hour Parking";
        case ParkingRule.HourParking4:
            return "4 Hour Parking";
        case ParkingRule.HourParking5:
            return "5 Hour Parking";
        case ParkingRule.MinuteParking15:
            return "15 Minute Parking";
        case ParkingRule.MinuteParking30:
            return "30 Minute Parking";
        case ParkingRule.MinuteParking45:
            return "45 Minute Parking";
        case ParkingRule.NoParkingAnytime:
            return "No Parking Anytime";
        case ParkingRule.LoadingOnly5:
            return "5 Minute Loading";
        case ParkingRule.MinuteParking20:
            return "20 Minute Parking";
        case ParkingRule.MinuteParking40:
            return "40 Minute Parking";
        case ParkingRule.HourParking8:
            return "8 Hour Parking";
        case ParkingRule.HourParking10:
            return "10 Hour Parking";
        case ParkingRule.HourParking9:
            return "9 Hour Parking";
        default:
            return "what";
    }
}
function getRuleTimes(RuleObj) {
    var textBuilder = "";
    var startTime = new TFDateTimeUTC(RuleObj.StartHour,RuleObj.StartMinute);
    var endTime = new TFDateTimeUTC(RuleObj.EndHour,RuleObj.EndMinute);

    textBuilder += startTime.Hour;
    if(parseInt(startTime.Minute) != 0) {
        textBuilder += "." + startTime.Minute;
    }
    if(startTime.isAM) {
        textBuilder += "A";
    }
    else {
        textBuilder += "P";
    }
    textBuilder += " to ";

    textBuilder += endTime.Hour;
    if(parseInt(endTime.Minute) != 0) {
        textBuilder += "." + endTime.Minute;
    }
    if(endTime.isAM) {
        textBuilder += "A";
    }
    else {
        textBuilder += "P";
    }
    return textBuilder;
}
function getRuleDays(RuleObj) {
    var textBuilder = "";
    if(RuleObj.IsSunday == "T") textBuilder += "Su ";
    if(RuleObj.IsMonday == "T") textBuilder += "M ";
    if(RuleObj.IsTuesday == "T") textBuilder += "T ";
    if(RuleObj.IsWednesday == "T") textBuilder += "W ";
    if(RuleObj.IsThursday == "T") textBuilder += "Th ";
    if(RuleObj.IsFriday == "T") textBuilder += "F ";
    if(RuleObj.IsSaturday == "T") textBuilder += "Sa ";
    return textBuilder;
}
function bindUpload(lat,lng) {
    //            'use strict';
    // Change this to the location of your server-side upload handler:
    var url = '../service/';
    var filename = '';
    $('#fileupload').fileupload({
        url: url,
        dataType: 'json',
        done: function (e, data) {
            $.each(data.result.files, function (index, file) {
                $('<p/>').text(file.name).appendTo('#files');
                filename = file.name;
                if(filename != null) addSign(filename,lat,lng);
            });
        },
        progressall: function (e, data) {
            var progress = parseInt(data.loaded / data.total * 100, 10);
            $('#progress .progress-bar').css(
                'width',
                progress + '%'
            );
        }
    }).prop('disabled', !$.support.fileInput)
        .parent().addClass($.support.fileInput ? undefined : 'disabled');
} // jQuery File Upload
function getUrlVars()
{
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}