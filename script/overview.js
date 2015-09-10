/*
 * title: 设备概览
 * author: wu xiaolong
 * date: 2015.05.27
 * */

var device = null, deviceId = null, deviceType = null, status = null, p = {
	a1 : false, //判断多个ajax请求是否完成
	a2 : false,
	a3 : false,
	alarm : null //设备告警信息
};
apiready = function() {
	common(false);
	device = api.pageParam;
	deviceId = device.id;
	deviceType = device.typeImg;
	//如果是未配置的设备，就不再加载数据
	if (device.status === 3) {
		showStatus({
			status : 3
		});
		$('.main-title').hide();
		$('.no-data').show();
		api.execScript({
	        name: 'device',
	        script: '$(".loading").css("opacity", 0);'
        });
	} else {
		//加载数据
		loadData();
	}
	//设置下拉刷新
	refresh();
};
//设置下拉刷新
function refresh() {
	api.setRefreshHeaderInfo({
		visible : true,
		loadingImg : 'widget://image/refresh.png',
		bgColor : '#000',
		textColor : 'rgba(159,167,176, 1)',
		textDown : '下拉刷新...',
		textUp : '松开刷新...',
		textLoading : '加载中...',
		showTime : true
	}, function(ret, err) {
		loadData();
	});
};
//加载数据
function loadData() {
	//获取设备的综合状态
	$.ajax({
		type : 'GET',
		dataType : 'json',
		url : server + '/rest/detail/findDeviceStatusById/' + deviceId,
		headers : {
			'access_token' : token
		},
		success : function(data, status, xhr) {
			if (status === 'success' && data) {
				showStatus(data);
			} else {
				api.toast({
					msg : '获取设备状态失败~',
					duration : 2000
				});
			};
		},
		error : function(xhr, errorType, error) {
			api.toast({
				msg : '无法获取设备状态~',
				duration : 2000
			});
		},
		complete : function(xhr, status) {
			p.a1 = true;
			ajaxComplete();
		}
	});
	//单独展示网络设备和蚁巡设备
	if (deviceType == 'Switch' || deviceType == 'Router' || deviceType == 'Camera' || deviceType == 'Antpatrol') {
		//如果是网络设备，则单独展示
		showSpecial();
		$('.main-title').hide();
		$('.no-data').show();
		return;
	};
	//加载度量数据总量
	$.ajax({
		type : 'GET',
		dataType : 'json',
		url : server + '/rest/assetmanager/getCpropertysheet',
		data : {
			resourceId : deviceId
		},
		headers : {
			'access_token' : token
		},
		success : function(data, status, xhr) {
			if (status === 'success' && data) {
				showMetric(data);
			} else {
				api.toast({
					msg : '获取度量数据总量失败~',
					duration : 2000
				});
			};
		},
		error : function(xhr, errorType, error) {
			api.toast({
				msg : '无法获取度量数据总量~',
				duration : 2000
			});
		},
		complete : function(xhr, status) {
			p.a2 = true;
			ajaxComplete();
		}
	});
	//加载服务
	$.ajax({
		type : 'GET',
		dataType : 'json',
		url : server + '/rest/detail/findServers',
		data : {
			resourceId : deviceId
		},
		headers : {
			'access_token' : token
		},
		success : function(data, status, xhr) {
			if (status === 'success' && data) {
				showServer(data);
			} else {
				api.toast({
					msg : '获取服务失败~',
					duration : 2000
				});
			};
		},
		error : function(xhr, errorType, error) {
			api.toast({
				msg : '无法获取服务~',
				duration : 2000
			});
		},
		complete : function(xhr, status) {
			p.a3 = true;
			ajaxComplete();
		}
	});
};
//判断多个ajax是否完成
function ajaxComplete() {
	if (p.a1 && p.a2 && p.a3) {
		api.execScript({
	        name: 'device',
	        script: '$(".loading").css("opacity", 0);'
        });
		api.refreshHeaderLoadDone();
		p.a1 = true;
		p.a2 = true;
		p.a3 = true;
	} else if (deviceType == 'Switch' || deviceType == 'Router' || deviceType == 'Camera' || deviceType == 'Antpatrol') {
		if (p.a1) {
			api.execScript({
		        name: 'device',
		        script: '$(".loading").css("opacity", 0);'
	        });
			api.refreshHeaderLoadDone();
			p.a1 = true;
		}
	}
};
//展示设备状态
function showStatus(data) {
	var alarm = {
		time : '',
		title : null,
		content : null,
		status : 'normal', //用来展示设备告警样式
		ip : 'N/A',
		val : ''
	};
	//判断设备状态
	if (data.status === 0) {
		//正常
		alarm.status = 'normal';
		alarm.title = '设备运行正常';
	} else if (data.status === 1 || data.status > 10) {
		//告警
		alarm.status = 'warning';
		alarm.title = data.highAlarmName + '告警';
		alarm.val = '(当前利用率' + data.highAlarmVal + data.highAlarmUnit;
		alarm.val += '，阀值区间' + data.minMeasThreshold + data.highAlarmUnit + '-' + data.maxMeasThreshold + data.highAlarmUnit + ')';
	} else if (data.status === 2) {
		//故障
		alarm.status = 'error';
		data.highAlarmName = data.highAlarmName ? data.highAlarmName : '该设备';
		alarm.title = '无法访问' + data.highAlarmName;
		alarm.val = '('+data.highAlarmName+'很可能发生了故障)';
	} else if (data.status === 3) {
		//未配置
		alarm.status = 'unconfig';
		alarm.title = '该设备未配置';
	}
	alarm.ip = device.ips ? device.ips[0] : 'N/A';
	$('.jumbotron').addClass(alarm.status);
	$('.jumbotron h1 span').text(alarm.title);
	$('#ip').html('IP:' + alarm.ip);
	var d = new Date();
	$('#alarm-time').text(d.getHours()+':'+d.getMinutes()+':'+d.getSeconds());
	$('.jumbotron p').html(alarm.val);
	alarm = null;
};
//展示度量数据
function showMetric(data) {
	//如果暂无度量数据，则终止程序
	if (data.length === 0) {
		return;
	};
	var tmp = '', cpu = '', ram = '', disk = '';
	for (var i=0;i<data.length;i++) {
		var prop = null, em = 'N/A';
		prop = data[i].propValue;
		//如果是 cpu
		switch (data[i].fComment) {
			case 'CPU':
				prop = data[i].propValue + 'Core';
				if(data[i].propValue == 1){
					prop = '单核';
				}else if(data[i].propValue == 2){
					prop = '双核';
				}else{
					prop = data[i].propValue+'核';
				}
				em = device.cpu ? device.cpu + '%' : 'N/A';
				cpu = '<li tapmode="active" class="no-speed animated flipInX" style="-webkit-animation-delay: '+(i*0.5)+'s;animation-delay: '+(i*0.5)+'s;"><div><span>' + data[i].fComment + ' [' + prop + ']</span><em>' + em + '</em></div></li>';
				break;
			case '内存':
				em = device.memery ? device.memery + '%' : 'N/A';
				ram = '<li tapmode="active" class="no-speed animated flipInX" style="-webkit-animation-delay: '+(i*0.5)+'s;animation-delay: '+(i*0.5)+'s;"><div><span>' + data[i].fComment + ' [' + prop + ']</span><em>' + em + '</em></div></li>';
				break;
			case '硬盘':
				em = device.disk ? device.disk + '%' : 'N/A';
				disk = '<li tapmode="active" class="no-speed animated flipInX" style="-webkit-animation-delay: '+(i*0.5)+'s;animation-delay: '+(i*0.5)+'s;"><div><span>' + data[i].fComment + ' [' + prop + ']</span><em>' + em + '</em></div></li>';
				break;
		};
	};
	tmp = cpu + ram + disk;
	//网络
	var netIn = 'N/A', netOut = 'N/A';
	if (device.inUnit) {
		netIn = device.networkTrafficInTotal + device.inUnit + '/min';
	}
	if (device.outUnit) {
		netOut = device.networkTrafficOutTotal + device.outUnit + '/min';
	}
	tmp += '<li tapmode="active" class="speed  animated flipInX" style="-webkit-animation-delay: '+(1.25)+'s;animation-delay: '+(1.5)+'s;"><div>';
	tmp += '<span><i class="iconfont">&#xe621;</i><em>' + netIn + '</em></span>';
	tmp += '<span><i class="iconfont">&#xe620;</i><em>' + netOut + '</em></span>';
	tmp += '</div></li>';
	$('.metric').html(tmp);
	tmp = '';
	api.parseTapmode();
	//如果度量数据为空，则无法打开性能视图
	$('.metric li').on('tap', function() {
		if ($(this).find('em').text() === 'N/A') {
			api.toast({
				msg : '暂无度量数据~',
				duration : 2000
			});
			return;
		};
		openMetric($(this).index(), null, null);
	});
};
//展示服务
function showServer(data) {
	if (data.length === 0) {
		api.toast({
			msg : '获取服务出现异常~'
		});
		return;
	};
	var tmp = '';
	for (i in data) {
		var serverIcon = '', status = 'normal';
		//图标
		serverIcon = '&#xe'+serverData[data[i].img]+';';
		//服务状态
		if (data[i].status === 0) {
			status = 'normal';
		} else if (data[i].status === 2) {
			status = 'error';
		} else if (data[i].status > 10) {
			status = 'warning';
		} else if (data[i].status === 3) {
			status = 'unconfig';
		} else if (data[i].status === -1) {
			status = 'unmonitor';
		} else if (data[i].status === 4) {
			status = 'identify';
			//识别中
		}
		tmp += '<li tapmode="active" data-id="' + data[i].id + '" class="' + status + ' animated slideInUp" style="-webkit-animation-delay: '+(i*0.25)+'s;animation-delay: '+(i*0.25)+'s;"><i class="servericon icon pull-left">' + serverIcon + '</i><i class="iconfont arrow-right"></i><span>' + data[i].name + '</span></li>';
	}
	$('.main-title').show();
	$('.listview').html(tmp);
	tmp = '';
	api.parseTapmode();
	$('.listview li').on('tap', function() {
		//判断如果是故障的服务则不展示性能视图
		if ($(this).hasClass('error')) {
			api.toast({
				msg : '该服务无法访问~',
				duration : 2000
			});
			return;
		} else if ($(this).hasClass('unconfig')) {
			api.toast({
				msg : '该服务暂未配置~',
				duration : 2000
			});
			return;
		} else if ($(this).hasClass('unmonitor')) {
			api.toast({
				msg : '该服务未监测~',
				duration : 2000
			});
			return;
		} else if ($(this).hasClass('identify')) {
			api.toast({
				msg : '该服务正在识别中~',
				duration : 2000
			});
			return;
		}
		openMetric(null, $(this).attr('data-id'), $(this).find('span').text());
	});
};
/*
 * 打开度量数据视图
 * @i: 要打开的度量元索引
 * @serId: 如果打开的是服务，则传递该值，否则为null
 * @serName: 如果打开的服务，则传递该值，否则为null
 * */
function openMetric(i, serId, serName) {
	api.openWin({
		name : 'metric',
		url : './metric.html',
		pageParam : {
			id : device.id, //设备id
			name : device.name, //设备名称
			index : i,
			serverId : serId,
			serName : serName
		}
	});
};
//单独展示网络设备和蚁巡设备的度量数据
function showSpecial() {
	var tmp = '',
		cpu = device.cpu ? device.cpu+'%' : 'N/A',
		memery = device.memery ? device.memery+'%' : 'N/A';
	tmp += '<li tapmode="active" class="no-speed"><div><span>CPU</span><em>' + cpu + '</em></div></li>';
	tmp += '<li tapmode="active" class="no-speed"><div><span>内存</span><em>' + memery + '</em></div></li>';
	//蚁巡设备再展示硬盘和网络
	if (deviceType === 'Antpatrol') {
		var netIn = '', netOut = '', disk = '';
		disk = device.disk ? device.disk+'%' : 'N/A';
		tmp += '<li tapmode="active" class="no-speed"><div><span>硬盘</span><em>' + disk + '</em></div></li>';
		//网络
		netIn = device.inUnit ? device.networkTrafficInTotal + device.inUnit + '/min' : 'N/A';
		netOut = device.outUnit ? device.networkTrafficOutTotal + device.outUnit + '/min' : 'N/A';
		tmp += '<li tapmode="active" class="speed"><div>';
		tmp += '<span><i class="iconfont">&#xe621;</i><em>' + netIn + '</em></span>';
		tmp += '<span><i class="iconfont">&#xe620;</i><em>' + netOut + '</em></span>';
		tmp += '</div></li>';
	};
	$('.metric').html(tmp);
	tmp = '';
	api.parseTapmode();
	$('.metric li').on('tap', function() {
		if ($(this).find('em').text() === 'N/A') {
			api.toast({
				msg : '暂无度量数据~',
				duration : 2000
			});
			return;
		};
		openMetric($(this).index(), null, null);
	});
};