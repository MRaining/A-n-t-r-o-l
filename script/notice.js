/*
 * title: 消息
 * author: wu xiaolong
 * date: 2015.07.15
 * */
apiready = function(){
	$('.loading').css('opacity', 1);
	common(true);
	var h = $('header').height();
	api.openFrame({
	    name: 'noticelist',
	    url: './noticelist.html',
	    rect: {
		    x:0,
		    y:h,
		    w:'auto',
		    h: api.winHeight-h
	    }
    });
    getTime();
    cancelNotification();
};
//获取上次打开面板的时间(服务端会存储本次打开的时间)
function getTime(){
	$.ajax({
		type: 'get',
		url: server+'/rest/user/getLastCheckNoticetime',
		dataType: 'text',
		data: {
			account: name
		},
		headers: {
			'access_token': token
		},
		success : function(data, status, xhr) {
			if (status === 'success') {
				
			}else{
				api.toast({
					msg : '获取上次打开时间失败~',
					duration : 2000
				});
			}
		},
		error : function(xhr, errorType, error) {
			api.toast({
				msg : '无法获取上次打开时间~',
				duration : 2000
			});
		},
		complete: function(xhr, status){
			
		}
	});
};
//打开通知后清空 notification
function cancelNotification(){
	api.cancelNotification({
		id: -1
	});
};
