import React, { useState } from 'react';
import {
  Gamepad2,
  Video,
  MonitorPlay,
  CloudUpload,
  Radio,
  PhoneCall,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

interface ActivityScore {
  id: string;
  name: string;
  category: 'Gaming' | 'Video' | 'Work / Conferencing' | 'Live Streaming';
  icon: React.ComponentType<{ className?: string }>;
  rating: 'Exceptional' | 'Good' | 'Fair' | 'Poor';
  badgeColor: string;
  bgGrad: string;
  score: number; // 0 - 100
  summary: string;
  requirements: {
    minDown: string;
    minUp: string;
    targetPing: string;
    maxBloat: string;
  };
  metricsAnalysis: string[];
}

interface RealtimeCapabilityAssessmentProps {
  downloadSpeed: number | null;
  uploadSpeed: number | null;
  ping: number | null;
  jitter: number;
  bufferbloatMs: number;
  packetLoss: number;
  isDark: boolean;
}

export const RealtimeCapabilityAssessment: React.FC<RealtimeCapabilityAssessmentProps> = ({
  downloadSpeed,
  uploadSpeed,
  ping,
  jitter,
  bufferbloatMs,
  packetLoss,
  isDark,
}) => {
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);

  const down = downloadSpeed ?? 0;
  const up = uploadSpeed ?? 0;
  const latency = ping ?? 999;
  const bloat = bufferbloatMs ?? 0;
  const loss = packetLoss ?? 0;

  // Determine scores for key activities based on network standards
  const evaluateActivities = (): ActivityScore[] => {
    // 1. Competitive Gaming (Esports / FPS: Valorant, CS2, Fortnite, Rocket League)
    // Needs: Ping < 30ms, Jitter < 3ms, Loss = 0%, Bufferbloat < 15ms
    let gamingScore = 100;
    if (latency > 25) gamingScore -= Math.min(35, (latency - 25) * 0.8);
    if (latency > 60) gamingScore -= 20;
    if (bloat > 15) gamingScore -= Math.min(25, (bloat - 15) * 0.5);
    if (jitter > 3) gamingScore -= Math.min(20, (jitter - 3) * 3);
    if (loss > 0) gamingScore -= loss * 20;
    gamingScore = Math.max(10, Math.min(100, Math.round(gamingScore)));

    const gamingRating: ActivityScore['rating'] =
      gamingScore >= 85 ? 'Exceptional' : gamingScore >= 65 ? 'Good' : gamingScore >= 45 ? 'Fair' : 'Poor';

    // 2. 4K HDR & 8K Streaming (Netflix, YouTube 4K 60fps HDR, Apple TV+)
    // Needs: Down >= 50 Mbps, Down >= 100 Mbps for multi-stream 4K, Loss < 1%
    let streamingScore = 100;
    if (down < 25) streamingScore -= 50;
    else if (down < 50) streamingScore -= 25;
    else if (down < 100) streamingScore -= 10;
    if (loss > 2) streamingScore -= 30;
    if (jitter > 15) streamingScore -= 15;
    streamingScore = Math.max(10, Math.min(100, Math.round(streamingScore)));

    const streamingRating: ActivityScore['rating'] =
      streamingScore >= 85 ? 'Exceptional' : streamingScore >= 65 ? 'Good' : streamingScore >= 45 ? 'Fair' : 'Poor';

    // 3. HD Video Conferencing & Work (Zoom HD, Google Meet, Teams 1080p, Screen Share)
    // Needs: Down >= 15 Mbps, Up >= 10 Mbps, Ping < 70ms, Jitter < 8ms, Loss < 1%
    let conferenceScore = 100;
    if (down < 15) conferenceScore -= 30;
    if (up < 10) conferenceScore -= 35;
    else if (up < 5) conferenceScore -= 50;
    if (latency > 70) conferenceScore -= 20;
    if (jitter > 8) conferenceScore -= 15;
    if (loss > 1) conferenceScore -= 25;
    conferenceScore = Math.max(10, Math.min(100, Math.round(conferenceScore)));

    const conferenceRating: ActivityScore['rating'] =
      conferenceScore >= 85 ? 'Exceptional' : conferenceScore >= 65 ? 'Good' : conferenceScore >= 45 ? 'Fair' : 'Poor';

    // 4. Live Video Streaming & Content Creation (Twitch 1080p60 8Mbps, YouTube Live 4K)
    // Needs: Up >= 20 Mbps, Bufferbloat < 25ms, Jitter < 5ms
    let liveScore = 100;
    if (up < 8) liveScore -= 50;
    else if (up < 20) liveScore -= 25;
    if (bloat > 30) liveScore -= 20;
    if (loss > 0.5) liveScore -= 25;
    if (jitter > 5) liveScore -= 15;
    liveScore = Math.max(10, Math.min(100, Math.round(liveScore)));

    const liveRating: ActivityScore['rating'] =
      liveScore >= 85 ? 'Exceptional' : liveScore >= 65 ? 'Good' : liveScore >= 45 ? 'Fair' : 'Poor';

    // 5. Cloud Gaming (GeForce NOW Ultimate 4K120, Xbox Cloud Gaming)
    // Needs: Down >= 75 Mbps, Up >= 15 Mbps, Ping < 25ms, Bloat < 10ms
    let cloudGamingScore = 100;
    if (down < 45) cloudGamingScore -= 40;
    if (latency > 35) cloudGamingScore -= 30;
    if (bloat > 20) cloudGamingScore -= 20;
    if (loss > 0) cloudGamingScore -= 25;
    cloudGamingScore = Math.max(10, Math.min(100, Math.round(cloudGamingScore)));

    const cloudGamingRating: ActivityScore['rating'] =
      cloudGamingScore >= 85 ? 'Exceptional' : cloudGamingScore >= 65 ? 'Good' : cloudGamingScore >= 45 ? 'Fair' : 'Poor';

    // 6. Large File Uploads & Cloud Backups (Drive, Dropbox, Git pushes, Video Renders)
    let uploadScore = 100;
    if (up < 10) uploadScore -= 50;
    else if (up < 40) uploadScore -= 25;
    else if (up < 80) uploadScore -= 10;
    uploadScore = Math.max(10, Math.min(100, Math.round(uploadScore)));

    const uploadRating: ActivityScore['rating'] =
      uploadScore >= 85 ? 'Exceptional' : uploadScore >= 65 ? 'Good' : uploadScore >= 45 ? 'Fair' : 'Poor';

    return [
      {
        id: 'competitive-gaming',
        name: 'Competitive Esports Gaming',
        category: 'Gaming',
        icon: Gamepad2,
        rating: gamingRating,
        badgeColor:
          gamingRating === 'Exceptional'
            ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
            : gamingRating === 'Good'
            ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
            : gamingRating === 'Fair'
            ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
            : 'text-rose-400 bg-rose-500/10 border-rose-500/20',
        bgGrad: 'from-emerald-500/5 to-transparent',
        score: gamingScore,
        summary:
          gamingScore >= 80
            ? 'Ultra-low jitter and crisp edge RTT ensures zero hit-reg delay in fast-paced competitive FPS shooters.'
            : 'Slight latency or bufferbloat variance may occasionally cause micro-stutters during heavy network traffic.',
        requirements: {
          minDown: '15 Mbps',
          minUp: '5 Mbps',
          targetPing: '< 30ms',
          maxBloat: '< 15ms',
        },
        metricsAnalysis: [
          `Latency: ${latency < 999 ? `${latency}ms` : 'Pending'} (${latency <= 30 ? 'Pristine' : 'Sub-optimal'})`,
          `Jitter: ${jitter}ms (${jitter <= 3 ? 'Excellent' : 'Elevated'})`,
          `Queue Delay: +${bloat}ms (${bloat <= 15 ? 'Minimal bloat' : 'Queue spikes'})`,
        ],
      },
      {
        id: '4k-streaming',
        name: '4K Ultra HD & 8K HDR',
        category: 'Video',
        icon: Video,
        rating: streamingRating,
        badgeColor:
          streamingRating === 'Exceptional'
            ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
            : streamingRating === 'Good'
            ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
            : streamingRating === 'Fair'
            ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
            : 'text-rose-400 bg-rose-500/10 border-rose-500/20',
        bgGrad: 'from-cyan-500/5 to-transparent',
        score: streamingScore,
        summary:
          streamingScore >= 80
            ? 'Sufficient bandwidth for concurrent 4K HDR Dolby Vision streams with instant buffer pre-fetching.'
            : 'Sufficient for 1080p, but multi-device 4K streams may experience brief buffering intervals.',
        requirements: {
          minDown: '50 Mbps',
          minUp: '5 Mbps',
          targetPing: '< 100ms',
          maxBloat: '< 50ms',
        },
        metricsAnalysis: [
          `Throughput: ${down.toFixed(1)} Mbps (${down >= 50 ? 'Passed 4K' : 'Below 50 Mbps 4K baseline'})`,
          `Packet Loss: ${loss}% (${loss === 0 ? 'Zero packet drop' : 'Dropped frames detected'})`,
        ],
      },
      {
        id: 'video-conferencing',
        name: 'HD Video Calls & Meetings',
        category: 'Work / Conferencing',
        icon: PhoneCall,
        rating: conferenceRating,
        badgeColor:
          conferenceRating === 'Exceptional'
            ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
            : conferenceRating === 'Good'
            ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
            : conferenceRating === 'Fair'
            ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
            : 'text-rose-400 bg-rose-500/10 border-rose-500/20',
        bgGrad: 'from-indigo-500/5 to-transparent',
        score: conferenceScore,
        summary:
          conferenceScore >= 80
            ? 'Crystal-clear 1080p video with simultaneous bi-directional screen sharing and zero voice lag.'
            : 'VoIP calls will connect, but jitter spikes may occasionally compress or chop outgoing audio packets.',
        requirements: {
          minDown: '15 Mbps',
          minUp: '10 Mbps',
          targetPing: '< 60ms',
          maxBloat: '< 30ms',
        },
        metricsAnalysis: [
          `Upload Speed: ${up.toFixed(1)} Mbps (${up >= 10 ? 'Broadband HD passed' : 'Constrained uplink'})`,
          `Jitter Variance: ${jitter}ms (${jitter <= 5 ? 'Stable audio RTT' : 'Jitter buffer active'})`,
        ],
      },
      {
        id: 'cloud-gaming',
        name: 'Cloud Gaming (GeForce NOW / Xbox)',
        category: 'Gaming',
        icon: MonitorPlay,
        rating: cloudGamingRating,
        badgeColor:
          cloudGamingRating === 'Exceptional'
            ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
            : cloudGamingRating === 'Good'
            ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
            : cloudGamingRating === 'Fair'
            ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
            : 'text-rose-400 bg-rose-500/10 border-rose-500/20',
        bgGrad: 'from-purple-500/5 to-transparent',
        score: cloudGamingScore,
        summary:
          cloudGamingScore >= 80
            ? 'High-framerate 1440p/4K 120Hz interactive cloud rendering with responsive frame decoding.'
            : 'Playable at standard 1080p60, but occasional input latency spikes may be noticeable in fast titles.',
        requirements: {
          minDown: '75 Mbps',
          minUp: '15 Mbps',
          targetPing: '< 25ms',
          maxBloat: '< 15ms',
        },
        metricsAnalysis: [
          `Ping: ${latency < 999 ? `${latency}ms` : 'Pending'} (${latency <= 25 ? 'Low input delay' : 'Noticeable input latency'})`,
          `Bufferbloat: +${bloat}ms`,
        ],
      },
      {
        id: 'live-broadcasting',
        name: 'Live Streaming (Twitch / YouTube 60fps)',
        category: 'Live Streaming',
        icon: Radio,
        rating: liveRating,
        badgeColor:
          liveRating === 'Exceptional'
            ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
            : liveRating === 'Good'
            ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
            : liveRating === 'Fair'
            ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
            : 'text-rose-400 bg-rose-500/10 border-rose-500/20',
        bgGrad: 'from-pink-500/5 to-transparent',
        score: liveScore,
        summary:
          liveScore >= 80
            ? 'Stable constant bitrate (CBR) streaming at 8000+ kbps with zero dropped frames on OBS Studio.'
            : 'Uplink headroom is limited. Recommend lowering OBS video bitrate to 4500 kbps (720p60) to avoid frame drops.',
        requirements: {
          minDown: '25 Mbps',
          minUp: '20 Mbps',
          targetPing: '< 50ms',
          maxBloat: '< 25ms',
        },
        metricsAnalysis: [
          `Uplink Pipe: ${up.toFixed(1)} Mbps (${up >= 20 ? 'Generous 1080p60 headroom' : 'Restricted upload pipe'})`,
          `Loaded Jitter: ${jitter}ms`,
        ],
      },
      {
        id: 'cloud-storage-sync',
        name: 'High-Volume Cloud Backup & Sync',
        category: 'Work / Conferencing',
        icon: CloudUpload,
        rating: uploadRating,
        badgeColor:
          uploadRating === 'Exceptional'
            ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
            : uploadRating === 'Good'
            ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
            : uploadRating === 'Fair'
            ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
            : 'text-rose-400 bg-rose-500/10 border-rose-500/20',
        bgGrad: 'from-blue-500/5 to-transparent',
        score: uploadScore,
        summary:
          uploadScore >= 80
            ? 'Rapid synchronization for gigabyte video files, code repos, and raw camera media archives.'
            : 'Standard backups work reliably, but large file uploads (>5GB) will take noticeable transfer time.',
        requirements: {
          minDown: '30 Mbps',
          minUp: '40 Mbps',
          targetPing: '< 100ms',
          maxBloat: '< 60ms',
        },
        metricsAnalysis: [
          `Upload Throughput: ${up.toFixed(1)} Mbps (${up >= 40 ? 'Fast cloud sync' : 'Standard upload rate'})`,
        ],
      },
    ];
  };

  const activities = evaluateActivities();
  const activeDetail = activities.find((a) => a.id === selectedActivity) || activities[0];

  const cardBg = isDark
    ? 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
    : 'bg-white border-slate-200 shadow-sm hover:border-slate-300';

  const avgOverallScore = Math.round(
    activities.reduce((acc, a) => acc + a.score, 0) / activities.length
  );

  return (
    <section
      id="realtimeCapabilityAssessment"
      className={`${cardBg} rounded-2xl p-5 border transition-all duration-200`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3
              className={`text-sm font-bold tracking-tight font-display ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              Real-World Connection Capability Index
            </h3>
            <p className="text-[11px] text-slate-400">
              Evaluated against real gaming servers, 4K video bitrates, and WebRTC tolerances
            </p>
          </div>
        </div>

        {/* Global Aggregate Score Badge */}
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <span className="text-[11px] text-slate-400 font-mono">Index Score:</span>
          <div
            className={`px-2.5 py-1 rounded-lg border font-mono font-bold text-xs flex items-center space-x-1.5 ${
              avgOverallScore >= 80
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : avgOverallScore >= 60
                ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
                : avgOverallScore >= 40
                ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
            }`}
          >
            <span>{avgOverallScore} / 100</span>
            <span className="text-[10px] uppercase font-sans">
              ({avgOverallScore >= 80 ? 'Optimal' : avgOverallScore >= 60 ? 'Capable' : 'Degraded'})
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Activities */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        {activities.map((act) => {
          const Icon = act.icon;
          const isSelected = act.id === activeDetail.id;

          return (
            <button
              key={act.id}
              onClick={() => setSelectedActivity(act.id)}
              className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? isDark
                    ? 'bg-slate-800/80 border-indigo-500/60 shadow-sm shadow-indigo-500/10'
                    : 'bg-indigo-50/50 border-indigo-300 shadow-sm'
                  : isDark
                  ? 'bg-slate-900/40 border-slate-800/60 hover:bg-slate-800/50 hover:border-slate-700'
                  : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100/60'
              }`}
            >
              <div className="flex items-start justify-between w-full mb-2">
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : isDark
                        ? 'bg-slate-800 text-slate-300'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                      {act.category}
                    </div>
                    <div
                      className={`text-xs font-bold leading-tight line-clamp-1 ${
                        isDark ? 'text-slate-200' : 'text-slate-800'
                      }`}
                    >
                      {act.name}
                    </div>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${act.badgeColor}`}
                >
                  {act.rating}
                </span>
              </div>

              {/* Mini Meter */}
              <div className="w-full space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Compatibility</span>
                  <span className="font-semibold text-slate-300">{act.score}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800/50 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      act.score >= 80
                        ? 'bg-emerald-400'
                        : act.score >= 60
                        ? 'bg-cyan-400'
                        : act.score >= 40
                        ? 'bg-amber-400'
                        : 'bg-rose-400'
                    }`}
                    style={{ width: `${act.score}%` }}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Activity Deep Diagnostic Breakdown */}
      {activeDetail && (
        <div
          className={`p-3.5 rounded-xl border transition-all text-xs ${
            isDark ? 'bg-slate-950/70 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-800/50">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-indigo-400">{activeDetail.name}:</span>
              <span className="text-slate-400">{activeDetail.summary}</span>
            </div>
            <div className="flex items-center space-x-3 text-[11px] font-mono shrink-0">
              <span className="text-slate-400">
                Target: Ping <strong className="text-slate-300">{activeDetail.requirements.targetPing}</strong>
              </span>
              <span className="text-slate-400">
                Down <strong className="text-slate-300">{activeDetail.requirements.minDown}</strong>
              </span>
              <span className="text-slate-400">
                Up <strong className="text-slate-300">{activeDetail.requirements.minUp}</strong>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
            <span className="text-slate-400">Telemetry Status:</span>
            {activeDetail.metricsAnalysis.map((metric, idx) => (
              <span
                key={idx}
                className={`px-2 py-0.5 rounded-md border ${
                  isDark
                    ? 'bg-slate-900 border-slate-800 text-slate-300'
                    : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                {metric}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
