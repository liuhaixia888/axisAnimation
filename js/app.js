require.config({
	baseUrl : './js',
	paths : {
		zepto 		: 'zepto.min',
		guid 		: 'guid',
		listen 		: 'listen'
	},
	shim:{
		'zepto': { 
			exports: 'Zepto'
		}
	}
});

require(['zepto', 'axisAnimation'], function($, AxisAnimation, App){
	// var wrapper = 'axisWrapper', 
	// axisAnimation = 'axisAnimation';

	// var axisAnim = new AxisAnimation({
	// 		container: $('.clover-timeline')
	// });

	//拖动关键帧
	//axisAnim._dragKeyframe();

	var timeline;

	// 生成时间轴
	timeline = new AxisAnimation({
		container: $('.clover-timeline'),
		direction: 'x',
		size: '800'
	});
	// 初始化时间轴事件
	 timeline.events.init(timeline);

	// 生成时间轴2
	timeline2 = new AxisAnimation({
		container: $('.clover-timeline2'),
		direction: 'y',
		size: '400'
	});
	// 初始化时间轴事件2
	 timeline2.events.init(timeline2);

	 	// 生成时间轴
	timeline3 = new AxisAnimation({
		container: $('.clover-timeline3')
	});
	// 初始化时间轴事件
	 timeline3.events.init(timeline3);


	$(document).bind('keyframeChange', function(event, data){
	 	console.log(data);
	 	timeline2.getAllKey();
	});

});