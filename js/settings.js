app.init = function() {

	$("#cancel").click(function() {
		chrome.app.window.current().close();
	});

	$("#save").click(function() {
		app.settings.password = $("#password").val();
		app.settings.interval = $("#interval").val();
		app.settings.cb_notif = $("#cb_notif").prop("checked");
		app.settings.batt_notif_over = $("#batt_notif_over").val();
		app.settings.batt_notif_under = $("#batt_notif_under").val();

		chrome.storage.sync.set(app.settings);

		chrome.app.window.current().close();
	});

	chrome.storage.sync.get(app.settings, function(settings) {
		app.settings = settings;

		$("#password").val(app.settings.password);
		$("#interval").val(app.settings.interval);
		$("#cb_notif").prop("checked", app.settings.cb_notif);
		$("#batt_notif_over").val(app.settings.batt_notif_over);
		$("#batt_notif_under").val(app.settings.batt_notif_under);
	});
}

$(document).ready(function() {
	app.init();
});