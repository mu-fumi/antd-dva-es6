/**
 *
 * @copyright(c) 2017
 * @created by  Administrator
 * @package dbaas-ui
 * @version :  2017-12-29 11:03 $
 */

const path = require('path'),
    fs = require('fs'),
    process = require('process'),
    srcPath = path.join(__dirname, '../'),
    argv = process.argv;

if (argv.length < 5) {
    console.error(`Usage: replace.js file search [replace].\n file parent path is ${srcPath}, 
    replace can be use env var with`+ '`$ENV_VAR`');
    // console.log(argv)
    process.exit(1);
}

const file = path.join(srcPath, argv[2]),
    search = argv[3];

let replace = argv[4];

console.log(`get ==> file: ${file}, search: ${search}, replace: ${replace}`);

const replaceArr = [];
replace.split('`').map((v) => {
    const val = v.slice(1);
    if (v[0] === '$' &&  val in process.env) {
        v = process.env[val];
        console.log(`get env var: ${val}<==>${v}`);
    } else {
        console.log(`not find env var: ${val}`);
    }
    replaceArr.push(v);
});

console.log(`gen replace array: ${replaceArr}`);

replace = replaceArr.join('');


const stats = fs.lstatSync(file);

if (stats.isSymbolicLink() || !stats.isFile()) {
    console.error(`${file} can't be symbolic link or dir`);
    process.exit(1);
}

fs.readFile(file, "utf-8", function(err, text) {
    if (err) throw err;

    const regexp = new RegExp(search, 'gmi');

    console.log(`gen regexp: ${regexp}`);

    text = text.replace(regexp, replace);

    fs.writeFile(file, text, function(err) {
        if (err) throw err;
    });

    console.log(`${file} replace ${search} with ${replace} done.`);
});
