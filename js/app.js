var app = {};

app.settings = {
	password : "",
	interval : 8,
	cb_notif : true,
	batt_notif_over : "80",
	batt_notif_under : "20",
	reconn_interval : ""
};

$(document).ready(function() {

	x18n.register('ja', {
		main : {
			cb_hs : "HSモード",
			cb_keep2 : "WiMAX 2+ 自動復帰",
			reconn : "WiMAX再接続",
			standby : "ルータースタンバイ",
			upgrading : "WiMAX 2+ 自動復帰中 ...",
			reconn_every : "WiMAX 2+ 自動再接続中 ...",
			standby_succeed : "スタンバイ成功",
			standby_failed : "スタンバイ失敗",
			auth_failed : "パスワードエラー",
			retrieving_failed : "情報取得失敗",
			setting_failed : "設定失敗",
			batt_notif_over : "バッテリーレベルが次の値を超えました",
			batt_notif_under : "バッテリーレベルが次の値を下回りました"
		},
		settings : {
			password : "Web管理画面パスワード",
			interval : "ステータスチェック間隔",
			cb_notif : "ステータス変更時に通知する",
			batt_notif_over : "バッテリーレベルが次の値を超えたら通知",
			batt_notif_under : "バッテリーレベルが次の値を下回ったら通知",
			reconn_interval : "次の時間毎にWiMAX 2+の再接続を実行",
			sec : "秒",
			hour : "時間",
			save : "保存",
			cancel : "キャンセル"
		}
	});

	x18n.register('en', {
		main : {
			cb_hs : "HS mode",
			cb_keep2 : "Keep WiMAX 2+",
			reconn : "Re-connect WiMAX",
			standby : "Standby router",
			upgrading : "Upgrading to WiMAX 2+ ...",
			reconn_every : "Auto Re-connecting ...",
			standby_succeed : "Standby succeed",
			standby_failed : "Standby failed",
			auth_failed : "invalid password",
			retrieving_failed : "retrieving failed",
			setting_failed : "setting failed",
			batt_notif_over : "battery level over",
			batt_notif_under : "battery level under"
		},
		settings : {
			password : "web admin password",
			interval : "status check interval",
			cb_notif : "notify when status changed",
			batt_notif_over : "notify when battery level over",
			batt_notif_under : "notify when battery level under",
			reconn_interval : "Re-connect WiMAX 2+ every",
			sec : "sec",
			hour : "hour",
			save : "save",
			cancel : "cancel"
		}
	});

	x18n.setDefault('en');
	var lang = x18n.detectLocal().substr(0, 2);
	x18n.set(lang);
	// x18n.set("en");
});