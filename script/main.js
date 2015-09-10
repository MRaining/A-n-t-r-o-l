/*
 * title: 首页主体部分
 * author: wu xiaolong
 * date: 2015.05.24
 * */
var w = null, h = null;
var p = {
	a1 : false, //多个ajax请求的完成状态
	a2 : false,
	a3 : false,
	group : null, //组信息
	attention : null //关注组
};
apiready = function() {
	common(false);
	w = api.winWidth;
	h = api.winHeight;
	refresh();
	bindEvent();
	loadData();
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
//bindEvent
function bindEvent() {
	var type = '', //点击的类型
	page = '';
	//要跳转的界面
	$('.circle').on('tap', function() {
		type = $(this).attr('data-type');
		//如果设备正常，则进入分组界面
		if (type === 'normal') {
			page = 'group';
		} else {
			page = 'issue';
		}
		api.openWin({
			name : page,
			url : './' + page + '.html',
			pageParam : {
				type : type
			}
		});
	});
	$('.total').on('tap', function() {
		api.openWin({
			name : 'group',
			url : './group.html',
			pageParam : {
				index : 0 //默认打开第一个分组
			}
		});
	});
};
//加载数据
function loadData() {
	if (checkNet()) {
		return;
	}
	//加载统计
	$.ajax({
		type : 'GET',
		url : server + '/rest/statistic/overview',
		dataType : 'json', //记得 json 一定要小写
		headers : {
			'access_token' : token
		},
		success : function(data, status, xhr) {
			if (status === 'success' && data !== null) {
				showStat(data);
			} else {
				api.toast({
					msg : '加载统计数据失败~',
					duration : 2000
				});
			}
		},
		error : function(xhr, errorType, error) {
			//判断token是否过期，过期后认证将失败，重新登录
			if (error === 'Unauthorized') {
				localStorage.removeItem('token');
				api.toast({
					msg : '登录身份已过期~',
					duration : 1000
				});
				setTimeout(function() {
					api.openWin({
						name : 'login',
						url : '../login.html',
						reload : true,
						slidBackEnabled : false,
						pageParam : {}
					});
				}, 2000);
				return;
			} else if (errorType === 'abort') {
				api.toast({
					msg : '无法加载统计数据~',
					duration : 2000
				});
			}
		},
		complete : function(xhr, status) {
			p.a1 = true;
			ajaxComplete();
		}
	});
	//加载分组
	$.ajax({
		type : 'GET',
		url : server + '/rest/assetmonitor/resources',
		dataType : 'json',
		headers : {
			'access_token' : token
		},
		success : function(data, status, xhr) {
			if (status === 'success' && data) {
				p.group = data;
			} else {
				api.toast({
					msg : '加载分组数据失败~'
				});
			}
		},
		error : function(xhr, errorType, error) {
			api.toast({
				msg : '无法加载分组数据~'
			});
		},
		complete : function(xhr, status) {
			p.a2 = true;
			ajaxComplete();
		}
	});
	//加载关注组的id
	$.ajax({
		type : 'GET',
		url : server + '/rest/assetmonitor/getAttenGroupId',
		dataType : 'json',
		data : {
			account : localStorage.getItem('name')
		},
		headers : {
			'access_token' : token
		},
		success : function(data, status, xhr) {
			if (status === 'success' && data) {
				p.attention = data;
			} else {
				api.toast({
					msg : '加载关注组失败~'
				});
			}
		},
		error : function(xhr, errorType, error) {
			api.toast({
				msg : '无法加载关注组~'
			});
		},
		complete : function(xhr, status) {
			p.a3 = true;
			ajaxComplete();
		}
	});
};
//判断多个ajax请求是否完成
function ajaxComplete() {
	if (p.a1 && p.a2 && p.a3) {
		if ($.isArray(p.group) && p.group.length > 0) {
			//按照sequencing从小到大排序
			p.group.sort(function(a, b) {
				return a.sequencing > b.sequencing ? 1 : -1;
			});
			//把组信息存起来
			api.writeFile({
				path : api.cacheDir + '/group.json',
				data : JSON.stringify(p.group),
				append : false
			}, function(ret, err) {
				if (!ret.status) {
					api.toast({
						msg : '分组数据写入缓存失败~'
					});
				}
			});
			//把关注组id缓存起来
			api.writeFile({
				path : api.cacheDir + '/attention.json',
				data : JSON.stringify(p.attention),
				append : false
			}, function(ret, err) {
				if (!ret.status) {
					api.toast({
						msg : '缓存关注组id失败'
					});
				}
			});
			//展示组
			showGroup();
		} else {
			api.toast({
				msg : '暂无分组数据~'
			});
		};
		api.execScript({
	        name: 'home',
	        script: '$(".loading").css("opacity", 0);'
        });
		api.refreshHeaderLoadDone();
		//重置参数
		p.a1 = false;
		p.a2 = false;
		p.a3 = false;
	}
};
//展示统计
function showStat(data) {
	var error = data['故障设备数'], warning = data['告警设备数'], total = data['总设备数'], noMonitor = data['未监测设备数'], noConfig = data['未配置设备数'];
	//既有告警又有故障
	if (error > 0 && warning > 0) {
		$('.stat .error em').text(error);
		$('.stat .warning em').text(warning);
		$('.stat .normal').removeClass('big animated flipInY');
		$('.stat .error').addClass('big animated flipInY');
		$('.stat .warning').addClass('small animated flipInY');
	} else if (error === 0 && warning > 0) {
		//只有告警
		$('.stat .warning em').text(warning);
		$('.stat .normal').removeClass('big animated flipInY');
		$('.stat .error').removeClass('big small animated flipInY');
		$('.stat .warning').addClass('big animated flipInY');
	} else if (warning === 0 && error > 0) {
		//只有故障
		$('.stat .error em').text(error);
		$('.stat .normal').removeClass('big animated flipInY');
		$('.stat .error').addClass('big animated flipInY');
		$('.stat .warning').removeClass('small big');
	} else {
		//都正常
		$('.stat .normal em').text(total);
		$('.stat .normal').addClass('big animated flipInY');
		$('.stat .error').removeClass('big samll animated flipInY');
		$('.stat .warning').removeClass('small big animated flipInY');
	}
	$('.total').show().find('em').text(total);
	//设置大圆小圆的大小
	circle();
};
//设置圆大小
function circle() {
	$('.stat .big').css({
		width : w * 0.45,
		height : w * 0.45
	});
	$('.stat .small').css({
		width : w * 0.3,
		height : w * 0.3
	});
};
//展示分组
function showGroup() {
	var group = '', resources = null, //组内的设备
	attIcon = '', attGroup = '';
	//关注图标
	//关注的组变成一个map
	/**
	 *  {
	 * 		1001:1,
	 * 		1002:1
	 * }
	 * 前面是组id，后面是用来判断的值
	 */
	var attMap = {};
	p.attention.forEach(function(groupId) {
		attMap[groupId] = 1;
	});
	//遍历数组
	for (i in p.group) {
		/*
		* 判断是否关注过
		* 方式一：
		* */
		//		for(n in p.attention){
		//			if(p.group[i].groupId == p.attention[n]){
		//				attIcon='<i class="iconfont">&#xe601;</i>';
		//			}else{
		//				attIcon = '';
		//			}
		//			break;
		//		};
		/*
		 * 方式二：
		 * */
		attIcon = attMap[p.group[i].groupId] ? '<i class="iconfont">&#xe601;</i>' : '';

		// 统计每个组内问题设备的个数
		resources = p.group[i].resources;
		var error = 0, //每个组内故障设备的个数
		warning = 0, //每个组内告警设备的个数
		issue = '', //问题设备
		status = 'normal';
		//分组的状态
		for (m in resources) {
			//判断故障设备
			if (resources[m].status === 2) {
				error++;
			} else if (resources[m].status > 10) {
				warning++;
			}
		};
		if (error > 0) {
			issue = error + warning + '/';
			status = 'error';
		} else if (warning > 0) {
			issue = warning + '/';
			status = 'warning';
		}
		//填充数据
		if (attIcon === '') {
			attGroup += '<li tapmode="active" data-id="' + p.group[i].groupId + '" data-index="' + i + '" class="' + status + '">';
			attGroup += '<div><i class="iconfont"></i><em>' + issue + resources.length + '</em></div>';
			attGroup += '<span>' + attIcon + p.group[i].name + '</span>';
			attGroup += '</li>';
		} else {
			group += '<li tapmode="active" data-id="' + p.group[i].groupId + '" data-index="' + i + '" class="' + status + '">';
			group += '<div><i class="iconfont"></i><em>' + issue + resources.length + '</em></div>';
			group += '<span>' + attIcon + p.group[i].name + '</span>';
			group += '</li>';
		}
	};
	$('.group ul').html(group + attGroup).addClass('animated fadeIn');
	api.parseTapmode();
	//用完后清空数据，释放内存
	p.group = null;
	p.attention = null;
	group = '';
	resources = null;
	attIcon = '';
	//绑定点击事件
	$('.group ul li').on('click', function() {
		api.openWin({
			name : 'group',
			url : './group.html',
			pageParam : {
				index : $(this).attr('data-index')
			}
		});
	});
};