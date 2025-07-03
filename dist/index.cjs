const isFlag = val => typeof val === "string" && val.startsWith("-");

const toCamelCase = str => str.replace(/-([a-z])/g, (_, char) => char.toUpperCase());

const castValue = val => {
	if (val === "true") return true;
	if (val === "false") return false;
	if (/^-?\d+(\.\d+)?$/.test(val)) return Number(val);
	return val;
};

const setFlag = (flags, key, value) => {
	const camelKey = toCamelCase(key);
	flags[key] = value;
	if (camelKey !== key) {
		flags[camelKey] = value;
	}
};

const getKey = (key, aliases) => aliases[key] || key;

const readMultiValues = (argv, startIndex, rawVal) => {
	const values = [];
	let i = startIndex;
	if (rawVal != null) {
		values.push(castValue(rawVal));
		return {
			values: values,
			argOffset: 0
		};
	}
	while (argv[i + 1] && !isFlag(argv[i + 1])) {
		values.push(castValue(argv[++i]));
	}
	return {
		values: values,
		argOffset: i - startIndex
	};
};

const parseLongFlag = (arg, index, context) => {
	const {argv: argv, aliases: aliases, arrays: arrays, flags: flags} = context;
	const [rawKey, rawVal] = arg.includes("=") ? arg.slice(2).split("=") : [ arg.slice(2) ];
	const key = getKey(rawKey, aliases);
	if (arrays.includes(key)) {
		const {values: values, argOffset: argOffset} = readMultiValues(argv, index, rawVal);
		setFlag(flags, key, (flags[key] || []).concat(values));
		return index + argOffset;
	}
	let value;
	if (rawVal != null) {
		value = castValue(rawVal);
	} else if (!isFlag(argv[index + 1]) && argv[index + 1] != null) {
		value = castValue(argv[++index]);
	} else {
		value = true;
	}
	setFlag(flags, key, value);
	return index;
};

const parseShortGroup = (arg, context) => {
	const {aliases: aliases, flags: flags} = context;
	for (const char of arg.slice(1)) {
		const key = getKey(char, aliases);
		setFlag(flags, key, true);
	}
};

const parseShortFlag = (arg, index, context) => {
	const {argv: argv, aliases: aliases, arrays: arrays, flags: flags} = context;
	const short = arg[1];
	const key = getKey(short, aliases);
	const next = argv[index + 1];
	const nextIsValue = next && !isFlag(next);
	if (arrays.includes(key)) {
		const values = [];
		let i = index;
		while (argv[i + 1] && !isFlag(argv[i + 1])) {
			values.push(castValue(argv[++i]));
		}
		setFlag(flags, key, (flags[key] || []).concat(values));
		return i;
	}
	const val = nextIsValue ? castValue(argv[++index]) : true;
	setFlag(flags, key, val);
	return index;
};

const getFlags = ({argv: argv = process.argv.slice(2), aliases: aliases = {}, arrays: arrays = [], defaults: defaults = {}} = {}) => {
	const flags = {
		_: []
	};
	const context = {
		argv: argv,
		aliases: aliases,
		arrays: arrays,
		flags: flags
	};
	for (let i = 0; i < argv.length; i++) {
		const arg = argv[i];
		if (arg === "--") {
			flags._.push(...argv.slice(i + 1));
			break;
		}
		if (arg.startsWith("--")) {
			i = parseLongFlag(arg, i, context);
			continue;
		}
		if (arg.startsWith("-")) {
			if (arg.length > 2) {
				parseShortGroup(arg, context);
			} else if (arg.length === 2) {
				i = parseShortFlag(arg, i, context);
			} else {
				flags._.push(arg);
			}
			continue;
		}
		flags._.push(arg);
	}
	for (const [key, val] of Object.entries(defaults)) {
		if (!(key in flags)) {
			setFlag(flags, key, val);
		}
	}
	return flags;
};

module.exports = getFlags;
