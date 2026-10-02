// Canonical lesson identities remain stable in receipts; display numbers are route-local.
export function routeCheckpoint(learningPath, lesson) {
 if(!Number.isInteger(lesson)||lesson<0||lesson>12)throw Error('Invalid canonical lesson');
 if(!['guided','application-mcp'].includes(learningPath))throw Error('Select a learning path');
 return {currentLesson:lesson,routeLesson:learningPath==='guided'?lesson:lesson<10?0:lesson-9};
}
export function canonicalLesson(learningPath, routeLesson) {
 if(!Number.isInteger(routeLesson)||routeLesson<0)throw Error('Invalid route lesson');
 if(learningPath==='guided'&&routeLesson<=12)return routeLesson;
 if(learningPath==='application-mcp'&&routeLesson<=3)return routeLesson===0?0:routeLesson+9;
 throw Error('Invalid route or route lesson');
}
