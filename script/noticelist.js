/*
 * title: 消息列表
 * author: wu xiaolong
 * date: 2015.07.20
 * */
var page = 1, sTime = null, isRefresh = true, compareDate = null;
apiready = function(){
	common();
	loadData();
	//下拉刷新
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
		page=1;
		isRefresh = true;
		compareDate = null;
		loadData();
	});
};
//加载数据
function loadData(){
	/*
	 * 筛选通知 filterState 参数说明： 【发现】= 1 【变更】= 2 【告警】= 4 【故障】= 8 【全部】= 15
	 */
	var d = new Date();
	sTime = d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()+' '+d.getHours()+':'+d.getMinutes()+':'+d.getSeconds();
	$.ajax({
		type: 'GET',
		dataType: 'json',
		url: server+'/rest/alarms/getNoticeList',
		data: {
			searchContent: '', //搜索内容
			filterState: '15', //筛选状态
			curpage: page, //当前页码
			rows: '10', //每页条数
			startTime: sTime, //开始时间
			attentRids: '' //被关注设备的resourceId	
		},
		headers: {
			'access_token' : token
		},
		success: function(data, status, xhr){
			if(status === 'success' && data){
				showNotice(data);
				bindEvent(data.length);
			}else{
				api.toast({
					msg : '获取消息失败~',
					duration : 2000
				});
			}
		},
		error: function(xhr, errorType, error){
			api.toast({
				msg : '无法获取消息~',
				duration : 2000
			});
		},
		complete: function(xhr, status){
			setTimeout(function(){
				api.refreshHeaderLoadDone();
				api.execScript({
			        name: 'notice',
			        script: '$(".loading").css("opacity", 0);'
		        });
			}, 1000);
		}
	});
};
//展示消息
function showNotice(data){
	if(data.length === 0){
		$('.no-data').show();
		return;
	}
	var tmp = '<table class="item">';
	for(var i=0;i< data.length;i++){
		var nType = noticeColor(data[i].type),
			nTime = data[i].firstOccurrencetime.substring(11, 16),
			nDate = data[i].firstOccurrencetime.substring(0, 10),
			reTime = data[i].recoverTime ? '(恢复时间：'+data[i].recoverTime.substring(11, 16)+')' : '';
		//插入日期分割
		if(nDate !== compareDate){
			tmp += '<tr><td colspan="2" class="date"><h2 class="main-title">'+nDate+'</h2></td></tr>';
			compareDate = nDate;
		}
		tmp += '<tr class="'+nType+'"><td class="state"><i></i></td><td class="time"><span class="pull-right">'+reTime+'</span>'+nTime+'</td></tr>';
		tmp += '<tr><td></td><td class="name">'+data[i].name+'</td></tr>';
	};
	tmp += '</table>';
	isRefresh ? $('#notice').html(tmp) : $('#notice').append(tmp);
	tmp = '';
};
/*
 * 处理通知类型，参数 t = 通知类型，返回通知颜色 故障 = 1, 告警 = 2, 变更 = 3, 发现 = 4
*/
function noticeColor(t){
	switch(t){
		case 1:
			return 'error'; 
			break;
		case 2:
			return 'warning';
			break;
		case 3:
			return 'change';
			break;
		case 4:
			return 'found';
			break;
	}
};
//绑定事件
function bindEvent(len){
	//如果小于	10条数据，则没有加载更多
	if(len < 10){
		api.removeEventListener({
	        name:'scrolltobottom'
        });
	}else{
		//load more
		api.addEventListener({
			name : 'scrolltobottom'
		}, function(ret, err) {
			$('.loading_more').show();
			isRefresh = false;
			page++;
			loadData();
		});
	};
};