/*
 * title: 基本信息
 * author: wu xiaolong
 * date: 2015.06.01
 * */
apiready = function() {
	$('.loading').css('opacity', 1);
	common(true);
	//打开基本信息内容
	basic(true);
	setTimeout(function(){
		api.closeWin({
    		name: 'scanner'
		});
	}, 300);
};
//basic
function basic() {
	var h = $('header').height();
	api.openFrame({
		name : 'basic',
		url : './basic.html',
		bounces : true,
		vScrollBarEnabled : false,
		rect : {
			x : 0,
			y : h,
			w : 'auto',
			h : api.winHeight - h
		},
		pageParam: {
			id: api.pageParam.id
		}
	});
};