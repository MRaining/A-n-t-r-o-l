/*
 * title: 问题设备
 * author: wu xiaolong
 * date: 2015.05.29
 * */
//两个防止滑动死循环的变量
var NavigationCallBackEnable = false,
	FrameGroupCallBackEnable = false, //设置两个开关，防止滑动死循环
	navigationBar = null,
	index = 0, //默认显示的索引
	type = null; //问题设备的类型，是故障还是告警
apiready = function() {
	common(true);
	// 要显示的索引
	type = api.pageParam.type;
	if(type === 'alarm'){
		index = 1;
	}
	navigation();
	frameGroup();
};
//navigation
function navigation(){
	navigationBar = api.require('navigationBar');
	navigationBar.open({
	    x: 0,
	    y: api.winHeight - 50,
	    w: api.winWidth,
	    h: 50,
	    items:[{
	    	title: '故障',
	    	bg: '#fff',
	    	bgSelected: '#f9f9f9'
	    },{
	    	title: '告警',
	    	bg: '#fff',
	    	bgSelected: '#f9f9f9'
	    }],
	    selectedIndex: index,
	    font: {
	    	size: 14,
	    	sizeSelected: 14,
	    	color: 'rgba(45,55,71,1)',
	    	colorSelected: 'rgba(249,168,37, 1)',
	    	bg: '#fff'
	    }
    },function(ret,err){
    	if(ret){
			if(NavigationCallBackEnable){
				FrameGroupCallBackEnable = false; // 当点击NavigationBar的item时，阻止 FrameGroup 回调
				api.setFrameGroupIndex({
	                name: 'issueGroup',
	                index: ret.index,
	                scroll: true
                });
			}
		}
		NavigationCallBackEnable = true; // 加载完后 允许 点击 NavigationBar的item时，进行FrameGroup的切换 
        return;
    });
};
//加载问题设备
function frameGroup() {
	var h = $('header').height();
	api.openFrameGroup({
		name : 'issueGroup',
		scrollEnabled : true,
		rect : {
			x : 0,
			y : h,
			w : 'auto',
			h : api.winHeight - h - 50
		},
		index : index,
		preload : 0, //不设置预加载
		frames : [{
			name : 'fault',
			url : './list.html',
			pageParam : {
				type : 'fault'
			}
		}, {
			name : 'alarm',
			url : './list.html',
			pageParam : {
				type : 'alarm'
			}
		}]
	}, function(ret, err) {
		if(ret){
			var name = ret.name,
				index = ret.index;
			if(FrameGroupCallBackEnable){
				NavigationCallBackEnable = false; // 当FrameGroup滑动切换时，阻止 NavigationBar回调
                navigationBar.config({ key: "selectedIndex", value: index });
			}
			FrameGroupCallBackEnable = true; // 加载完后 允许 FrameGroup滑动切换时，进行NavigationBar中item的选中状态切换 
		}
	});
};