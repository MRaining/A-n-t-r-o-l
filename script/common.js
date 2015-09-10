/*
 * title: common js
 * author: wu xiaolong
 * date: 2015.05.25
 * */
var server = null,
	token = null,
	name = null;
function common(isWin) {
	//从 localStorage中读取 服务器地址
	server = localStorage.getItem('server');
	token = localStorage.getItem('token');
	name = localStorage.getItem('name');
	//判断是window还是frame，如果是window则执行
	if(isWin){
		//适配iOS7+系统状态栏，为传入的DOM元素增加20px的上内边距
		var strDM = api.systemType;
		if (strDM == 'ios') {
			var strSV = api.systemVersion;
			var numSV = parseInt(strSV, 10);
			if (numSV >= 7) {
				var header = $('header').css('padding-top', '20px');
			}
		};
		//设置系统状态栏
		api.setStatusBarStyle({
			style : 'light', // ios7+ 文字颜色
			color : 'rgba(45,55,71,1)' //android 5.0 背景色
		});
		//back btn
		back();
		//监测网络断开
		api.addEventListener({
			name : 'offline'
		}, function(ret, err) {
			api.toast({
				msg : '网络连接断开~',
				duration: 2000
			});
		});
	}
};
//检查网络
function checkNet() {
	var conType = api.connectionType;
	if(conType === 'none'){
		$('.no-data').show();
		api.toast({
			msg : '未连接到网络~',
			duration: 5000
		});
		api.hideProgress();
		api.refreshHeaderLoadDone();
		return true;
	}else{
		$('.no-data').hide();
	}
};
//back btn
function back() {
	$('.icon-back').on('tap', function(){
		api.closeWin();
	});
};
//show progress
function showProgress(){
	api.showProgress({
		modal: false,
		animationType: 'zoom'
	});
};