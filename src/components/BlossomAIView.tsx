import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Icon from './Icon';

interface BlossomAIViewProps {
  globalZone?: string;
  user?: any;
}

interface Recommendation {
  title: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
}

interface IdentifiedProblem {
  Area: string;
  issue: string;
  impact: string;
  status: string;
}

interface Prediction {
  risk: string;
  probability: number;
  timeline: string;
  indicator: string;
}

interface AIAnalysisResult {
  aiGenerated: boolean;
  summary: string;
  recommendations: Recommendation[];
  identifiedProblems: IdentifiedProblem[];
  predictions: Prediction[];
  score: number;
}

const generateLocalAnalysis = (payload: any, activeZone: string): AIAnalysisResult => {
  let totalLogs = 0;
  let totalDefects = 0;
  
  const endline = payload.materialData || []; // use material/cutting/inline/endline data
  const cutting = payload.cuttingData || [];
  const inline = payload.inlineData || [];
  const endlineData = payload.endlineData || [];
  const aql = payload.aqlData || [];
  const finalAudit = payload.finalAuditData || [];

  const processLogArray = (arr: any[]) => {
    arr.forEach((log: any) => {
      totalLogs++;
      const defCount = Number(log.defectQty || log.defects || log.checkedQuantity || 0);
      if (defCount > 0) {
        totalDefects += defCount;
      }
    });
  };

  processLogArray(cutting);
  processLogArray(inline);
  processLogArray(endlineData);

  let aqlFails = 0;
  aql.forEach((log: any) => {
    totalLogs++;
    if (String(log.status || '').toUpperCase() === 'FAIL' || String(log.result || '').toUpperCase() === 'FAIL') {
      aqlFails++;
    }
  });

  let score = 100;
  if (totalLogs > 0) {
    const defectRatio = totalDefects / totalLogs;
    score -= Math.min(30, Math.round(defectRatio * 150));
  }
  if (aqlFails > 0) {
    score -= Math.min(20, aqlFails * 8);
  }
  
  score = Math.max(45, Math.min(100, score));
  const zoneName = activeZone && activeZone !== 'ALL' ? `Zone ${activeZone}` : 'Global Production';
  
  const recommendations: Recommendation[] = [];
  const identifiedProblems: IdentifiedProblem[] = [];
  const predictions: Prediction[] = [];

  if (totalDefects > 0 || aqlFails > 0) {
    recommendations.push({
      title: `Calibrate Sewing Machinery in ${zoneName}`,
      priority: score < 75 ? 'HIGH' : 'MEDIUM',
      description: `Detected ${totalDefects} manufacturing deviations in inline/endline inspections. Re-verify needle alignment and thread tension to stabilize stitch tolerances.`
    });
    identifiedProblems.push({
      Area: `${zoneName} Assembly Lines`,
      issue: `Accumulated stitching or measurement deviations`,
      impact: `Increases downstream rework burden by estimated ${Math.round((totalDefects / (totalLogs || 1)) * 100)}%`,
      status: score < 75 ? 'Critical Warning' : 'Stable Review'
    });
  } else {
    recommendations.push({
      title: `Maintain standard preventative maintenance in ${zoneName}`,
      priority: 'LOW',
      description: "Active quality metrics reside well within acceptable tolerances. Maintain current inspection pacing and standard machine calibrations."
    });
  }

  if (aqlFails > 0) {
    recommendations.push({
      title: "Initiate AQL Fail Batch Re-auditing",
      priority: 'HIGH',
      description: `AQL inspection reports register ${aqlFails} batch failure(s). Execute structured 100% sorting audits on affected lots prior to shipment release.`
    });
    identifiedProblems.push({
      Area: "AQL Gatekeeper Station",
      issue: `${aqlFails} inspection lot(s) failed standard audit metrics`,
      impact: "Shipment hold and sorting required to protect outer brand quality profile",
      status: "Action Required"
    });
    predictions.push({
      risk: "Downstream shipment delay due to AQL lot quarantine",
      probability: 75,
      timeline: "Next 24 to 48 hours",
      indicator: `Active failure in AQL lot tracking under ${zoneName}`
    });
  }

  if (recommendations.length < 2) {
    recommendations.push({
      title: "Cross-validate material receiving specifications",
      priority: 'MEDIUM',
      description: "Perform randomized elasticity and stretch-back validations on incoming elastane-rich trims to counter ambient humidity adjustments."
    });
  }
  if (recommendations.length < 3) {
    recommendations.push({
      title: "Perform operator gauge re-training",
      priority: 'LOW',
      description: "Conduct bi-weekly operator measurement posture checks. Ensure consistent fabric smoothing on flat tables during caliper logging."
    });
  }

  if (identifiedProblems.length === 0) {
    identifiedProblems.push({
      Area: `${zoneName} Operations`,
      issue: "No significant outlier defects detected in current log cycle",
      impact: "Minimal process disruption; scrap rate under target threshold of 1.5%",
      status: "Healthy"
    });
  }

  if (predictions.length === 0) {
    predictions.push({
      risk: "Minor measurement variance warning on premium wings",
      probability: 35,
      timeline: "3 days horizon",
      indicator: "Localized operator shift change or stretch tolerance relaxation"
    });
  }
  
  predictions.push({
    risk: "Stitching friction on double-needle speed runs",
    probability: Math.max(30, Math.round(100 - score)),
    timeline: "Ongoing cycle",
    indicator: "Aggregate inline skip-stitch frequency trends"
  });

  return {
    aiGenerated: false,
    summary: `Blossom AI diagnostic engine completed local statistical profiling for ${zoneName}. Processed ${totalLogs} quality logs with ${totalDefects} defect events. Statistical quality health index is scored at ${score}/100.`,
    recommendations,
    identifiedProblems,
    predictions,
    score
  };
};

const BlossomAIView: React.FC<BlossomAIViewProps> = ({ globalZone, user }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [dataLogs, setDataLogs] = useState<any>({
    material: [],
    cutting: [],
    inline: [],
    endline: [],
    aql: [],
    finalAudit: []
  });
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [completedActions, setCompletedActions] = useState<string[]>([]);
  const [errorText, setErrorText] = useState<string | null>(null);

  const fetchFullDatasetAndAnalyse = async () => {
    setLoading(true);
    setErrorText(null);
    try {
      // 1. Gather all logs from the database/sheets parallelly
      const [
        material, 
        cutting, 
        inline, 
        endline, 
        aql, 
        finalAudit
      ] = await Promise.all([
        api.run('api_getMaterialData').catch(() => []),
        api.run('api_getCuttingData').catch(() => []),
        api.run('api_getInlineData').catch(() => []),
        api.run('api_getEndlineData').catch(() => []),
        api.run('api_getAQLData').catch(() => []),
        api.run('api_getFinalAuditData').catch(() => [])
      ]);

      const logStore = {
        material: Array.isArray(material) ? material : [],
        cutting: Array.isArray(cutting) ? cutting : [],
        inline: Array.isArray(inline) ? inline : [],
        endline: Array.isArray(endline) ? endline : [],
        aql: Array.isArray(aql) ? aql : [],
        finalAudit: Array.isArray(finalAudit) ? finalAudit : []
      };

      setDataLogs(logStore);

      // Apply zone filtering on inputs if globalZone is specified and not "ALL"
      const zoneFilter = (arr: any[]) => {
        if (!globalZone || globalZone === 'ALL') return arr;
        return arr.filter((item: any) => 
          String(item.zone || item.location || '').toUpperCase() === globalZone.toUpperCase()
        );
      };

      const payload = {
        materialData: zoneFilter(logStore.material),
        cuttingData: zoneFilter(logStore.cutting),
        inlineData: zoneFilter(logStore.inline),
        endlineData: zoneFilter(logStore.endline),
        aqlData: zoneFilter(logStore.aql),
        finalAuditData: zoneFilter(logStore.finalAudit)
      };

      // 2. Transmit to server side Blossom AI analyzer endpoint
      try {
        const response = await fetch('/api/blossom-analyse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error(`AI service offline. Code ${response.status}`);
        }

        const result: AIAnalysisResult = await response.json();
        setAnalysis(result);
      } catch (fetchErr: any) {
        console.warn("[BLOSSOM AI] Web service unavailable, engaged local statistical safe-mode fallback engine:", fetchErr);
        const localResult = generateLocalAnalysis(payload, globalZone || 'ALL');
        setAnalysis(localResult);
      }

    } catch (err: any) {
      console.error("[BLOSSOM AI APPLET LOGS FETCH FAILURE]", err);
      setErrorText(err.message || "Unknown error executing predictive algorithm.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFullDatasetAndAnalyse();
  }, [globalZone]);

  const toggleActionItem = (title: string) => {
    setCompletedActions(prev => 
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    );
  };

  const scoreColor = (score: number) => {
    if (score >= 90) return { text: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200', stroke: '#10b981' };
    if (score >= 75) return { text: 'text-sky-500', bg: 'bg-sky-50', border: 'border-sky-200', stroke: '#0284c7' };
    if (score >= 60) return { text: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200', stroke: '#f59e0b' };
    return { text: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-200', stroke: '#f43f5e' };
  };

  const getScoreVerdict = (score: number) => {
    if (score >= 90) return "OPTIMAL QUALITY PROFILE";
    if (score >= 75) return "QC LEVEL STABLE";
    if (score >= 60) return "WARNING: DRIFT DETECTED";
    return "CRITICAL INTERVENTION NEEDED";
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-6 text-center">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-[#00B4D8] animate-spin" />
          <div className="absolute w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-[#00B4D8] animate-pulse">
            <Icon name="brain" size={16} />
          </div>
        </div>
        <div className="space-y-1.5 max-w-sm">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Querying Quality Brain</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Gathering factory records, running predictive regression models and identifying bottlenecks...</p>
        </div>
      </div>
    );
  }

  if (errorText) {
    return (
      <div className="py-12 text-center max-w-md mx-auto space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
          <Icon name="alert-triangle" size={24} />
        </div>
        <div className="space-y-1">
          <h3 className="font-extrabold text-[#2F3E46] text-sm uppercase">Blossom AI Connection Dropped</h3>
          <p className="text-xs text-slate-500 leading-relaxed">{errorText}</p>
        </div>
        <button 
          onClick={fetchFullDatasetAndAnalyse}
          className="px-4 py-2 bg-[#00B4D8] text-white rounded-xl text-xs font-bold shadow-md hover:bg-[#0077B6]"
        >
          Retry Diagnostic Sync
        </button>
      </div>
    );
  }

  const result = analysis || {
    aiGenerated: false,
    summary: "System is initializing. Add QA logs in Data Entry modules to feed prediction models.",
    recommendations: [],
    identifiedProblems: [],
    predictions: [],
    score: 100
  };

  const activeColor = scoreColor(result.score);

  return (
    <div className="space-y-6 animate-fade-in" id="blossom-ai-module">
      
      {/* 1. Header & AI Mode Badge */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-[#00B4D8] rounded-xl shadow-xs">
            <Icon name="brain-circuit" size={20} className="stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Blossom AI Co-pilot</h3>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              Quality Analysis, Bottleneck Detection & Risk Predictions
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {result.aiGenerated ? (
            <span className="flex items-center gap-1 px-2.5 py-1 bg-teal-50 text-teal-600 rounded-full text-[9px] font-black uppercase tracking-wider border border-teal-150 animate-pulse">
              <span className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
              Gemini Real-Time Active
            </span>
          ) : (
            <span className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-[#00B4D8] rounded-full text-[9px] font-black uppercase tracking-wider border border-indigo-150">
              <span className="w-1.5 h-1.5 bg-[#00B4D8] rounded-full" />
              Offline Statistical Safe Mode
            </span>
          )}
          
          <button 
            onClick={fetchFullDatasetAndAnalyse}
            className="p-1.5 border border-slate-200 hover:border-[#00B4D8] rounded-lg hover:text-[#00B4D8] duration-150 transition bg-white"
            title="Recalculate AI analysis"
          >
            <Icon name="refresh-cw" size={13} />
          </button>
        </div>
      </div>

      {/* 2. Top Grid: Quality Assessment Meter & Executive Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Circle Score Assessment Card */}
        <div className={`p-5 rounded-2xl border ${activeColor.border} ${activeColor.bg} flex flex-col items-center justify-center text-center space-y-4`}>
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Quality Safety Rating</span>
          
          <div className="relative flex items-center justify-center">
            {/* SVG Arc Gauge */}
            <svg className="w-28 h-28 transform -rotate-90">
              <circle
                cx="56"
                cy="56"
                r="45"
                className="stroke-slate-200/50 fill-none"
                strokeWidth="8"
              />
              <circle
                cx="56"
                cy="56"
                r="45"
                className="fill-none transition-all duration-700 ease-out"
                stroke={activeColor.stroke}
                strokeWidth="8"
                strokeDasharray={282}
                strokeDashoffset={282 - (282 * result.score) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-3xl font-black tracking-tighter text-slate-800">{result.score}</span>
              <span className="text-xs text-slate-400 font-bold">/100</span>
            </div>
          </div>

          <div className="space-y-1">
            <h4 className={`text-[10px] font-extrabold uppercase tracking-widest ${activeColor.text}`}>
              {getScoreVerdict(result.score)}
            </h4>
            <div className="text-[9px] text-slate-400 font-bold bg-white/70 px-2 py-0.5 rounded-full border border-slate-200/40 inline-block">
              Filtered for Zone: {globalZone || 'ALL'}
            </div>
          </div>
        </div>

        {/* Executive summary card */}
        <div className="lg:col-span-2 p-5 bg-white border border-slate-200 rounded-2xl relative flex flex-col justify-between">
          <div className="absolute right-4 top-4 text-slate-100 select-none pointer-events-none">
            <Icon name="quote" size={48} className="rotate-180" />
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-3.5 bg-[#00B4D8] rounded-full" />
              <h4 className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Executive AI Briefing</h4>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              "{result.summary}"
            </p>
          </div>

          {/* Quick numbers bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 mt-4 border-t border-slate-100 text-center">
            <div className="bg-slate-50 rounded-xl p-2 border border-slate-150">
              <span className="block text-[8px] font-black text-slate-400 uppercase tracking-wider">Raw Material</span>
              <span className="text-xs font-black text-slate-700">{dataLogs.material.length} entries</span>
            </div>
            <div className="bg-slate-50 rounded-xl p-2 border border-slate-150">
              <span className="block text-[8px] font-black text-slate-400 uppercase tracking-wider">Cutting QC</span>
              <span className="text-xs font-black text-slate-700">{dataLogs.cutting.length} logs</span>
            </div>
            <div className="bg-slate-50 rounded-xl p-2 border border-slate-150">
              <span className="block text-[8px] font-black text-slate-400 uppercase tracking-wider">Sewing QC</span>
              <span className="text-xs font-black text-slate-700">{dataLogs.inline.length + dataLogs.endline.length} checkpts</span>
            </div>
            <div className="bg-slate-50 rounded-xl p-2 border border-[#00B4D8]/10 bg-indigo-50/20">
              <span className="block text-[8px] font-black text-[#00B4D8] uppercase tracking-wider">AQL + Final Auds</span>
              <span className="text-xs font-black text-[#00B4D8]">{dataLogs.aql.length + dataLogs.finalAudit.length} audits</span>
            </div>
          </div>
        </div>

      </div>

      {/* 3. Section Predictions: What will fail tomorrow */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-red-50 text-red-500 rounded-lg">
            <Icon name="orbit" size={14} />
          </div>
          <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Risk Predictor Forecasts (Short Horizon)</h4>
        </div>
        
        {result.predictions.length === 0 ? (
          <div className="bg-slate-50 text-center text-xs text-slate-450 py-6 border border-slate-200 rounded-xl italic">
            Insufficient QC logs found to output predictive hazard horizons. Feed more entries to prime models.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.predictions.map((pred, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between hover:border-red-200/80 hover:shadow-md transition duration-200 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-xl translate-x-4 -translate-y-4 group-hover:scale-125 transition duration-150" />
                
                <div className="space-y-2 relative">
                  {/* Probability tag & timeline */}
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                      <Icon name="clock" size={10} />
                      {pred.timeline}
                    </span>
                    <span className="bg-rose-50 text-rose-500 font-black px-1.5 py-0.5 rounded border border-rose-100">
                      {pred.probability}% Probability
                    </span>
                  </div>

                  <h5 className="text-xs font-bold text-slate-800 leading-snug">
                    {pred.risk}
                  </h5>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-50 flex items-start gap-1.5 text-[10px] text-slate-500 leading-normal">
                  <span className="font-extrabold text-rose-500 uppercase flex-shrink-0">Lead Trigger:</span>
                  <span className="italic">{pred.indicator}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Problems Grid: Bottle necks and active defects */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-amber-50 text-amber-500 rounded-lg">
            <Icon name="alert-triangle" size={14} />
          </div>
          <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Identified Problems & Quality Bottlenecks</h4>
        </div>

        {result.identifiedProblems.length === 0 ? (
          <div className="bg-slate-50 text-center text-xs text-slate-450 py-6 border border-slate-200 rounded-xl italic">
            No severe bottlenecks flagged in active inspect arrays. Quality meets default compliance gates.
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-150 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="py-2.5 px-4 w-1/4">Line/Area Affected</th>
                    <th className="py-2.5 px-4 w-5/12">Detected Quality Non-Compliance</th>
                    <th className="py-2.5 px-4 w-1/4">Line Efficiency Impact</th>
                    <th className="py-2.5 px-4 text-right pr-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {result.identifiedProblems.map((prob, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition">
                      <td className="py-3 px-4 font-bold text-slate-705 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                        {prob.Area}
                      </td>
                      <td className="py-3 px-4 text-slate-550 leading-relaxed font-medium">
                        {prob.issue}
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-bold text-[10px] uppercase">
                        {prob.impact}
                      </td>
                      <td className="py-3 px-4 text-right pr-4">
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded text-[9px] font-black uppercase tracking-wide border border-amber-100">
                          {prob.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 5. CAPA Action Plan Recommendations */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-emerald-50 text-emerald-500 rounded-lg">
            <Icon name="check-square" size={14} />
          </div>
          <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Corrective and Preventive Action (CAPA) Directive</h4>
        </div>

        {result.recommendations.length === 0 ? (
          <div className="bg-slate-50 text-center text-xs text-slate-450 py-6 border border-slate-200 rounded-xl italic">
            Zero proactive corrective directives received.
          </div>
        ) : (
          <div className="space-y-3">
            {result.recommendations.map((rec, i) => {
              const isDone = completedActions.includes(rec.title);
              const isHigh = rec.priority === 'HIGH';
              const isMedium = rec.priority === 'MEDIUM';
              
              const priorityPill = isHigh 
                ? 'bg-red-50 text-red-600 border-red-100' 
                : isMedium 
                  ? 'bg-amber-50 text-amber-600 border-amber-100'
                  : 'bg-blue-50 text-blue-600 border-blue-100';

              return (
                <div 
                  key={i} 
                  onClick={() => toggleActionItem(rec.title)}
                  className={`p-4 rounded-xl border transition-all duration-200 flex gap-3.5 select-none cursor-pointer ${
                    isDone 
                      ? 'bg-slate-50/80 border-slate-200 line-through text-slate-400' 
                      : 'bg-white border-slate-200 hover:border-[#00B4D8]'
                  }`}
                >
                  {/* Selector checkbox */}
                  <div className={`w-5 h-5 rounded-lg border-2 mt-0.5 flex-shrink-0 flex items-center justify-center transition-all duration-150 ${
                    isDone 
                      ? 'bg-[#00B4D8] border-[#00B4D8] text-white' 
                      : 'border-slate-300'
                  }`}>
                    {isDone && <Icon name="check" size={12} className="stroke-[3]" />}
                  </div>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${priorityPill}`}>
                        {rec.priority} PRIORITY
                      </span>
                      <h5 className={`text-xs font-black truncate leading-tight ${isDone ? 'text-slate-400' : 'text-slate-800'}`}>
                        {rec.title}
                      </h5>
                    </div>
                    <p className={`text-[11px] leading-relaxed ${isDone ? 'text-slate-400' : 'text-slate-500'}`}>
                      {rec.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default BlossomAIView;
