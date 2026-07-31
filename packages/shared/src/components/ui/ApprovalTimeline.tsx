import React from 'react';
import { CheckCircle2, Circle, Clock, XCircle } from 'lucide-react';
import { APPROVAL_STAGES_CONFIG } from '../../constants/approval';
import { ApprovalStageRecord } from '../../types';

export interface ApprovalTimelineProps {
  currentStage: number;
  finalStatus: 'pending' | 'approved' | 'rejected';
  stages?: ApprovalStageRecord[];
  stage3Department?: string;
}

export const ApprovalTimeline: React.FC<ApprovalTimelineProps> = ({
  currentStage,
  finalStatus,
  stages = [],
  stage3Department,
}) => {
  const allStages = [1, 2, 3, 4, 5, 6];

  return (
    <div className="py-4">
      <div className="flex items-center justify-between relative">
        {/* Connecting line */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-800 -z-0" />

        {allStages.map((stageNum) => {
          const isDone = stageNum < currentStage || (stageNum === 6 && finalStatus === 'approved');
          const isCurrent = stageNum === currentStage && finalStatus === 'pending';
          const isRejected = finalStatus === 'rejected' && stageNum === currentStage;
          const stageRecord = stages.find((s) => s.stageNumber === stageNum);

          let stageLabel = APPROVAL_STAGES_CONFIG[stageNum];
          if (stageNum === 3 && stage3Department) {
            stageLabel = `${stage3Department} Dept`;
          }

          return (
            <div key={stageNum} className="flex flex-col items-center relative z-10 bg-slate-900 px-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center border transition-all">
                {isRejected ? (
                  <XCircle className="w-6 h-6 text-red-400 bg-slate-900 rounded-full" />
                ) : isDone ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 bg-slate-900 rounded-full" />
                ) : isCurrent ? (
                  <Clock className="w-6 h-6 text-amber-400 animate-pulse bg-slate-900 rounded-full" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-600 bg-slate-900 rounded-full" />
                )}
              </div>
              <span className={`text-[10px] mt-1.5 font-medium max-w-[70px] text-center leading-tight ${
                isDone ? 'text-emerald-400' : isCurrent ? 'text-amber-400 font-semibold' : isRejected ? 'text-red-400' : 'text-slate-500'
              }`}>
                {stageLabel}
              </span>
              {stageRecord?.actionedByName && (
                <span className="text-[9px] text-slate-400 truncate max-w-[60px]">
                  {stageRecord.actionedByName}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
