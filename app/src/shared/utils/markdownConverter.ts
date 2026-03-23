import type { ResumeData } from '@resumate/schema';

/**
 * Convert ResumeData object to Markdown string
 */
export function resumeToMarkdown(resume: ResumeData): string {
  let markdown = '';

  markdown += `# ${resume.basics.name}\n\n`;

  const contactInfo = [
    resume.basics.email && `**Email:** ${resume.basics.email}`,
    resume.basics.phone && `**Phone:** ${resume.basics.phone}`,
    resume.basics.location && `**Location:** ${resume.basics.location}`,
    resume.basics.website.url && `**Website:** ${resume.basics.website.url}`,
  ].filter(Boolean).join(' | ');

  if (contactInfo) {
    markdown += `${contactInfo}\n\n`;
  }

  if (resume.summary.content) {
    markdown += `${resume.summary.content}\n\n`;
  }

  markdown += '---\n\n';

  if (resume.sections.experience.items.length > 0) {
    markdown += '## Experience\n\n';
    resume.sections.experience.items.forEach(exp => {
      markdown += `**${exp.position}** — ${exp.company} — ${exp.location}  \n`;
      markdown += `*${exp.period}*\n\n`;
      if (exp.description) {
        markdown += `${exp.description}\n\n`;
      }
    });
  }

  if (resume.sections.education.items.length > 0) {
    markdown += '## Education\n\n';
    resume.sections.education.items.forEach(edu => {
      markdown += `**${edu.school}** — ${edu.location}  \n`;
      markdown += `*${edu.degree}* | ${edu.period}\n`;
      if (edu.grade) {
        markdown += `- Grade: ${edu.grade}\n`;
      }
      if (edu.description) {
        markdown += `${edu.description}\n`;
      }
      markdown += '\n';
    });
  }

  if (resume.sections.skills.items.length > 0) {
    markdown += '## Skills\n\n';
    resume.sections.skills.items.forEach(item => {
      if (item.name) {
        markdown += `**${item.name}:** ${item.keywords?.join(', ') || ''}  \n`;
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

  markdown = markdown.replace(/<(strong|b)>(.*?)<\/(strong|b)>/gi, '**$2**');
  markdown = markdown.replace(/<(em|i)>(.*?)<\/(em|i)>/gi, '*$2*');

  markdown = markdown.replace(/<ul[^>]*>(.*?)<\/ul>/gis, (_, content) => {
    return content.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
  });

  markdown = markdown.replace(/<br\s*\/?>/gi, '\n');
  markdown = markdown.replace(/<[^>]+>/g, '');
  markdown = markdown.replace(/\n{3,}/g, '\n\n').trim();

  return markdown;
}

/**
 * Convert Markdown to HTML (for rich text editor display)
 */
export function markdownToHtml(markdown: string): string {
  if (!markdown) return '';

  let html = markdown;

  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

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
