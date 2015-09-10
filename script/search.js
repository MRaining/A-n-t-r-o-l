/*
 * title: 搜索
 * author: wu xiaolong
 * date: 2015.06.01
 * */
apiready = function(){
	common(true);
	bindEvent();
};
//bind event
function bindEvent(){
	var val = '';
	$('.search-btn').on('tap', function(){
		val = $('input[type="search"]').val();
		if(val === ''){
			api.toast({
	            msg:'你还没关键词~',
	            duration: 2000
            });
		}else{
			search(val);
		}
	});
};
//搜索
function search(keyword){
	var h = $('header').height()+70;
	api.openFrame({
	    name: 'result',
	    url: './list.html',
	    rect: {
		    x:0,
		    y:h,
		    w:'auto',
		    h: api.winHeight - h
	    },
	    pageParam: {
	    	key: keyword
	    },
	    reload: true
    });
};