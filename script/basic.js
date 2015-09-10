/*
 * title: 设备基本信息
 * author: wu xiaolong
 * date: 2015.06.11
 * */
var resourceId = null,
	a1 = false, //用来判断多个ajax请求是否完成
	a2 = false;
apiready = function() {
	common();
	resourceId = api.pageParam.id;
	loadData();
};
//载入数据
function loadData(){
	if(checkNet()){return;}
	//获取基本信息
	$.ajax({
		type : 'GET',
		url : server + '/rest/assetmanager/findDeviceBasicInfo',
		dataType: 'json',
		data : {
			resourceId : resourceId
		},
		headers: {
			'access_token' : token
		},
		success : function(data, status, xhr) {
			if (status === 'success' && data) {
				showBasic(data);
			} else {
				api.toast({
					msg : '获取基本信息失败~',
					duration : 2000
				});
			}
		},
		error : function(xhr, errorType, error) {
			api.toast({
				msg : '无法获取基本信息~',
				duration : 2000
			});
		},
		complete: function(xhr, status){
			a1 = true;
			ajaxComplete();
		}
	});
	//自定义信息
	$.ajax({
		type : 'GET',
		url : server + '/rest/qrcode',
		dataType: 'json',
		data : {
			resourceId : resourceId
		},
		headers: {
			'access_token' : token
		},
		success : function(data, status, xhr) {
			if (status === 'success' && data) {
				showCustom(data);
			} else {
				api.toast({
					msg : '获取自定义信息失败~',
					duration : 2000
				});
			}
		},
		error : function(xhr, errorType, error) {
			api.toast({
				msg : '无法获取自定义信息~',
				duration : 2000
			});
		},
		complete: function(xhr, status){
			a2 = true;
			ajaxComplete();
		}
	});
};
//验证多个ajax请求是否完成
function ajaxComplete(){
	if(a1 && a2){
		api.execScript({
		    name: 'info',
		    script: '$(".loading").css("opacity", 0);'
	    });
	}
};
//展示基本信息
function showBasic(data){
	var basic = '';
	//一般属性
	basic += '<h2 class="main-title">一般属性</h2>';
	basic += '<ul class="listview">';
	basic += '<li><span class="val pull-right">'+data.alias+'</span>名称</li>';
	basic += '<li><span class="val pull-right">'+data.name+'</span>主机名</li>';
	basic += '<li><span class="val pull-right">'+data.typeComment+'</span>类型</li>';
	basic += '<li class="clearfix"><span class="val pull-right">'+data.comment+'</span>备注</li>';
	basic += '</ul>';
	//ip信息
	basic += '<h2 class="main-title">IP信息</h2>';
	basic += '<ul class="listview">';
	var deviceIps = data.deviceIps;
	for(i in deviceIps){
		basic += '<li><span class="val pull-right">'+deviceIps[i].ip+'</span>IP地址</li>';
		basic += '<li><span class="val pull-right">'+deviceIps[i].macAddress+'</span>MAC地址</li>';
		basic += '<li><span class="val pull-right">'+deviceIps[i].netmask+'</span>子网掩码</li>';
	};
	basic += '</ul>';
	//配置信息
	basic += '<h2 class="main-title">配置信息</h2>';
	basic += '<ul class="listview">';
	var type = '', port = '', differ = '';
	//判断配置信息的类型
	if(data.config.swVersion){
		type = 'SSH';
		port = data.config.swPort;
		differ += '<li><span class="val pull-right">'+data.config.swUser+'</span>用户名</li>';
		differ += '<li><span class="val pull-right">'+data.config.swPassword+'</span>密码</li>';
	}else if(data.config.snmpVersion){
		type = 'SNMP';
		port = data.config.snmpPort;
		differ += '<li><span class="val pull-right">'+data.config.snmpVersion+'</span>版本</li>';
		differ += '<li><span class="val pull-right">'+data.config.snmpCommunity+'</span>团体名</li>';
	};
	basic += '<li><span class="val pull-right">'+type+'</span>类型</li>';
	basic += '<li><span class="val pull-right">'+port+'</span>端口</li>';
	basic += differ;
	basic += '</ul>';
	$('body').prepend(basic);
	basic = '';
};
//展示自定义信息
function showCustom(data){
	var custom = '',
		tagInfo = data.tagInfoList;
	custom += '<h2 class="main-title">自定义信息</h2>';
	custom += '<ul class="listview">';
	for(i in tagInfo){
		custom += '<li><span class="val pull-right">'+tagInfo[i].tagInfo+'</span>'+tagInfo[i].tagName+'</li>';
	};
	custom += '</ul>';
	$('body').append(custom);
	custom = '';
};