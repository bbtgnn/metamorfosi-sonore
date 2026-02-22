import csv from 'csvtojson';
import { join, relative } from 'node:path';

//

const researchDir = join(process.cwd(), 'research');

const numberFields = [
	'transient_index',
	'timestamp_s',
	'strength',
	'strength_rounded',
	'frequency_hz',
	'frequency_hz_rounded',
	'wavelength_m',
	'wavelength_m_rounded',
	'rolloff_hz',
	'rolloff_hz_rounded',
	'pitch_hz',
	'pitch_hz_rounded'
];

async function main() {
	const glob = new Bun.Glob('**/*.csv');
	const csvPaths: string[] = [];
	for await (const p of glob.scan({ cwd: researchDir, absolute: true, onlyFiles: true })) {
		csvPaths.push(p);
	}

	for (const csvPath of csvPaths) {
		const csvText = await Bun.file(csvPath).text();
		const json = await csv({
			colParser: Object.fromEntries(numberFields.map((field) => [field, 'number']))
		}).fromString(csvText);
		const jsonPath = csvPath.replace(/\.csv$/i, '.json');
		await Bun.write(jsonPath, JSON.stringify(json, null, 0));
		console.log(relative(researchDir, csvPath), '→', relative(researchDir, jsonPath));
	}
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
