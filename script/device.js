/*
 * title: 设备概览
 * author: wu xiaolong
 * date: 2015.05.27
 * */
var deviceId = null;
apiready = function(){
	common(true);
	$('.loading').css('opacity', 1);
	deviceId = api.pageParam.id;
	$('.title').prepend(api.pageParam.name);
	$('.icon-info').attr('data-id', deviceId);
	overview();
	bindEvent();
};
//打开概览
function overview(){
	var h = $('header').height();
	api.openFrame({
	    name: 'overview',
	    url: './overview.html',
	    rect: {
		    x:0,
		    y:h,
		    w:'auto',
		    h: api.winHeight - h
	    },
	   	vScrollBarEnabled: false,
	   	pageParam: api.pageParam
    });
};
function bindEvent(){
	//基本信息
	$('.icon-info').on('tap', function(){
		api.openWin({
	        name: 'info',
	        url: './info.html',
	        pageParam: {
	        	id: deviceId
	        }
        });
	});
};
