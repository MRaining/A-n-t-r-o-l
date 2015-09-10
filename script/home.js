/*
 * title: 首页
 * author: wu xiaolong
 * date: 2015.05.24
 * */
apiready = function() {
	common(true);
	$('.loading').css('opacity', 1);
	bindEvent();
	//每次启动的时候检查是否有告警，如果有，则推送到通知栏
	//checkNotice();
	//socket 接收服务端消息
	socket();
};
// 搜索和设置
function bindEvent() {
	//打开frame
	var h = $('header').height();
	api.openFrame({
		name : 'main',
		url : './main.html',
		rect : {
			x : 0,
			y : h,
			w : 'auto',
			h : api.winHeight - h
		},
		vScrollBarEnabled : false,
		reload : true
	});
	// more btn
	$('#moreBtn').on('tap', function() {
		api.openFrame({
			name : 'more-menu',
			url : 'moremenu.html',
			rect : {
				x : 0,
				y : 0,
				w : 'auto',
				h : 'auto'
			}
		});
	});
	//keymenu
	api.addEventListener({
		name : 'keymenu'
	}, function(ret, err) {
		$('#moreBtn').trigger('tap');
	});
	//关闭登录界面
	api.closeWin({
		name : 'login'
	});
	//消息
	$('#noticeBtn').on('tap', function() {
		$(this).removeClass('new-notice');
		api.openWin({
			name : 'notice',
			url : './notice.html'
		});
	});
	//关闭应用
	var backSecond = 0;
	api.addEventListener({
		name : 'keyback'
	}, function(ret, err) {
		var curSecond = (new Date).getSeconds();
		if (Math.abs(curSecond - backSecond) > 2) {
			backSecond = curSecond;
			api.toast({
				msg : '再按一次退出应用',
				duration : 2000,
				location : 'bottom'
			});
		} else {
			api.closeWidget({
				silent : true,
				type : 'push'
			});
		};
	});
	//noticeclicked
	api.addEventListener({
		name : 'noticeclicked'
	}, function(ret, err) {
		//1 = 开发者自定义的推送, 比如第三方推送的消息
		//0 = notification的信息，还有socket推送的消息，和从apicloud平台推送的消息
		if(ret.type == 0){
			//notification的信息，还有socket推送的消息，和从apicloud平台推送的消息
			$('#noticeBtn').trigger('tap');
		}else if(ret.type == 1){
			//开发者自定义的推送, 比如第三方推送的消息
			console.log(1);
		}
	});
};
//检查是否有告警
function checkNotice() {
	$.ajax({
		type : 'get',
		url : server + '/rest/alarms/getNoticeCount',
		dataType : 'json',
		data : {
			account : name
		},
		headers : {
			'access_token' : token
		},
		success : function(data, status, xhr) {
			if (status === 'success') {
				notification(data);
			} else {
				api.toast({
					msg : '检查新消息失败~',
					duration : 2000
				});
			}
		},
		error : function(xhr, errorType, error) {
			api.toast({
				msg : '检查新消息出错~',
				duration : 2000
			});
		},
		complete : function(xhr, status) {

		}
	});
};
function socket() {
	//过滤 掉url协议和端口
	var host = '';
	if(server.indexOf('https://') === 0){
		var index = server.indexOf('https://'),
			port = server.lastIndexOf(':');
		if(port === 5){
			host = server.substring(8);
		}else{
			host = server.substring(8, port);
		}
	}else if(server.indexOf('http://' === 0)){
		var index = server.indexOf('http://'),
			port = server.lastIndexOf(':');
		if(port === 4){
			host = server.substring(7);
		}else{
			host = server.substring(7, port);
		}
	}
	var socket = api.require('socketManager');
	socket.createSocket({
		host : host,
		port : 9092
	}, function(ret, err) {
		if (ret) {
			var state = ret.state;
			var sid = ret.sid;
			var data = ret.data;
			var stateStr = "";
			if (101 === state) {
				stateStr = "创建成功";
			} else if (102 === state) {
				stateStr = "连接成功";
			} else if (103 === state) {
				stateStr = "收到消息";
				notification(data);
			} else if (201 === state) {
				stateStr = "创建失败";
			} else if (202 === state) {
				stateStr = "连接失败";
			} else if (203 === state) {
				stateStr = "异常断开";
			} else if (204 === state) {
				stateStr = "正常断开";
			} else if (205 === state) {
				stateStr = "发生未知错误";
			}
			//console.log(stateStr);
		}
	});
};
/*
 * 新消息通知
 * data: string
 * */
function notification(data) {
	var notice = eval('(' + data + ')');
	$('#noticeBtn').addClass('new-notice');
	api.notification({
		vibrate : [500, 500], //震动
		sound : 'default',
		light : true,
		notify : {
			title : '蚁巡',
			content : notice.content,
			extra : notice.deviceResourceId,
			updateCurrent : false
		}
	}, function(ret, err) {
	});
};