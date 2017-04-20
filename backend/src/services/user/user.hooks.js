'use strict';

const { authenticate } = require('feathers-authentication').hooks;
const commonHooks = require('feathers-hooks-common');
const { restrictToRoles } = require('feathers-authentication-hooks');
const local = require('feathers-authentication-local');
const hooks = require('feathers-authentication-hooks');
const { iff, iffElse } = require('feathers-hooks-common');

const isAuthenticated = () => hook => hook.params.user != null;
const isAdmin = () => hook => hook.params.user.role === 'admin';

const restrict = [
  authenticate('jwt'),
  restrictToRoles({
    roles: ['admin'],
    fieldName: 'role',
    idField: '_id',
    ownerField: '_id',
    owner: true
  })
];

const restrictAdmin = restrictToRoles({
  roles: ['admin'],
  fieldName: 'role',
});

const restrictOwner = hooks.restrictToOwner({
  idField: '_id', ownerField: '_id'
});

const restrictRoleField = () => {
  return hook => {
    if(hook.params.user.role !== 'admin') {
      delete hook.data.role;
    }
    return Promise.resolve(hook);
  };
};

const restrictAdminOrOwner = iff(isAuthenticated(),
  iffElse(isAdmin(),
    [restrictAdmin],
    [restrictOwner])
);

module.exports = {
  before: {
    all: [],
    find: [restrictAdminOrOwner],
    get: [ ...restrict ],
    create: [ local.hooks.hashPassword(), restrictAdmin ],
    update: [ ...restrict ],
    patch: [ ...restrict, restrictRoleField() ],
    remove: [ ...restrict ]
  },

  after: {
    all: [
      commonHooks.when(
        hook => hook.params.provider,
        commonHooks.discard('password')
      )
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
