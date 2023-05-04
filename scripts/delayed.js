// eslint-disable-next-line import/no-cycle
import { sampleRUM } from './scripts.js';
import { clearProductCache } from '../utils/utils.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

// add more delayed functionality here

// clear products cache
clearProductCache();
