var url = "https://api.github.com/search/repositories?q=pushed:>2015-09-01&order=desc";
var page = 1,
    loading = false;

function init() {
	$.activityIndicator.show();
	load(function(items) {		
		var lvmc = require('com.falkolab.lvmc');
		var section = lvmc.wrap($.getView('list').sections[0]);
		var transformed = transform(items, 3, section.getItems().length);
		section.setItems(transformed);
		$.activityIndicator.hide();
		if ($.is) {
			$.is.init($.getView('list'));
			$.is.mark();
		}
	}, function(e) {
		Ti.API.error(e.error);
		$.activityIndicator.hide();
	});
}

function transform(items, columns, startIndex) {
	var items = _.map(items, function(item, index) {
		return {
			avatar : {
				image : item.owner.avatar_url
			},
			name : {
				text : item.name
			},
			index : {
				text : startIndex + index
			},
			properties : {
				height : 150,
				width : 150
			}
		};
	});
	
	return adjustItemsSize(items, columns);
}

function load(callback, error) {
	if (loading)
		return;
		
	loading = true;
	var client = Ti.Network.createHTTPClient({
		onload : function(e) {
			var reps = JSON.parse(this.responseText);

			callback && callback(reps.items);
			page++;
			loading = false;
		},
		onerror : function(e) {
			error && error(e);
			loading = false;
		},
		timeout : 5000
	});
	var requestUrl = url + "&page=" + page;
	
	client.open("GET", requestUrl);
	client.send();
}

function onLoadMore(evt) {
	load(function(items) {
		var lvmc = require('com.falkolab.lvmc');
		var section = lvmc.wrap($.getView('list').sections[0]);

		section.appendItems(transform(items, 3, section.getItems().length));
		evt.success();
	}, function(e) {
		Ti.API.error(e.error);
		evt.error("Error");
	});
}

function getScreenSize() {
	var height = Ti.Platform.displayCaps.platformHeight;
    var width = Ti.Platform.displayCaps.platformWidth;
    var dpi = Ti.Platform.displayCaps.dpi;
                
    if(Ti.Platform.osname =='android') {
        height = height/dpi*160;
        width = width/dpi*160;
    }
    
    return {
    	width: width,
    	height: height
    };
}

function adjustItemsSize(items, columns) {
	var size = getScreenSize();
	return _.map(items, function(item) {
		item.properties.width = size.width/columns;
		item.properties.height = item.properties.width;		
		return item;		
	});
}

function cleanup() {
	if ($.is)
		$.is.detach();
}