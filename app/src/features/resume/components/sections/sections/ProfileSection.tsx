import { memo } from 'react';
import type { ProfileData } from '@/shared/types/resume';
import { RichTextEditor } from '@/components/common/RichTextEditor';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ProfileSectionProps {
  data: ProfileData;
  onChange: (data: ProfileData) => void;
}

export const ProfileSection = memo(function ProfileSection({ data, onChange }: ProfileSectionProps) {
  const handleChange = (field: keyof ProfileData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="cv-section">
      <h2 className="section-title">Profile</h2>

      <div className="form-grid">
        {[
          { id: 'fullName',  label: 'Full Name',           type: 'text',  placeholder: 'John Smith',            field: 'fullName'  as const },
          { id: 'email',     label: 'Email',               type: 'email', placeholder: 'john@example.com',       field: 'email'     as const },
          { id: 'phone',     label: 'Phone',               type: 'tel',   placeholder: '+1 (555) 123-4567',      field: 'phone'     as const },
          { id: 'location',  label: 'Location',            type: 'text',  placeholder: 'San Francisco, CA',      field: 'location'  as const },
          { id: 'linkedin',  label: 'LinkedIn (optional)', type: 'url',   placeholder: 'linkedin.com/in/...',    field: 'linkedin'  as const },
          { id: 'website',   label: 'Website (optional)',  type: 'url',   placeholder: 'yoursite.com',           field: 'website'   as const },
        ].map(({ id, label, type, placeholder, field }) => (
          <div key={id} className="form-field">
            <Label htmlFor={id}>{label}</Label>
            <Input
              id={id}
              type={type}
              value={(data[field] as string) || ''}
              onChange={(e) => handleChange(field, e.target.value)}
              placeholder={placeholder}
            />
          </div>
        ))}
      </div>

      <div className="form-field full-width mt-4">
        <Label>Professional Summary</Label>
        <RichTextEditor
          value={data.summary}
          onChange={(html) => handleChange('summary', html)}
          placeholder="A brief summary of your professional background and goals..."
        />
      </div>
    </div>
  );
});
