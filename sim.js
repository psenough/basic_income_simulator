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
var population = 100;
var employed_percentage = 0.80;
var iva = 0.23;
var social_security_tax = 0.26;
var minimum_wage = 500.0;

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

addCompanyType('non profit', 	10, 	1.0, 0.0, 0.0,   1000.0,   1000.0, 0.0);
addCompanyType('small', 		2, 		0.4, 0.6, 0.0,   1000.0,   4000.0, iva);
addCompanyType('pme', 			10, 	0.4, 0.4, 0.2,   5000.0,  20000.0, iva);
addCompanyType('medium', 		20, 	0.4, 0.4, 0.2,  10000.0,  40000.0, iva);
addCompanyType('large', 		200, 	0.6, 0.3, 0.1, 100000.0, 400000.0, iva);

var companies = [{'name':'company 1', 'type':'small'} , {'name':'company 2', 'type':'pme'}, {'name':'company 3', 'type':'medium'}, {'name':'company 4', 'type':'large'}];

function testCompaniesCanPayWages() {
	for (var i=0; i<companies.length; i++) testCompanyCanPayWages(companies[i]);
}

function testCompanyCanPayWages(company) {

	var c = company_types[company['type']];

	var salaries_costs =  c['low'] * c['employs'] * minimum_wage +
						  c['mid'] * c['employs'] * 2.0 * minimum_wage +
						  c['high'] * c['employs'] * 4.0 * minimum_wage;

	var tax = c['monthly_sold'] * c['tax_on_business'];

	var costs = salaries_costs + c['monthly_costs_suppliers'] + tax;

	var profit = c['monthly_sold'] - costs;
	
	logme('company ' + company['name'] + ' has ' + profit + ' monthly profit and paid ' + tax + ' in taxes');
}

logme('init done');

function logme(thisstring) {
	//TODO: also log do disk
	console.log(thisstring);
}	

testCompaniesCanPayWages();
