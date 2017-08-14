const winston = require('winston');

const timerTimeout = 1000;

const traceCaller = function(n) {
  if (isNaN(n) || n < 0)
    n = 1;
  n += 1;
  let s = (new Error()).stack;
  let a = s.indexOf('\n', 5);

  while (n--) {
    a = s.indexOf('\n', a + 1);
    if (a < 0) {
      a = s.lastIndexOf('\n', s.length);
      break;
    }
  }
  let b = s.indexOf('\n', a + 1);
  if (b < 0)
    b = s.length;
  a = Math.max(s.lastIndexOf(' ', b), s.lastIndexOf('/', b));
  b = s.lastIndexOf(':', b);
  s = s.substring(a + 1, b);
  return s;
};

const processArguments_ = function(args) {
  for (let i = 0 ; args.length > i ; ++i) {
    if (args[i]) {
      if (args[i].constructor === Error)
        args[i] = args[i].stack;
      else if (args[i].constructor === Object ||
               args[i].constructor === Array) {
        if (({}).hasOwnProperty.call(args[i], 'toString'))
          args[i] = args[i].toString();
        else
          args[i] = JSON.stringify(args[i]);
      }
      else if (({}).hasOwnProperty.call(args[i], 'toString'))
        args[i] = args[i].toString();
    }
  }
  return args;
};

const log = function() {
  const args = processArguments_(arguments);
  return winston.info(' ' + (global.processId ? global.processId + ', ' : '') + traceCaller(1) + ': ' + Array.prototype.slice.call(args).join(' '));
};

const info = function() {
  const args = processArguments_(arguments);
  return winston.info(' ' + (global.processId ? global.processId + ', ' : '') + traceCaller(1) + ': ' + Array.prototype.slice.call(args).join(' '));
};

const verbose = function() {
  const args = processArguments_(arguments);
  return winston.verbose(' ' + (global.processId ? global.processId + ', ' : '') + traceCaller(1) + ': ' + Array.prototype.slice.call(args).join(' '));
};

const debug = function() {
  const args = processArguments_(arguments);
  return winston.debug((global.processId ? global.processId + ', ' : '') + traceCaller(1) + ': ' + Array.prototype.slice.call(args).join(' '));
};

const silly = function() {
  const args = processArguments_(arguments);
  return winston.silly((global.processId ? global.processId + ', ' : '') + traceCaller(1) + ': ' + Array.prototype.slice.call(args).join(' '));
};

const warn = function() {
  const args = processArguments_(arguments);
  return winston.warn(' ' + (global.processId ? global.processId + ', ' : '') + traceCaller(1) + ': ' + Array.prototype.slice.call(args).join(' '));
};

const error = function() {
  const args = processArguments_(arguments);
  return winston.error((global.processId ? global.processId + ', ' : '') + traceCaller(1) + ': ' + Array.prototype.slice.call(args).join(' '));
};

let times = [];
let timesIdx = [];
const time = function(timeName) {
  timesIdx.push(timeName);
  times[timesIdx.length - 1] = new Date();
};
const timeEnd = function(timeName) {
  const now = new Date();

  let t;
  for (let i = times.length - 1 ; 0 <= i ; --i) {
    t = times[i];
    if (timerTimeout <= (now - t)) {
      verbose(timesIdx[i], 'timer timed out, started', t.toISOString());
      times.splice(i, 1);
    }
  }

  const idx = timesIdx.indexOf(timeName);
  if (-1 === idx)
    return ;

  verbose(timeName + ':', (now - times[idx]) + 'ms');

  timesIdx.splice(idx, 1);
  times.splice(idx, 1);
};

module.exports = {
  log:          log,
  info:         info,
  verbose:      verbose,
  debug:        debug,
  silly:        silly,
  warn:         warn,
  error:        error,

  time:         time,
  timeEnd:      timeEnd,
};

winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {level: 'silly', prettyPrint: true, colorize: true, timestamp: true});
