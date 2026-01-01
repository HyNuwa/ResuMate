import { RefreshCw, TrendingUp, FileCheck, Target } from 'lucide-react';

interface ResumeMetricsProps {
  score: number; // 0-100
}

export function ResumeMetrics({ score }: ResumeMetricsProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981'; // green
    if (score >= 60) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  const scoreColor = getScoreColor(score);
  const scoreLabel = getScoreLabel(score);
  
  // Calculate circle progress
  const circumference = 2 * Math.PI * 70; // radius = 70
  const progress = ((100 - score) / 100) * circumference;

  return (
    <div className="metrics-panel">
      <div className="metrics-header">
        <h3>Resume Metrics</h3>
        <button className="btn-icon" title="Refresh">
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="metrics-content">
        <p className="metrics-updated">Last updated: just now</p>

        {/* Score Circle */}
        <div className="score-circle-container">
          <svg width="160" height="160" className="score-circle">
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke="#374151"
              strokeWidth="12"
            />
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke={scoreColor}
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={progress}
              strokeLinecap="round"
              transform="rotate(-90 80 80)"
            />
            <text
              x="80"
              y="75"
              textAnchor="middle"
              fontSize="48"
              fontWeight="bold"
              fill="#111827"
            >
              {score}
            </text>
            <text
              x="80"
              y="95"
              textAnchor="middle"
              fontSize="16"
              fill="#6b7280"
            >
              / 100
            </text>
          </svg>
        </div>

        <div className="score-label">
          <h4>Matcha Score: {scoreLabel}</h4>
          <p>Your resume has room for improvement. See the metrics below for suggestions.</p>
        </div>

        <button className="btn-primary">
          <TrendingUp size={16} />
          Beef up my resume
        </button>

        {/* Metrics */}
        <div className="metrics-list">
          <div className="metric-item">
            <div className="metric-icon impact">
              <TrendingUp size={18} />
            </div>
            <div className="metric-info">
              <span className="metric-name">Impact</span>
              <span className="metric-score impact-color">24</span>
            </div>
          </div>

          <div className="metric-item">
            <div className="metric-icon success">
              <FileCheck size={18} />
            </div>
            <div className="metric-info">
              <span className="metric-name">ATS-Friendly</span>
              <span className="metric-score success-color">83</span>
            </div>
          </div>

          <div className="metric-item">
            <div className="metric-icon">
              <Target size={18} />
            </div>
            <div className="metric-info">
              <span className="metric-name">Match</span>
              <span className="metric-value">0 / 100</span>
            </div>
          </div>
        </div>

        <div className="metrics-info">
          <p>Boost your Matcha Score by tailoring this resume to a specific job description.</p>
        </div>

        <button className="btn-secondary">
          <Target size={16} />
          Tailor to Job
        </button>
      </div>
    </div>
  );
}
