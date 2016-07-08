var util = require('util');
var fs = require('fs');

logme("Starting server...");
/*
var net = require('net');
var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();
var httpServer = http.createServer(app);
httpServer.listen(80);
*/

var state = {
	'money': 0.0,
	'minimum_wage': 500.0,
	'average_welfare_cost_per_person': 300.0, // TODO: this should be calculated from monthly costs in public health, public education, public transportation, etc; technically speaking i think this value should be covered or forcing adjustments to the social security tax, because that's what it's for, to cover social security
	'population': 1000,
	'employed_percentage': 0.50, // lets assume 20% are unemployed, 40% are elders or youngsters
	'employed_percentage_bi': 0.40,
	'iva': 0.23,
	'social_security_tax': 0.26
}

var company_types = {};

function addCompanyType(type, employs, low, mid, high, monthly_costs_suppliers, monthly_sold, tax_on_business) {
	//TODO: check if company type already exists, log error if it does
	company_types[type] = {
		'desc': type,
		'employs': employs,
		'low': low,
		'mid': mid,
		'high': high,
		'monthly_costs_suppliers': monthly_costs_suppliers,
		'monthly_sold': monthly_sold,
		'tax_on_business': tax_on_business
	};
}

//addCompanyType('non profit', 	10, 	1.0, 0.0, 0.0,   1000.0,   1000.0, 0.0);
addCompanyType('small', 		2, 		0.4, 0.6, 0.0,   1000.0,   4000.0, state['iva']);
addCompanyType('pme', 			10, 	0.4, 0.4, 0.2,   5000.0,  20000.0, state['iva']);
addCompanyType('medium', 		20, 	0.4, 0.4, 0.2,  10000.0,  40000.0, state['iva']);
addCompanyType('large', 		200, 	0.6, 0.3, 0.1, 100000.0, 400000.0, state['iva']);

var companies = [{'name':'company 1', 'type':'small'} , {'name':'company 2', 'type':'pme'}, {'name':'company 3', 'type':'medium'}, {'name':'company 4', 'type':'large'}];

function testCompaniesCanPayWages() {
	for (var i=0; i<companies.length; i++) testCompanyCanPayWages(companies[i]);
}

function testCompanyCanPayWages(company) {

	var c = company_types[company['type']];

	var salaries_costs =  c['low'] * c['employs'] * state['minimum_wage'] +
						  c['mid'] * c['employs'] * 2.0 * state['minimum_wage'] +
						  c['high'] * c['employs'] * 4.0 * state['minimum_wage'];

	var tax = c['monthly_sold'] * c['tax_on_business'];

	var costs = salaries_costs + c['monthly_costs_suppliers'] + tax;

	var profit = c['monthly_sold'] - costs;
	
	logme('company ' + company['name'] + ' has ' + profit + ' monthly profit and paid ' + tax + ' in taxes');
}

function calculateRandomSalary(company) {
	var c = company_types[company['type']];
	var rnd = Math.random();
	//TODO: i somehow think this random check is not very statistically correct, but am to lazy to look up the proper way to attribute a random value to a multiway percentile
	if (rnd < c['low']) return c['low'] * state['minimum_wage'];
	else if (rnd < c['low']+c['mid']) return c['mid'] * 2.0 * state['minimum_wage'];
	else return c['high'] * 4.0 * state['minimum_wage'];
}

function calculateAverageSalary(company) {
	return ((c['low'] * state['minimum_wage']) + (c['mid'] * 2.0 * state['minimum_wage']) + (c['high'] * 4.0 * state['minimum_wage']));
}

logme('init done');

function logme(thisstring) {
	//TODO: also log do disk
	console.log(thisstring);
}	

//testCompaniesCanPayWages();

rand = function(n){
	return Math.floor(Math.random()*n);
};


function simulateMonth() {
	
	state['money'] = 0;
	
	logme('initial state money ' + state['money'] + ' in a place that pays ' + state['minimum_wage'] + ' minimum wage to unemployed, taxes ' + state['iva'] + ' on business, collects ' + state['social_security_tax'] + ' social taxes and has ' + state['employed_percentage'] + ' employment percentage of ' + state['population'] + ' population');
		
	var citizens = [];
	for (var i=0; i<state['population']; i++) {
		if (i/state['population'] > state['employed_percentage']) {
			citizens.push({'unemployed': true});
		} else {
			citizens.push({'unemployed': false, 'company': rand(companies.length) });
			//TODO: distribute employment more realistically, with statistic percentage of employment on small, pme, medium or large companies 
		}
	}
	
	// simulate month
	// tax company business
	for (var i=0; i<companies.length; i++) {
		var c = company_types[companies[i]['type']];
		var tax = c['monthly_sold'] * c['tax_on_business'];
		state['money'] += tax;
	}
	// social welfare
	for (var i=0; i<citizens.length; i++) {
		state['money'] -= state['average_welfare_cost_per_person'];
		if (citizens[i]['unemployed'] === true) {
			state['money'] -= state['minimum_wage'];
		} else {
			var company_id = citizens[i]['company'];
			var company = companies[company_id];
			var salary = calculateRandomSalary(company);
			state['money'] += salary * state['social_security_tax'];
		}
	}
	
	logme('final state money: ' + state['money']);
}

function simulateMonthBI() {
	
	state['money'] = 0;
	
	logme('initial state money ' + state['money'] + ' in a place that pays ' + state['minimum_wage'] + ' minimum wage, taxes ' + state['iva'] + ' on business, collects no social taxes and has ' + state['employed_percentage_bi'] + ' employment percentage of ' + state['population'] + ' population');
	
	var citizens = [];
	for (var i=0; i<state['population']; i++) {
		if (i/state['population'] > state['employed_percentage_bi']) {
			citizens.push({'unemployed': true});
		} else {
			citizens.push({'unemployed': false, 'company': rand(companies.length) });
			//TODO: distribute employment more realistically, with statistic percentage of employment on small, pme, medium or large companies 
		}
	}
	
	// simulate month
	// tax company business
	for (var i=0; i<companies.length; i++) {
		var c = company_types[companies[i]['type']];
		var tax = c['monthly_sold'] * c['tax_on_business'];
		state['money'] += tax;
	}
	// social welfare
	for (var i=0; i<citizens.length; i++) {
		state['money'] -= state['minimum_wage']; // everyone receives BI, no extra welfare costs for state, no social tax charged on salaries
	}
	
	logme('BI :: final state money: ' + state['money']);
}

simulateMonth();

simulateMonthBI();
