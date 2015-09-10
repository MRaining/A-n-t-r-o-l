/*
 * title: 分组
 * author: wu xiaolong
 * date: 2015.05.25
 * */
var h = null, //header高度
	navigationBar = null, //导航 
	group = null, //分组数据 
	selectedIndex = null, //选中的组索引 
	attention = null, //关注组数据
	navMap = {};
//两个防止滑动死循环的变量
var NavigationCallBackEnable = false;
var FrameGroupCallBackEnable = false;
//导航对象
apiready = function() {
	common(true);
	$('.loading').css('opacity', 1);
	//要打开哪个分组
	selectedIndex = api.pageParam.index;
	//读取关注组id数据
	api.readFile({
		path : api.cacheDir + '/attention.json'
	}, function(ret, err) {
		if (ret.status) {
			attention = JSON.parse(ret.data);
		} else {
			api.toast({
				msg : '获取关注组id失败~',
				duration : 2000
			});
		}
	});
	//读取分组数据
	api.readFile({
		path : api.cacheDir + '/group.json'
	}, function(ret, err) {
		if (ret.status) {
			group = JSON.parse(ret.data);
			setTimeout(getGroup, 300);
		} else {
			api.toast({
				msg : '获取分组数据失败~',
				duration : 2000
			});
		}
	});
};
//获取分组数据
function getGroup() {
	var nav = [], frame = [];
	for (var i=0; i < group.length; i++) {
		nav[i] = {
			title : intercept(group[i].name),
			bg : 'rgba(217,223,229,1)',
			bgSelected : 'rgba(217,223,229,1)'
		};
		frame[i] = {
			name : 'list' + i,
			url : './list.html',
			pageParam : {
				index : i,
				groupId : group[i].groupId
			},
			vScrollBarEnabled : true
		};
		navMap[i] = group[i].groupId;
	};
	//是否关注
	setAtt();
	showGroup(nav);
	openFrameGroup(frame);
	nav = [], frame = [];
};
//截取字符，中文算两个，英文算一个
function intercept(str) {
    var cArr = str.match(/[^\x00-\xff]/ig);  
    var len = str.length + (cArr == null ? 0 : cArr.length);
    if(len > 10){
    	var n = 0, m = '';
    	for(i in str){
    		if(n > 10){
    			break;
    		};
    		//不是中文字符
    		if(str[i].match == null){
    			n++;
    		}else{
    			n = n+2;
    		};
    		m = m + str[i];
    	}
    	return m + '...';
    }else{
		return str;
    }
};
//展示分组
function showGroup(nav) {
	//navigationBar
	h = $('header').height();
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
		bg : 'rgba(217,223,229,1)',
		itemSize : {
			w : api.winWidth / 3
		}
	}, function(ret, err) {
		if (ret) {
			if (NavigationCallBackEnable) {
				FrameGroupCallBackEnable = false;
				// 当点击NavigationBar的item时，阻止 FrameGroup 回调
				api.setFrameGroupIndex({
					name : 'group',
					index : ret.index,
					scroll : false
				});
				selectedIndex = ret.index;
				setAtt();
			}
		}
		NavigationCallBackEnable = true;
		// 加载完后 允许 点击 NavigationBar的item时，进行FrameGroup的切换
		return;
	});
};
//openFrameGroup
function openFrameGroup(frame) {
	api.openFrameGroup({
		name : 'group',
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
				selectedIndex = index;
				setAtt();
			}
			FrameGroupCallBackEnable = true;
			// 加载完后 允许 FrameGroup滑动切换时，进行NavigationBar中item的选中状态切换
		}
	});
};
//显示关注组小星星
function setAtt() {
	var att = navMap[selectedIndex].toString();
	if($.inArray(att, attention) === -1){
		$('.icon-attention i').empty();
	}else{
		$('.icon-attention i').html('&#xe601;').addClass('attention').css('color', 'rgba(241,181,83,1)');
	}
};