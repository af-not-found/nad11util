app.routerInfo = {
	antennaLevel : "",
	battery : "N/A",
	charging : false,
	comSetting : 0,
	comState : 0,
	profile : 0,
	connDuration : 0
};
app.sessionId = "";
app.sessionIdInfoBtn = "";
app.getStatusCount = -1;
app.callbackRemain = 0;
app.timer = undefined;
app.notification = undefined;
app.prevStatus = "";
app.lastw2time = -1;
app.keep2 = true;
app.prevBatt = -1;

app.updateSettings = function() {
	chrome.storage.sync.get(app.settings, function(settings) {
		app.settings = settings;
	});
}

app.init = function() {

	app.updateSettings();

	chrome.storage.sync.get({
		keep2 : true
	}, function(items) {
		app.keep2 = items.keep2;
		$("#cb_keep2").prop("checked", app.keep2);
		$("#cb_keep2").change(function() {
			app.keep2 = $(this).prop("checked");
			chrome.storage.sync.set({
				keep2 : app.keep2
			});
		});
	});

	$("#settings_toggle").click(function() {
		chrome.app.window.create('settings.html', {
			id : "nad11util_settings",
			width : 340,
			height : 220,
			minWidth : 340,
			minHeight : 220,
			resizable : true,
			frame : "chrome"
		}, function(createdWindow) {
			createdWindow.setAlwaysOnTop(true);
			createdWindow.onClosed.addListener(function() {
				app.updateSettings();
				app.reload();
			});
		});
	});

	$("#cb_hs").click(app.toggleMode);

	$("#reload").click(app.reload);

	$("#reconn").click(app.reconnWimax);

	$("#standby").click(app.standby);

	chrome.app.window.current().onClosed.addListener(function() {
		app.stopTimer();
		chrome.app.window.get("nad11util_settings").close();
	});
}

app.startTimer = function(delay) {
	clearTimeout(app.timer);
	if (delay === undefined) {
		delay = parseInt(app.settings.interval) * 1000;
		delay = Math.max(delay, 5000);
	}
	app.timer = setTimeout(app.getStatus, delay)
}

app.stopTimer = function() {
	clearTimeout(app.timer);
	app.callbackRemain = 100;
}

app.toggleMode = function() {
	app.stopTimer();
	app.lastw2time = -1;
	$(this).prop("disabled", true);
	$("#loading").show();

	var f = function() {
		var selval = app.routerInfo.comSetting == 1 ? "2" : "1";

		$.ajax({
			url : "http://aterm.me/index.cgi/index_contents_local_set",
			type : "POST",
			username : "admin",
			password : app.settings.password,
			data : {
				"DISABLED_CHECKBOX" : "",
				"CHECK_ACTION_MODE" : "1",
				"COM_MODE_SEL" : selval,
				"BTN_CLICK" : "wan2",
				"SESSION_ID" : app.sessionId
			}
		}).done(function(data, textStatus) {
			app.getStatusCount = -1;
			app.startTimer(4000); // ディレイを入れないと変更前の値が取れてしまう
		}).fail(function(jqXHR, textStatus, errorThrown) {
			$("#error").text("setting failed, " + errorThrown);
		});
	}

	app.updateIndexInfo(f);
}

app.reload = function() {
	app.getStatusCount = -1;
	app.startTimer(1);
}

app.reconnWimax = function() {
	app.stopTimer();
	app.lastw2time = -1;
	$(this).prop("disabled", true);
	$("#loading").show();

	var f = function() {
		$.ajax({
			url : "http://aterm.me/index.cgi/index_contents_local_set",
			type : "POST",
			username : "admin",
			password : app.settings.password,
			data : {
				"DISABLED_CHECKBOX" : "",
				"CHECK_ACTION_MODE" : "1",
				"SELECT_PROFILE" : app.routerInfo.profile,
				"BTN_CLICK" : "profile",
				"SESSION_ID" : app.sessionId
			}
		}).done(function(data, textStatus) {
			app.getStatusCount = -1;
			app.startTimer(4000);
		}).fail(function(jqXHR, textStatus, errorThrown) {
			$("#error").text("setting failed, " + errorThrown);
		});
	}

	app.updateIndexInfo(f);
}

app.updateIndexInfo = function(successCallback, completeCallback) {

	$.ajax({
		url : "http://aterm.me/index.cgi/index_contents",
		dataType : "html",
		username : "admin",
		password : app.settings.password,
		complete : completeCallback
	}).done(function(data, textStatus) {
		var r = app.routerInfo;
		try {
			var html = $($.parseHTML(data));
			r.comSetting = html.find("select#COM_MODE_SEL option[selected=selected]")[0].value;
			r.profile = html.find("select#SELECT_PROFILE option[selected=selected]")[0].value;
			app.sessionId = html.find("#SESSION_ID")[0].value;

			html.find("li.label").each(function() {
				var e = $(this);
				if (e.text().indexOf("接続時間") != -1) {
					var txt = e.next("li.value").text(); // 12:34:56
					r.connDuration = parseInt(txt);
				}
			});

			if (successCallback) {
				successCallback();
			}
		} catch (e) {
			r.comSetting = 0;
			r.profile = 0;
			$("#error").text("index_contents parsing failed, " + e);
		}
	}).fail(function(jqXHR, textStatus, errorThrown) {
		var r = app.routerInfo;
		r.comSetting = 0;
		r.profile = 0;
		$("#error").text("index_contents failed, " + errorThrown);
	});
}

app.standby = function() {
	app.stopTimer();
	app.lastw2time = -1;
	$(this).prop("disabled", true);
	$("#loading").show();

	var f = function() {
		$.ajax({
			url : "http://aterm.me/index.cgi/info_btn_btstandby",
			type : "POST",
			username : "admin",
			password : app.settings.password,
			data : {
				"PERMIT_MODEL" : "enable",
				"DISABLED_CHECKBOX" : "",
				"CHECK_ACTION_MODE" : "1",
				"SESSION_ID" : app.sessionIdInfoBtn
			}
		}).done(function(data, textStatus) {
			$("#error").text("standby failed, " + textStatus);
		}).fail(function(jqXHR, textStatus, errorThrown) {
			$("#error").text("standby succeeded, " + errorThrown);
		});
	}

	app.updateInfoBtnInfo(f);
}

app.updateInfoBtnInfo = function(successCallback, completeCallback) {

	$.ajax({
		url : "http://aterm.me/index.cgi/info_btn",
		dataType : "html",
		username : "admin",
		password : app.settings.password,
		complete : completeCallback
	}).done(function(data, textStatus) {
		try {
			var html = $($.parseHTML(data));
			app.sessionIdInfoBtn = html.find("#SESSION_ID")[0].value;
			if (successCallback) {
				successCallback();
			}
		} catch (e) {
			$("#error").text("info_btn parsing failed, " + e);
		}
	}).fail(function(jqXHR, textStatus, errorThrown) {
		$("#error").text("info_btn failed, " + errorThrown);
	});
}

app.getStatus = function() {

	var onlyxml = false;
	if (++app.getStatusCount % 80 != 0) {
		onlyxml = true;
	}
	app.callbackRemain = onlyxml ? 1 : 2;
	$("#error").text("");
	$("#loading").show();

	$.ajax({
		url : "http://aterm.me/index.cgi/status_get.xml",
		dataType : "xml",
		complete : app.callback
	}).done(function(data, textStatus) {
		var r = app.routerInfo;
		var status = $(data).find("status").text();
		var datas = status.split("_");
		for (var i = 0; i < datas.length; i++) {
			var data = datas[i];

			switch (i) {
			case 0:
				r.battery = parseInt(data);
				break;
			case 1:
				r.antennaLevel = parseInt(data);
				break;
			case 2:
				r.comState = parseInt(data);
				break;
			case 4:
				r.charging = data != "1";
				break;
			default:
				break;
			}
		}
	}).fail(function(jqXHR, textStatus, errorThrown) {
		var r = app.routerInfo;
		r.battery = "N/A";
		r.antennaLevel = 0;
		r.comState = 0;
		$("#error").text("status_get.xml failed, " + errorThrown);
	});

	if (onlyxml == false) {
		app.updateIndexInfo(undefined, app.callback);
	}
};

app.callback = function() {
	if (--app.callbackRemain >= 1) {
		return;
	}
	$("#loading").hide();

	var comStateStrs = [ "N/A", "WiMAX 2+", "WiMAX 1", "Wi-Fi spot" ];
	var comStateTitleStrs = [ "N/A", "W2+", "W1", "SP" ];
	var antMaxs = [ 0, 4, 5, 5 ];
	// var comSettingStrs = [ "N/A", "HS", "NL" ];

	var r = app.routerInfo;
	status = comStateStrs[r.comState] + ", batt=" + r.battery + (r.charging ? "+" : "%") + ", ant=" + r.antennaLevel + "/"
			+ antMaxs[r.comState];
	statusTitle = comStateTitleStrs[r.comState] + " " + r.battery + (r.charging ? "+" : "%") + " " + r.antennaLevel + "/"
			+ antMaxs[r.comState];

	$("#ajax1").text(status);
	$("#main_title").text(statusTitle + " - NAD11 utility");

	if (r.comSetting == 0) {
		$("#cb_hs").prop("disabled", true);
	} else {
		$("#cb_hs").prop("disabled", false).prop("checked", r.comSetting == 1 ? true : false);
	}
	$("#reconn").prop("disabled", false);

	if (app.prevBatt != -1) {
		var message = null;
		if (r.battery > parseInt(app.settings.batt_notif_over) && r.battery > app.prevBatt) {
			message = "battery level over " + app.settings.batt_notif_over + "%";
		} else if (r.battery < parseInt(app.settings.batt_notif_under) && r.battery < app.prevBatt) {
			message = "battery level under " + app.settings.batt_notif_under + "%";
		}
		if (message != null) {
			chrome.notifications.create("appnif_batt", {
				type : "basic",
				title : "NAD11 utility",
				iconUrl : 'assets/icon.png',
				message : message
			}, function() {
			});
		}
	}
	app.prevBatt = r.battery;

	if (app.settings.cb_notif && app.prevStatus != status) {
		app.prevStatus = status;
		chrome.notifications.create("appnif", {
			type : "basic",
			title : "NAD11 utility",
			iconUrl : 'assets/icon.png',
			message : status
		}, function() {
			setTimeout(function() {
				chrome.notifications.clear("appnif", function() {
				})
			}, 2000);
		});
	}

	var next = true;
	var now = new Date().getTime();
	if (r.comState == 2 && r.comSetting == 1) {
		if (app.keep2 && now - app.lastw2time <= 50000) {
			next = false;
			chrome.notifications.create("appnif_keep", {
				type : "basic",
				title : "NAD11 utility",
				iconUrl : 'assets/icon.png',
				message : t("main.upgrading")
			}, function() {
			});
			app.reconnWimax();
		}
	}

	if (r.comState == 1 && app.settings.reconn_interval) {
		var rival = parseInt(app.settings.reconn_interval);
		if (rival <= app.routerInfo.connDuration) {
			next = false;
			chrome.notifications.create("appnif_keep", {
				type : "basic",
				title : "NAD11 utility",
				iconUrl : 'assets/icon.png',
				message : t("main.reconn_every")
			}, function() {
			});
			app.reconnWimax();
		}
	}

	if (r.comState == 1) {
		app.lastw2time = now;
	} else if (r.comState == 2) { // WiMAX1に落ちる時にWi-Fiが切れるので、N/Aで-1に戻すのはNG
		app.lastw2time = -1;
	}

	if (next) {
		app.startTimer();
	}
}

$(document).ready(function() {
	app.init();
	app.startTimer();
});
