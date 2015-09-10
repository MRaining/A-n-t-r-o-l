/*
 * title: 扫描二维码
 * author: wu xiaolong
 * date: 2015.05.23
 * */

var scanner = null, type = null;
apiready = function() {
	common(true);
	type = api.pageParam.type;
	//扫描
	setTimeout(function() {
		scan();
	}, 300);
	//闪光灯
	flash();
	if(type === 'scan'){
		$('p').hide();
	};
};
//扫描
function scan() {
	var header = $('.header');
	var w = api.winWidth;
	scanner = api.require('scanner');
	scanner.openView({
		x : w * 0.1,
		y : w * 0.3,
		w : api.winWidth * 0.8,
		h : api.winWidth * 0.8,
		sound : api.wgtRootDir + '/res/beep.caf'
	}, function(ret, err) {
		if (ret) {
			//判断是配置服务器还是扫描服务器二维码查看信息
			type == 'scan' ? openInfo(ret.msg) : config(ret.msg);
		} else {
			api.hideProgress();
			api.toast({
				msg : '糟糕，扫描失败~'
			});
		}
	});
};
//闪光灯开关
function lightSwitch(flag) {
	scanner.lightSwitch({
		turnOn : flag
	});
};
//闪光灯
function flash() {
	$('.icon-flash').on('tap', function() {
		var flag = $(this).hasClass('on');
		lightSwitch(!flag);
		if (flag) {
			$(this).removeClass('on').find('i').html('&#xe61b;');
		} else {
			$(this).addClass('on').find('i').html('&#xe61a;');
		}
	});
};
//配置
function config(server) {
	showProgress();
	var url = server + '/images/antopporter/asset-adddevice-line.png';
	api.imageCache({
		url : url
	}, function(ret, err) {
		if (ret && ret.status) {
			//保存 服务器地址到 localStorage
			localStorage.setItem('server', server);
			setTimeout(function() {
				api.hideProgress();
				api.openWin({
					name : 'root',
					url : '../login.html',
					pageParam : {
						config : 'success' // 传递参数
					},
					reload : true
				});
			}, 300);
		} else {
			api.hideProgress();
			api.toast({
				msg : '无法连接到服务器！' + server,
				duration : 4000
			});
		}
	});
};
//扫描服务器二维码查看服务器基本信息
function openInfo(deviceId) {
	//	scanner.closeView();
	api.openWin({
		name : 'info',
		url : './info.html',
		pageParam : {
			id : deviceId
		},
		slidBackEnabled : false
	});
};