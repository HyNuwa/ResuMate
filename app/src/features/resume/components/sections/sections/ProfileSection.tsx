import { memo } from 'react';
import type { Basics } from '@resumate/schema';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ProfileSectionProps {
  data: Basics;
  onChange: (data: Basics) => void;
}

export const ProfileSection = memo(function ProfileSection({ data, onChange }: ProfileSectionProps) {
  const handleChange = (field: keyof Basics, value: string) => {
    if (field === 'website') {
      onChange({ ...data, website: { ...data.website, url: value } });
    } else {
      onChange({ ...data, [field]: value });
    }
  };

  return (
    <div className="cv-section">
      <h2 className="section-title">Profile</h2>

      <div className="form-grid">
        {[
          { id: 'name',     label: 'Full Name',        type: 'text', placeholder: 'John Smith',            field: 'name'     as const },
          { id: 'email',    label: 'Email',             type: 'email', placeholder: 'john@example.com',      field: 'email'    as const },
          { id: 'phone',    label: 'Phone',             type: 'tel',   placeholder: '+1 (555) 123-4567',    field: 'phone'    as const },
          { id: 'location', label: 'Location',           type: 'text',  placeholder: 'San Francisco, CA',     field: 'location'  as const },
          { id: 'headline', label: 'Headline (optional)', type: 'text', placeholder: 'Software Engineer',   field: 'headline' as const },
          { id: 'website',  label: 'Website (optional)', type: 'url',  placeholder: 'yoursite.com',         field: 'website'  as const },
        ].map(({ id, label, type, placeholder, field }) => (
          <div key={id} className="form-field">
            <Label htmlFor={id}>{label}</Label>
            <Input
              id={id}
              type={type}
              value={field === 'website' ? data.website.url : (data[field] as string) || ''}
              onChange={(e) => handleChange(field, e.target.value)}
              placeholder={placeholder}
            />
          </div>
        ))}
      </div>
    </div>
  );
});
