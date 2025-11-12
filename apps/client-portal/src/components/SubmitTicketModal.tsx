import React, { useEffect, useMemo, useState } from 'react';
import API from '../utils/axios';

interface ProjectLite { _id: string; name: string; category: 'Cybersecurity'|'Web Development'; }

interface Props {
  open: boolean;
  onClose: () => void;
}

export const SubmitTicketModal: React.FC<Props> = ({ open, onClose }) => {
  const [projects, setProjects] = useState<ProjectLite[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);

  const [projectId, setProjectId] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');

  // Cybersecurity
  const [cyberIssueType, setCyberIssueType] = useState('Vulnerability Report');
  const [cyberSystem, setCyberSystem] = useState('');
  const [cyberStart, setCyberStart] = useState('');
  const [cyberDown, setCyberDown] = useState<'yes'|'no'>('no');
  const [cyberDataCompromise, setCyberDataCompromise] = useState(false);
  const [cyberImpact, setCyberImpact] = useState('');
  const [cyberLogs, setCyberLogs] = useState('');

  // Web Dev
  const [webComponent, setWebComponent] = useState('Frontend (Visual/Layout)');
  const [webBrowser, setWebBrowser] = useState('Chrome');
  const [webOs, setWebOs] = useState('Windows');
  const [webUrl, setWebUrl] = useState('');
  const [webSteps, setWebSteps] = useState('');
  const [webExpected, setWebExpected] = useState('');
  const [webActual, setWebActual] = useState('');

  useEffect(() => {
    if (!open) return;
    const fetchProjects = async () => {
      try {
        setLoading(true); setError(null);
        const { data } = await API.get<ProjectLite[]>('/client-portal/projects');
        // ensure category is present; backend select includes category
        setProjects(data);
      } catch (e) {
        setError('Failed to load projects');
      } finally { setLoading(false); }
    };
    fetchProjects();
  }, [open]);

  const selectedProject = useMemo(() => projects.find(p => p._id === projectId) || null, [projects, projectId]);
  const selectedCategory = selectedProject?.category ?? null;

  const reset = () => {
    setProjectId(''); setSubject(''); setDescription(''); setPriority('Medium');
    setCyberIssueType('Vulnerability Report'); setCyberSystem(''); setCyberStart(''); setCyberDown('no'); setCyberDataCompromise(false); setCyberImpact(''); setCyberLogs('');
    setWebComponent('Frontend (Visual/Layout)'); setWebBrowser('Chrome'); setWebOs('Windows'); setWebUrl(''); setWebSteps(''); setWebExpected(''); setWebActual('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !subject || !description) { setError('Please complete required fields'); return; }
    try {
      setLoading(true); setError(null);
      const body: any = { project: projectId, subject, description, priority, category: selectedCategory };
      if (selectedCategory === 'Cybersecurity') {
        body.cybersecurity = {
          issueType: cyberIssueType,
          system: cyberSystem,
          startedAt: cyberStart || undefined,
          systemDown: cyberDown === 'yes',
          dataCompromise: cyberDataCompromise,
          impact: cyberImpact,
          logs: cyberLogs,
        };
      } else if (selectedCategory === 'Web Development') {
        body.webdev = {
          component: webComponent,
          browser: webBrowser,
          os: webOs,
          url: webUrl,
          steps: webSteps,
          expected: webExpected,
          actual: webActual,
        };
      }
      await API.post('/client-portal/tickets', body);
      reset();
      onClose();
      alert('Support ticket submitted');
    } catch (e) {
      setError('Failed to submit ticket');
    } finally { setLoading(false); }
  };

  if (!open) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
      <div className="info-box" style={{ width: 'min(900px, 92vw)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 12 }}>
          <h3 style={{ margin:0, color:'#fff' }}>Submit Support Ticket</h3>
          <button className="logout-button" onClick={onClose}>Close</button>
        </div>

        {error && <div style={{ color:'#ff6b6b', marginBottom: 8 }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ display:'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label style={{ display:'flex', flexDirection:'column', gap:6 }}>
              <span>Related Project</span>
              <select value={projectId} onChange={(e)=> setProjectId(e.target.value)}>
                <option value="">Select a project...</option>
                {projects.map(p => (
                  <option key={p._id} value={p._id}>{p.name} — {p.category}</option>
                ))}
              </select>
            </label>
            <label style={{ display:'flex', flexDirection:'column', gap:6 }}>
              <span>Priority</span>
              <select value={priority} onChange={(e)=> setPriority(e.target.value)}>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Urgent/Critical</option>
              </select>
            </label>
            <label style={{ gridColumn: '1 / -1', display:'flex', flexDirection:'column', gap:6 }}>
              <span>Subject</span>
              <input placeholder="Brief, descriptive title" value={subject} onChange={(e)=> setSubject(e.target.value)} />
            </label>
            <label style={{ gridColumn: '1 / -1', display:'flex', flexDirection:'column', gap:6 }}>
              <span>Description</span>
              <textarea rows={4} placeholder="Describe the issue in detail..." value={description} onChange={(e)=> setDescription(e.target.value)} />
            </label>
          </div>

          {/* Category specific */}
          {selectedCategory === 'Cybersecurity' && (
            <div style={{ marginTop: 12 }}>
              <h4 style={{ marginTop:0, color:'#fff' }}>Cybersecurity</h4>
              <div style={{ display:'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  <span>Issue Type</span>
                  <select value={cyberIssueType} onChange={(e)=> setCyberIssueType(e.target.value)}>
                    <option>Vulnerability Report</option>
                    <option>Security Incident</option>
                    <option>Access/Authentication Issue</option>
                    <option>Policy Inquiry</option>
                    <option>Remediation Follow-up</option>
                    <option>General Question</option>
                  </select>
                </label>
                <label style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  <span>System/Application Affected</span>
                  <input value={cyberSystem} onChange={(e)=> setCyberSystem(e.target.value)} placeholder="E-commerce Platform, VPN, HR Portal..." />
                </label>
                <label style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  <span>When Did the Problem Start?</span>
                  <input type="datetime-local" value={cyberStart} onChange={(e)=> setCyberStart(e.target.value)} />
                </label>
                <label style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  <span>Is the System Currently Down?</span>
                  <div style={{ display:'flex', gap: 16 }}>
                    <label><input type="radio" name="cyberDown" checked={cyberDown==='yes'} onChange={()=> setCyberDown('yes')} /> Yes</label>
                    <label><input type="radio" name="cyberDown" checked={cyberDown==='no'} onChange={()=> setCyberDown('no')} /> No</label>
                  </div>
                </label>
                <label style={{ gridColumn: '1 / -1', display:'flex', flexDirection:'column', gap:6 }}>
                  <span>Data Compromise / Impact</span>
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    <label><input type="checkbox" checked={cyberDataCompromise} onChange={(e)=> setCyberDataCompromise(e.target.checked)} /> Possible unauthorized access</label>
                    <input disabled={!cyberDataCompromise} value={cyberImpact} onChange={(e)=> setCyberImpact(e.target.value)} placeholder="If yes, describe potential impact/data" />
                  </div>
                </label>
                <label style={{ gridColumn: '1 / -1', display:'flex', flexDirection:'column', gap:6 }}>
                  <span>Relevant Log Snippets (optional)</span>
                  <textarea rows={4} value={cyberLogs} onChange={(e)=> setCyberLogs(e.target.value)} placeholder="Paste relevant log lines here..." />
                </label>
              </div>
            </div>
          )}

          {selectedCategory === 'Web Development' && (
            <div style={{ marginTop: 12 }}>
              <h4 style={{ marginTop:0, color:'#fff' }}>Web Development</h4>
              <div style={{ display:'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  <span>Component / Area Affected</span>
                  <select value={webComponent} onChange={(e)=> setWebComponent(e.target.value)}>
                    <option>Frontend (Visual/Layout)</option>
                    <option>Backend (Server/Data)</option>
                    <option>Database/CMS</option>
                    <option>Forms/Functionality</option>
                    <option>Performance/Speed</option>
                    <option>Third-Party Integration</option>
                  </select>
                </label>
                <div style={{ display:'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <label style={{ display:'flex', flexDirection:'column', gap:6 }}>
                    <span>Browser</span>
                    <select value={webBrowser} onChange={(e)=> setWebBrowser(e.target.value)}>
                      <option>Chrome</option>
                      <option>Firefox</option>
                      <option>Edge</option>
                      <option>Safari</option>
                      <option>Mobile Browser</option>
                      <option>Other</option>
                    </select>
                  </label>
                  <label style={{ display:'flex', flexDirection:'column', gap:6 }}>
                    <span>Operating System</span>
                    <select value={webOs} onChange={(e)=> setWebOs(e.target.value)}>
                      <option>Windows</option>
                      <option>macOS</option>
                      <option>Linux</option>
                      <option>iOS</option>
                      <option>Android</option>
                    </select>
                  </label>
                </div>
                <label style={{ gridColumn: '1 / -1', display:'flex', flexDirection:'column', gap:6 }}>
                  <span>Specific URL</span>
                  <input value={webUrl} onChange={(e)=> setWebUrl(e.target.value)} placeholder="https://clientdomain.com/problem-page" />
                </label>
                <label style={{ gridColumn: '1 / -1', display:'flex', flexDirection:'column', gap:6 }}>
                  <span>Steps to Reproduce</span>
                  <textarea rows={4} value={webSteps} onChange={(e)=> setWebSteps(e.target.value)} placeholder={'1. Go to URL\n2. Click Sign In\n3. Enter credentials\n4. Error appears'} />
                </label>
                <div style={{ display:'grid', gridTemplateColumns: '1fr 1fr', gap: 12, gridColumn: '1 / -1' }}>
                  <label style={{ display:'flex', flexDirection:'column', gap:6 }}>
                    <span>Expected Result</span>
                    <input value={webExpected} onChange={(e)=> setWebExpected(e.target.value)} placeholder="I should see the Dashboard" />
                  </label>
                  <label style={{ display:'flex', flexDirection:'column', gap:6 }}>
                    <span>Actual Result</span>
                    <input value={webActual} onChange={(e)=> setWebActual(e.target.value)} placeholder="I see a 404 error" />
                  </label>
                </div>
              </div>
            </div>
          )}

          <div style={{ display:'flex', justifyContent:'flex-end', gap: 12, marginTop: 16 }}>
            <button type="button" className="logout-button" onClick={onClose}>Cancel</button>
            <button type="submit" className="logout-button">Submit Ticket</button>
          </div>
        </form>
      </div>
    </div>
  );
};
