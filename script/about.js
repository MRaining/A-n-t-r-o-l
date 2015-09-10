/*
 * title: 关于
 * author: wu xiaolong
 * date: 2015.07.07
 * */
apiready = function() {
	//获取当前版本
	$('#version').text('v' + api.appVersion);
	checkUpdate();
};
//检查升级
function checkUpdate() {
	if(api.systemType == 'ios'){return;}
	var mam = api.require('mam');
	mam.checkUpdate(function(ret, err) {
		if (ret && ret.status) {
			var result = ret.result;
			if (result.update) {
				showUpdate(result);
			} else {
				api.toast({
					msg : '已是最新版本！',
					duration : 2000
				});
			}
		} else {
			api.toast({
				msg : '检查更新失败~',
				duration : 2000
			});
		}
	});
};
//升级提醒
function showUpdate(result) {
	api.openFrame({
		name : 'panel',
		url : './panel.html',
		rect : {
			x : 0,
			y : 0,
			w : api.winWidth,
			h : api.winHeight
		},
		pageParam: result
	});
};