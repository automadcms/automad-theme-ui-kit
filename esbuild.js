import esbuild from 'esbuild';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = process.argv.includes('--dev');
const outdir = path.join(__dirname, 'dist');
const src = path.join(__dirname, 'src');

const entryPoints = fs.globSync(`${src}/components/*/index.ts`);

const commonConfig = {
	entryPoints,
	bundle: true,
	format: 'esm',
	sourcemap: isDev,
	minify: !isDev,
	target: ['es2022'],
	assetNames: '[name]',
	write: true,
	outdir,
	drop: isDev ? [] : ['console'],
	logLevel: 'info',
	loader: { '.svg': 'text' },
	plugins: [],
};

const runBuild = async () => {
	await esbuild.build(commonConfig);
};

const runDev = async () => {
	await runBuild();

	let ctx = await esbuild.context(commonConfig);

	await ctx.watch();
};

if (isDev) {
	runDev().catch((err) => {
		console.error(err);
		process.exit(1);
	});
} else {
	runBuild().catch((err) => {
		console.error(err);
		process.exit(1);
	});
}
