declare function getFlags(options?: {
	argv?: string[];
	aliases?: Record<string, string>;
	arrays?: string[];
	defaults?: Record<string, unknown>;
}): {
	[key: string]: string | number | boolean | Array<string | number | boolean> | undefined;
	_: string[];
};

export = getFlags;