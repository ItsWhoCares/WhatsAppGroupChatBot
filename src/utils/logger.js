/**
 * Simple timestamped logger
 * @param  {...any} args
 */
export function log(...args) {
    console.log(new Date().toISOString(), ...args);
}
