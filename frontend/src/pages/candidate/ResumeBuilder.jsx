import React, { useState, useRef } from 'react';
import Navbar from '../../components/common/Navbar';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../services/api';
import { FiDownload, FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './ResumeBuilder.css';

export default function ResumeBuilder() {
  const { user, updateUser } = useAuth();
  const resumeRef = useRef();
  const [saving, setSaving] = useState(false);

  const exp = user?.experience || [];
  const edu = user?.education || [];
  const skills = user?.skills || [];

  const downloadPDF = async () => {
    try {
      const { default: jsPDF } = await import('jspdf');
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const W = doc.internal.pageSize.getWidth();
      let y = 40;

      // Header
      doc.setFillColor(10, 102, 194);
      doc.rect(0, 0, W, 80, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(26);
      doc.text(user?.name || 'Your Name', 40, 38);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text([user?.email || '', user?.phone || '', user?.location || ''].filter(Boolean).join(' | '), 40, 58);
      if (user?.linkedin) doc.text(`LinkedIn: ${user.linkedin}`, 40, 72);
      y = 100;

      // Bio
      if (user?.bio) {
        doc.setTextColor(30, 30, 30);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        const bioLines = doc.splitTextToSize(user.bio, W - 80);
        doc.text(bioLines, 40, y);
        y += bioLines.length * 14 + 16;
      }

      const section = (title) => {
        doc.setFillColor(245, 247, 250);
        doc.rect(0, y - 4, W, 22, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(10, 102, 194);
        doc.text(title.toUpperCase(), 40, y + 12);
        y += 28;
        doc.setTextColor(30, 30, 30);
      };

      // Skills
      if (skills.length > 0) {
        section('Skills');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        const skillLine = skills.join(' • ');
        const lines = doc.splitTextToSize(skillLine, W - 80);
        doc.text(lines, 40, y);
        y += lines.length * 14 + 16;
      }

      // Experience
      if (exp.length > 0) {
        section('Work Experience');
        exp.forEach(e => {
          if (y > 750) { doc.addPage(); y = 40; }
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(12);
          doc.text(e.title || '', 40, y);
          doc.setFont('helvetica', 'italic');
          doc.setFontSize(11);
          doc.setTextColor(80, 80, 80);
          const period = `${e.from ? new Date(e.from).getFullYear() : ''} - ${e.current ? 'Present' : (e.to ? new Date(e.to).getFullYear() : '')}`;
          doc.text(`${e.company || ''} | ${period}`, 40, y + 14);
          doc.setTextColor(30, 30, 30);
          y += 28;
          if (e.description) {
            doc.setFont('helvetica', 'normal');
            const descLines = doc.splitTextToSize(e.description, W - 80);
            doc.text(descLines, 40, y);
            y += descLines.length * 13;
          }
          y += 12;
        });
      }

      // Education
      if (edu.length > 0) {
        section('Education');
        edu.forEach(e => {
          if (y > 750) { doc.addPage(); y = 40; }
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(12);
          doc.setTextColor(30, 30, 30);
          doc.text(`${e.degree || ''} in ${e.field || ''}`, 40, y);
          doc.setFont('helvetica', 'italic');
          doc.setFontSize(11);
          doc.setTextColor(80, 80, 80);
          const period = `${e.from ? new Date(e.from).getFullYear() : ''} - ${e.current ? 'Present' : (e.to ? new Date(e.to).getFullYear() : '')}`;
          doc.text(`${e.institution || ''} | ${period}`, 40, y + 14);
          y += 30;
        });
      }

      doc.save(`${(user?.name || 'resume').replace(/\s+/g, '_')}_resume.pdf`);
      toast.success('Resume downloaded!');

      // Save resume data
      await userAPI.updateResume({ data: 'generated', filename: 'resume.pdf' });
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF');
    }
  };

  return (
    <div style={{ paddingTop: 64, background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <div className="resume-page">
        <div className="resume-toolbar">
          <h1>Resume Builder</h1>
          <div className="toolbar-actions">
            <button className="btn btn-primary" onClick={downloadPDF}><FiDownload /> Download PDF</button>
          </div>
        </div>

        <div className="resume-note card">
          💡 Your resume is generated from your profile data. <a href="/candidate/profile" style={{ color: 'var(--primary)', fontWeight: 600 }}>Update your profile</a> to improve it.
        </div>

        {/* Resume Preview */}
        <div className="resume-preview card" ref={resumeRef}>
          <div className="rv-header">
            <h2 className="rv-name">{user?.name || 'Your Name'}</h2>
            <div className="rv-contact">
              {[user?.email, user?.phone, user?.location].filter(Boolean).join(' | ')}
            </div>
            <div className="rv-links">
              {user?.linkedin && <a href={user.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>}
              {user?.github && <a href={user.github} target="_blank" rel="noreferrer">GitHub</a>}
              {user?.website && <a href={user.website} target="_blank" rel="noreferrer">Portfolio</a>}
            </div>
          </div>

          {user?.bio && (
            <div className="rv-section">
              <h3 className="rv-section-title">Professional Summary</h3>
              <p className="rv-bio">{user.bio}</p>
            </div>
          )}

          {skills.length > 0 && (
            <div className="rv-section">
              <h3 className="rv-section-title">Skills</h3>
              <div className="rv-skills">{skills.map(s => <span key={s} className="rv-skill">{s}</span>)}</div>
            </div>
          )}

          {exp.length > 0 && (
            <div className="rv-section">
              <h3 className="rv-section-title">Work Experience</h3>
              {exp.map((e, i) => (
                <div key={i} className="rv-item">
                  <div className="rv-item-header">
                    <div>
                      <div className="rv-item-title">{e.title}</div>
                      <div className="rv-item-sub">{e.company}{e.location ? ` — ${e.location}` : ''}</div>
                    </div>
                    <div className="rv-item-date">
                      {e.from ? new Date(e.from).getFullYear() : ''} – {e.current ? 'Present' : (e.to ? new Date(e.to).getFullYear() : '')}
                    </div>
                  </div>
                  {e.description && <p className="rv-item-desc">{e.description}</p>}
                </div>
              ))}
            </div>
          )}

          {edu.length > 0 && (
            <div className="rv-section">
              <h3 className="rv-section-title">Education</h3>
              {edu.map((e, i) => (
                <div key={i} className="rv-item">
                  <div className="rv-item-header">
                    <div>
                      <div className="rv-item-title">{e.degree} {e.field ? `in ${e.field}` : ''}</div>
                      <div className="rv-item-sub">{e.institution}</div>
                    </div>
                    <div className="rv-item-date">
                      {e.from ? new Date(e.from).getFullYear() : ''} – {e.current ? 'Present' : (e.to ? new Date(e.to).getFullYear() : '')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
