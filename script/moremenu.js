/*
 * title: 下拉菜单
 * author: wu xiaolong
 * date: 2015.07.14
 * */
apiready = function() {
	if(api.systemType == 'ios'){
		document.querySelector('ul').style.marginTop = '70px';
	}
	bindEvent();
};
//绑定事件
function bindEvent() {
	document.querySelector('body').addEventListener('touchend', function() {
		api.closeFrame({
			name : 'more-menu'
		});
	});
	document.querySelector('#settingBtn').addEventListener('touchend', function() {
		api.openWin({
			name : 'setting',
			url : './setting.html',
			reload: true
		});
	});
	document.querySelector('#searchBtn').addEventListener('touchend', function() {
		api.openWin({
			name : 'search',
			url : './search.html'
		});
	});
};