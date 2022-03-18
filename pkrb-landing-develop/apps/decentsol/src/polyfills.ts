/**
 * Polyfill stable language features. These imports will be optimized by `@babel/preset-env`.
 *
 * See: https://github.com/zloirock/core-js#babel
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { Buffer } from 'buffer';

(window as any).global = window;
global.Buffer = global.Buffer || Buffer;
global.process = require('process');
