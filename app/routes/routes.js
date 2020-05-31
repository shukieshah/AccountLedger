
function isValidAccountParams(params) {
    if (!params.customerAccountId || !params.firstName || !params.lastName) {
        return false;
    }
    return true;
}

function isValidUpdateParams(params) {
    if (!params.customerAccountId || !params.ledgerName || isNaN(params.newBalance)) {
        return false;
    }
    return true;
}

function getDate(timestamp) {
    timestamp = Date.parse(timestamp);
    if (!isNaN(timestamp)) {
        return new Date(timestamp);
    }
    return null;
}

function searchByDate(searchDate, ledgerHistory, ledgerName) {
    var i = 0;
    if (searchDate < getDate(ledgerHistory[i].timestamp)) {
        return {};
    }
    while (i < ledgerHistory.length && searchDate >= getDate(ledgerHistory[i].timestamp)) {
        i += 1;
    }

    result = {}
    result[ledgerName] = ledgerHistory[i-1].balance;
    result['timestamp'] = ledgerHistory[i-1].timestamp
    return result
}

module.exports = function (app, collection) {

    app.get('/getCustomerAccountIds', (req, res) => {
        collection.find({}).project({ _id: 0, customerAccountId: 1 }).toArray(function (err, documents) {
            if (err) {
                res.send({ 'error': 'A database error has occurred' });
            } else {
                res.send(documents);
            }
        });
    });

    app.get('/getCustomerAccountData', (req, res) => {
        collection.find({ customerAccountId: req.query.customerAccountId }).toArray(function (err, documents) {
            if (err) {
                res.send({ 'error': 'A database error has occurred' });
            } else if (!documents[0]) {
                res.send({ 'error': 'No such customer account found' });
            } else {
                res.send(documents[0]);
            }
        });
    });

    app.get('/getCurrentLedgerBalances', (req, res) => {
        collection.find({ customerAccountId: req.query.customerAccountId }).toArray(function (err, documents) {
            if (err) {
                res.send({ 'error': 'A database error has occurred' });
                return;
            }

            if (!documents[0]) {
                res.send({ 'error': 'No such customer account found' });
                return;
            }

            ledgers = documents[0].ledgers;
            currentLedgerBalances = {};

            for (var ledgerName in ledgers) {
                currentLedgerBalances[ledgerName] = ledgers[ledgerName].slice(-1)[0].balance;
            }

            res.send(currentLedgerBalances);

        });
    });

    app.get('/getPreviousLedgerBalance', (req, res) => {
        collection.find({ customerAccountId: req.query.customerAccountId }).toArray(function (err, documents) {
            if (err) {
                res.send({ 'error': 'A database error has occurred' });
                return;
            }

            if (!documents[0]) {
                res.send({ 'error': 'No such customer account found' });
                return;
            }

            ledgers = documents[0].ledgers;
            ledgerName = req.query.ledgerName;

            if (!ledgerName) {
                res.send({ 'error': 'No ledger specified' });
            } else if (!(ledgerName in ledgers)) {
                res.send({ 'error': 'No such ledger found' });
            } else {
                result = {}
                length = ledgers[ledgerName].length;
                result[ledgerName] = ledgers[ledgerName].slice(Math.max(-2, -length))[0].balance;
                res.send(result);
            }
        });
    });

    app.get('/getLedgerBalanceByDate', (req, res) => {
        collection.find({ customerAccountId: req.query.customerAccountId }).toArray(function (err, documents) {
            if (err) {
                res.send({ 'error': 'A database error has occurred' });
                return;
            }

            if (!documents[0]) {
                res.send({ 'error': 'No such customer account found' });
                return;
            }

            ledgers = documents[0].ledgers;
            ledgerName = req.query.ledgerName;

            if (!ledgerName) {
                res.send({ 'error': 'No ledger specified' });
            } else if (!(ledgerName in ledgers)) {
                res.send({ 'error': 'No such ledger found' });
            } else if (getDate(req.query.timestamp) === null) {
                res.send({ 'error': 'Invalid timestamp' });
            } else {
                result = searchByDate(getDate(req.query.timestamp), ledgers[ledgerName], ledgerName);
                res.send(result);
            }

        });

    });


    app.post('/createCustomerAccount', (req, res) => {
        if (!isValidAccountParams(req.body)) {
            res.send({ 'error': 'Invalid or missing account parameters' });
            return;
        }

        currDate = new Date();
        const accountInfo = {
            customerAccountId: req.body.customerAccountId,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            ledgers: {
                principal: [
                    {
                        timestamp: currDate,
                        balance: 0
                    }
                ],
                applicationFee: [
                    {
                        timestamp: currDate,
                        balance: 0
                    }
                ],
                principalPaid: [
                    {
                        timestamp: currDate,
                        balance: 0
                    }
                ],
                interestFee: [
                    {
                        timestamp: currDate,
                        balance: 0
                    }
                ],
                interestFeePaid: [
                    {
                        timestamp: currDate,
                        balance: 0
                    }
                ],
                lateFees: [
                    {
                        timestamp: currDate,
                        balance: 0
                    }
                ]
            }
        }

        collection.insertOne(accountInfo, (err, results) => {
            if (err) {
                res.send({ 'error': 'A database error has occurred' });
            } else {
                res.send(results.ops[0]);
            }
        });
    });

    app.post('/updateLedgerBalance', (req, res) => {
        if (!isValidUpdateParams(req.body)) {
            res.send({ 'error': 'Invalid or missing parameters' });
            return;
        }

        pushValue = {}
        pushValue[`ledgers.${req.body.ledgerName}`] = { timestamp: new Date(), balance: parseInt(req.body.newBalance) }

        collection.update({ customerAccountId: req.body.customerAccountId }, { '$push': pushValue }, (err, results) => {
            if (err) {
                res.send({ 'error': 'A database error has occurred' });
            } else {
                res.send(results);
            }
        });
    });
}

