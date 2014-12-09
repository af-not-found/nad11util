chrome.app.runtime.onLaunched.addListener(function() {
	chrome.app.window.create('index.html', {
		id : "nad11util",
		width : 250,
		height : 120,
		minWidth : 250,
		minHeight : 120,
		resizable : true,
		frame : "chrome"
	});
});
