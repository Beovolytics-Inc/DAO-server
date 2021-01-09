[![Gitpod ready-to-code](https://img.shields.io/badge/Gitpod-ready--to--code-blue?logo=gitpod)](https://gitpod.io/#https://github.com/PhoenixDAO/DAO-server)

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

[travis-image]: https://api.travis-ci.org/nestjs/nest.svg?branch=master
[travis-url]: https://travis-ci.org/nestjs/nest
[linux-image]: https://img.shields.io/travis/nestjs/nest/master.svg?label=linux
[linux-url]: https://travis-ci.org/nestjs/nest
  
  <p align="center">A progressive <a href="http://nodejs.org" target="blank">Node.js</a> framework for building efficient and scalable server-side applications, heavily inspired by <a href="https://angular.io" target="blank">Angular</a>.</p>

# PheonixDAO-Server

## Description
Pheonix-DAO Server repository. The Application allows users to authenticate themself through MetaMask and Numio. Users can then add proposals, vote on proposals, stake on proposals and view updates. Admin approve the proposals so the users can vote on them. If a proposal is accepted after clearing the voting stage, then user can mark the milestones of proposal as completed and admin reviews and verifies it to issue funds.<br/>

## About App
PhoenixDAO is a truly decentralized, open-source project that covers identity, payments, tokenization, authentication, and storage, alongside a dApp Store which sits at the heart of the Phoenix ecosystem. A core part of the PhoenixDAO strategy is to actively on-board both individual developers and enterprise level corporations to build using the protocols to power their products. This will enhance decentralization, token utility and the overall ecosystem.

* Functions/Modules 
  - Admin
  - Auth
  - User
  - Proposal
  - Stake
  - Transaction
  - Cron
 
 Few keys that needed to be updated. Create .env file and update things that are mentioned below

* Updates Required
  - DATABASE_URL
  - private_key
  - SECRET_KEY
  - Attributes_DOC_ID
  - app_secret

Create these variables in your ".env" file and assign your values to these variables.


### Integrated Stack
  - Web3
  - Smartcontract
  - MetaMask
  - Numio


## File Structure
<pre>
app    
├── src  
│     └── main.ts  
│     └── app.controller.spec.ts  
│     └── app.controller.ts  
│     └── app.module.ts    
│     └── app.service.ts     
│     └── Admin    
│     |   ├── admin.service.ts    
│     |   ├── admin.controller.ts    
│     |   ├── admin.model.ts    
│     |   └── admin.module.ts
│     └── User 
│     |   ├── user.service.ts    
│     |   ├── user.controller.ts    
│     |   ├── user.model.ts    
│     |   └── user.module.ts
│     └── Auth    
│     |   ├── auth.service.ts    
│     |   ├── auth.controller.ts    
│     |   ├── auth.model.ts    
│     |   └── auth.module.ts
│     └── Proposal     
│     |   ├── proposal.service.ts    
│     |   ├── proposal.controller.ts    
│     |   ├── proposal.model.ts    
│     |   └── proposal.module.ts
│     └── Stake    
│     |   ├── stake.service.ts    
│     |   ├── stake.controller.ts    
│     |   ├── stake.model.ts    
│     |   └── stake.module.ts
│     └── Transaction    
│     |   ├── transaction.service.ts    
│     |   ├── transaction.controller.ts    
│     |   ├── transaction.model.ts    
│     |   └── transaction.module.ts
│     └── cron         
│         ├── cron.service.ts    
│         └── cron.module.ts   
└── gitignore  
└── package.json  
└── package-lock.json  
└── Readme.md  
└── nodeModules   
└── loggerMiddleware.ts
└── main.ts
└── .env  
</pre>
## App Link
[Pheonix-DAO Server](https://phoenix-dao-backend.herokuapp.com)

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```



## License

  Nest is [MIT licensed](LICENSE).
