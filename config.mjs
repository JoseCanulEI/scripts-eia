const env = 'prod' // 'dev'
const userDB = { // user database
  dev: {
    host: '74.208.252.188', //'70.35.207.62',
    user: 'root',
    password: 'ErbDev20.', //'eiWis3r.18',
    database: '03112021083337_erbessdinstruments', //'devicesusers_db',
    dateStrings: true
  },
  prod: {
    host: 'dbprimary.eianalytic.com',
    user: 'user_02062022104344_erbessdinst', //'root',
    password: 'kb?l0Lphe9_zH@c9iF8l', //'eiWis3r.18',
    database: '02062022104344_erbessdinstruments',
    dateStrings: true
  }
}

const masterDB = { // master database
  dev: {
    host: '74.208.252.188',
    user: 'db_devices_user',
    password: 'jdksh!0ksdh$#',
    database: 'devicesusers_db',
    dateStrings: true
  },
  prod: {
    host: 'dbprimary.eianalytic.com',
    user: 'db_devices_user',
    password: 'f0xtRot#ju1i3T@D3l7@',
    database: 'devicesusers_db',
    dateStrings: true
  }
}

export default {
  userDB: userDB[env],
  masterDB: masterDB[env]
}
