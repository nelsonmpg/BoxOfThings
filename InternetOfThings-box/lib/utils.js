module.exports = {
	dateTimeFormat : function(date) {
		var day;
		try {
			day = date.getDate();
		} catch (e) {
			date = module.exports.parseISOString(date);
		}
		day = date.getDate();
		var month = date.getMonth() + 1;
		var year = date.getFullYear();
		var hour = date.getHours();
		var minute = date.getMinutes();
		var second = date.getSeconds();

		return year + "-" +
		(month.toString().length === 1 ? "0" + month : month) + "-" +
		(day.toString().length === 1 ? "0" + day : day) + " " +
		(hour.toString().length === 1 ? "0" + hour : hour) + ":" +
		(minute.toString().length === 1 ? "0" + minute : minute) + ":" +
		(second.toString().length === 1 ? "0" + second : second);
	},

	parseISOString : function(s) {
		var b = s.split(/\D+/);
		return new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5], b[6]));
	}
}