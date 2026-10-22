import {cp, mkdir, readdir, rm} from 'node:fs/promises';
import {resolve} from 'node:path';
const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'dist');
await rm(output, {recursive:true, force:true});
await mkdir(output, {recursive:true});
for (const path of ['index.html', 'style.css', 'assets', 'src', 'data']) {
  await cp(resolve(root,path), resolve(output,path), {recursive:true});
}
await mkdir(resolve(output,'docs'), {recursive:true});
for (const name of await readdir(resolve(root,'docs'))) {
  if (name.endsWith('.md')) await cp(resolve(root,'docs',name),resolve(output,'docs',name));
}
await cp(resolve(root,'Road_to_Air_Project_Brief.md'),resolve(output,'Road_to_Air_Project_Brief.md'));
await cp(resolve(root,'results'),resolve(output,'results'),{recursive:true});
console.log('Static site built in dist/');
