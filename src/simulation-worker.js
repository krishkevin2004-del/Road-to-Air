import {computeExperiment} from './experiment.js';
self.onmessage=({data})=>{try{const start=performance.now(),result=computeExperiment(data.options,data.includeStory,data.storyConfig);self.postMessage({id:data.id,...result,computeMs:performance.now()-start});}catch(error){self.postMessage({id:data.id,error:error.message});}};
