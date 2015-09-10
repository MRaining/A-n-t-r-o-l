/*
 * title: 设置列表
 * author: wu xiaolong
 * date: 2015.06.12
 * */
var updateInfo = null;
apiready = function() {
	common(false);
	//bindEvent
	bindEvent();
	//显示当前版本
	$('.app-version').text('v' + api.appVersion);
	//显示已连接的服务器
	$('#server .val').text(server);
	loadData();
	checkUpdate();
};
//bind event
function bindEvent() {
	//switch btn
	$('.switch').on('tap', function() {
		$(this).toggleClass('on');
	});
	//signout
	$('.signout').on('tap', function() {
		api.confirm({
			title : '提示',
			msg : '确定退出？',
			buttons : ['取消', '确定']
		}, function(ret, err) {
			if (ret.buttonIndex === 2) {
				showProgress();
				$.ajax({
					url : server + '/rest/auth/login/out?access_token=' + token,
					type : 'GET',
					dataType : 'json',
					headers : {
						'm' : true
					},
					success : function(data, status, xhr) {
						if (status === 'success') {
							localStorage.removeItem('token');
							localStorage.removeItem('name');
							localStorage.removeItem('pwd');
							api.openWin({
								name : 'login',
								url : '../login.html',
								reload : true,
								slidBackEnabled : false,
								pageParam : {}
							});
						} else {
							api.toast({
								msg : '退出失败~',
								duration : 2000
							});
						}
					},
					error : function(xhr, errorType, error) {
						api.toast({
							msg : '退出时遇到错误~',
							duration : 2000
						});
					},
					complete : function(xhr, status) {
						api.hideProgress();
					}
				});
			}
		});
	});
	//和服务器断开连接
	$('#server').on('tap', function() {
		api.confirm({
			title : '提醒',
			msg : '确定要和服务器断开连接？',
			buttons : ['取消', '确定']
		}, function(ret, err) {
			if (ret.buttonIndex === 2) {
				showProgress();
				$.ajax({
					url : server + '/rest/auth/login/out?access_token=' + token,
					type : 'GET',
					dataType : 'json',
					headers : {
						'm' : true
					},
					success : function(data, status, xhr) {
						if (status === 'success') {
							//清空保存的server信息
							localStorage.clear();
							api.openWin({
								name : 'config',
								url : './config.html',
								reload : true,
								slidBackEnabled : false,
								pageParam : {}
							});
						} else {
							api.toast({
								msg : '退出失败~',
								duration : 2000
							});
						}
					},
					error : function(xhr, errorType, error) {
						api.toast({
							msg : '退出时遇到错误~',
							duration : 2000
						});
					},
					complete : function(xhr, status) {
						api.hideProgress();
					}
				});
			}
		});
	});
	//扫一扫
	$('#scan-btn').on('tap', function() {
		api.openWin({
			name : 'scanner',
			url : './scanner.html',
			pageParam : {
				type : 'scan'
			}
		});
	});
	//关于
	$('#about').on('tap', function() {
		$(this).find('.badge').hide();
		api.openWin({
			name : 'about',
			url : './about.html'
		});
	});
	//帮助与反馈
	$('#feedback').on('tap', function() {
		//美洽
		var mc = api.require('meChat');
		//初始化
		mc.initMeChat({
			appkey : '559df5204eae358f15000005'
		});
		//分配客服
		mc.initMeChat({
			groupId : '',
			agentId : '22955'
		}, function(ret, err) {
			//coding...
		});
		//添加规范化用户信息
		mc.addUserInfo({
			appUserName : localStorage.getItem('name'),
			comment : localStorage.getItem('roleName'),
			email : localStorage.getItem('email')
		}, function(ret, err) {
			//coding...
		});
		//展示
		mc.show();
	});
};
//加载个人资料
function loadData() {
	$.ajax({
		url : server + '/rest/user/getLoginUser?account=' + name,
		type : 'GET',
		dataType : 'json',
		headers : {
			'access_token' : token
		},
		success : function(data, status, xhr) {
			if (status === 'success' && data) {
				showUser(data);
			} else {
				api.toast({
					msg : '加载个人资料失败~',
					duration : 2000
				});
			}
		},
		error : function(xhr, errorType, error) {
			api.toast({
				msg : '无法加载个人资料~',
				duration : 2000
			});
		},
		complete : function(xhr, status) {
			api.execScript({
		        name: 'setting',
		        script: '$(".loading").css("opacity", 0);'
	        });
		}
	});
};
//展示个人信息
function showUser(data) {
	$('#user-name').text(data.account + '(' + data.roleName + ')');
	var email = data.email ? data.email : '未填写';
	$('#email').text(email);
	localStorage.setItem('roleName', data.roleName);
	localStorage.setItem('email', email);
};
//检查更新
function checkUpdate() {
	var mam = api.require('mam');
	mam.checkUpdate(function(ret, err) {
		if (ret && ret.status) {
			var result = ret.result;
			if (result.update) {
				$('#about').find('.badge').show();
			} else {
				$('#about').find('.badge').hide();
			}
		} else {
			api.toast({
				msg : '检查更新失败~',
				duration : 2000
			});
		}
	});
};