/*
* title: 性能图
* author: wu xiaolong
* date: 2015.05.27
* */
//定义两个开关，防止滑动死循环
var NavigationCallBackEnable = false,
	FrameGroupCallBackEnable = false,
	h = null,
	deviceId = null,
	selectedIndex = null,
	serId = null,
	serName = null,
	title = null;
apiready = function() {
	$('.loading').css('opacity', 1);
	common(true);
	deviceId = api.pageParam.id;
	selectedIndex = api.pageParam.index ? api.pageParam.index : 0;
	serId = api.pageParam.serverId;
	serName = api.pageParam.serName;
	//如果serName
	title = serName ? serName : api.pageParam.name;
	$('.title').prepend(title);
	h = $('header').height();
	loadData();
	filter();
};
//加载数据
function loadData(){
	var resId = serId ? serId : deviceId;
	//加载导航视图
	$.ajax({
		type : 'GET',
		dataType : 'json',
		url : server + '/rest/detail/findView/'+resId,
		data: {
			acount: name
		},
		headers:{
			'access_token': token
		},
		success : function(data, status, xhr) {
			if (status === 'success' && data) {
				generate(data);
			} else {
				api.toast({
					msg : '获取度量导航失败~',
					duration : 2000
				});
			};
		},
		error : function(xhr, errorType, error) {
			api.toast({
				msg : '无法获取度量导航~',
				duration : 2000
			});
		},
		complete : function(xhr, status) {
			
		}
	});
};
//整合导航和视图数据
function generate(data){
	var nav = [], frame = [];
	data.sort(function(a, b){
		return a.sequencing > b.sequencing ? 1 : -1;
	});
	for(var i=0;i < data.length;i++){
		if(data[i].descr === '连续运行时间'){
			continue;
		}
		nav[i] = {
			title: data[i].descr,
			bg : 'rgba(217,223,229,1)',
			bgSelected : 'rgba(217,223,229,1)'
		}
		frame[i] = {
			name : 'chart'+i,
			url : './chart.html',
			pageParam : {
				selectedIndex : i,
				performance: data[i].measurementGroups
			},
			vScrollBarEnabled : true
		}
	}
	navigation(nav);
	frameGroup(frame);
	nav = [], frame = [];
};
//加载导航
function navigation(nav) {
	navigationBar = api.require('navigationBar');
	navigationBar.open({
		x : 0,
		y : h,
		w : api.winWidth,
		h : 50,
		items : nav,
		selectedIndex : selectedIndex,
		font : {
			size : 16,
			sizeSelected : 16,
			color : 'rgba(47,62,76,0.6)',
			colorSelected : 'rgba(250,184,78,1)'
		},
		bg : 'rgba(217,223,229,1)'
	}, function(ret, err) {
		if (ret) {
			if (NavigationCallBackEnable) {
				FrameGroupCallBackEnable = false;
				// 当点击NavigationBar的item时，阻止 FrameGroup 回调
				api.setFrameGroupIndex({
					name : 'chartGroup',
					index : ret.index,
					scroll : false
				});
			}
		}
		NavigationCallBackEnable = true;
		// 加载完后 允许 点击 NavigationBar的item时，进行FrameGroup的切换
		return;
	});
};
//openFrameGroup
function frameGroup(frame) {
	api.openFrameGroup({
		name : 'chartGroup',
		scrollEnabled : true,
		rect : {
			x : 0,
			y : h + 50,
			w : 'auto',
			h : api.winHeight - h - 50
		},
		index : selectedIndex,
		preload : 0, //不设置预加载
		frames : frame
	}, function(ret, err) {
		if (ret) {
			var name = ret.name, index = ret.index;
			if (FrameGroupCallBackEnable) {
				NavigationCallBackEnable = false;
				// 当FrameGroup滑动切换时，阻止 NavigationBar回调
				navigationBar.config({
					key : "selectedIndex",
					value : index
				});
			}
			FrameGroupCallBackEnable = true;
			// 加载完后 允许 FrameGroup滑动切换时，进行NavigationBar中item的选中状态切换
		}
	});
};
//filter
function filter() {
	$('.icon-filter').on('tap', function() {
		api.actionSheet({
			title : '按时间查看',
			cancelTitle : '取消',
			buttons : ['一小时', '一天', '一周','一月'],
			style : {
				itemNormalColor:'rgba(232,238,243,1)',
				itemPressColor:'rgba(217,223,229,1)',
				fontNormalColor:'rgba(41,171,226,1)',
				fontPressColor:'rgba(41,171,226,0.8)'
			}
		}, function(ret, err) {
			var t = null;
			switch(ret.buttonIndex){
				case 1:
					t = 2;
					break;
				case 2:
					t = 3;
					break;
				case 3:
					t = 4;
					break;
				case 4:
					t = 5
					break;
				default:
					return;
			};
			api.sendEvent({
				name: 'filter',
				extra: {
					timeType: t
				}
			});
		});
	});
};