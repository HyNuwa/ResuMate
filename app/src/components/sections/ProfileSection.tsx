import type { ProfileData } from '../../types/resume';
import { RichTextEditor } from '../common/RichTextEditor';

interface ProfileSectionProps {
  data: ProfileData;
  onChange: (data: ProfileData) => void;
}

export function ProfileSection({ data, onChange }: ProfileSectionProps) {
  const handleChange = (field: keyof ProfileData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="cv-section">
      <h2 className="section-title">Profile</h2>
      
      <div className="form-grid">
        <div className="form-field">
          <label htmlFor="fullName">Full Name</label>
          <input
            id="fullName"
            type="text"
            value={data.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
            placeholder="John Smith"
            className="input"
          />
        </div>

        <div className="form-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={data.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="john@example.com"
            className="input"
          />
        </div>

        <div className="form-field">
          <label htmlFor="phone">Phone</label>
          <input
            id="phone"
            type="tel"
            value={data.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="+1 (555) 123-4567"
            className="input"
          />
        </div>

        <div className="form-field">
          <label htmlFor="location">Location</label>
          <input
            id="location"
            type="text"
            value={data.location}
            onChange={(e) => handleChange('location', e.target.value)}
            placeholder="San Francisco, CA"
            className="input"
          />
        </div>

        <div className="form-field">
          <label htmlFor="linkedin">LinkedIn (optional)</label>
          <input
            id="linkedin"
            type="url"
            value={data.linkedin || ''}
            onChange={(e) => handleChange('linkedin', e.target.value)}
            placeholder="linkedin.com/in/johnsmith"
            className="input"
          />
        </div>

        <div className="form-field">
          <label htmlFor="website">Website (optional)</label>
          <input
            id="website"
            type="url"
            value={data.website || ''}
            onChange={(e) => handleChange('website', e.target.value)}
            placeholder="johnsmith.com"
            className="input"
          />
        </div>
      </div>

      <div className="form-field full-width">
        <label>Professional Summary</label>
        <RichTextEditor
          value={data.summary}
          onChange={(markdown) => handleChange('summary', markdown)}
          placeholder="A brief summary of your professional background and goals..."
        />
      </div>
    </div>
  );
}
