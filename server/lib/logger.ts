const SOC_LOG_LEVEL = <LogLevel>process.env['SOC_LOG_LEVEL'];
const REST_LOG_LEVEL = <LogLevel>process.env['REST_LOG_LEVEL'];
const SORT_LOG_LEVEL = <LogLevel>process.env['SORT_LOG_LEVEL'];

export type LogLevel = 'debug'|'info'|'warn'|'error';
export type Service = 'rest'|'socket'|'sort';

export class Logger {
  level = {
    'rest': REST_LOG_LEVEL,
    'socket': SOC_LOG_LEVEL,
    'sort': SORT_LOG_LEVEL
  };
  service: Service;

  constructor(service: Service) {
    this.service = service;
  }

  public setLogLevel = (level: LogLevel) => this.level[this.service] = level;

  public getLogLevel = (): LogLevel => this.level[this.service];

  public debug = (...args: any) => ['debug'].indexOf(this.getLogLevel()) !== -1 ? console.log(...args) : null;

  public info = (...args: any) => ['debug', 'info'].indexOf(this.getLogLevel()) !== -1 ? console.info(...args) : null;

  public warn = (...args: any) => ['debug', 'info', 'warning'].indexOf(this.getLogLevel()) !== -1 ? console.warn(...args) : null;

  public error = (...args: any) => ['debug', 'info', 'warning', 'error'].indexOf(this.getLogLevel()) !== -1 ? console.error(...args) : null;
  
}