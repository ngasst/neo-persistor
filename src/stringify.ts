export function stringify(object: Object) {
    let str: string = JSON.stringify(object);
    let parsed = str.replace(new RegExp(/"(\w+)"\s*:/g), '$1:');
    let stripped = parsed.indexOf('timestamp?') ? parsed.replace('\"timestamp()\"', 'timestamp()') : parsed;
    return stripped;
}