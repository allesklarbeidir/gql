/* @flow */
import Emitter, { type EmitterSubscription } from './emitter';
import defer from './defer';

export default class GQLBaseService {
  _emitter: Emitter = new Emitter();
  _isRunning: boolean = false;
  _onReady = defer<void>();
  _name: string;

  _triggerError = (err: Error) => this._emitter.emit('error', err);
  _triggerChange = () => this._emitter.emit('change');

  onChange(listener: () => void): EmitterSubscription {
    return this._emitter.addListener('change', listener);
  }

  onError(listener: (err: Error) => any): EmitterSubscription {
    return this._emitter.addListener('error', listener);
  }

  _catchThrownErrors = <T>(fn: () => T, defaultValue: T): T => {
    try {
      return fn();
    } catch (err) {
      this._triggerError(err);
      return defaultValue;
    }
  };

  isRunning() {
    return this._isRunning;
  }

  onReady(): Promise<void> {
    return this._onReady.promise;
  }

  async _handleStart() {
    await Promise.reject(
      new Error(
        'You must implement _handleStart when extending GQLBaseService',
      ),
    );
  }

  async _handleStop() {
    await Promise.reject(
      new Error('You must implement _handleStop when extending GQLBaseService'),
    );
  }

  async start(): Promise<void> {
    if (this._isRunning) {
      throw new Error(
        `Trying to start service '${this._name}' which is already running`,
      );
    }
    await this._handleStart();
    this._onReady.resolve();
    this._isRunning = true;
  }

  async stop(): Promise<void> {
    if (!this._isRunning) {
      throw new Error(
        `Trying to stop service '${this._name}' which is already stopped.`,
      );
    }
    await this._handleStop();
    this._isRunning = false;
  }
}
