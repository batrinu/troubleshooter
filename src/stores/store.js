import { observable, action } from 'mobx';
import _ from 'lodash';
import { feathersClient } from './client';

class Store {

  service = null;
  serviceName = null;
  @observable errors = {};
  @observable entity = {};
  @observable entities = [];
  @observable loading = false;
  @observable redirect = false;

  constructor(serviceName) {
    this.service = feathersClient().service(serviceName);
    this.serviceName = serviceName;
    console.info("init store:", serviceName)
    this.service.on('patched', entity => {
      console.log(serviceName,'patched',entity)
    })
  }

  handleFeathersError = (err) => {
    if( err.code === 400) {
      let messages = [];
      _.each(err.errors, (value, key) => {
        messages.push(value.message);
      })
      this.errors = {global: err.message, messages}
    } else {
      this.errors = {global: err.message}
    }
  }

  @action
  fetchAll = () => {
    this.loading = true;
    this.errors = {};
    this.service.find({})
      .then(response => this.entities = response.data )
      .catch(err => this.handleFeathersError(err))
      .then(() => this.loading = false);
  }

  @action
  create = (entity) => {
    this.loading = true;
    this.errors = {};
    this.service.create(entity)
      .then(response => {
        this.entities.push(response)
        this.redirect = true;
      })
      .catch(err => this.handleFeathersError(err))
      .then(() => {
        this.loading = false;
        this.redirect = false;
      })
  }

  @action
  newEntity = () => {
    this.entity = {};
    this.errors = {};
  }

  @action
  fetch = (_id) => {
    this.loading = true;
    this.errors = {}
    this.service.get(_id)
      .then(response => this.entity = response)
      .catch(err => this.handleFeathersError(err))
      .then(() => this.loading = false)
  }

  @action
  update = (_id, entity) => {
    this.loading = true;
    this.errors = {};
    this.service.patch(_id, entity)
      .then(response => {
        this.entities = this.entities.map(item => item._id === entity._id ? entity : item);
        this.redirect = true;
      })
      .catch(err => this.handleFeathersError(err))
      .then(() => {
        this.loading = false;
        this.redirect = false;
      })
  }

  @action
  deleteOne = (_id) => {
    this.service.remove(_id)
      .then(response => {
        this.entities = this.entities.filter(item => item._id !== _id)
      })
      .catch(err => this.handleFeathersError(err))
  }

}

let stores = [];

export default function createStore(serviceName) {
  let instance = false;
  _.each(stores, store => instance  = store.serviceName === serviceName ? store : false)
  if(!instance) {
    instance = new Store(serviceName);
    stores.push(instance);
  }
  return instance;
}
