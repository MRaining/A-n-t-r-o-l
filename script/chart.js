/*
 * title: 图表
 * author: wu xiaolong
 * date: 2015.05.29
 * */
var performance = null, len = 0, //共有多少个请求
completed = 0, //已完成的请求
timeType = 3;
//默认显示一天的数据
//暂无数据提醒
//筛选的时间类型
apiready = function() {
	common();
	performance = api.pageParam.performance;
	//展示度量图
	showPerformance(performance);
	bindEvent();
};
function bindEvent() {
	//监听按时间筛选
	api.addEventListener({
		name : 'filter'
	}, function(ret, err) {
		api.execScript({
	        name: 'metric',
	        script: '$(".loading").css("opacity", 1);'
        });
		if (ret && ret.value) {
			var v = ret.value;
			timeType = v.timeType;
			len = 0;
			//重置一些参数
			completed = 0;
			showPerformance(performance);
		} else {
			api.toast({
				msg : 'filter 参数错误~',
				duration : 2000
			});
		}
	});
	//下拉刷新
	api.setRefreshHeaderInfo({
		visible : true,
		loadingImg : 'widget://image/refresh.png',
		bgColor : '#000',
		textColor : 'rgba(159,167,176, 1)',
		textDown : '下拉刷新...',
		textUp : '松开刷新...',
		showTime : true
	}, function(ret, err) {
		len = 0;
		completed = 0;
		showPerformance(performance);
	});
};
//获取当前日期时间
function getTime() {
	var d = new Date();
	return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() + ' ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
};
//展示性能图单元
function showPerformance(data) {
	api.execScript({
	    name: 'metric',
	    script: '$(".loading").css("opacity", 1);'
    });
	//有可能是刷新，所有先清空容器
	$('body').empty();
	var endTime = getTime();
	data.sort(function(a, b) {
		return a.sequencing > b.sequencing ? 1 : -1;
	});
	len = data.length;
	for (var i = 0; i < data.length; i++) {
		var tmp = '';
		tmp += '<section class="chart" id="performance' + data[i].id + '">';
		tmp += '<div class="chart-title clearfix"><span class="pull-left">' + data[i].descr + '</span><span class="pull-right val"></span></div>';
		tmp += '<canvas id="chart' + data[i].id + '" height="320"></canvas>';
		tmp += '<div class="no-data"><i class="iconfont">&#xe603;</i><span>暂无数据</span></div>';
		tmp += '<div class="chart-legend"></div>';
		tmp += '</section>';
		$('body').append(tmp);
		loadData(endTime, data[i].chartType, data[i].measurementIds, data[i].id);
		//如果是磁盘则只显示磁盘利用率
		if (data[i].descr === '硬盘使用情况') {
			len = 1;
			break;
		}
	};
};
/*
 * 加载度量数据
 * @timeType: 1,半小时; 2,1小时;3,1天;4,1周;5,1月;6,1年;
 * @endTime: 发送当前时间
 * @chartType: 图表类型,1:标示线图(单线或多线);2:标示双轴3:标示柱状图;4:标示单个服务(备用)
 * @measurementIds: 度量元集合
 * @id: 性能图的id
 * */
function loadData(endTime, chartType, measurementIds, id) {
	var ids = '';
	for (i in measurementIds) {
		ids += measurementIds[i] + ','
	}
	$.ajax({
		type : 'GET',
		dataType : 'json',
		url : server + '/rest/detail/findAndroidMetricData/' + timeType + '/' + endTime + '/' + chartType + '/' + ids,
		headers : {
			'access_token' : token
		},
		success : function(data, status, xhr) {
			if (status === 'success' && data) {
				showChart(data, id);
			} else {
				api.toast({
					msg : '获取度量数据失败~',
					duration : 2000
				});
			}
		},
		error : function(xhr, errorType, error) {
			api.toast({
				msg : '无法获取度量数据~',
				duration : 2000
			});
		},
		complete : function(xhr, status) {
			ajaxComplete();
		}
	});
};
//判断多个ajax请求是否完成
function ajaxComplete() {
	completed++;
	if (completed === len) {
		api.execScript({
	        name: 'metric',
	        script: '$(".loading").css("opacity", 0);'
        });
		api.refreshHeaderLoadDone();
	}
};
//图表颜色库
var color = ['151,187,205', '220,220,220', '243,134,48', '148,159,177', '212,204,197', '247,70,74'];
/*
 * 展示图表
 * data 为每个图标的数据
 * */
function showChart(data, id) {
	var datasets = [], metricValues = null, val = [], labels = [], legend = '', lastVal = '';
	//如果度量元个数大于6个，则是网络端口，单独展示
	if (data.length > 6) {
		showPort(data, id);
		return;
	}
	//遍历多个度量元
	for (var n = 0; n < data.length; n++) {
		//需要重置的变量
		metricValues = null, val = [], lastVal = '';
		//判断是否是磁盘，如果是磁盘就不再遍历
		if (data[n].name === '硬盘利用率' || data[n].name === '磁盘使用情况') {
			showPie(data[n], id);
			return;
		}
		//度量元不是磁盘的时候
		datasets.push({
			fillColor : "rgba(" + color[n] + ",0.5)",
			strokeColor : "rgba(" + color[n] + ",1)",
			pointColor : "rgba(" + color[n] + ",1)",
			pointStrokeColor : "#fff",
			data : []
		});
		/*
		 * 获取图例
		 * 如果只有一个度量元则不显示图例
		 * */
		if (data.length > 1) {
			legend += '<i style="background:rgba(' + color[n] + ',0.5);border:2px solid rgba(' + color[n] + ',1)"></i><span>' + data[n].name + '</span>';
		}
		//提取图表数据
		metricValues = data[n].metricValues;
		//判断度量数据是否为空
		if (metricValues.length === 0) {
			continue;
		}
		//取比当前数值大的最小整数（上取整），过滤,如果大于10个点，最多显示10个点
		var remainder = Math.ceil(metricValues.length / 10);
		//如果是一周的数据，就显示7个点
		if (timeType === 4) {
			remainder = Math.ceil(metricValues.length / 7);
		}
		for (var m = 0; m < metricValues.length; m++) {
			//如果大于10个点才过滤
			if (metricValues.length > 10) {
				//每隔 remainder 个就跳过这个点的数据
				if (m % remainder !== 0) {
					continue;
				};
			};
			//labels只需要一组数据即可
			if (n === 0) {
				var d = new Date(metricValues[m].timestamp), timeStr = '';
				//根据不同的时间类型，展示不同类型的时间
				switch(timeType) {
					case 2:
						//一小时
						timeStr = d.getMinutes();
						break;
					case 3:
						//一天
						timeStr = d.getHours() + ':' + d.getMinutes() + '0';
						break;
					case 4:
						//一周
						timeStr = d.getDate();
						break;
					case 5:
						//一月
						timeStr = d.getDate();
						break;
					default:
						timeStr = d.getHours() + ':' + d.getMinutes() + '0'
				};
				labels.push(timeStr);
			};
			val.push(metricValues[m].value.toFixed(2));
			//获取最后一个非空的值
			if (metricValues[m].value.toFixed(2)) {
				lastVal = metricValues[m].value;
			};
		};
		datasets[n].data = val;
	};
	//判断度量元数据是否为空,metricValues
	if (datasets[0].data.length === 0) {
		$('#performance' + id).find('.no-data').show();
		$('#chart' + id).remove();
		return;
	}
	//显示当前值,如果有多个度量元则只显示单位
	if (data.length > 1) {
		$('#performance' + id).find('.val').text('单位:' + data[0].unit[0]);
	} else {
		$('#performance' + id).find('.val').text(lastVal + data[0].unit[0]);
	}
	//显示图例
	$('#performance' + id).find('.chart-legend').html(legend);
	//初始化图表
	var chartData = {
		labels : labels,
		datasets : datasets
	};
	//Get context with jQuery - using jQuery's .get() method.
	var ctx = $('#chart' + id).get(0).getContext("2d");
	var chart = new Chart(ctx);
	/*
	 * show chart
	 * 如果是一个度量元则显示柱状图；
	 * 两个以上度量元显示曲线图；
	 * 如果是硬盘，则显示饼图；
	 * */
	if (data.length === 1) {
		chart.Line(chartData);
	} else if (data.length > 1) {
		chart.Line(chartData);
	}
	chartData = null;
};
//展示端口
function showPort(data, id) {
	var tmp = '', ethernet = [], other = [], max = 0, legend = '';
	for (i in data) {
		//筛选以太网
		if (data[i].name.indexOf('Ethernet') === 0) {
			ethernet.push(data[i]);
		} else {
			other.push(data[i]);
		}
		//获取最大值
		var metric = data[i].metricValues;
		if(metric.length > 0){
			if(metric[0].value > max){
				max = metric[0].value;
			}
		}
	}
	//从小到大排序
	ethernet = sortPort(ethernet, true);
	//合并
	data = ethernet.concat(other);
	for (var i = 0; i < data.length; i++) {
		var metric = data[i].metricValues[0].value, w = metric/max*100+'%';
		if(i%2 === 0){
			var name = substrName(data[i].name);
			tmp += '<figure class="port-item">';
			tmp += '<figcaption>' + name + '</figcaption>';
			tmp += '<div class="progress out"><span style="width:'+w+'">'+metric+'</span></div>';
		}else{
			tmp += '<div class="progress in"><span style="width:'+w+'">'+metric+'</span></div>';
			tmp += '</figure>';
		}
	}
	$('#chart' + id).replaceWith(tmp);
	$('#performance' + id).find('.val').text('单位:' + data[0].unit[0]);
	//显示图例
	legend += '<i style="background:rgba(91,192,222,0.5);border:2px solid rgba(91,192,222,1)"></i><span>接收</span><i style="background:rgba(92,184,92,0.5);border:2px solid rgba(92,184,92,1)"></i><span>发送</span>';
	$('#performance' + id).find('.chart-legend').html(legend);
};
//截取名称
function substrName(name){
	var index = 0;
	if(name.indexOf('丢弃') !== -1){
		index = name.indexOf('丢弃');
	}else if(name.indexOf('接收') !== -1){
		index = name.indexOf('接收');
	}else if(name.indexOf('发送') !== -1){
		index = name.indexOf('发送');
	}
	return name.substr(0, index);
};
// 端口按照从小到大排序,isEG:是否是百兆/千兆以太网端口
function sortPort(port, isEG) {
	port.sort(function(a, b) {
		aend = a.name.indexOf("接收") !== -1 ? a.name.indexOf("接收") : a.name.indexOf("发送");
		bend = b.name.indexOf("接收") !== -1 ? b.name.indexOf("接收") : b.name.indexOf("发送");
		aport = a.name.substring( isEG ? (a.name.lastIndexOf("/") + 1) : 0, aend);
		bport = b.name.substring( isEG ? (b.name.lastIndexOf("/") + 1) : 0, bend);
		if (isEG) {
			return parseInt(aport) > parseInt(bport) ? 1 : -1;
		} else {
			return aport > bport ? 1 : -1;
		}
	});
	return port;
};
//展示饼图
function showPie(data, id) {
	var datasets = [], metricValues = null, lastVal = 'N/A', legend = '';
	metricValues = data.metricValues;
	//倒序遍历，获取最后一个不为空的值
	for (var i = metricValues.length - 1; i > 0; i--) {
		if (metricValues[i].value) {
			lastVal = metricValues[i].value;
			break;
		}
	};
	//饼图数据
	var used = lastVal / 100 * data.totleValue, last = data.totleValue - used;
	var pieData = [{
		value : used.toFixed(2),
		color : "rgba(243,134,48,1)"
	}, {
		value : last.toFixed(2),
		color : "rgba(224,228,204,1)"
	}];
	//Get context with jQuery - using jQuery's .get() method.
	var ctx = $('#chart' + id).get(0).getContext("2d");
	var chart = new Chart(ctx);
	chart.Pie(pieData);
	//展示当前利用率
	lastVal += data.unit[0] + '/' + data.totleValue + data.unit[1];
	$('#performance' + id).find('.val').text(lastVal);
	//显示图例
	legend += '<i style="background:rgba(243,134,48,0.5);border:2px solid rgba(243,134,48,1)"></i><span>已用</span>';
	legend += '<i style="background:rgba(224,228,204,0.5);border:2px solid rgba(224,228,204,1)"></i><span>剩余</span>';
	$('#performance' + id).find('.chart-legend').html(legend);
};