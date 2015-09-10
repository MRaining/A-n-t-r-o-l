/*
 * title: 配置服务地址
 * author: wu xiaolong
 * date: 2015.05.23
 * */

apiready = function() {
	common(true);
	//切换tab
	tab();
	//绑定事件
	bindEvent();
};
// 切换tab
function tab() {
	var navigationBar = api.require('navigationBar');
	navigationBar.open({
		x : 0,
		y : api.winHeight - 50,
		w : api.winWidth,
		h : 50,
		items : [{
			title : '扫描二维码',
			bg : '#fff',
			bgSelected : '#f9f9f9'
		}, {
			title : '手动输入',
			bg : '#fff',
			bgSelected : '#f9f9f9'
		}],
		selectedIndex : 0,
		font : {
			size : 14,
			sizeSelected : 14,
			color : 'rgba(45,55,71,1)',
			colorSelected : 'rgba(249,168,37, 1)',
			bg : '#fff'
		}
	}, function(ret, err) {
		$('.configTab').eq(ret.index).addClass('active').siblings('.configTab').removeClass('active');
	});
};
//绑定事件
function bindEvent() {
	//扫描按钮
	$('.scan').on('tap', function() {
		api.openWin({
			name : 'scanner',
			url : './scanner.html',
			reload : true
		});
	});
	//退出
	api.addEventListener({
		name : 'keyback'
	}, function(ret, err) {
		api.closeWidget();
	});
	//配置按钮
	$('.configTab button').on('tap', function() {
		//验证非空
		var val = $('.configTab input').val();
		if (val.length < 10) {
			api.toast({
				msg : '服务地址输入错误~'
			});
		} else if (val.toLowerCase().indexOf('http://') === 0 || val.toLowerCase().indexOf('https://') === 0) {
			config(val);
		} else {
			api.toast({
				msg : '请输入url协议',
				duration : 2000
			});
		}
	});
};
//配置
function config(server) {
	showProgress();
	//向服务器发一个 ajax请求，如果返回状态为 success，说明可以联通
	$.ajax({
		type : 'POST',
		url : server,
		success : function(data, status, xhr) {
			if (status === 'success') {
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
					msg : 'status:' + status
				});
			}
		},
		error : function(xhr, errorType, error) {
			api.hideProgress();
			api.toast({
				msg : '无法连接到服务器！' + server,
				duration : 4000
			});
		}
	});
};
/*
 * 配置新方法
 * imageCache 不支持https协议
 * */
function config(server) {
	showProgress();
	var url = server + '/images/antopporter/asset-adddevice-line.png';
	//加载图片，判断是否能联通
	var img = new Image();
	img.src = url;
	img.onload = function() {
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
	}
	//判断图片是否缓存完
	setTimeout(function() {
		if (!img.completed) {
			api.hideProgress();
			api.toast({
				msg : '无法连接到服务器！' + server,
				duration : 4000
			});
		}
	}, 5000);
};