/*
 * title： 登录
 * author: wu xiaolong
 * date: 2015.05.22
 */
var token = '', name = '', pwd = '', server = '';
//判断是否为初次登录，如果初次登录，则跳转到配置界面
apiready = function() {
	server = localStorage.getItem('server');
	token = localStorage.getItem('token');
	if (server === null) {
		//未配置过，跳到配置界面
		api.openWin({
			name : 'config',
			url : './html/config.html',
			slidBackEnabled : false,
			reload : true
		});
	} else if (token) {
		//token 已存在，将进行自动登录
		name = localStorage.getItem('name');
		pwd = localStorage.getItem('pwd');
		bindEvent();
		login();
	} else {
		/*
		* 剩下的这种情况就是：
		* 服务器地址已存在，说明从配置界面跳转过来，刚配置成功，
		* 并且用户名和密码不存在于 localStorage
		* */
		//配置成功后返回到登录界面，验证是否配置成功
		var p = api.pageParam;
		if (p.config === 'success') {
			api.toast({
				msg : '配置成功！'
			});
			//关闭配置界面
			api.closeWin({
				name : 'config'
			});
			//关闭 scanner
			api.closeWin({
				name : 'scanner'
			});
		}
		bindEvent();
	}
};
//bind event
function bindEvent() {
	//显示已连接的服务器
	$('#server').val(server);
	// 键盘弹出的时候，隐藏底部信息
	$('input').focus(function() {
		$('footer').hide();
	}).blur(function() {
		$('footer').show();
	});
	//quit
	api.addEventListener({
		name : 'keyback'
	}, function(ret, err) {
		api.closeWidget();
	});
	//验证登录
	$('form button').on('tap', function() {
		name = $('#name').val(), pwd = $('#pwd').val();
		//验证非空
		if (!name) {
			api.toast({
				msg : '你还没有输入用户名！'
			});
		} else if (!pwd) {
			api.toast({
				msg : '你还没有输入密码！'
			});
		} else {
			login();
		}
	});
	//键盘弹出时，隐藏垂直滚动条
	api.setWinAttr({
		vScrollBarEnabled : false
	});
	//重新配置
	$('#server').on('tap', function() {
		api.confirm({
			title : '提醒',
			msg : '确定要更改服务器地址？',
			buttons : ['取消', '确定']
		}, function(ret, err) {
			if (ret.buttonIndex === 2) {
				api.openWin({
					name : 'config',
					url : './html/config.html',
					slidBackEnabled : false,
					reload : true
				});
			}
		});
	});
};

//登录
function login() {
	//md5加密密码
	var password = md5(pwd);
	//进行登录操作
	api.showProgress({
    	title: '登录中',
    	modal: false
	});
	$.ajax({
		type : 'GET',
		url : server + '/rest/auth/login',
		dataType : 'JSON',
		data : {
			userName : name,
			password : password
		},
		headers: {
			m: true
		},
		success : function(data, status, xhr) {
			api.hideProgress();
			//判断是否登录成功
			if (status === 'success' && data !== 'fail') {
				setLogin(data);
			} else {
				api.toast({
					msg : '用户名或密码错误~'
				});
			}
		},
		error : function(xhr, errorType, error) {
			api.hideProgress();
			api.toast({
				msg : '糟糕，登录失败~'
			});
		}
	});
};
//设置登录
function setLogin(data) {
	//将 token存到 localStorage 里
	localStorage.setItem('token', data);
	//设置自动登录，把用户名储存起来
	localStorage.setItem('name', name);
	localStorage.setItem('pwd', pwd);
	api.openWin({
		name : 'home',
		url : './html/home.html',
		vScrollBarEnabled : false,
		slidBackEnabled : false,
		reload : true
	});
};
