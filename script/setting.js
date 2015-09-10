/*
 * title: 设置
 * author: wu xiaolong
 * date: 2015.05.26
 * */
apiready = function(){
	$('.loading').css('opacity', 1);
	common(true);
	openSettinglist();
};
//打开设置列表
function openSettinglist(){
	var h = $('header').height();
	api.openFrame({
	    name: 'settinglist',
	    url: './settinglist.html',
	    rect: {
		    x:0,
		    y:h,
		    w:'auto',
		    h:api.winHeight - h
	    },
	    bounces: true,
	    vScrollBarEnabled: false,
	    reload: true
    });
};