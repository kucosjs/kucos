exports.success = function (res, msg) {
	var data = {
		status: "success",
		message: msg
	};
	return res.status(200).json(data);
};

exports.successData = function (res, msg, data) {
	data = {
		status: "success",
		message: msg,
		data: data
	};
	return res.status(200).json(data);
};

exports.createdData = function (res, msg, data) {
	data = {
		status: "success",
        message: msg,
        data: data
	};
	return res.status(201).json(data);
};

exports.created = function (res, msg, data) {
	data = {
		status: "success",
        message: msg
	};
	return res.status(201).json(data);
};

exports.error = function (res, msg) {
	var data = {
        status: "error",
        message: msg
	};
	return res.status(500).json(data);
};

exports.notFound = function (res, msg) {
	var data = {
		status: "error",
		message: msg,
	};
	return res.status(404).json(data);
};

exports.notFoundData = function (res, msg, data) {
	data = {
		status: "error",
		message: msg,
		data: data
	};
	return res.status(404).json(data);
};

exports.validationError = function (res, msg) {
	var data = {
		status: "error",
		message: msg
	};
	return res.status(400).json(data);
};

exports.unauthorized = function (res, msg) {
	var data = {
		status: "error",
		message: msg,
	};
	return res.status(401).json(data);
};