// Build da lib: ESM, UMD, UMD minificado, CSS e tipos.
import { build, transform } from "esbuild";
import { execFileSync } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";

const out = "build";
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

const rawCss = await readFile("src/datepicker.css", "utf8");
const minCss = (await transform(rawCss, { loader: "css", minify: true })).code;

// O CSS entra no JS já minificado, como texto.
const cssAsText = {
	name: "css-as-text",
	setup(builder) {
		builder.onLoad({ filter: /\.css$/ }, () => ({ contents: minCss.trim(), loader: "text" }));
	},
};

const common = {
	entryPoints: ["src/index.ts"],
	bundle: true,
	target: "es2017",
	legalComments: "none",
	plugins: [cssAsText],
	write: false,
};

const esm = await build({ ...common, format: "esm" });
await writeFile(`${out}/datepicker.mjs`, esm.outputFiles[0].text);

// UMD: AMD, CommonJS, ou globais no browser (datepicker_init e Calendar,
// como nas versões anteriores, mais DatepickerLib com tudo).
const umd = (code) => `(function (root, factory) {
	if (typeof define === "function" && define.amd) define([], factory);
	else if (typeof module === "object" && module.exports) module.exports = factory();
	else {
		var lib = factory();
		root.DatepickerLib = lib;
		root.datepicker_init = lib.datepicker_init;
		root.Calendar = lib.Calendar;
	}
})(typeof self !== "undefined" ? self : this, function () {
${code}
return __dpk;
});
`;

for (const minify of [false, true]) {
	const iife = await build({ ...common, format: "iife", globalName: "__dpk", minify });
	const wrapped = umd(iife.outputFiles[0].text);
	const code = minify ? (await transform(wrapped, { minify: true, target: "es2017" })).code : wrapped;
	await writeFile(`${out}/datepicker${minify ? ".min" : ""}.js`, code);
}

await writeFile(`${out}/datepicker.css`, rawCss);
await writeFile(`${out}/datepicker.min.css`, minCss);

execFileSync(
	process.execPath,
	["node_modules/typescript/bin/tsc", "--noEmit", "false", "--declaration", "--emitDeclarationOnly", "--outDir", `${out}/types`],
	{ stdio: "inherit" }
);

for (const file of ["datepicker.js", "datepicker.min.js", "datepicker.mjs", "datepicker.min.css"]) {
	const content = await readFile(`${out}/${file}`);
	console.log(`${file.padEnd(20)} ${String(content.length).padStart(6)} B  gzip ${String(gzipSync(content).length).padStart(5)} B`);
}
