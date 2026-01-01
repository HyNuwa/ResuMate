import type { Resume, ExperienceEntry, EducationEntry, SkillCategory } from '../types/resume';

/**
 * Convert Resume object to Markdown string
 */
export function resumeToMarkdown(resume: Resume): string {
  let markdown = '';

  // Profile section
  markdown += `# ${resume.profile.fullName}\n\n`;
  
  const contactInfo = [
    resume.profile.email && `**Email:** ${resume.profile.email}`,
    resume.profile.phone && `**Phone:** ${resume.profile.phone}`,
    resume.profile.location && `**Location:** ${resume.profile.location}`,
    resume.profile.linkedin && `**LinkedIn:** ${resume.profile.linkedin}`,
    resume.profile.website && `**Website:** ${resume.profile.website}`,
  ].filter(Boolean).join(' | ');
  
  if (contactInfo) {
    markdown += `${contactInfo}\n\n`;
  }

  if (resume.profile.summary) {
    markdown += `${resume.profile.summary}\n\n`;
  }

  markdown += '---\n\n';

  // Experience section
  if (resume.experience.length > 0) {
    markdown += '## Experience\n\n';
    resume.experience.forEach(exp => {
      markdown += `**${exp.position}** — ${exp.company} — ${exp.location}  \n`;
      markdown += `*${exp.startDate} - ${exp.endDate}*\n\n`;
      if (exp.description) {
        markdown += `${exp.description}\n\n`;
      }
    });
  }

  // Education section
  if (resume.education.length > 0) {
    markdown += '## Education\n\n';
    resume.education.forEach(edu => {
      markdown += `**${edu.institution}** — ${edu.location}  \n`;
      markdown += `*${edu.degree}* | ${edu.graduationDate}\n`;
      if (edu.gpa) {
        markdown += `- GPA: ${edu.gpa}\n`;
      }
      if (edu.achievements) {
        markdown += `${edu.achievements}\n`;
      }
      markdown += '\n';
    });
  }

  // Skills section
  if (resume.skills.categories.length > 0) {
    markdown += '## Skills\n\n';
    resume.skills.categories.forEach(category => {
      if (category.items.length > 0) {
        markdown += `**${category.name}:** ${category.items.join(', ')}  \n`;
      }
    });
  }

  return markdown.trim();
}

/**
 * Convert HTML to Markdown (for rich text editor)
 */
export function htmlToMarkdown(html: string): string {
  let markdown = html;

  // Convert <strong> and <b> to **bold**
  markdown = markdown.replace(/<(strong|b)>(.*?)<\/(strong|b)>/gi, '**$2**');

  // Convert <em> and <i> to *italic*
  markdown = markdown.replace(/<(em|i)>(.*?)<\/(em|i)>/gi, '*$2*');

  // Convert <ul><li> to markdown bullets
  markdown = markdown.replace(/<ul[^>]*>(.*?)<\/ul>/gis, (_, content) => {
    return content.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
  });

  // Remove <br> and convert to newlines
  markdown = markdown.replace(/<br\s*\/?>/gi, '\n');

  // Remove remaining HTML tags
  markdown = markdown.replace(/<[^>]+>/g, '');

  // Clean up extra whitespace
  markdown = markdown.replace(/\n{3,}/g, '\n\n').trim();

  return markdown;
}

/**
 * Convert Markdown to HTML (for rich text editor display)
 */
export function markdownToHtml(markdown: string): string {
  if (!markdown) return '';

  let html = markdown;

  // Convert **bold** to <strong>
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // Convert *italic* to <em>
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Convert markdown bullets to <ul><li>
  const lines = html.split('\n');
  let inList = false;
  let result = '';

  for (let line of lines) {
    if (line.trim().startsWith('- ')) {
      if (!inList) {
        result += '<ul>';
        inList = true;
      }
      result += `<li>${line.trim().substring(2)}</li>`;
    } else {
      if (inList) {
        result += '</ul>';
        inList = false;
      }
      if (line.trim()) {
        result += line + '<br>';
      }
    }
  }

  if (inList) result += '</ul>';

  return result;
}

/**
 * Parse markdown back to Resume object (basic implementation)
 * This is for loading existing CVs - can be enhanced later
 */
export function markdownToResume(markdown: string): Resume {
  // This is a basic parser - can be improved
  // For now, return empty resume as we'll primarily work from form → markdown
  const lines = markdown.split('\n');
  
  const resume: Resume = {
    profile: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      summary: '',
    },
    experience: [],
    education: [],
    skills: { categories: [] },
  };

  // Extract name from first # heading
  const nameMatch = lines.find(line => line.startsWith('# '));
  if (nameMatch) {
    resume.profile.fullName = nameMatch.replace('# ', '').trim();
  }

  // Extract contact info
  const contactLine = lines.find(line => line.includes('Email:') || line.includes('Phone:'));
  if (contactLine) {
    const emailMatch = contactLine.match(/Email:\s*([^\s|]+)/);
    const phoneMatch = contactLine.match(/Phone:\s*([^\s|]+)/);
    const locationMatch = contactLine.match(/Location:\s*([^\s|]+)/);
    
    if (emailMatch) resume.profile.email = emailMatch[1];
    if (phoneMatch) resume.profile.phone = phoneMatch[1];
    if (locationMatch) resume.profile.location = locationMatch[1];
  }

  // For now, return this basic structure
  // Can enhance parsing later if needed
  return resume;
}
