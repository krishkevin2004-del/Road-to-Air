import {matched,simulate} from './simulation.js';
export function computeExperiment(options,includeStory=false,storyConfig=options.config){const runs=matched(options);return {runs,story:includeStory?simulate({scenario:'exit',seed:42,policy:'optional',intent:'convenience',consent:true,config:storyConfig}):null};}
