import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';
import {simulate,matched} from './src/simulation.js';
import {publicCombinations,CASES,responseLabel} from './src/catalog.js';
import {analyzeRun} from './src/analysis.js';
import {sweep} from './src/physics.js';
const config=JSON.parse(readFileSync(new URL('./data/vehicle.json',import.meta.url)));
const records=[];
for(const seed of [7,19,42,101,2026]){const byScenario=new Map();for(const combination of publicCombinations()){if(!byScenario.has(combination.scenario))byScenario.set(combination.scenario,matched({...combination,seed,config}));const runs=byScenario.get(combination.scenario),run=runs.find(r=>r.options.policy===combination.policy),audit=analyzeRun(run,runs);records.push({...combination,seed,purpose:CASES[combination.caseId].purpose,response:responseLabel(combination.caseId,combination.policy),decision:audit.title,summary:run.summary,events:run.events,requests:run.requests.map(({screen,...q})=>q)});}}
mkdirSync('results',{recursive:true});
writeFileSync('results/curated-combinations.json',JSON.stringify({version:'0.8.0',baseline:'B1',publicCases:4,combinations:publicCombinations().length,note:'Every public situation/variant/response combination is run for all five seeds. Legacy adversarial fixtures remain in tests, not the public menu.',records},null,2));
const keys=['caseId','scenario','intent','policy','response','seed','purpose','decision',...[...new Set(records.flatMap(r=>Object.keys(r.summary)))].filter(k=>k!=='policy')],cell=v=>'"'+String(v??'').replaceAll('"','""')+'"';
writeFileSync('results/curated-combinations.csv',[keys.map(cell).join(','),...records.map(r=>keys.map(k=>cell(r[k]??r.summary[k])).join(','))].join('\n')+'\n');
writeFileSync('results/envelope-sweep.json',JSON.stringify(sweep(config),null,2));
console.log(`${records.length} runs: ${publicCombinations().length} curated combinations × 5 seeds, plus 36 envelope points.`);
for(const [key,c] of Object.entries(CASES))console.log(key,records.filter(r=>r.caseId===key&&r.seed===42).map(r=>`${r.scenario}/${r.policy}: ${r.decision}; air ${r.summary.airUsed.toFixed(2)} s; impulse ${(r.summary.impulseUsed/1000).toFixed(1)} kN·s`).join(' | '));
