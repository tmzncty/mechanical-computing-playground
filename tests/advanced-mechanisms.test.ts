import { describe, expect, it } from 'vitest';
import { createRevolutionCounter, crankRevolution, InvalidRevolutionCounterError, reduceRevolution } from '../src/mechanisms/revolution-counter';
import { createIntegrator, integrate } from '../src/mechanisms/continuous-integrator';
import { createPhaseMachine, runPhaseCycle, stepPhase, STAGE_A_PHASES } from '../src/backprop/core/phase-machine';
import { evaluate } from '../src/backprop/core/stage-a';

describe('shared mechanisms',()=>{
 it('counts and replays revolutions',()=>{const a=createRevolutionCounter(2); const b=crankRevolution(a); expect(b.event).toEqual({ type: 'REVOLUTION', sequence: 2, before: 2, after: 3 }); expect(reduceRevolution(a,b.event)).toEqual(b.state);});
 it('rejects a crank that would leave the safe integer range',()=>{expect(()=>crankRevolution(createRevolutionCounter(Number.MAX_SAFE_INTEGER))).toThrow(InvalidRevolutionCounterError);});
 it.each([-1, 1.5, Number.MAX_SAFE_INTEGER + 1, Number.NaN, Number.POSITIVE_INFINITY])('rejects invalid initial count %s',(count)=>{expect(()=>createRevolutionCounter(count)).toThrow(InvalidRevolutionCounterError);});
 it.each(['unknown','sequence','before','after','invalid-state'] as const)('rejects %s revolution replay tampering',(kind)=>{const state=createRevolutionCounter(); const { event }=crankRevolution(state); const tampered={...event} as { type: string; sequence: number; before: number; after: number }; if(kind==='unknown')tampered.type='UNKNOWN'; if(kind==='sequence')tampered.sequence=1; if(kind==='before')tampered.before=1; if(kind==='after')tampered.after=2; const replayState=kind==='invalid-state'?{count:-1}:state; expect(()=>reduceRevolution(replayState,tampered as never)).toThrow(InvalidRevolutionCounterError);});
 it('snapshots an accessor-backed state count once before cranking',()=>{let reads=0; const state={get count(){reads+=1; return reads<=2?0:Number.MAX_SAFE_INTEGER;}}; expect(crankRevolution(state)).toEqual({state:{count:1},event:{type:'REVOLUTION',sequence:0,before:0,after:1}}); expect(reads).toBe(1);});
 it('snapshots accessor-backed event fields once before reducing',()=>{let afterReads=0; const event={type:'REVOLUTION' as const,sequence:0,before:0,get after(){afterReads+=1; return afterReads<=2?1:Number.MAX_SAFE_INTEGER+1;}}; expect(reduceRevolution(createRevolutionCounter(),event)).toEqual({count:1}); expect(afterReads).toBe(1);});
 it('integrates a constant shaft input',()=>{let s=createIntegrator(2,.5); for(let i=0;i<4;i++) s=integrate(s); expect(s.integratedQuantity).toBe(4);});
 it('runs the same explicit phase cycle',()=>{const m=runPhaseCycle(createPhaseMachine(evaluate({x1:2,x2:3,w1:0,w2:0,target:10,learningRate:.01}))); expect(m.events.map(e=>e.phase)).toEqual(STAGE_A_PHASES); expect(m.state.loss).toBeLessThan(50);});
 it('finishes a partially stepped cycle without entering the next cycle',()=>{
   const initial=createPhaseMachine(evaluate({x1:2,x2:3,w1:0,w2:0,target:10,learningRate:.01}));
   let partial=initial;
   for(let i=0;i<3;i+=1) partial=stepPhase(partial);
   const completed=runPhaseCycle(partial);
   expect(completed.phaseIndex).toBe(0);
   expect(completed.events.map(e=>e.phase)).toEqual(STAGE_A_PHASES);
   expect(completed.state.loss).toBeLessThan(initial.state.loss);
 });
});
