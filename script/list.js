/*
 * title: 设备列表
 * author: wu xiaolong
 * date: 2015.05.25
 * */
var p = {
	type : null, //要显示设备的类型
	curpage : 1, //当前页码
	isRefresh : true, //区分刷新行为和翻页行为
	groupId : null, //接收的组id
	deviceMap : {}, //一个设备的 map
	key : '', //搜索别名
	init : true
};
apiready = function() {
	common(false);
	//接收参数
	p.type = api.pageParam.type;
	p.groupId = api.pageParam.groupId;
	p.key = api.pageParam.key;
	//如果是搜索，则不加载下拉刷新
	if (!p.key) {
		//refresh header
		setRefresh();
	}
	//获取设备列表
	getDevices();
};
//下拉加载
function setRefresh() {
	api.setRefreshHeaderInfo({
		visible : true,
		loadingImg : 'widget://image/refresh.png',
		bgColor : '#000',
		textColor : 'rgba(159,167,176, 1)',
		textDown : '下拉刷新...',
		textUp : '松开刷新...',
		showTime : true
	}, function(ret, err) {
		p.curpage = 1;
		p.isRefresh = true;
		p.init = true;
		getDevices();
	});
};
//获取设备列表
function getDevices() {
	var param = {
		curpage : p.curpage,
		pageSize : 20
	};
	//判断从分组点击过来
	if (p.groupId) {
		param.groupId = p.groupId;
		api.execScript({
			name : 'group',
			script : '$(".loading").css("opacity", 1);'
		});
	}
	//从大圆小圆点击过来
	if (p.type) {
		param.type = p.type;
		api.execScript({
			name : 'issue',
			script : '$(".loading").css("opacity", 1);'
		});
	}
	//如果是搜索
	if (p.key) {
		param.aliasName = p.key;
		api.execScript({
			name : 'search',
			script : '$(".loading").css("opacity", 1);'
		});
	}
	$.ajax({
		url : server + '/rest/assetmanager/devices',
		type : 'GET',
		dataType : 'json',
		headers : {
			'access_token' : token
		},
		data : param,
		success : function(data, status, xhr) {
			if (status === 'success' && data.length > 0) {
				$('.loading_more').hide();
				showList(data);
				bindEvent(data.length);
			} else if (data.length === 0) {
//				$('.no-data').show();
				$('.loading_more').hide();
			} else {
				api.toast({
					msg : '获取设备列表失败~',
					duration : 2000
				});
			}
		},
		error : function(xhr, errorType, error) {
			api.toast({
				msg : '无法获取设备列表~',
				duration : 2000
			});
		},
		complete : function(xhr, status) {
			//判断从分组点击过来
			if (p.groupId) {
				api.execScript({
					name : 'group',
					script : '$(".loading").css("opacity", 0);'
				});
			}
			//从大圆小圆点击过来
			if (p.type) {
				api.execScript({
					name : 'issue',
					script : '$(".loading").css("opacity", 0);'
				});
			}
			//如果是搜索
			if (p.key) {
				param.aliasName = p.key;
				api.execScript({
					name : 'search',
					script : '$(".loading").css("opacity", 0);'
				});
			}
			api.refreshHeaderLoadDone();
			$('.loader').hide();
		}
	});
};
//展示设备列表
function showList(deviceList) {
	var list = '';
	var w = api.winWidth - 80;
	for (n in deviceList) {
		var typeImg = '', //系统类型图标
		status = '', //设备状态
		CPU = '', RAM = '', DISK = '';
		//图标
		typeImg = '&#xe' + serverData[deviceList[n].typeImg] + ';';
		//设备状态
		if (deviceList[n].status === 0) {
			status = 'normal';
		} else if (deviceList[n].status === 2) {
			status = 'error';
		} else if (deviceList[n].status > 10) {
			status = 'warning';
		} else if (deviceList[n].status === 3) {
			status = 'unconfig';
		} else if (deviceList[n].status === -1) {
			status = 'unmonitor';
		} else if (deviceList[n].status === 4) {
			status = 'identify';
			//识别中
		}
		//度量数据
		CPU = deviceList[n].cpu ? deviceList[n].cpu + '%' : 'N/A';
		RAM = deviceList[n].memery ? deviceList[n].memery + '%' : 'N/A';
		DISK = deviceList[n].disk ? deviceList[n].disk + '%' : 'N/A';
		list += '<li tapmode="active" class="' + status + ' animated fadeIn" data-id="' + deviceList[n].id + '">';
		list += '<div class="avatar"><i class="servericon">' + typeImg + '</i></div>';
		list += '<div class="detail" style="width:' + w + 'px">';
		list += '<h3><span class="name">' + deviceList[n].name + '</span></h3>';
		list += '<div class="state">';
		list += '<em>CPU</em><span>' + CPU + '</span>';
		list += '<em>RAM</em><span>' + RAM + '</span>';
		list += '<em>DISK</em><span>' + DISK + '</span>';
		list += '</div>';
		list += '</div>';
		//list += '<i class="arrow iconfont"></i>';
		list += '</li>';
		p.deviceMap[deviceList[n].id] = deviceList[n];
	};
	//判断是刷新行为还是翻页行为
	p.isRefresh ? $('.list').html(list) : $('.list').append(list);
	api.parseTapmode();
	list = null;
};
//bind event
function bindEvent(len) {
	//如果小于20条数据，则没有加载更多
	if (len < 20) {
		api.removeEventListener({
			name: 'scrolltobottom'
		});
	} else {
		//初始化时绑定一次事件
		if (p.init) {
			//load more
			api.addEventListener({
				name : 'scrolltobottom'
			}, function(ret, err) {
				if(len === 0){
					api.removeEventListener({
						name: 'scrolltobottom'
					});
				}else{
					$('.loading_more').show();
					p.isRefresh = false;
					p.curpage++;
					getDevices();
				}
			});
			p.init = false;
		}
	}
	//打开设备界面
	$('.list li').on('click', function() {
		var id = $(this).attr('data-id');
		api.openWin({
			name : 'device',
			url : './device.html',
			pageParam : p.deviceMap[id]
		});
	});
};