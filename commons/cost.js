import { emojis } from '../config.js';

function outputSimulatedCost(masts, cargo, speed, cannons){
	const total = masts + cargo + speed + cannons;

	return `${emojis.masts} ${masts} ${emojis.cargo} ${cargo} ${emojis.speed} ${speed} ${emojis.cannon} ${cannons} = :coin: ${total.toFixed(1).replace('.0', '')}`;
}

const mastsRegex = new RegExp(/^[0-9]|10$/);
const cargoRegex = new RegExp(/^[0-9]|10$/);
const speedRegex = new RegExp(/^([SLDT]\+?)+$/);
const cannonsRegex = new RegExp(/^([1-6][SL] ?)+$/);

function round(value) {
	return Math.floor(value * 10) / 10;
}

export default function cost(masts, cargo, speed, cannons) {
	const errors = [];
	if (!mastsRegex.test(masts)) {
		errors.push('`masts` should be a number between 1 and 10');
	}
	if (!cargoRegex.test(cargo)) {
		errors.push('`cargo` should be a number between 0 and 10');
	}
	if (!speedRegex.test(speed)) {
		errors.push('`speed` should be letters (S, L, D, T) with or without a + sign in between (ex: "S+L" or "sSs")');
	}
	if (!cannonsRegex.test(cannons)) {
		errors.push('`cannons` should be dice (1 to 6) and range (S or L) with or without a space in between (ex: "4S3L2L4S" or "4s 3l 2l 4s")');
	}

	if (errors.length > 0) {
		return {
			title: 'Wrong input format',
			description: errors.join('\n')
		};
	}

	const _speed = speed
		.replace(/\+/g, '');
	const _cannons = cannons
		.replace(/ /g, '')
		.match(/.{2}/g); // cuts the string into 2-char-long segments

	let masts_points = 0;
	let cargo_points = 0;
	let speed_points = 0;
	let cannons_points = 0;
	
	/* UDC */

	// Masts
	masts_points = masts > 2 ? masts - 2 : 0;

	// Cargo
	cargo_points = cargo > 2 ? cargo - 2 : 0;

	// Speed
	speed_points =
		(3 * ((_speed.match(/L/g) || []).length))
		+
		(2 * ((_speed.match(/S/g) || []).length));

	// Cannons
	if (_cannons) {
		cannons_points = _cannons.reduce(
			(total, [cannon_unit, cannon_range]) => {
			// 6 5 4 => free
			if (cannon_unit > 3) {
				return total;
			}
			// 3L 2L 1L 2S 1S => +1 point
			if (cannon_unit < 3) {
				return total + 1;
			}
			// 3S => free
			if (cannon_range === "S") {
				return total;
			}
			// 3L => +1 point
			return total + 1;
		}, 0);
	}

	const udc_calc = outputSimulatedCost(masts_points, cargo_points, speed_points, cannons_points);

	/* SimCost */

	// Masts
	masts_points = round(masts * 0.7);

	// Cargo
	cargo_points = round(cargo * 0.5);

	// Speed
	speed_points = round(
		((3 * ((_speed.match(/L/g) || []).length)) + (2 * ((_speed.match(/S/g) || []).length)))
		* 0.2
	);

	// Cannons
	let simcost_cannons_unit = 0;
	let simcost_cannons_range = 0;
	if (_cannons) {
		_cannons.forEach(([cannon_unit, cannon_range]) => {
			//  6 - cannonvalue = score per cannon. And 1 point per L cannon
			simcost_cannons_unit += 6 - cannon_unit;
			if (cannon_range === "L") {
				simcost_cannons_range ++;
			}
		});
	}
	cannons_points = round(simcost_cannons_unit * 0.3 + simcost_cannons_range * 0.2);

	const simcost_calc = outputSimulatedCost(masts_points, cargo_points, speed_points, cannons_points);
		
	return {
		title: 'Cost estimation for:',
		description: `**Masts**: ${masts}\n**Cargo**: ${cargo}\n**Speed**: ${speed}\n**Cannons**: ${cannons}`,
		fields: [
			{
				name: 'UDC',
				value: udc_calc
			},
			{
				name: 'SimCost',
				value: simcost_calc
			},
		]
	}
}