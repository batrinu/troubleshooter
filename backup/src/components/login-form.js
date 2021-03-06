import React, { Component } from 'react';
import { Form, Button, Message } from 'semantic-ui-react';
import { observer } from 'mobx-react';
import MobxReactForm from 'mobx-react-form';
import validatorjs from 'validatorjs';
import InputField from './input-field';
import authStore from '../stores/auth-store';

const fields = {
  email: {
    name: 'email',
    label: 'Email',
    placeholder: 'Email',
    type: 'email',
    rules:'email|string|required'
  },
  password: {
    name: 'password',
    label: 'Password',
    placeholder: 'Password',
    type: 'password',
    rules:'string|required'
  }
}

class MobxForm extends MobxReactForm {
  onSuccess(form) {
    authStore.login(form.values())
  }
}

@observer
class LoginForm extends Component {

  form = null;

  componentWillMount() {
    const plugins = { dvr: validatorjs };
    this.form = new MobxForm({fields},{plugins});
  }

  render() {
    const form = this.form;

    const errorMessage = (
      <Message icon negative>
        <Message.Content>
           {authStore.errors.global}
       </Message.Content>
      </Message>
    );

    return (
      <div>
        <h1>Login</h1>
        {authStore.errors.global && errorMessage}
        <Form onSubmit={form.onSubmit} loading={authStore.loading}>
          <InputField field={form.$('email')} />
          <InputField field={form.$('password')} />
          <Button primary disabled={form.isPristine}>Sign In</Button>
        </Form>
      </div>
    );
  }
}

export default LoginForm
