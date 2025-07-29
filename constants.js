'use strict';

module.exports.apiLoginKey = '8nTEhg6Z6X';
module.exports.transactionKey = '46T8as7G645vfAQG';
module.exports.config = {
    'logger': {
        'enabled': false,
        'location': '',
        //logging levels - { error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5
        'level': 'silly'
    },
    'proxy': {
        'setProxy': false,
        'proxyUrl': 'http://<username>:<password>@<proxyHost>:<proxyPort>'
    }
}